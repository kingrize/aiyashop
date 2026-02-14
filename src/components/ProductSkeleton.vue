<template>
    <div
        class="relative h-full flex flex-col rounded-2xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-700/40"
    >
        <!-- Header shimmer -->
        <div class="h-24 md:h-28 bg-slate-200 dark:bg-slate-700 animate-pulse relative">
            <div class="absolute -bottom-1 left-0 right-0">
                <svg viewBox="0 0 400 30" class="w-full h-auto fill-white dark:fill-slate-900" preserveAspectRatio="none">
                    <path d="M0,30 L0,15 Q200,-10 400,15 L400,30 Z" />
                </svg>
            </div>
        </div>

        <!-- Icon + price -->
        <div class="relative px-5 -mt-7 z-10 flex items-end justify-between">
            <div
                class="w-14 h-14 rounded-2xl bg-slate-200 dark:bg-slate-700 animate-pulse ring-4 ring-white dark:ring-slate-900"
            ></div>
            <div
                class="w-20 h-7 rounded-xl bg-slate-200 dark:bg-slate-700 animate-pulse mb-1"
            ></div>
        </div>

        <!-- Content -->
        <div class="flex-1 px-5 pt-3 pb-2 flex flex-col gap-2">
            <div class="w-3/4 h-5 rounded-lg bg-slate-200 dark:bg-slate-700 animate-pulse"></div>
            <div class="w-full h-3 rounded-md bg-slate-200 dark:bg-slate-700 animate-pulse"></div>
            <div class="w-2/3 h-3 rounded-md bg-slate-200 dark:bg-slate-700 animate-pulse"></div>
        </div>

        <!-- Button -->
        <div class="px-5 pb-5 pt-2 mt-auto">
            <div class="w-full h-11 rounded-xl bg-slate-200 dark:bg-slate-700 animate-pulse"></div>
        </div>

        <!-- Shimmer overlay -->
        <div
            class="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 dark:via-white/5 to-transparent pointer-events-none"
        ></div>
    </div>
</template>
