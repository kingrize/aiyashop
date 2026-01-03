<script setup>
import { ref, onMounted, watch } from "vue";
import QRCode from "qrcode";
import {
    Copy,
    Check,
    MessageCircle,
    QrCode,
    CreditCard,
    Loader2,
    RefreshCw,
    AlertCircle,
    ShieldCheck,
    Timer,
    X,
    Info,
    Download,
} from "lucide-vue-next";
import qrisStaticImage from "../assets/qris.jpg";

const props = defineProps({
    isOpen: Boolean,
    totalPrice: Number,
    orderId: String,
});

const emit = defineEmits(["close"]);

const BASE_QRIS_PAYLOAD =
    "00020101021126610014COM.GO-JEK.WWW01189360091431999512000210G1999512000303UMI51440014ID.CO.QRIS.WWW0215ID10254602759650303UMI5204549953033605802ID5908aiyashop6006MANADO61059525162070703A0163047950";

const activeTab = ref("qris");

const qrisState = ref({
    isLoading: false,
    data: null,
    error: false,
    errorMessage: "",
});

const loadingStage = ref("Menyiapkan pembayaran…");
const MIN_LOADING_MS = 850;

const rekening = {
    bank: "DANA / ShopeePay",
    number: "085942963323",
    name: "Aiya Shop Admin",
};

const copiedNumber = ref(false);
const copiedTotal = ref(false);

const formatRupiah = (val) =>
    new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
    }).format(val || 0);

// ===== TLV helpers =====
function parseTLV(payload) {
    let i = 0;
    const items = [];
    while (i < payload.length) {
        const tag = payload.slice(i, i + 2);
        const lenStr = payload.slice(i + 2, i + 4);
        const len = parseInt(lenStr, 10);
        if (!Number.isFinite(len) || len < 0)
            throw new Error("TLV length invalid");

        const value = payload.slice(i + 4, i + 4 + len);
        if (value.length !== len) throw new Error("TLV value truncated");

        items.push({ tag, value });
        i += 4 + len;
    }
    return items;
}

function buildTLV(items) {
    return items
        .map(({ tag, value }) => {
            const len = String(value.length).padStart(2, "0");
            return `${tag}${len}${value}`;
        })
        .join("");
}

function upsertTag(items, tag, value) {
    const idx = items.findIndex((x) => x.tag === tag);
    if (idx >= 0) items[idx].value = value;
    else items.push({ tag, value });
}

function removeTag(items, tag) {
    const idx = items.findIndex((x) => x.tag === tag);
    if (idx >= 0) items.splice(idx, 1);
}

// CRC-16/CCITT-FALSE
function crc16ccittFalse(str) {
    let crc = 0xffff;
    for (let i = 0; i < str.length; i++) {
        crc ^= str.charCodeAt(i) << 8;
        for (let j = 0; j < 8; j++) {
            if (crc & 0x8000) crc = ((crc << 1) ^ 0x1021) & 0xffff;
            else crc = (crc << 1) & 0xffff;
        }
    }
    return crc.toString(16).toUpperCase().padStart(4, "0");
}

function rebuildWithCRC(payloadWithoutCRC) {
    const crc = crc16ccittFalse(payloadWithoutCRC);
    return payloadWithoutCRC + crc;
}

