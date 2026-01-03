<script setup>
import { computed, ref, onMounted, onBeforeUnmount } from "vue";
import { useCartStore } from "../stores/cart";
import {
    Sparkles,
    Heart,
    Stars,
    ChevronRight,
    Plus,
    Flame,
    Cloud,
    Moon,
    Star,
    Zap,
    Wind,
} from "lucide-vue-next";

const props = defineProps({
    product: { type: Object, required: true },
});

const emit = defineEmits(["open-detail"]);
const cart = useCartStore();

const isLiked = ref(false);
const toggleLike = (e) => {
    e.stopPropagation();
    isLiked.value = !isLiked.value;
};

const isComplex = computed(() => {
    return (
        props.product.isCalculator === true ||
        (Array.isArray(props.product.variants) &&
            props.product.variants.length > 0)
    );
});

const iconComponent = computed(() => {
    const map = {
        moon: Moon,
        star: Star,
        wind: Wind,
        cloud: Cloud,
        flame: Flame,
        zap: Zap,
        heart: Heart,
    };
    return map[props.product.iconType?.toLowerCase()] || Sparkles;
});

const formatCurrency = (val) =>
    new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
    }).format(val || 0);

// ====== Cute theme accents (base ikut tema via card-soft) ======
const theme = computed(() => {
    const type = props.product.category;

    if (type === "heart" || props.product.isCalculator) {
        return {
            stickerBg: "bg-rose-100/80",
            stickerText: "text-rose-800",
            iconBg: "bg-gradient-to-br from-rose-400 to-rose-600",
            iconRing: "ring-rose-200/70",
            glow: "bg-rose-200/40",
            primaryBtn: "bg-rose-600 hover:bg-rose-700 border-rose-600",
        };
    }

    if (type === "candlerun") {
        return {
            stickerBg: "bg-amber-100/80",
            stickerText: "text-amber-900",
            iconBg: "bg-gradient-to-br from-amber-400 to-orange-500",
            iconRing: "ring-amber-200/70",
            glow: "bg-amber-200/40",
            primaryBtn: "bg-amber-600 hover:bg-amber-700 border-amber-600",
        };
    }

    return {
        stickerBg: "bg-sky-100/80",
        stickerText: "text-sky-900",
        iconBg: "bg-gradient-to-br from-sky-400 to-cyan-500",
        iconRing: "ring-sky-200/70",
        glow: "bg-sky-200/40",
        primaryBtn: "bg-indigo-600 hover:bg-indigo-700 border-indigo-600",
    };
});

const cuteStickerText = computed(() => {
    const type = props.product.category;
    if (type === "heart" || props.product.isCalculator) return "Cute pick ✨";
    if (type === "candlerun") return "Warm & cozy 🕯️";
    return "Soft vibe ☁️";
});

// ====== Dark detector (robust) ======
const isDark = ref(false);
let obs = null;

function detectDark() {
    const html = document.documentElement;
    const body = document.body;
    const app = document.getElementById("app");

    // cek beberapa kemungkinan tempat class "dark" ditempel
    isDark.value =
        html?.classList?.contains("dark") ||
        body?.classList?.contains("dark") ||
        app?.classList?.contains("dark") ||
        false;
}

onMounted(() => {
    detectDark();

    // observe perubahan class (toggle dark/light)
    obs = new MutationObserver(() => detectDark());
    obs.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["class"],
    });
    if (document.body)
        obs.observe(document.body, {
            attributes: true,
            attributeFilter: ["class"],
        });

    const app = document.getElementById("app");
    if (app) obs.observe(app, { attributes: true, attributeFilter: ["class"] });
});

onBeforeUnmount(() => {
    if (obs) obs.disconnect();
});

