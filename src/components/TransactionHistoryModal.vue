<script setup>
import { useUserStore } from "../stores/user";
import {
    X,
    ArrowUpRight,
    ArrowDownLeft,
    Clock,
    ShoppingBag,
} from "lucide-vue-next";

const userStore = useUserStore();
const emit = defineEmits(["close"]);

const formatRupiah = (val) =>
    new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
    }).format(val || 0);

const formatDate = (date) => {
    if (!date) return "-";
    // Format: 10 Mei, 14:30
    return new Intl.DateTimeFormat("id-ID", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
    }).format(date);
};
</script>

<template>
    <div class="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div
            class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
            @click="emit('close')"
        ></div>

        <div
            class="bg-white dark:bg-charcoal w-full max-w-md h-[80vh] flex flex-col rounded-[2rem] shadow-2xl relative z-10 animate-in zoom-in-95 duration-200 border border-slate-100 dark:border-slate-700 overflow-hidden"
        >
            <div
                class="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-white/50 dark:bg-slate-900/50 backdrop-blur-md"
            >
                <div>
                    <h3
                        class="font-bold text-lg text-slate-800 dark:text-slate-100"
                    >
                        Riwayat Transaksi
                    </h3>
                    <p class="text-xs text-slate-400 dark:text-slate-500">
                        Jejak saldo kamu 💸
                    </p>
                </div>
                <button
                    @click="emit('close')"
                    class="p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-400 hover:text-rose-500 transition"
                >
                    <X :size="20" />
                </button>
            </div>

            <div
                class="flex-1 overflow-y-auto p-4 custom-scrollbar bg-slate-50/50 dark:bg-slate-900/30"
            >
                <div
                    v-if="userStore.transactions.length === 0"
                    class="flex flex-col items-center justify-center h-full text-slate-400 space-y-3 opacity-60"
                >
                    <Clock
                        :size="48"
                        class="text-slate-300 dark:text-slate-700"
                    />
                    <p class="text-sm font-medium">
                        Belum ada transaksi nih...
                    </p>
                </div>

                <div v-else class="space-y-3">
                    <div
                        v-for="trx in userStore.transactions"
                        :key="trx.id"
                        class="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-center justify-between gap-3"
                    >
                        <div
                            class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                            :class="
                                trx.type === 'income'
                                    ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                                    : 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400'
                            "
                        >
                            <ArrowUpRight
                                v-if="trx.type === 'income'"
                                :size="20"
                            />
                            <ArrowDownLeft v-else :size="20" />
                        </div>

                        <div class="flex-1 min-w-0">
                            <p
                                class="font-bold text-slate-700 dark:text-slate-200 text-sm truncate"
                            >
                                {{ trx.title }}
                            </p>
                            <p
                                class="text-[10px] text-slate-400 dark:text-slate-500 truncate"
                            >
                                {{ trx.desc || "-" }}
                            </p>
                            <p
                                class="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5"
                            >
                                {{ formatDate(trx.createdAt) }}
                            </p>
                        </div>

                        <div class="text-right">
                            <p
                                class="font-bold text-sm"
                                :class="
                                    trx.type === 'income'
                                        ? 'text-emerald-600 dark:text-emerald-400'
                                        : 'text-slate-800 dark:text-slate-200'
                                "
                            >
                                {{ trx.type === "income" ? "+" : "-"
                                }}{{ formatRupiah(trx.amount) }}
                            </p>
                            <span
                                class="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-500 uppercase tracking-wide font-bold"
                            >
                                {{ trx.status || "Success" }}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
    width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
    background-color: #cbd5e1;
    border-radius: 99px;
}
:global(.dark) .custom-scrollbar::-webkit-scrollbar-thumb {
    background-color: #334155;
}
</style>
