<script setup>
import { useToastStore } from "../stores/toast";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-vue-next";

const toastStore = useToastStore();

const getIcon = (type) => {
    if (type === "error") return AlertCircle;
    if (type === "info") return Info;
    return CheckCircle2;
};

// Style Modern: Pill Shape, Glassmorphism
const getTheme = (type) => {
    if (type === "error") return "bg-rose-500/90 text-white shadow-rose-500/30";
    if (type === "info")
        return "bg-slate-800/90 text-white shadow-slate-900/30";
    // Success (Default)
    return "bg-emerald-500/90 text-white shadow-emerald-500/30";
};
</script>

<template>
    <div
        class="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] flex flex-col items-center gap-2 pointer-events-none w-full max-w-sm px-4"
    >
        <transition-group name="toast-pop">
            <div
                v-for="item in toastStore.items"
                :key="item.id"
                class="pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-full shadow-xl backdrop-blur-md transition-all duration-300 transform origin-top"
                :class="getTheme(item.type)"
            >
                <component
                    :is="getIcon(item.type)"
                    :size="20"
                    stroke-width="2.5"
                    class="shrink-0"
                />

                <p
                    class="text-sm font-bold tracking-wide leading-tight whitespace-nowrap"
                >
                    {{ item.message }}
                </p>

                <button
                    @click="toastStore.remove(item.id)"
                    class="ml-2 p-0.5 rounded-full bg-white/20 hover:bg-white/30 transition"
                >
                    <X :size="12" />
                </button>
            </div>
        </transition-group>
    </div>
</template>

<style scoped>
/* Animasi Pop-in (Mirip notifikasi HP) */
.toast-pop-enter-active {
    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.toast-pop-leave-active {
    transition: all 0.3s ease-in;
}

.toast-pop-enter-from {
    opacity: 0;
    transform: translateY(-20px) scale(0.9);
}
.toast-pop-leave-to {
    opacity: 0;
    transform: translateY(-10px) scale(0.95);
}
</style>