// ✅ text tokens diset langsung di article (inline) => pasti keubah
const cardVars = computed(() => {
    if (isDark.value) {
        return {
            "--pc-title": "241 245 249", // slate-100
            "--pc-desc": "203 213 225", // slate-300
            "--pc-meta": "148 163 184", // slate-400
            "--pc-muted": "100 116 139", // slate-500
            "--pc-bubble-bg": "255 255 255",
            "--pc-bubble-border": "255 255 255",
            "--pc-bubble-alpha": "0.10",
            "--pc-border-alpha": "0.14",
            "--pc-mini-alpha": "0.12",
            "--pc-cta2-alpha": "0.10",
        };
    }

    return {
        "--pc-title": "15 23 42", // slate-900
        "--pc-desc": "71 85 105", // slate-600
        "--pc-meta": "100 116 139", // slate-500
        "--pc-muted": "203 213 225", // slate-300
        "--pc-bubble-bg": "255 255 255",
        "--pc-bubble-border": "255 255 255",
        "--pc-bubble-alpha": "0.60",
        "--pc-border-alpha": "0.55",
        "--pc-mini-alpha": "0.85",
        "--pc-cta2-alpha": "0.60",
    };
});

const handleButtonClick = () => {
    if (isComplex.value) emit("open-detail", props.product);
    else cart.addToCart(props.product);
};
</script>

<template>
    <article
        class="pc group relative h-full overflow-hidden rounded-[2rem] cursor-pointer card-soft border border-white/60 transition-all duration-300 hover:-translate-y-0.5 hover:border-white/80 hover:shadow-[0_16px_42px_rgba(0,0,0,0.08)]"
        :style="cardVars"
        @click="emit('open-detail', product)"
    >
        <!-- inner hairline -->
        <div
            class="pointer-events-none absolute inset-0 rounded-[2rem] ring-1 ring-black/5"
        ></div>

        <!-- pastel glow -->
        <div
            class="pointer-events-none absolute -top-10 -right-10 w-28 h-28 rounded-full blur-2xl opacity-60 transition-opacity duration-500 group-hover:opacity-80"
            :class="theme.glow"
        ></div>

        <!-- ✨ floating doodles -->
        <div class="pointer-events-none absolute inset-0">
            <div
                class="pc-bubble absolute left-4 top-4 w-7 h-7 rounded-full border flex items-center justify-center shadow-sm doodle-float-1"
            >
                <Stars :size="14" class="opacity-70" />
            </div>

            <div
                class="pc-bubble absolute right-5 top-16 w-7 h-7 rounded-full border flex items-center justify-center shadow-sm doodle-float-2"
            >
                <Sparkles :size="14" class="opacity-70" />
            </div>

            <div
                class="pc-bubble absolute left-6 bottom-20 w-7 h-7 rounded-full border flex items-center justify-center shadow-sm doodle-float-3"
            >
                <Heart :size="14" class="opacity-70" />
            </div>
        </div>

        <div class="relative z-10 p-5 flex flex-col h-full">
            <!-- Top row -->
            <div class="flex items-start justify-between gap-3">
                <div class="flex items-center gap-3 min-w-0">
                    <!-- Icon badge -->
                    <div
                        class="relative w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-sm ring-1 shrink-0 transition-transform duration-300 group-hover:scale-[1.04]"
                        :class="[theme.iconBg, theme.iconRing]"
                    >
                        <component
                            :is="iconComponent"
                            :size="24"
                            stroke-width="2.5"
                        />

                        <!-- mini sticker on icon -->
                        <div
                            class="pc-mini absolute -right-1 -bottom-1 w-6 h-6 rounded-xl border flex items-center justify-center shadow-sm"
                        >
                            <Sparkles :size="12" class="opacity-80" />
                        </div>
                    </div>

                    <!-- Sticker pill -->
                    <div class="min-w-0">
                        <div
                            class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-extrabold border shadow-sm"
                            :class="[theme.stickerBg, theme.stickerText]"
                        >
                            <span class="truncate max-w-[160px]">
                                {{ cuteStickerText }}
                            </span>
                        </div>

                        <p
                            class="pc-meta mt-1 text-[10px] font-bold uppercase tracking-wide truncate"
                        >
                            {{ product.category || "Service" }}
                        </p>
                    </div>
                </div>

                <!-- Like -->
                <button
                    @click="toggleLike"
                    class="pc-likebtn w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-90 shrink-0"
                    :class="isLiked ? 'text-rose-500' : 'pc-muted'"
                    aria-label="Like"
                >
                    <Heart
                        :size="20"
                        :class="{ 'fill-current animate-pop': isLiked }"
                    />
                </button>
            </div>

            <!-- Text block -->
            <div class="mt-4">
                <h3
                    class="pc-title text-[17px] font-black leading-snug line-clamp-2 min-h-[44px]"
                >
                    {{ product.name }}
                </h3>

                <p
                    class="pc-desc mt-2 text-xs leading-relaxed line-clamp-2 min-h-[32px]"
                >
                    {{ product.desc }}
                </p>
            </div>

            <!-- Footer -->
            <div
                class="mt-auto pt-4 mt-5 border-t flex items-center justify-between gap-3 pc-divider"
            >
                <div class="min-w-0">
                    <p
                        class="pc-meta text-[10px] font-bold uppercase tracking-wide"
                    >
                        Harga
                    </p>
                    <p
                        class="pc-title text-base font-extrabold truncate tabular-nums"
                    >
                        {{ formatCurrency(product.price) }}
                    </p>
                </div>

                <button
                    @click.stop="handleButtonClick"
                    class="pc-cta w-10 h-10 rounded-2xl flex items-center justify-center border shadow-sm transition-all active:scale-90 hover:shadow-md shrink-0"
                    :class="
                        isComplex ? 'pc-cta2' : `text-white ${theme.primaryBtn}`
                    "
                    :aria-label="
                        isComplex ? 'Buka detail' : 'Tambah ke keranjang'
                    "
                >
                    <ChevronRight
                        v-if="isComplex"
                        :size="20"
                        stroke-width="2.5"
                    />
                    <Plus v-else :size="20" stroke-width="3" />
                </button>
            </div>
        </div>
    </article>
