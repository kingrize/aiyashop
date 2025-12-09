<script setup>
import { ref, provide } from "vue";
import { RouterView, useRoute } from "vue-router"; // Import useRoute
import { Cloud } from "lucide-vue-next";

import Navbar from "./components/Navbar.vue";
import Footer from "./components/Footer.vue";
import BottomNav from "./components/BottomNav.vue";
import CartDrawer from "./components/CartDrawer.vue";
import Toast from "./components/Toast.vue";

const isLoading = ref(false);
const route = useRoute(); // Init route

provide("globalLoading", {
    start: () => (isLoading.value = true),
    finish: () => (isLoading.value = false),
});
</script>

<template>
    <div
        class="min-h-screen bg-cream dark:bg-charcoal font-sans text-slate-600 dark:text-slate-300 flex flex-col transition-colors duration-300"
        :class="{ 'pb-20 md:pb-0': !route.path.includes('/admin') }"
    >
        <transition name="fade">
            <div
                v-if="isLoading"
                class="fixed inset-0 z-[9999] bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center"
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

        <Navbar v-if="!route.path.includes('/admin')" />

        <main class="flex-1">
            <router-view v-slot="{ Component }">
                <transition name="page-fade" mode="out-in">
                    <component :is="Component" />
                </transition>
            </router-view>
        </main>

        <Footer v-if="!route.path.includes('/admin')" />
        <BottomNav v-if="!route.path.includes('/admin')" />

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
</style>
