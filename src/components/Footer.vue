<script setup>
import { MapPin, Heart, Cloud, Sparkles } from "lucide-vue-next";
</script>

<template>
    <footer
        class="relative bg-gradient-to-b from-cream to-amber-50/50 dark:from-charcoal dark:to-slate-950 border-t border-amber-100/30 dark:border-slate-800 pt-0 pb-8 px-6 transition-colors duration-300 md:mb-0 mb-16 overflow-hidden"
    >
        <!-- Wave separator -->
        <div class="absolute -top-1 left-0 right-0">
            <svg viewBox="0 0 1440 60" class="w-full h-auto fill-white dark:fill-charcoal" preserveAspectRatio="none">
                <path d="M0,60 L0,30 Q180,0 360,25 Q540,50 720,20 Q900,-5 1080,25 Q1260,50 1440,30 L1440,60 Z" />
            </svg>
        </div>

        <!-- Floating decorations -->
        <div class="absolute inset-0 pointer-events-none overflow-hidden">
            <Cloud :size="40" class="absolute top-8 left-[10%] text-sky-200/30 dark:text-white/5 animate-float-slow" />
            <Sparkles :size="20" class="absolute top-12 right-[15%] text-amber-300/30 dark:text-amber-500/10 animate-float-fast" />
            <Heart :size="16" class="absolute bottom-16 left-[20%] text-rose-200/30 dark:text-rose-500/10 animate-float-fast" style="animation-delay: 1s" />
            <Cloud :size="28" class="absolute bottom-10 right-[25%] text-indigo-200/20 dark:text-white/5 animate-float-slow" style="animation-delay: 2s" />
        </div>

        <div
            class="mx-auto flex max-w-6xl flex-col items-center gap-6 text-sm text-slate-400 dark:text-slate-500 relative z-10 pt-10"
        >
            <!-- Brand mark -->
            <div class="flex flex-col items-center gap-3">
                <div class="flex items-center gap-2">
                    <div class="w-10 h-10 rounded-2xl bg-gradient-to-br from-sky-400 via-cyan-400 to-emerald-300 flex items-center justify-center shadow-md">
                        <Cloud :size="20" class="text-white fill-white/20" />
                    </div>
                    <span class="text-lg font-bold text-slate-600 dark:text-slate-300 tracking-tight">
                        Aiya<span class="text-sky-500">Shop</span><span class="text-amber-400 ml-0.5">✨</span>
                    </span>
                </div>
                <p class="text-xs text-slate-400 dark:text-slate-500 text-center leading-relaxed max-w-xs">
                    Teman setia buat urusan grinding di Sky ☁️<br />
                    Rebahan aja, Aiya yang jalanin~
                </p>
            </div>

            <!-- Divider with stars -->
            <div class="flex items-center gap-3 w-full max-w-xs">
                <div class="flex-1 h-px bg-gradient-to-r from-transparent to-amber-200/40 dark:to-slate-700"></div>
                <span class="text-amber-300 dark:text-amber-600 text-xs">✦</span>
                <span class="text-sky-300 dark:text-sky-700 text-[10px]">☁️</span>
                <span class="text-rose-300 dark:text-rose-700 text-xs">✦</span>
                <div class="flex-1 h-px bg-gradient-to-l from-transparent to-amber-200/40 dark:to-slate-700"></div>
            </div>

            <!-- Links & status -->
            <div class="flex flex-col md:flex-row items-center gap-4 md:gap-8">
                <div class="flex items-center gap-6">
                    <a href="https://wa.me/6285942963323?text=Halo%20Admin%20Aiya!%20Saya%20ingin%20tanya%20soal%20Privacy%20Policy" target="_blank" class="hover:text-sky-500 transition text-xs font-medium">Privacy</a>
                    <a href="https://wa.me/6285942963323?text=Halo%20Admin%20Aiya!%20Saya%20ingin%20tanya%20soal%20Terms%20of%20Service" target="_blank" class="hover:text-sky-500 transition text-xs font-medium">Terms</a>
                    <span
                        class="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800/20"
                    >
                        <span class="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                        <span class="text-[10px] font-bold text-green-600 dark:text-green-400">Online</span>
                    </span>
                </div>
            </div>

            <!-- Copyright with love -->
            <div class="flex flex-col items-center gap-1.5 pt-2">
                <p class="font-bold text-slate-500 dark:text-slate-400 text-xs">
                    © {{ new Date().getFullYear() }} Aiya Sky Service
                </p>
                <div class="flex items-center gap-1.5 text-[10px] text-slate-400 dark:text-slate-500">
                    <MapPin :size="10" /> <span>Manado, Indonesia</span>
                </div>
                <p class="text-[10px] text-slate-400/60 dark:text-slate-600 flex items-center gap-1 mt-1">
                    Made with <Heart :size="10" class="text-rose-400 fill-rose-400 animate-pulse" /> for Sky Community
                </p>
            </div>
        </div>
    </footer>
</template>

<style scoped>
.animate-float-slow {
    animation: footer-float 6s ease-in-out infinite;
}
.animate-float-fast {
    animation: footer-float 4s ease-in-out infinite;
}
@keyframes footer-float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-8px); }
}
</style>
