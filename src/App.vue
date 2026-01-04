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
                class="fixed inset-0 z-[9999] bg-white/80 dark:bg-black/40 backdrop-blur-sm flex flex-col items-center justify-center"
            >
                <div class="relative">
                    <Cloud :size="64" class="text-sky-200 animate-pulse" />
                    <div
                        class="absolute inset-0 flex items-center justify-center"
                    >
                        <div
                            class="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"
                        ></div>
                    </div>
                </div>
                <p
                    class="mt-4 text-sky-500 font-bold text-sm tracking-widest animate-pulse"
                >
                    MEMUAT...
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
</style>
