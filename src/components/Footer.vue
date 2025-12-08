<script setup>
import { MapPin } from "lucide-vue-next";
</script>

<template>
    <footer
        class="bg-white dark:bg-charcoal border-t border-slate-100 dark:border-slate-800 py-8 px-6 transition-colors duration-300"
    >
        <div
            class="mx-auto flex max-w-6xl flex-col md:flex-row items-center justify-between gap-6 text-sm text-slate-400 dark:text-slate-500"
        >
            <div class="flex flex-col items-center md:items-start gap-2">
                <p class="font-bold text-slate-600 dark:text-slate-300">
                    © {{ new Date().getFullYear() }} Aiya Sky Service
                </p>
                <div class="flex items-center gap-1.5 text-xs">
                    <MapPin :size="12" /> <span>Manado, Indonesia</span>
                </div>
            </div>
            <div class="flex items-center gap-6">
                <a href="#" class="hover:text-sky-500 transition">Privacy</a>
                <a href="#" class="hover:text-sky-500 transition">Terms</a>
                <span
                    class="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700"
                >
                    <span
                        class="w-2 h-2 rounded-full bg-green-400 animate-pulse"
                    ></span>
                    <span
                        class="text-xs font-bold text-green-600 dark:text-green-400"
                        >Online</span
                    >
                </span>
            </div>
        </div>
    </footer>
</template>
