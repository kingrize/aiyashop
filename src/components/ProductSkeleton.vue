<template>
    <div
        class="bg-white dark:bg-slate-800 rounded-3xl p-4 border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col gap-4 relative overflow-hidden"
    >
        <div class="flex justify-between items-start">
            <div
                class="w-10 h-10 rounded-2xl bg-slate-200 dark:bg-slate-700 animate-pulse"
            ></div>
            <div
                class="w-20 h-6 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse"
            ></div>
        </div>

        <div class="space-y-2">
            <div
                class="w-3/4 h-6 rounded-lg bg-slate-200 dark:bg-slate-700 animate-pulse"
            ></div>
            <div
                class="w-full h-3 rounded-md bg-slate-200 dark:bg-slate-700 animate-pulse"
            ></div>
            <div
                class="w-2/3 h-3 rounded-md bg-slate-200 dark:bg-slate-700 animate-pulse"
            ></div>
        </div>

        <div class="mt-auto pt-4 flex justify-between items-end">
            <div class="space-y-1">
                <div
                    class="w-12 h-3 rounded-md bg-slate-200 dark:bg-slate-700 animate-pulse"
                ></div>
                <div
                    class="w-24 h-8 rounded-lg bg-slate-200 dark:bg-slate-700 animate-pulse"
                ></div>
            </div>
            <div
                class="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-700 animate-pulse"
            ></div>
        </div>

        <div
            class="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 dark:via-white/5 to-transparent"
        ></div>
    </div>
</template>
