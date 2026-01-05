<script setup>
import { computed } from "vue";
import { useUserStore } from "../stores/user";
import { useThemeStore } from "../stores/theme";
import { Crown, Zap, Sparkles, Feather, Wallet } from "lucide-vue-next";
import { formatRupiah } from "../utils/format";

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

const clampPercent = computed(() => {
    const p = Number(progressInfo.value.percent || 0);
    return Math.max(0, Math.min(100, p));
});

const displayName = computed(() => {
    return (
        userStore.memberData?.name ||
        userStore.user?.displayName ||
        userStore.user?.email?.split("@")?.[0] ||
        "Member"
    );
});

const totals = computed(() => {
    return {
        saldo: Number(userStore.memberData?.saldo || 0),
        totalTopUp: Number(userStore.memberData?.totalTopUp || 0),
    };
});

const nextRankDetail = computed(() => {
    const total = totals.value.totalTopUp;

    if (total > 1000000) {
        return { label: "Max Rank", remaining: 0, target: 1000000 };
    }
    if (total > 500000) {
        return {
            label: "Elder",
            remaining: Math.max(0, 1000000 - total),
            target: 1000000,
        };
    }
    if (total > 100000) {
        return {
            label: "Phoenix",
            remaining: Math.max(0, 500000 - total),
            target: 500000,
        };
    }
    return {
        label: "Butterfly",
        remaining: Math.max(0, 100000 - total),
        target: 100000,
    };
});
</script>

