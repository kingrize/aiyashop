<script setup>
import { computed } from "vue";
import { useUserStore } from "../stores/user";
import { useThemeStore } from "../stores/theme";
import { Crown, Zap, Sparkles, Feather, Wallet } from "lucide-vue-next";

const userStore = useUserStore();
const themeStore = useThemeStore();

// --- LOGIC RANK & TEMA ---
const memberLevel = computed(() => {
    const total =
        userStore.memberData?.totalTopUp || userStore.memberData?.saldo || 0;

    // Elder (Tertinggi)
    if (total > 1000000)
        return {
            name: "Elder",
            icon: Crown,
            text: "text-amber-500",
            bg: "bg-amber-500",
            softBg: "bg-amber-50 dark:bg-amber-900/10",
            border: "border-amber-200 dark:border-amber-800",
        };
    // Phoenix
    if (total > 500000)
        return {
            name: "Phoenix",
            icon: Zap,
            text: "text-rose-500",
            bg: "bg-rose-500",
            softBg: "bg-rose-50 dark:bg-rose-900/10",
            border: "border-rose-200 dark:border-rose-800",
        };
    // Butterfly
    if (total > 100000)
        return {
            name: "Butterfly",
            icon: Sparkles,
            text: "text-indigo-500",
            bg: "bg-indigo-500",
            softBg: "bg-indigo-50 dark:bg-indigo-900/10",
            border: "border-indigo-200 dark:border-indigo-800",
        };
    // Moth (Default)
    return {
        name: "Moth",
        icon: Feather,
        text: "text-sky-500",
        bg: "bg-sky-500",
        softBg: "bg-sky-50 dark:bg-sky-900/10",
        border: "border-sky-200 dark:border-sky-800",
    };
});

// Hitung Progress ke Rank Berikutnya
const progressInfo = computed(() => {
    const total = userStore.memberData?.totalTopUp || 0;
    if (total > 1000000) return { percent: 100, next: "Max Rank" };
    if (total > 500000)
        return { percent: ((total - 500000) / 500000) * 100, next: "Elder" };
    if (total > 100000)
        return { percent: ((total - 100000) / 400000) * 100, next: "Phoenix" };
    return { percent: (total / 100000) * 100, next: "Butterfly" };
});

const formatRupiah = (val) =>
    new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
    }).format(val || 0);
</script>

<template>
    <div class="w-full h-full py-2">
        <div
            class="relative w-full rounded-2xl md:rounded-3xl p-4 md:p-6 transition-colors duration-300 border-2"
            :class="[
                themeStore.isDark
                    ? 'bg-slate-800/50 border-slate-700'
                    : 'bg-white border-slate-100 shadow-xl shadow-slate-200/50',
            ]"
        >
            <div class="flex justify-between items-start mb-4 md:mb-6">
                <div class="flex items-center gap-3 md:gap-4">
                    <div
                        class="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center transition-colors duration-300"
                        :class="memberLevel.softBg"
                    >
                        <component
                            :is="memberLevel.icon"
                            class="w-5 h-5 md:w-6 md:h-6"
                            :class="memberLevel.text"
                        />
                    </div>

                    <div>
                        <p
                            class="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5"
                        >
                            Current Rank
                        </p>
                        <h3
                            class="text-lg md:text-xl font-black tracking-tight"
                            :class="
                                themeStore.isDark
                                    ? 'text-white'
                                    : 'text-slate-800'
                            "
                        >
                            {{ memberLevel.name }}
                        </h3>
                    </div>
                </div>

                <div
                    class="px-2 py-1 md:px-2.5 md:py-1 rounded-lg border text-[9px] md:text-[10px] font-mono font-bold tracking-widest"
                    :class="
                        themeStore.isDark
                            ? 'bg-slate-900 border-slate-700 text-slate-400'
                            : 'bg-slate-50 border-slate-200 text-slate-500'
                    "
                >
                    #{{ userStore.user?.uid.slice(0, 6).toUpperCase() }}
                </div>
            </div>

            <div class="mb-5 md:mb-6">
                <p
                    class="text-[10px] md:text-xs font-medium text-slate-400 mb-1 flex items-center gap-1.5"
                >
                    <Wallet class="w-3.5 h-3.5 md:w-4 md:h-4" /> Saldo Aktif
                </p>
                <h2
                    class="text-3xl md:text-4xl font-black tracking-tighter truncate"
                    :class="themeStore.isDark ? 'text-white' : 'text-slate-800'"
                >
                    {{ formatRupiah(userStore.memberData?.saldo) }}
                </h2>
            </div>

            <div>
                <div class="flex justify-between items-end mb-1.5 md:mb-2">
                    <div
                        class="flex items-center gap-1 text-[10px] md:text-xs font-bold text-slate-400"
                    >
                        <span>Next:</span>
                        <span :class="memberLevel.text">{{
                            progressInfo.next
                        }}</span>
                    </div>
                    <span
                        class="text-[10px] md:text-xs font-bold"
                        :class="memberLevel.text"
                    >
                        {{ Math.floor(progressInfo.percent) }}%
                    </span>
                </div>

                <div
                    class="w-full h-2 md:h-2.5 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-700"
                >
                    <div
                        class="h-full rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
                        :class="memberLevel.bg"
                        :style="{ width: `${progressInfo.percent}%` }"
                    >
                        <div
                            class="absolute inset-0 bg-white/30 w-full -translate-x-full animate-shine"
                        ></div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
@keyframes shine {
    100% {
        transform: translateX(100%);
    }
}
.animate-shine {
    animation: shine 2s infinite linear;
}
</style>
