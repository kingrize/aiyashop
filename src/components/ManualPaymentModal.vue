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
} from "lucide-vue-next";
import qrisStaticImage from "../assets/qris.jpg"; // fallback gambar statis (optional)

// ====== PROPS / EMITS ======
const props = defineProps({
    isOpen: Boolean,
    totalPrice: Number,
    orderId: String,
});

const emit = defineEmits(["close"]);

// ====== QRIS BASE PAYLOAD (punya kamu) ======
// Ini QRIS statis kamu (string EMV) yang kamu kirim:
const BASE_QRIS_PAYLOAD =
    "00020101021126610014COM.GO-JEK.WWW01189360091431999512000210G1999512000303UMI51440014ID.CO.QRIS.WWW0215ID10254602759650303UMI5204549953033605802ID5908aiyashop6006MANADO61059525162070703A0163047950";

// ====== STATE ======
const activeTab = ref("qris");
const qrisState = ref({
    isLoading: false,
    data: null, // dataURL PNG hasil generate
    error: false,
    errorMessage: "",
});

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

// ====== EMV QR (TLV) HELPERS ======
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

// CRC-16/CCITT-FALSE (poly 0x1021, init 0xFFFF)
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
    // payloadWithoutCRC harus berakhir dengan "6304"
    const crc = crc16ccittFalse(payloadWithoutCRC);
    return payloadWithoutCRC + crc;
}

/**
 * Membuat payload QRIS baru dengan nominal:
 * - Hapus CRC lama (63)
 * - Set 01=12 (dynamic) (opsional tapi disarankan)
 * - Set 54=amount
 * - Hitung CRC baru
 */
function makeQrisWithAmount(
    basePayload,
    amountNumber,
    { forceDynamic = true } = {},
) {
    const amount = String(Math.round(Number(amountNumber || 0)));
    if (!amount || amount === "NaN" || Number(amount) <= 0) {
        throw new Error("Amount harus angka > 0");
    }

    // Parse
    const items = parseTLV(basePayload);

    // Buang CRC lama
    removeTag(items, "63");

    // Set initiation method ke dynamic
    if (forceDynamic) {
        upsertTag(items, "01", "12");
    }

    // Set amount
    upsertTag(items, "54", amount);

    // Rebuild + CRC
    const payloadNoCrc = buildTLV(items) + "6304";
    return rebuildWithCRC(payloadNoCrc);
}

