<script setup>
import { useToastStore } from "../stores/toast";
import {
    CheckCircle2,
    AlertCircle,
    Info,
    Sparkles,
    X,
    Heart,
    ShoppingBag,
    ShieldCheck,
} from "lucide-vue-next";

const toastStore = useToastStore();

/**
 * Cozy icons per type (kecil + cute)
 * - success: Sparkles / Check
 * - error: Alert
 * - info: Info
 * - warning: Heart (fallback)
 */
const iconForType = (type) => {
    switch (type) {
        case "success":
            return Sparkles;
        case "error":
            return AlertCircle;
        case "warning":
            return Heart;
        case "info":
        default:
            return Info;
    }
};

/**
 * Cozy theme palette (pastel, premium)
 * - gunakan overlay + border halus, tidak hard-white/dark
 */
const themeForType = (type) => {
    switch (type) {
        case "success":
            return {
                wrap: "bg-emerald-500/85 text-white border-emerald-200/20 shadow-emerald-500/25",
                stripe: "bg-emerald-200/60",
                badge: "bg-white/15",
                icon: "text-white",
            };
        case "error":
            return {
                wrap: "bg-rose-500/85 text-white border-rose-200/20 shadow-rose-500/25",
                stripe: "bg-rose-200/60",
                badge: "bg-white/15",
                icon: "text-white",
            };
        case "warning":
            return {
                wrap: "bg-amber-500/85 text-white border-amber-200/20 shadow-amber-500/25",
                stripe: "bg-amber-200/60",
                badge: "bg-white/15",
                icon: "text-white",
            };
        case "info":
        default:
            return {
                wrap: "bg-slate-900/80 text-white border-white/10 shadow-slate-900/25",
                stripe: "bg-white/25",
                badge: "bg-white/10",
                icon: "text-white",
            };
    }
};

/**
 * Optional: label kecil biar cozy & jelas
 */
const labelForType = (type) => {
    switch (type) {
        case "success":
            return "Berhasil";
        case "error":
            return "Gagal";
        case "warning":
            return "Perhatian";
        case "info":
        default:
            return "Info";
    }
};
</script>

<template>
    <!-- Container: center top, lebar max biar gak keluar layar -->
    <div
        class="fixed top-4 sm:top-6 left-1/2 -translate-x-1/2 z-[9999] flex flex-col items-center gap-2 pointer-events-none px-3"
        style="width: min(92vw, 28rem)"
    >
        <transition-group name="toast-pop">
            <div
                v-for="item in toastStore.items"
                :key="item.id"
                class="pointer-events-auto w-full overflow-hidden relative rounded-2xl border shadow-xl backdrop-blur-md transition-all duration-300 transform origin-top"
                :class="themeForType(item.type).wrap"
            >
                <!-- left pastel stripe -->
                <div
                    class="absolute left-0 top-0 bottom-0 w-1.5"
                    :class="themeForType(item.type).stripe"
                />

                <div class="flex items-start gap-3 px-4 py-3">
                    <!-- icon bubble -->
                    <div
                        class="shrink-0 w-9 h-9 rounded-2xl flex items-center justify-center"
                        :class="themeForType(item.type).badge"
                    >
                        <component
                            :is="iconForType(item.type)"
                            :size="18"
                            stroke-width="2.5"
                            :class="themeForType(item.type).icon"
                        />
                    </div>

                    <!-- text -->
                    <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-2 mb-0.5">
                            <span
                                class="text-[10px] font-black tracking-widest uppercase opacity-90"
                            >
                                {{ labelForType(item.type) }}
                            </span>
                            <!-- tiny cute icon decorative (optional) -->
                            <component
                                :is="
                                    item.type === 'success'
                                        ? ShieldCheck
                                        : item.type === 'error'
                                          ? AlertCircle
                                          : ShoppingBag
                                "
                                :size="12"
                                class="opacity-80"
                            />
                        </div>

                        <!-- ✅ wrap + clamp -->
                        <p
                            class="text-sm font-bold tracking-wide leading-snug whitespace-normal break-words line-clamp-3"
                        >
                            {{ item.message }}
                        </p>
                    </div>

                    <!-- close -->
                    <button
                        @click="toastStore.remove(item.id)"
                        class="ml-1 shrink-0 p-1 rounded-full bg-white/10 hover:bg-white/20 transition"
                        aria-label="Tutup toast"
                    >
                        <X :size="14" />
                    </button>
                </div>
            </div>
        </transition-group>
    </div>
</template>

<style scoped>
.toast-pop-enter-active {
    transition: all 0.42s cubic-bezier(0.175, 0.885, 0.32, 1.2);
}
.toast-pop-leave-active {
    transition: all 0.22s ease-in;
}
.toast-pop-enter-from {
    opacity: 0;
    transform: translateY(-14px) scale(0.96);
}
.toast-pop-leave-to {
    opacity: 0;
    transform: translateY(-10px) scale(0.98);
}
</style>
