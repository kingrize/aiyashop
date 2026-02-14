<script setup>
import { ref, provide, computed } from "vue";
import { RouterView, useRoute } from "vue-router";
import { Cloud } from "lucide-vue-next";

// Import Komponen Global
import Navbar from "./components/Navbar.vue";
import Footer from "./components/Footer.vue";
import BottomNav from "./components/BottomNav.vue";
import CartDrawer from "./components/CartDrawer.vue";
import Toast from "./components/Toast.vue";
import GlobalBanner from "./components/GlobalBanner.vue";

const isLoading = ref(false);
const route = useRoute();

provide("globalLoading", {
    start: () => (isLoading.value = true),
    finish: () => (isLoading.value = false),
});

const isAdminRoute = computed(() => route.path.includes("/admin"));
</script>

<template>
    <div
        class="min-h-screen bg-cream dark:bg-charcoal font-sans text-slate-600 dark:text-slate-300 flex flex-col transition-colors duration-300 overflow-x-hidden"
        :class="{ 'pb-20 md:pb-0': !isAdminRoute }"
    >
        <transition name="fade">
            <div
                v-if="isLoading"
                class="fixed inset-0 z-[9999] bg-cream/90 dark:bg-charcoal/90 backdrop-blur-sm flex flex-col items-center justify-center overflow-hidden"
            >
                <!-- Floating hearts/stars particles -->
                <div class="absolute inset-0 pointer-events-none">
                    <div class="loading-particle loading-p1 absolute top-1/4 left-1/4 text-rose-300/40 text-lg">❤️</div>
                    <div class="loading-particle loading-p2 absolute top-1/3 right-1/3 text-amber-300/40 text-sm">✨</div>
                    <div class="loading-particle loading-p3 absolute bottom-1/3 left-1/3 text-sky-300/40 text-base">☁️</div>
                    <div class="loading-particle loading-p4 absolute top-1/2 right-1/4 text-indigo-300/30 text-xs">✦</div>
                    <div class="loading-particle loading-p5 absolute bottom-1/4 right-1/2 text-rose-200/30 text-sm">🕯️</div>
                </div>

                <div class="relative loading-bounce">
                    <Cloud :size="56" class="text-sky-300 dark:text-sky-500 drop-shadow-sm" />
                    <div class="absolute -top-1 -right-1 text-amber-400 text-xs animate-spin" style="animation-duration: 3s">✨</div>
                </div>
                <p
                    class="mt-4 text-sky-500 dark:text-sky-400 font-bold text-xs tracking-[0.2em] loading-dots"
                >
                    Terbang ke langit
                </p>
                <p class="mt-1 text-[10px] text-slate-400/60 dark:text-slate-500/40 font-medium">
                    Sebentar ya~
                </p>
            </div>
        </transition>

        <GlobalBanner v-if="!isAdminRoute" />
        <Navbar v-if="!isAdminRoute" />

        <main class="flex-1 w-full">
            <router-view v-slot="{ Component }">
                <transition name="page-fade" mode="out-in">
                    <component :is="Component" />
                </transition>
            </router-view>
        </main>

        <Footer v-if="!isAdminRoute" />
        <BottomNav v-if="!isAdminRoute" />

        <CartDrawer />
        <Toast />
    </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
.page-fade-enter-active,
.page-fade-leave-active {
    transition:
        opacity 0.3s ease,
        transform 0.3s ease;
}
.page-fade-enter-from {
    opacity: 0;
    transform: translateY(10px);
}
.page-fade-leave-to {
    opacity: 0;
    transform: translateY(-10px);
}

/* PERF: blur overlay itu berat di HP, matiin blur di layar kecil */
@media (max-width: 640px) {
    .backdrop-blur-sm {
        backdrop-filter: none !important;
    }
}

/* Loading screen animations */
.loading-bounce {
    animation: cloud-bounce 2s ease-in-out infinite;
}
@keyframes cloud-bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-12px); }
}

.loading-dots::after {
    content: '...';
    animation: dots-cycle 1.5s steps(4, end) infinite;
}
@keyframes dots-cycle {
    0% { content: ''; }
    25% { content: '.'; }
    50% { content: '..'; }
    75% { content: '...'; }
}

.loading-particle {
    animation: particle-drift 4s ease-in-out infinite;
}
.loading-p1 { animation-delay: 0s; }
.loading-p2 { animation-delay: 0.8s; }
.loading-p3 { animation-delay: 1.6s; }
.loading-p4 { animation-delay: 2.4s; }
.loading-p5 { animation-delay: 3.2s; }

@keyframes particle-drift {
    0%, 100% {
        transform: translateY(0) translateX(0) scale(0.8);
        opacity: 0;
    }
    25% { opacity: 0.6; }
    50% {
        transform: translateY(-20px) translateX(10px) scale(1.1);
        opacity: 0.4;
    }
    75% { opacity: 0.2; }
}
</style>