// ====== Generate QR Image Offline ======
const generateDynamicQR = async () => {
    qrisState.value = {
        isLoading: true,
        data: null,
        error: false,
        errorMessage: "",
    };

    try {
        const nominal = props.totalPrice;

        // 1) build payload dinamis
        const newPayload = makeQrisWithAmount(BASE_QRIS_PAYLOAD, nominal, {
            forceDynamic: true,
        });

        // 2) generate QR PNG as dataURL
        const dataUrl = await QRCode.toDataURL(newPayload, {
            margin: 1,
            scale: 8,
            errorCorrectionLevel: "M",
        });

        qrisState.value.data = dataUrl;
    } catch (err) {
        console.error("❌ Gagal Generate QRIS Offline:", err);
        qrisState.value.error = true;
        qrisState.value.errorMessage =
            "Gagal membuat QRIS (offline). Coba mode manual.";
    } finally {
        qrisState.value.isLoading = false;
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

// ====== UTIL UI ======
const copyToClipboard = async (text, type) => {
    try {
        await navigator.clipboard.writeText(text);
        if (type === "number") {
            copiedNumber.value = true;
            setTimeout(() => (copiedNumber.value = false), 2000);
        } else {
            copiedTotal.value = true;
            setTimeout(() => (copiedTotal.value = false), 2000);
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

const handleRetry = () => {
    generateDynamicQR();
};
</script>

<template>
    <div
        v-if="isOpen"
        class="fixed inset-0 z-[100] flex items-center justify-center p-4"
    >
        <div
            class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
            @click="$emit('close')"
        ></div>

        <div
            class="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[2.5rem] overflow-hidden shadow-2xl relative z-10 animate-in zoom-in-95 duration-300 border border-slate-100 dark:border-slate-800 flex flex-col max-h-[90vh]"
        >
            <div
                class="bg-slate-50 dark:bg-slate-800/50 p-6 pb-4 text-center border-b border-slate-100 dark:border-slate-800 shrink-0"
            >
                <h3 class="text-xl font-black text-slate-800 dark:text-white">
                    Pembayaran
                </h3>
                <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Order ID:
                    <span class="font-mono font-bold">{{ orderId }}</span>
                </p>

                <div
                    class="flex p-1 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 mt-4 shadow-sm"
                >
                    <button
                        @click="activeTab = 'qris'"
                        class="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all"
                        :class="
                            activeTab === 'qris'
                                ? 'bg-indigo-500 text-white shadow-md'
                                : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700'
                        "
                    >
                        <QrCode :size="16" /> QRIS Auto
                    </button>
                    <button
                        @click="activeTab = 'manual'"
                        class="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all"
                        :class="
                            activeTab === 'manual'
                                ? 'bg-indigo-500 text-white shadow-md'
                                : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700'
                        "
                    >
                        <CreditCard :size="16" /> Manual
                    </button>
                </div>
            </div>

            <div class="p-6 overflow-y-auto custom-scrollbar">
                <div class="mb-6 text-center space-y-2">
                    <label
                        class="text-[10px] font-bold text-slate-400 uppercase tracking-widest"
                        >Total Tagihan</label
                    >
                    <div
                        class="flex items-center justify-center gap-3 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl border-2 border-dashed border-indigo-200 dark:border-indigo-800/50 cursor-pointer hover:border-indigo-400 transition group"
                        @click="copyToClipboard(totalPrice.toString(), 'total')"
                    >
                        <span
                            class="text-3xl font-black text-indigo-600 dark:text-indigo-400 tracking-tight group-hover:scale-105 transition-transform"
                        >
                            {{ formatRupiah(totalPrice) }}
                        </span>
                        <div
                            class="w-8 h-8 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center text-indigo-500 shadow-sm"
                        >
                            <Check
                                v-if="copiedTotal"
                                :size="16"
                                class="text-emerald-500"
                            />
                            <Copy v-else :size="16" />
                        </div>
                    </div>
                </div>

                <!-- TAB QRIS -->
                <div
                    v-if="activeTab === 'qris'"
                    class="space-y-4 animate-in slide-in-from-right-4 duration-300"
                >
                    <div
                        v-if="qrisState.isLoading"
                        class="flex flex-col items-center justify-center py-8 space-y-3"
                    >
                        <Loader2
                            :size="40"
                            class="text-indigo-500 animate-spin"
                        />
                        <p
                            class="text-xs font-bold text-slate-500 animate-pulse"
                        >
                            Sedang generate QRIS (offline)...
                        </p>
                    </div>

                    <div
                        v-else-if="!qrisState.error && qrisState.data"
                        class="flex flex-col items-center animate-in zoom-in duration-300"
                    >
                        <div
                            class="bg-white p-3 rounded-3xl shadow-lg border border-slate-200 dark:border-slate-700 relative group"
                        >
                            <img
                                :src="qrisState.data"
                                alt="QRIS Dynamic"
                                class="w-56 h-56 object-contain rounded-2xl mix-blend-multiply"
                            />
                            <div
                                class="absolute bottom-4 left-1/2 -translate-x-1/2 bg-slate-900/80 backdrop-blur px-3 py-1 rounded-full text-[10px] font-bold text-white flex items-center gap-1 shadow-lg"
                            >
                                <RefreshCw
                                    :size="10"
                                    class="animate-spin-slow"
                                />
                                Auto Nominal
                            </div>
                        </div>
                        <p
                            class="text-[10px] font-bold text-slate-400 mt-4 uppercase tracking-wide"
                        >
                            Scan Sekarang • Nominal Pas
                        </p>
                    </div>

                    <div
                        v-else
                        class="flex flex-col items-center animate-in zoom-in duration-300"
                    >
                        <div
                            class="bg-white p-3 rounded-3xl shadow-lg border border-slate-200 dark:border-slate-700 relative grayscale opacity-90"
                        >
                            <img
                                :src="qrisStaticImage"
                                alt="QRIS Static"
                                class="w-56 h-56 object-contain rounded-2xl"
                            />
                            <div
                                class="absolute bottom-4 left-1/2 -translate-x-1/2 bg-rose-500/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-bold text-white shadow-lg"
                            >
                                Mode Manual
                            </div>
                        </div>

                        <div
                            class="mt-4 bg-rose-50 dark:bg-rose-900/20 p-2 px-4 rounded-xl border border-rose-100 dark:border-rose-800 text-center w-full"
                        >
                            <p
                                class="text-[10px] font-bold text-rose-600 dark:text-rose-400 flex items-center justify-center gap-1"
                            >
                                <AlertCircle :size="12" />
                                {{ qrisState.errorMessage }}
                            </p>
                        </div>

                        <button
                            @click="handleRetry"
                            class="mt-2 text-[10px] text-indigo-500 hover:underline flex items-center gap-1"
                        >
                            <RefreshCw :size="10" /> Coba Lagi
                        </button>
                    </div>
                </div>

                <!-- TAB MANUAL -->
                <div
                    v-else
                    class="space-y-4 animate-in slide-in-from-left-4 duration-300"
                >
                    <div
                        class="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/30"
                    >
                        <div class="flex justify-between items-start mb-2">
                            <div>
                                <p
                                    class="text-xs font-bold text-slate-500 dark:text-slate-400 mb-0.5"
                                >
                                    {{ rekening.bank }}
                                </p>
                                <p
                                    class="text-xl font-mono font-black text-slate-800 dark:text-white tracking-wide"
                                >
                                    {{ rekening.number }}
                                </p>
                                <p
                                    class="text-[10px] text-slate-400 uppercase mt-0.5"
                                >
                                    {{ rekening.name }}
                                </p>
                            </div>
                        </div>

                        <button
                            @click="copyToClipboard(rekening.number, 'number')"
                            class="w-full py-2 bg-white dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-indigo-500 transition flex items-center justify-center gap-2"
                        >
                            <Check
                                v-if="copiedNumber"
                                :size="14"
                                class="text-emerald-500"
                            />
                            <span v-else>Salin Nomor</span>
                            <Copy v-if="!copiedNumber" :size="14" />
                        </button>
                    </div>
                </div>
            </div>

            <div
                class="p-6 pt-2 shrink-0 bg-white dark:bg-slate-900 z-10 border-t border-slate-50 dark:border-slate-800/50"
            >
                <button
                    @click="openWhatsApp"
                    class="w-full py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold shadow-lg shadow-emerald-200 dark:shadow-none transition-all active:scale-[0.98] flex items-center justify-center gap-2 btn-bouncy"
                >
                    <MessageCircle :size="20" />
                    Saya Sudah Bayar
                </button>
                <button
                    @click="$emit('close')"
                    class="w-full text-xs font-bold text-slate-400 hover:text-slate-600 py-3 mt-1"
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
.animate-spin-slow {
    animation: spin 3s linear infinite;
}
@keyframes spin {
    from {
        transform: rotate(0deg);
    }
    to {
        transform: rotate(360deg);
    }
}
</style>
