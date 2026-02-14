<script setup>
import { ref, reactive } from "vue";
import { useUserStore } from "../stores/user";
import { useToastStore } from "../stores/toast";
import { useRouter } from "vue-router";
import { formatRupiah } from "../utils/format";
import {
    ChevronLeft,
    Wallet,
    CreditCard,
    QrCode,
    ArrowRight,
    CheckCircle2,
    AlertCircle,
    ShieldCheck,
    Zap,
    HelpCircle,
} from "lucide-vue-next";

const userStore = useUserStore();
const toastStore = useToastStore();
const router = useRouter();

// State
const amount = ref("");
const selectedMethod = ref("qris");

// Options
const quickAmounts = [10000, 20000, 25000, 50000, 100000, 250000];

const paymentMethods = [
    {
        id: "qris",
        name: "QRIS (All E-Wallet)",
        desc: "Scan pakai GoPay, OVO, ShopeePay, Dana, dll.",
        icon: QrCode,
        color: "text-sky-500 bg-sky-100 dark:bg-sky-900/30",
    },
    {
        id: "dana",
        name: "Transfer DANA",
        desc: "Kirim ke nomor admin (Tanpa biaya admin)",
        icon: Wallet,
        color: "text-blue-500 bg-blue-100 dark:bg-blue-900/30",
    },
    {
        id: "bca",
        name: "Transfer Bank BCA",
        desc: "Cek otomatis (08:00 - 21:00 WIB)",
        icon: CreditCard,
        color: "text-indigo-500 bg-indigo-100 dark:bg-indigo-900/30",
    },
];

const steps = [
    { title: "Isi Nominal", desc: "Masukkan jumlah saldo yang diinginkan." },
    {
        title: "Chat Admin",
        desc: "Klik tombol lanjut, kirim format order ke WA.",
    },
    { title: "Transfer", desc: "Lakukan pembayaran sesuai instruksi admin." },
    { title: "Selesai!", desc: "Saldo akan bertambah di akun kamu." },
];
const selectAmount = (val) => {
    amount.value = val;
};

const handleTopUpProcess = () => {
    if (!amount.value || amount.value < 10000) {
        toastStore.trigger("Minimal Top Up Rp 10.000 ya kak! 😊", "warning");
        return;
    }

    const methodName =
        paymentMethods.find((m) => m.id === selectedMethod.value)?.name ||
        "Lainnya";

    // Format Pesan WhatsApp
    const message =
        `Halo Admin Aiya! 👋%0A%0A` +
        `Saya mau *Top Up Saldo Member* dong! 💎%0A` +
        `--------------------------------%0A` +
        `👤 Nama: ${userStore.user?.displayName || "Member"}%0A` +
        `📧 Email: ${userStore.user?.email}%0A` +
        `💰 Nominal: *${formatRupiah(amount.value)}*%0A` +
        `💳 Via: ${methodName}%0A` +
        `--------------------------------%0A` +
        `Mohon kirimkan detail pembayarannya ya! ✨`;

    window.open(`https://wa.me/6285942963323?text=${message}`, "_blank");
};
</script>

