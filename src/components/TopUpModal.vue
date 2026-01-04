<script setup>
import { ref, reactive, computed } from "vue";
import { useUserStore } from "../stores/user";
import { formatRupiah } from "../utils/format";
import {
    X,
    Wallet,
    CreditCard,
    Banknote,
    QrCode,
    ArrowRight,
    CheckCircle2,
} from "lucide-vue-next";

const props = defineProps({
    isOpen: Boolean,
});

const emit = defineEmits(["close"]);
const userStore = useUserStore();

// State
const amount = ref(0); // Custom amount
const selectedMethod = ref("qris");

// Quick Select Options
const quickAmounts = [10000, 20000, 25000, 50000, 100000, 250000];

const paymentMethods = [
    {
        id: "qris",
        name: "QRIS (All E-Wallet)",
        icon: QrCode,
        color: "text-sky-500 bg-sky-100 dark:bg-sky-900/30",
    },
    {
        id: "dana",
        name: "DANA",
        icon: Wallet,
        color: "text-blue-500 bg-blue-100 dark:bg-blue-900/30",
    },
    {
        id: "bca",
        name: "Transfer BCA",
        icon: CreditCard,
        color: "text-indigo-500 bg-indigo-100 dark:bg-indigo-900/30",
    },
];
const selectAmount = (val) => {
    amount.value = val;
};

const handleTopUpProcess = () => {
    if (amount.value < 10000) {
        alert("Minimal Top Up Rp 10.000 ya kak! 😊");
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
    emit("close");
};
</script>

<template>
    <transition name="modal-fade">
        <div
            v-if="isOpen"
            class="fixed inset-0 z-[100] flex items-center justify-center p-4"
        >
            <div
                class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
                @click="emit('close')"
            ></div>

            <div
                class="bg-white dark:bg-charcoal w-full max-w-md rounded-[2rem] shadow-2xl relative z-10 animate-in zoom-in-95 duration-200 border border-slate-100 dark:border-slate-700 overflow-hidden flex flex-col max-h-[90vh]"
            >
                <div
                    class="p-6 pb-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-between items-center"
                >
                    <div>
                        <h3
                            class="text-lg font-bold text-slate-800 dark:text-slate-100"
                        >
                            Isi Saldo Member
                        </h3>
                        <p class="text-xs text-slate-500 dark:text-slate-400">
                            Top up mudah, aman & instan!
                        </p>
                    </div>
                    <button
                        @click="emit('close')"
                        class="p-2 bg-white dark:bg-slate-800 rounded-full text-slate-400 hover:text-rose-500 shadow-sm border border-slate-100 dark:border-slate-700 transition"
                    >
                        <X :size="20" />
                    </button>
                </div>

                <div class="p-6 overflow-y-auto custom-scrollbar">
                    <div class="mb-6">
                        <label
                            class="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2"
                            >Mau isi berapa?</label
                        >
                        <div class="relative group">
                            <span
                                class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold"
                                >Rp</span
                            >
                            <input
                                type="number"
                                v-model="amount"
                                placeholder="0"
                                class="w-full pl-10 pr-4 py-4 bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-2xl text-xl font-black text-slate-700 dark:text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition"
                            />
                        </div>
                    </div>

                    <div class="mb-6">
                        <p class="text-[10px] text-slate-400 font-bold mb-2">
                            PILIHAN CEPAT
                        </p>
                        <div class="grid grid-cols-3 gap-2">
                            <button
                                v-for="val in quickAmounts"
                                :key="val"
                                @click="selectAmount(val)"
                                class="py-2.5 rounded-xl text-xs font-bold border-2 transition-all active:scale-95"
                                :class="
                                    amount === val
                                        ? 'border-indigo-500 bg-indigo-500 text-white shadow-lg shadow-indigo-200 dark:shadow-none'
                                        : 'border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:border-indigo-300 dark:hover:border-indigo-500'
                                "
                            >
                                {{ val / 1000 }}k
                            </button>
                        </div>
                    </div>

                    <div>
                        <label
                            class="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2"
                            >Bayar Pakai Apa?</label
                        >
                        <div class="space-y-2">
                            <button
                                v-for="method in paymentMethods"
                                :key="method.id"
                                @click="selectedMethod = method.id"
                                class="w-full flex items-center gap-3 p-3 rounded-2xl border-2 transition-all"
                                :class="
                                    selectedMethod === method.id
                                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                                        : 'border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600'
                                "
                            >
                                <div
                                    class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                                    :class="method.color"
                                >
                                    <component :is="method.icon" :size="20" />
                                </div>
                                <span
                                    class="flex-1 text-left font-bold text-slate-700 dark:text-slate-200 text-sm"
                                    >{{ method.name }}</span
                                >
                                <div
                                    class="w-5 h-5 rounded-full border-2 flex items-center justify-center"
                                    :class="
                                        selectedMethod === method.id
                                            ? 'border-indigo-500 bg-indigo-500'
                                            : 'border-slate-300 dark:border-slate-600'
                                    "
                                >
                                    <CheckCircle2
                                        v-if="selectedMethod === method.id"
                                        :size="12"
                                        class="text-white"
                                    />
                                </div>
                            </button>
                        </div>
                    </div>
                </div>

                <div
                    class="p-6 pt-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-charcoal"
                >
                    <button
                        @click="handleTopUpProcess"
                        class="w-full py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold shadow-lg shadow-indigo-200 dark:shadow-none hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                        Lanjut ke WhatsApp <ArrowRight :size="18" />
                    </button>
                </div>
            </div>
        </div>
    </transition>
</template>

<style scoped>
.modal-fade-enter-active,
.modal-fade-leave-active {
    transition: opacity 0.3s ease;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
    opacity: 0;
}

.custom-scrollbar::-webkit-scrollbar {
    width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
    background-color: #cbd5e1;
    border-radius: 20px;
}
:global(.dark) .custom-scrollbar::-webkit-scrollbar-thumb {
    background-color: #475569;
}
</style>