</template>

<style scoped>
.pc-title {
    color: rgb(var(--pc-title) / 1);
}
.pc-desc {
    color: rgb(var(--pc-desc) / 0.92);
}
.pc-meta {
    color: rgb(var(--pc-meta) / 0.9);
}
.pc-muted {
    color: rgb(var(--pc-muted) / 1);
}

.pc-divider {
    border-color: rgb(255 255 255 / var(--pc-border-alpha));
}

/* doodle bubbles */
.pc-bubble {
    background: rgb(var(--pc-bubble-bg) / var(--pc-bubble-alpha));
    border-color: rgb(var(--pc-bubble-border) / var(--pc-bubble-alpha));
    color: rgb(var(--pc-title) / 0.82);
}

/* mini sticker on icon */
.pc-mini {
    background: rgb(255 255 255 / var(--pc-mini-alpha));
    border-color: rgb(255 255 255 / calc(var(--pc-mini-alpha) * 0.94));
    color: rgb(var(--pc-title) / 0.85);
}

/* like hover */
.pc-likebtn:hover {
    background: rgb(255 255 255 / var(--pc-bubble-alpha));
}

/* CTA secondary */
.pc-cta2 {
    background: rgb(255 255 255 / var(--pc-cta2-alpha));
    border-color: rgb(255 255 255 / var(--pc-cta2-alpha));
    color: rgb(var(--pc-title) / 0.92);
}
.pc-cta2:hover {
    background: rgb(255 255 255 / calc(var(--pc-cta2-alpha) + 0.06));
}

@keyframes floaty {
    0% {
        transform: translateY(0px) rotate(0deg);
    }
    50% {
        transform: translateY(-6px) rotate(2deg);
    }
    100% {
        transform: translateY(0px) rotate(0deg);
    }
}
.doodle-float-1 {
    animation: floaty 3.6s ease-in-out infinite;
    opacity: 0.75;
}
.doodle-float-2 {
    animation: floaty 4.2s ease-in-out infinite;
    opacity: 0.65;
}
.doodle-float-3 {
    animation: floaty 4.8s ease-in-out infinite;
    opacity: 0.6;
}

@media (prefers-reduced-motion: reduce) {
    .doodle-float-1,
    .doodle-float-2,
    .doodle-float-3 {
        animation: none;
    }
}

@keyframes pop {
    0% {
        transform: scale(1);
    }
    50% {
        transform: scale(1.35);
    }
    100% {
        transform: scale(1);
    }
}
.animate-pop {
    animation: pop 0.28s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
</style>