<template>
    <div
        class="min-h-screen bg-cream dark:bg-charcoal pt-24 pb-20 px-4 md:px-6 transition-colors duration-300"
    >
        <div class="max-w-2xl mx-auto">
            <button
                @click="router.back()"
                class="flex items-center gap-2 text-slate-400 hover:text-sky-500 dark:text-slate-300 dark:hover:text-sky-400 transition mb-6 font-bold text-sm"
            >
                <ChevronLeft :size="18" /> Kembali
            </button>

            <div class="text-center mb-8">
                <div
                    class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mb-4 shadow-lg shadow-indigo-200 dark:shadow-none animate-float-slow"
                >
                    <Wallet :size="32" class="text-white" />
                </div>
                <h1
                    class="text-3xl md:text-4xl font-black text-slate-800 dark:text-slate-100 mb-2"
                >
                    Isi Saldo Member
                </h1>
                <p class="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                    Top up saldo untuk kemudahan transaksi joki tanpa ribet
                    transfer berulang kali.
                </p>
            </div>

            <div
                class="bg-white/70 dark:bg-slate-900/30 backdrop-blur-md rounded-[2rem] p-6 md:p-8 shadow-xl shadow-slate-200/40 dark:shadow-none border border-white/60 dark:border-white/10 relative overflow-hidden"
            >
                <div
                    class="absolute top-0 right-0 w-64 h-64 bg-indigo-50 dark:bg-indigo-900/10 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2 pointer-events-none"
                ></div>

                <div class="mb-8">
                    <label
                        class="block text-sm font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wide mb-3"
                    >
                        Mau isi berapa?
                    </label>

                    <div class="relative group mb-4">
                        <span
                            class="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xl"
                            >Rp</span
                        >
                        <input
                            type="number"
                            v-model="amount"
                            placeholder="0"
                            class="w-full pl-14 pr-6 py-5 bg-white/70 dark:bg-slate-900/30 border-2 border-slate-200 dark:border-slate-700 rounded-2xl text-2xl font-black text-slate-700 dark:text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition"
                        />
                    </div>

                    <div class="grid grid-cols-3 gap-3">
                        <button
                            v-for="val in quickAmounts"
                            :key="val"
                            @click="selectAmount(val)"
                            class="py-3 rounded-xl text-sm font-bold border-2 transition-all active:scale-95"
                            :class="
                                amount === val
                                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400'
                                    : 'border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 hover:border-indigo-300 dark:hover:border-indigo-500'
                            "
                        >
                            {{ val / 1000 }}k
                        </button>
                    </div>
                </div>

                <div class="mb-8">
                    <label
                        class="block text-sm font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wide mb-3"
                    >
                        Metode Pembayaran
                    </label>
                    <div class="space-y-3">
                        <button
                            v-for="method in paymentMethods"
                            :key="method.id"
                            @click="selectedMethod = method.id"
                            class="w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left group"
                            :class="
                                selectedMethod === method.id
                                    ? 'border-indigo-500 bg-white dark:bg-slate-800 shadow-md ring-1 ring-indigo-500/20'
                                    : 'border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 hover:border-slate-300 dark:hover:border-slate-600'
                            "
                        >
                            <div
                                class="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110"
                                :class="method.color"
                            >
                                <component :is="method.icon" :size="24" />
                            </div>
                            <div class="flex-1">
                                <p
                                    class="font-bold text-slate-800 dark:text-slate-100"
                                >
                                    {{ method.name }}
                                </p>
                                <p
                                    class="text-xs text-slate-500 dark:text-slate-400"
                                >
                                    {{ method.desc }}
                                </p>
                            </div>
                            <div
                                class="w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors"
                                :class="
                                    selectedMethod === method.id
                                        ? 'border-indigo-500 bg-indigo-500'
                                        : 'border-slate-300 dark:border-slate-600'
                                "
                            >
                                <CheckCircle2
                                    v-if="selectedMethod === method.id"
                                    :size="14"
                                    class="text-white"
                                />
                            </div>
                        </button>
                    </div>
                </div>

                <button
                    @click="handleTopUpProcess"
                    class="w-full py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold shadow-lg shadow-indigo-200 dark:shadow-none hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-lg btn-bouncy"
                >
                    Lanjut ke WhatsApp <ArrowRight :size="20" />
                </button>
                <p class="text-center text-xs text-slate-400 mt-4">
                    <ShieldCheck :size="12" class="inline mb-0.5" /> Transaksi
                    aman & terpercaya via Admin AiyaShop.
                </p>
            </div>

            <div class="mt-12 grid md:grid-cols-2 gap-8">
                <div>
                    <h3
                        class="font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2"
                    >
                        <Zap :size="18" class="text-amber-500" /> Cara Top Up
                    </h3>
                    <div class="space-y-6 pl-2">
                        <div
                            v-for="(step, i) in steps"
                            :key="i"
                            class="relative pl-8 border-l-2 border-slate-100 dark:border-slate-700"
                        >
                            <div
                                class="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-slate-200 dark:bg-slate-700 border-2 border-white dark:border-charcoal"
                            ></div>
                            <h4
                                class="font-bold text-sm text-slate-700 dark:text-slate-200"
                            >
                                {{ step.title }}
                            </h4>
                            <p
                                class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed"
                            >
                                {{ step.desc }}
                            </p>
                        </div>
                    </div>
                </div>

                <div
                    class="bg-indigo-50 dark:bg-indigo-900/10 p-6 rounded-3xl border border-indigo-100 dark:border-indigo-800/30"
                >
                    <h3
                        class="font-bold text-indigo-900 dark:text-indigo-200 mb-4 flex items-center gap-2"
                    >
                        <HelpCircle :size="18" /> Info Penting
                    </h3>
                    <ul
                        class="space-y-3 text-xs md:text-sm text-indigo-800 dark:text-indigo-300/80 list-disc pl-4"
                    >
                        <li>
                            Saldo member <b>tidak ada masa aktif</b> (hangus).
                        </li>
                        <li>
                            Bisa digunakan untuk semua layanan joki (Heart, CR,
                            dll).
                        </li>
                        <li>Minimal top up <b>Rp 10.000</b>.</li>
                        <li>
                            Jika salah transfer, segera hubungi admin dengan
                            bukti transfer.
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.animate-float-slow {
    animation: float 6s ease-in-out infinite;
}
@keyframes float {
    0%,
    100% {
        transform: translateY(0);
    }
    50% {
        transform: translateY(-10px);
    }
}
</style>