<script setup>
import { onMounted } from "vue";
import { useAnnouncementStore } from "../stores/announcement";
import { useRouter } from "vue-router";
import {
    X,
    Megaphone,
    AlertTriangle,
    CheckCircle,
    Zap,
    ArrowRight,
} from "lucide-vue-next";

const store = useAnnouncementStore();
const router = useRouter();

onMounted(() => {
    store.fetchActive();
});

const closeBanner = () => {
    store.activeAnnouncement = null;
};

const handleAction = () => {
    const link = store.activeAnnouncement?.actionLink;
    if (link) {
        link.startsWith("http")
            ? window.open(link, "_blank")
            : router.push(link);
    }
};

const getTheme = (type) => {
    if (type === "warning")
        return "from-amber-400/90 to-orange-500/90 text-white shadow-orange-500/20";
    if (type === "danger")
        return "from-rose-500/90 to-red-600/90 text-white shadow-rose-500/20";
    if (type === "success")
        return "from-emerald-500/90 to-teal-600/90 text-white shadow-emerald-500/20";
    if (type === "promo")
        return "from-indigo-500/90 via-purple-500/90 to-pink-500/90 text-white shadow-purple-500/30";
    return "from-slate-700/90 to-slate-900/90 text-white shadow-slate-900/20";
};

const getIcon = (type) => {
    if (type === "warning" || type === "danger") return AlertTriangle;
    if (type === "success") return CheckCircle;
    if (type === "promo") return Zap;
    return Megaphone;
};
</script>

<template>
    <transition name="slide-down">
        <div
            v-if="store.activeAnnouncement"
            class="sticky top-0 z-[60] bg-gradient-to-r backdrop-blur-md shadow-lg border-b border-white/10 overflow-hidden"
            :class="getTheme(store.activeAnnouncement.type)"
        >
            <div
                class="container mx-auto max-w-6xl px-4 py-2.5 flex items-center justify-between gap-3 relative z-10"
            >
                <div class="flex-1 flex items-center gap-3 overflow-hidden">
                    <div
                        class="p-1.5 bg-white/20 rounded-full shrink-0 animate-pulse"
                    >
                        <component
                            :is="getIcon(store.activeAnnouncement.type)"
                            :size="16"
                            stroke-width="3"
                        />
                    </div>
                    <div class="flex-1 min-w-0">
                        <p
                            class="text-xs md:text-sm font-bold tracking-wide leading-tight truncate md:whitespace-normal"
                        >
                            {{ store.activeAnnouncement.text }}
                        </p>
                    </div>
                </div>

                <button
                    v-if="store.activeAnnouncement.actionLink"
                    @click="handleAction"
                    class="shrink-0 flex items-center gap-1 bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-full text-[10px] md:text-xs font-bold transition uppercase tracking-wider"
                >
                    {{ store.activeAnnouncement.actionLabel || "Check" }}
                    <ArrowRight :size="12" />
                </button>

                <button
                    @click="closeBanner"
                    class="p-1 rounded-full hover:bg-black/10 transition shrink-0 opacity-70 hover:opacity-100"
                >
                    <X :size="16" />
                </button>
            </div>

            <div
                class="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-shimmer pointer-events-none z-0"
            ></div>
        </div>
    </transition>
</template>

<style scoped>
.slide-down-enter-active,
.slide-down-leave-active {
    transition:
        transform 0.4s cubic-bezier(0.16, 1, 0.3, 1),
        opacity 0.4s ease;
}
.slide-down-enter-from,
.slide-down-leave-to {
    transform: translateY(-100%);
    opacity: 0;
}
@keyframes shimmer {
    100% {
        transform: translateX(100%);
    }
}
.animate-shimmer {
    animation: shimmer 3s infinite linear;
}
</style>