<template>
    <div class="w-full py-2">
        <div
            class="relative overflow-hidden rounded-3xl p-4 md:p-6 border transition-colors duration-300"
            :class="[
                themeStore.isDark
                    ? 'bg-graphite/70 border-metal/70'
                    : 'bg-white/70 border-white/60 shadow-xl shadow-slate-200/40',
            ]"
        >
            <!-- Cozy decoration blobs (subtle, premium) -->
            <div
                class="absolute -top-12 -right-10 w-36 h-36 rounded-full blur-3xl opacity-[0.12] pointer-events-none"
                :class="memberLevel.bg"
            />
            <div
                class="absolute -bottom-12 -left-10 w-36 h-36 rounded-full blur-3xl opacity-[0.10] pointer-events-none"
                :class="memberLevel.bg"
            />
            <div
                class="absolute inset-0 pointer-events-none opacity-[0.10]"
                :class="
                    themeStore.isDark
                        ? 'bg-[radial-gradient(circle_at_20%_10%,rgba(255,255,255,0.25),transparent_40%)]'
                        : 'bg-[radial-gradient(circle_at_20%_10%,rgba(0,0,0,0.06),transparent_40%)]'
                "
            />

            <!-- Header -->
            <div class="flex items-start justify-between gap-3">
                <div class="flex items-center gap-3 min-w-0">
                    <div
                        class="relative shrink-0 w-11 h-11 md:w-12 md:h-12 rounded-2xl flex items-center justify-center border"
                        :class="[
                            memberLevel.softBg,
                            themeStore.isDark
                                ? 'border-white/10'
                                : 'border-slate-100',
                        ]"
                    >
                        <component
                            :is="memberLevel.icon"
                            class="w-5 h-5 md:w-6 md:h-6"
                            :class="memberLevel.text"
                        />
                        <div
                            class="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2"
                            :class="[
                                memberLevel.bg,
                                themeStore.isDark
                                    ? 'border-graphite'
                                    : 'border-white',
                            ]"
                        />
                    </div>

                    <div class="min-w-0">
                        <p
                            class="text-[10px] md:text-xs font-bold uppercase tracking-widest"
                            :class="
                                themeStore.isDark
                                    ? 'text-slate-400'
                                    : 'text-slate-400'
                            "
                        >
                            Member Card
                        </p>

                        <div class="flex items-center gap-2 min-w-0">
                            <h3
                                class="text-base md:text-lg font-black tracking-tight truncate"
                                :class="
                                    themeStore.isDark
                                        ? 'text-white'
                                        : 'text-slate-800'
                                "
                            >
                                {{ displayName }}
                            </h3>
                            <span
                                class="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-black border"
                                :class="[
                                    memberLevel.softBg,
                                    memberLevel.border,
                                    themeStore.isDark
                                        ? 'text-slate-200'
                                        : 'text-slate-700',
                                ]"
                            >
                                {{ memberLevel.name }}
                            </span>
                        </div>
                    </div>
                </div>

                <!-- Saldo pill (compact biar ga panjang di mobile) -->
                <div
                    class="shrink-0 rounded-2xl px-3 py-2 border"
                    :class="[
                        themeStore.isDark
                            ? 'bg-slate-900/30 border-white/10'
                            : 'bg-cream/70 border-slate-100',
                    ]"
                >
                    <p
                        class="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest"
                        :class="
                            themeStore.isDark
                                ? 'text-slate-400'
                                : 'text-slate-500'
                        "
                    >
                        <Wallet class="w-3.5 h-3.5" />
                        Saldo
                    </p>
                    <p
                        class="text-sm md:text-base font-black tracking-tight"
                        :class="
                            themeStore.isDark ? 'text-white' : 'text-slate-800'
                        "
                    >
                        {{ formatRupiah(totals.saldo) }}
                    </p>
                </div>
            </div>

            <!-- Body stats (mini chips, biar cozy dan nggak vertikal) -->
            <div class="mt-4 grid grid-cols-2 gap-2">
                <div
                    class="rounded-2xl p-3 border"
                    :class="[
                        themeStore.isDark
                            ? 'bg-slate-900/25 border-white/10'
                            : 'bg-white/60 border-slate-100',
                    ]"
                >
                    <p
                        class="text-[10px] font-bold uppercase tracking-widest"
                        :class="
                            themeStore.isDark
                                ? 'text-slate-400'
                                : 'text-slate-500'
                        "
                    >
                        Total Top Up
                    </p>
                    <p
                        class="mt-0.5 text-sm md:text-base font-black tracking-tight"
                        :class="
                            themeStore.isDark ? 'text-white' : 'text-slate-800'
                        "
                    >
                        {{ formatRupiah(totals.totalTopUp) }}
                    </p>
                </div>

                <div
                    class="rounded-2xl p-3 border"
                    :class="[
                        themeStore.isDark
                            ? 'bg-slate-900/25 border-white/10'
                            : 'bg-white/60 border-slate-100',
                    ]"
                >
                    <p
                        class="text-[10px] font-bold uppercase tracking-widest"
                        :class="
                            themeStore.isDark
                                ? 'text-slate-400'
                                : 'text-slate-500'
                        "
                    >
                        Next Rank
                    </p>
                    <p
                        class="mt-0.5 text-sm md:text-base font-black tracking-tight"
                        :class="
                            themeStore.isDark ? 'text-white' : 'text-slate-800'
                        "
                    >
                        {{ nextRankDetail.label }}
                    </p>
                </div>
            </div>

            <!-- Progress (lebih premium & rapih) -->
            <div class="mt-4">
                <div class="flex items-center justify-between mb-2">
                    <p
                        class="text-[10px] md:text-xs font-bold"
                        :class="
                            themeStore.isDark
                                ? 'text-slate-400'
                                : 'text-slate-500'
                        "
                    >
                        Progress
                    </p>
                    <p
                        class="text-[10px] md:text-xs font-black"
                        :class="
                            themeStore.isDark
                                ? 'text-slate-300'
                                : 'text-slate-600'
                        "
                    >
                        <span v-if="nextRankDetail.remaining > 0">
                            Kurang {{ formatRupiah(nextRankDetail.remaining) }}
                        </span>
                        <span v-else>Sudah mentok ✨</span>
                    </p>
                </div>

                <div
                    class="h-3 rounded-full overflow-hidden border"
                    :class="[
                        themeStore.isDark
                            ? 'bg-slate-900/35 border-white/10'
                            : 'bg-slate-100/80 border-slate-200/60',
                    ]"
                >
                    <div
                        class="h-full rounded-full transition-all duration-700 ease-out relative overflow-hidden"
                        :class="memberLevel.bg"
                        :style="{ width: `${clampPercent}%` }"
                    >
                        <div
                            class="absolute inset-0 bg-white/30 w-full -translate-x-full animate-shine"
                        />
                    </div>
                </div>

                <div class="mt-2 flex items-center justify-between">
                    <p
                        class="text-[10px] font-bold"
                        :class="
                            themeStore.isDark
                                ? 'text-slate-400'
                                : 'text-slate-500'
                        "
                    >
                        {{ Math.round(clampPercent) }}%
                    </p>
                    <p
                        class="text-[10px] font-bold"
                        :class="
                            themeStore.isDark
                                ? 'text-slate-400'
                                : 'text-slate-500'
                        "
                    >
                        Target: {{ formatRupiah(nextRankDetail.target) }}
                    </p>
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
    animation: shine 2.2s infinite linear;
}
</style>