function makeQrisWithAmount(
    basePayload,
    amountNumber,
    { forceDynamic = true } = {},
) {
    const amount = String(Math.round(Number(amountNumber || 0)));
    if (!amount || amount === "NaN" || Number(amount) <= 0) {
        throw new Error("Amount harus angka > 0");
    }

    const items = parseTLV(basePayload);
    removeTag(items, "63");

    if (forceDynamic) upsertTag(items, "01", "12");
    upsertTag(items, "54", amount);

    const payloadNoCrc = buildTLV(items) + "6304";
    return rebuildWithCRC(payloadNoCrc);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const generateDynamicQR = async () => {
    const startedAt = Date.now();
    qrisState.value = {
        isLoading: true,
        data: null,
        error: false,
        errorMessage: "",
    };

    try {
        loadingStage.value = "Menyiapkan pembayaran…";
        await sleep(160);
        loadingStage.value = "Menyusun QRIS sesuai nominal…";

        const newPayload = makeQrisWithAmount(
            BASE_QRIS_PAYLOAD,
            props.totalPrice,
            {
                forceDynamic: true,
            },
        );

        await sleep(160);
        loadingStage.value = "Menghasilkan QR Code…";

        const dataUrl = await QRCode.toDataURL(newPayload, {
            margin: 1,
            scale: 8,
            errorCorrectionLevel: "M",
        });

        const elapsed = Date.now() - startedAt;
        if (elapsed < MIN_LOADING_MS) await sleep(MIN_LOADING_MS - elapsed);

        qrisState.value.data = dataUrl;
    } catch (err) {
        console.error("❌ Gagal Generate QRIS Offline:", err);

        const elapsed = Date.now() - startedAt;
        if (elapsed < MIN_LOADING_MS) await sleep(MIN_LOADING_MS - elapsed);

        qrisState.value.error = true;
        qrisState.value.errorMessage =
            "QR otomatis gagal dibuat. Silakan pakai mode manual.";
    } finally {
        qrisState.value.isLoading = false;
        loadingStage.value = "Siap";
    }
};

watch(
    () => props.isOpen,
    (open) => {
        if (open) generateDynamicQR();
        else {
            qrisState.value.isLoading = false;
            qrisState.value.data = null;
            qrisState.value.error = false;
            qrisState.value.errorMessage = "";
        }
    },
    { immediate: true },
);

onMounted(() => {
    if (props.isOpen) generateDynamicQR();
});

const copyToClipboard = async (text, type) => {
    try {
        await navigator.clipboard.writeText(text);
        if (type === "number") {
            copiedNumber.value = true;
            setTimeout(() => (copiedNumber.value = false), 1400);
        } else {
            copiedTotal.value = true;
            setTimeout(() => (copiedTotal.value = false), 1400);
        }
    } catch (err) {
        console.error("Gagal copy", err);
    }
};

const openWhatsApp = () => {
    const method = activeTab.value === "qris" ? "Scan QRIS" : "Transfer Manual";
    const message = `Halo Admin Aiya! 👋\n\nSaya mau konfirmasi pesanan:\n🆔 Order ID: *${props.orderId}*\n💰 Total: *${formatRupiah(
        props.totalPrice,
    )}*\nMetode: ${method}\n\nSudah saya bayar lunas kak! Mohon dicek. ✨`;
    const url = `https://wa.me/6285942963323?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
    emit("close");
};

const handleRetry = () => generateDynamicQR();

// ✅ Download QR mini
const downloadQR = () => {
    if (!qrisState.value.data) return;

    const safeOrder = (props.orderId || "order")
        .toString()
        .trim()
        .replace(/[^a-z0-9-_]+/gi, "-")
        .slice(0, 40);

    const nominal = String(Math.round(Number(props.totalPrice || 0)));
    const filename = `aiyashop-${safeOrder}-${nominal}.png`;

    const a = document.createElement("a");
    a.href = qrisState.value.data;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
};
</script>

<template>
    <div
        v-if="isOpen"
        class="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4"
    >
        <div
            class="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            @click="$emit('close')"
        ></div>

        <div
            class="w-full max-w-sm sm:max-w-md relative z-10 overflow-hidden rounded-[1.75rem] sm:rounded-[2.25rem] border border-white/10 shadow-2xl bg-white dark:bg-slate-950 animate-in zoom-in-95 duration-200 flex flex-col max-h-[86vh] sm:max-h-[88vh]"
        >
            <!-- Header -->
            <div
                class="px-4 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4 bg-gradient-to-b from-indigo-50 to-white dark:from-indigo-950/40 dark:to-slate-950 border-b border-slate-100 dark:border-white/10"
            >
                <div class="flex items-start justify-between gap-3 min-w-0">
                    <div class="min-w-0">
                        <p
                            class="text-[10px] sm:text-[11px] font-extrabold tracking-widest uppercase text-indigo-600/80 dark:text-indigo-300/80"
                        >
                            Secure Checkout
                        </p>
                        <h3
                            class="text-lg sm:text-xl font-black text-slate-900 dark:text-white mt-1 leading-tight"
                        >
                            Pembayaran Pesanan
                        </h3>
                        <p
                            class="text-xs text-slate-500 dark:text-slate-400 mt-1 truncate"
                        >
                            Order ID:
                            <span class="font-mono font-bold">{{
                                orderId
                            }}</span>
                        </p>
                    </div>

                    <button
                        class="shrink-0 w-10 h-10 rounded-2xl bg-white/70 dark:bg-white/10 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition"
                        @click="$emit('close')"
                        aria-label="Close"
                    >
                        <X :size="18" />
                    </button>
                </div>

                <div
                    class="mt-3 flex flex-wrap items-center gap-2 text-[11px] font-bold"
                >
                    <div
                        class="flex items-center gap-2 px-3 py-2 rounded-2xl bg-white/70 dark:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-200"
                    >
                        <ShieldCheck :size="14" class="text-emerald-500" />
                        <span class="whitespace-nowrap">Encrypted</span>
                    </div>
                    <div
                        class="flex items-center gap-2 px-3 py-2 rounded-2xl bg-white/70 dark:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-200"
                    >
                        <Timer :size="14" class="text-indigo-500" />
                        <span class="whitespace-nowrap">Real-time</span>
                    </div>
                </div>

                <div
                    class="mt-3 p-1.5 rounded-2xl bg-white/70 dark:bg-white/10 border border-slate-200 dark:border-white/10 flex gap-2"
                >
                    <button
                        @click="activeTab = 'qris'"
                        class="flex-1 py-2.5 rounded-xl font-black transition-all flex items-center justify-center gap-2 overflow-hidden"
                        :class="
                            activeTab === 'qris'
                                ? 'bg-indigo-600 text-white shadow-md'
                                : 'text-slate-600 dark:text-slate-200 hover:bg-white/70 dark:hover:bg-white/10'
                        "
                    >
                        <QrCode :size="16" class="shrink-0" />
                        <span
                            class="text-[11px] sm:text-xs whitespace-nowrap truncate sm:hidden"
                            >QRIS</span
                        >
                        <span
                            class="hidden sm:inline text-xs whitespace-nowrap truncate"
                            >QRIS Otomatis</span
                        >
                    </button>

                    <button
                        @click="activeTab = 'manual'"
                        class="flex-1 py-2.5 rounded-xl font-black transition-all flex items-center justify-center gap-2 overflow-hidden"
                        :class="
                            activeTab === 'manual'
                                ? 'bg-indigo-600 text-white shadow-md'
                                : 'text-slate-600 dark:text-slate-200 hover:bg-white/70 dark:hover:bg-white/10'
                        "
                    >
                        <CreditCard :size="16" class="shrink-0" />
                        <span
                            class="text-[11px] sm:text-xs whitespace-nowrap truncate sm:hidden"
                            >Manual</span
                        >
                        <span
                            class="hidden sm:inline text-xs whitespace-nowrap truncate"
                            >Transfer Manual</span
                        >
                    </button>
                </div>
            </div>

            <!-- Body -->
            <div
                class="px-4 sm:px-6 py-4 overflow-y-auto custom-scrollbar flex-1"
            >
                <div
                    class="rounded-3xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-4"
                >
                    <div
                        class="flex items-center justify-between gap-3 min-w-0"
                    >
                        <div class="min-w-0">
                            <p
                                class="text-[10px] font-extrabold tracking-widest uppercase text-slate-400"
                            >
                                Total
                            </p>
                            <p
                                class="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-1 truncate"
                            >
                                {{ formatRupiah(totalPrice) }}
                            </p>
                        </div>

                        <button
                            class="shrink-0 w-11 h-11 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 flex items-center justify-center text-indigo-600 dark:text-indigo-300 shadow-sm"
                            @click="
                                copyToClipboard(totalPrice.toString(), 'total')
                            "
                            aria-label="Copy amount"
                        >
                            <Check
                                v-if="copiedTotal"
                                :size="18"
                                class="text-emerald-500"
                            />
                            <Copy v-else :size="18" />
                        </button>
                    </div>

                    <div
                        class="mt-2 flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-300"
                    >
                        <Info :size="14" class="text-slate-400 shrink-0" />
                        <span class="truncate"
                            >Nominal QR otomatis mengikuti total.</span
                        >
                    </div>
                </div>

                <!-- QRIS -->
                <div v-if="activeTab === 'qris'" class="mt-4 space-y-3">
                    <div
                        v-if="qrisState.isLoading"
                        class="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 p-4"
                    >
                        <div class="flex items-center gap-3 min-w-0">
                            <div
                                class="w-11 h-11 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 flex items-center justify-center shrink-0"
                            >
                                <Loader2
                                    :size="20"
                                    class="text-indigo-600 dark:text-indigo-300 animate-spin"
                                />
                            </div>
                            <div class="min-w-0">
                                <p
                                    class="text-sm font-black text-slate-900 dark:text-white"
                                >
                                    Membuat QRIS
                                </p>
                                <p
                                    class="text-xs text-slate-500 dark:text-slate-300 mt-0.5 truncate"
                                >
                                    {{ loadingStage }}
                                </p>
                            </div>
                        </div>

                        <div
                            class="mt-4 w-full rounded-3xl bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/10 relative overflow-hidden"
                            style="aspect-ratio: 1 / 1"
                        >
                            <div class="absolute inset-0 shimmer"></div>
                            <div
                                class="absolute inset-0 flex items-center justify-center"
                            >
                                <p
                                    class="text-[11px] font-bold text-slate-400 dark:text-slate-400"
                                >
                                    QR siap sebentar lagi…
                                </p>
                            </div>
                        </div>
                    </div>

                    <div
                        v-else-if="!qrisState.error && qrisState.data"
                        class="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 p-4"
                    >
                        <div
                            class="flex items-start justify-between gap-2 min-w-0"
                        >
                            <div class="min-w-0">
                                <p
                                    class="text-sm font-black text-slate-900 dark:text-white"
                                >
                                    Scan QRIS
                                </p>
                                <p
                                    class="text-xs text-slate-500 dark:text-slate-300 mt-1 truncate"
                                >
                                    Scan pakai e-wallet / m-banking.
                                </p>
                            </div>

                            <!-- ✅ actions mini: refresh + download -->
                            <div class="flex items-center gap-2 shrink-0">
                                <button
                                    @click="handleRetry"
                                    class="w-10 h-10 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 transition flex items-center justify-center"
                                    aria-label="Refresh QR"
                                    title="Refresh"
                                >
                                    <RefreshCw :size="16" />
                                </button>

                                <button
                                    @click="downloadQR"
                                    class="w-10 h-10 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 transition flex items-center justify-center"
                                    aria-label="Download QR"
                                    title="Download"
                                >
                                    <Download :size="16" />
                                </button>
                            </div>
                        </div>

                        <div
                            class="mt-4 bg-white rounded-3xl border border-slate-200 dark:border-white/10 p-3 flex items-center justify-center"
                        >
                            <img
                                :src="qrisState.data"
                                alt="QRIS Dynamic"
                                class="w-44 h-44 sm:w-56 sm:h-56 object-contain rounded-2xl"
                            />
                        </div>

                        <div
                            class="mt-3 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 px-3 py-2"
                        >
                            <p
                                class="text-[11px] font-bold text-slate-600 dark:text-slate-200"
                            >
                                Scan → Bayar → Konfirmasi
                            </p>
                            <p
                                class="text-[11px] text-slate-500 dark:text-slate-300"
                            >
                                Setelah bayar, klik “Saya Sudah Bayar”.
                            </p>
                        </div>
                    </div>

                    <div
                        v-else
                        class="rounded-3xl border border-rose-200 dark:border-rose-500/20 bg-rose-50/70 dark:bg-rose-500/5 p-4"
                    >
                        <div class="flex items-start gap-3 min-w-0">
                            <div
                                class="w-11 h-11 rounded-2xl bg-white dark:bg-white/10 border border-rose-200 dark:border-rose-500/20 flex items-center justify-center shrink-0"
                            >
                                <AlertCircle
                                    :size="20"
                                    class="text-rose-600 dark:text-rose-300"
                                />
                            </div>
                            <div class="min-w-0">
                                <p
                                    class="text-sm font-black text-slate-900 dark:text-white"
                                >
                                    QR Otomatis Tidak Tersedia
                                </p>
                                <p
                                    class="text-xs text-slate-600 dark:text-slate-300 mt-1"
                                >
                                    {{ qrisState.errorMessage }}
                                </p>
                            </div>
                        </div>

                        <div
                            class="mt-4 bg-white rounded-3xl border border-slate-200 dark:border-white/10 p-3 flex items-center justify-center"
                        >
                            <img
                                :src="qrisStaticImage"
                                alt="QRIS Static"
                                class="w-44 h-44 sm:w-56 sm:h-56 object-contain rounded-2xl opacity-90"
                            />
                        </div>

                        <button
                            @click="handleRetry"
                            class="mt-4 w-full py-3 rounded-2xl bg-white dark:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 font-black text-sm hover:bg-slate-50 dark:hover:bg-white/20 transition flex items-center justify-center gap-2"
                        >
                            <RefreshCw :size="16" />
                            Coba Lagi
                        </button>
                    </div>
                </div>

                <!-- Manual -->
                <div v-else class="mt-4 space-y-3">
                    <div
                        class="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 p-4"
                    >
                        <p
                            class="text-sm font-black text-slate-900 dark:text-white"
                        >
                            Transfer Manual
                        </p>
                        <p
                            class="text-xs text-slate-500 dark:text-slate-300 mt-1"
                        >
                            Salin nomor tujuan lalu transfer sesuai total.
                        </p>

                        <div
                            class="mt-4 rounded-3xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-4"
                        >
                            <p
                                class="text-xs font-bold text-slate-500 dark:text-slate-300"
                            >
                                {{ rekening.bank }}
                            </p>
                            <p
                                class="mt-1 text-xl sm:text-2xl font-black font-mono text-slate-900 dark:text-white tracking-wide break-all"
                            >
                                {{ rekening.number }}
                            </p>
                            <p
                                class="text-[11px] text-slate-400 mt-1 uppercase"
                            >
                                {{ rekening.name }}
                            </p>

                            <button
                                @click="
                                    copyToClipboard(rekening.number, 'number')
                                "
                                class="mt-4 w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm transition flex items-center justify-center gap-2"
                            >
                                <Check
                                    v-if="copiedNumber"
                                    :size="18"
                                    class="text-white"
                                />
                                <span class="whitespace-nowrap">
                                    {{
                                        copiedNumber
                                            ? "Tersalin"
                                            : "Salin Nomor"
                                    }}
                                </span>
                                <Copy v-if="!copiedNumber" :size="18" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Footer -->
            <div
                class="px-4 sm:px-6 py-4 border-t border-slate-100 dark:border-white/10 bg-white dark:bg-slate-950"
            >
                <button
                    @click="openWhatsApp"
                    class="w-full py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-black shadow-lg shadow-emerald-200/60 dark:shadow-none transition active:scale-[0.99] flex items-center justify-center gap-2"
                >
                    <MessageCircle :size="20" class="shrink-0" />
                    <span class="whitespace-nowrap">Saya Sudah Bayar</span>
                </button>

                <button
                    @click="$emit('close')"
                    class="w-full text-xs font-black text-slate-400 hover:text-slate-600 py-3 mt-1"
                >
                    Bayar Nanti
                </button>
            </div>
        </div>
    </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
    width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
    background-color: #cbd5e1;
    border-radius: 20px;
}
:global(.dark) .custom-scrollbar::-webkit-scrollbar-thumb {
    background-color: #475569;
}

/* shimmer skeleton */
.shimmer {
    background: linear-gradient(
        90deg,
        rgba(148, 163, 184, 0) 0%,
        rgba(148, 163, 184, 0.18) 50%,
        rgba(148, 163, 184, 0) 100%
    );
    transform: translateX(-100%);
    animation: shimmer 1.2s infinite;
}
@keyframes shimmer {
    0% {
        transform: translateX(-100%);
    }
    100% {
        transform: translateX(100%);
    }
}
</style>
