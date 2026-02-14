<script setup>
import { computed } from "vue";
import { useCartStore } from "../stores/cart";
import { formatRupiah } from "../utils/format";
import {
    Sparkles,
    Heart,
    ChevronRight,
    Plus,
    Flame,
    Cloud,
    Moon,
    Star,
    Zap,
    Wind,
    ShoppingBag,
    Settings2,
} from "lucide-vue-next";

const props = defineProps({
    product: { type: Object, required: true },
});

const emit = defineEmits(["open-detail"]);
const cart = useCartStore();

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

// ====== Category-based theming ======
// Warna header dibuat sangat lembut agar menyatu dengan tema cream website.
// Menggunakan opacity rendah dan warna pastel alih-alih gradient dominan.
const theme = computed(() => {
    const type = props.product.category;

    if (type === "heart" || props.product.isCalculator) {
        return {
            headerGradient: "from-rose-100/80 via-pink-50/60 to-orange-50/40",
            headerGradientDark: "dark:from-rose-950/40 dark:via-pink-950/25 dark:to-slate-900/60",
            tagBg: "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300",
            iconFloat: "bg-white dark:bg-slate-800 text-rose-500 ring-rose-200/60 dark:ring-rose-500/20",
            btnClass: "bg-rose-500 hover:bg-rose-600 text-white shadow-rose-200 dark:shadow-none",
            accent: "text-rose-500",
            priceBg: "bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-300",
            doodleColor: "text-rose-300/30 dark:text-rose-400/10",
            dotColor: "bg-rose-200/30 dark:bg-rose-500/10",
            borderColor: "border-rose-200/20 dark:border-rose-500/5",
        };
    }

    if (type === "candlerun") {
        return {
            headerGradient: "from-amber-100/80 via-orange-50/60 to-yellow-50/40",
            headerGradientDark: "dark:from-amber-950/40 dark:via-orange-950/25 dark:to-slate-900/60",
            tagBg: "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300",
            iconFloat: "bg-white dark:bg-slate-800 text-amber-500 ring-amber-200/60 dark:ring-amber-500/20",
            btnClass: "bg-amber-500 hover:bg-amber-600 text-white shadow-amber-200 dark:shadow-none",
            accent: "text-amber-500",
            priceBg: "bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300",
            doodleColor: "text-amber-300/30 dark:text-amber-400/10",
            dotColor: "bg-amber-200/30 dark:bg-amber-500/10",
            borderColor: "border-amber-200/20 dark:border-amber-500/5",
        };
    }

    // special / default
    return {
        headerGradient: "from-sky-100/80 via-indigo-50/60 to-blue-50/40",
        headerGradientDark: "dark:from-sky-950/40 dark:via-indigo-950/25 dark:to-slate-900/60",
        tagBg: "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300",
        iconFloat: "bg-white dark:bg-slate-800 text-indigo-500 ring-indigo-200/60 dark:ring-indigo-500/20",
        btnClass: "bg-indigo-500 hover:bg-indigo-600 text-white shadow-indigo-200 dark:shadow-none",
        accent: "text-indigo-500",
        priceBg: "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300",
        doodleColor: "text-sky-300/30 dark:text-sky-400/10",
        dotColor: "bg-sky-200/30 dark:bg-sky-500/10",
        borderColor: "border-sky-200/20 dark:border-sky-500/5",
    };
});

// Display price
const displayPrice = computed(() => {
    const p = props.product;
    if (p.price > 0) return formatRupiah(p.price);
    if (p.variants?.length) {
        const min = Math.min(...p.variants.map((v) => v.price));
        return `Mulai ${formatRupiah(min)}`;
    }
    return "Gratis";
});

// Short description helper
const shortDesc = computed(() => {
    const d = props.product.desc || "";
    return d.length > 70 ? d.slice(0, 67) + "..." : d;
});

const handleButtonClick = (e) => {
    e.stopPropagation();
    if (isComplex.value) emit("open-detail", props.product);
    else cart.addToCart(props.product);
};
</script>

<template>
    <!-- "Snack Card": Playful, catchy, lightweight -->
    <article
        class="snack-card group relative h-full flex flex-col rounded-2xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-700/40 cursor-pointer"
        @click="emit('open-detail', product)"
    >
        <!-- ===== Gradient Header ===== -->
        <div
            class="relative h-24 md:h-28 bg-gradient-to-br overflow-hidden"
            :class="[theme.headerGradient, theme.headerGradientDark]"
        >
            <!-- Decorative pattern -->
            <div class="absolute inset-0">
                <div class="absolute top-2 left-4 w-8 h-8 rounded-full border-2 border-current doodle-1" :class="theme.doodleColor"></div>
                <div class="absolute top-5 right-8 w-5 h-5 rounded-full doodle-2" :class="theme.dotColor"></div>
                <div class="absolute bottom-4 left-1/3 w-3 h-3 rounded-full doodle-3" :class="theme.dotColor"></div>
                <div class="absolute top-3 right-1/4 text-lg doodle-1" :class="theme.doodleColor">✦</div>
                <div class="absolute bottom-3 right-6 text-sm doodle-2" :class="theme.doodleColor">✧</div>
            </div>

            <!-- Tag badge -->
            <div v-if="product.tag" class="absolute top-3 left-3 z-10">
                <span
                    class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider backdrop-blur-sm bg-white/90 dark:bg-black/30 dark:text-white text-slate-700 shadow-sm"
                >
                    <Sparkles :size="10" class="opacity-70" />
                    {{ product.tag }}
                </span>
            </div>

            <!-- ETA badge -->
            <div v-if="product.eta" class="absolute top-3 right-3 z-10">
                <span
                    class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-slate-700/60 dark:bg-black/30 text-white backdrop-blur-sm"
                >
                    ⏱ {{ product.eta }}
                </span>
            </div>

            <!-- Curved bottom -->
            <div class="absolute -bottom-1 left-0 right-0">
                <svg viewBox="0 0 400 30" class="w-full h-auto fill-white dark:fill-slate-900" preserveAspectRatio="none">
                    <path d="M0,30 L0,15 Q200,-10 400,15 L400,30 Z" />
                </svg>
            </div>
        </div>

        <!-- ===== Floating Icon ===== -->
        <div class="relative px-5 -mt-7 z-10 flex items-end justify-between">
            <div
                class="w-14 h-14 rounded-2xl flex items-center justify-center ring-2 shadow-md icon-float transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3"
                :class="theme.iconFloat"
            >
                <component :is="iconComponent" :size="26" stroke-width="2" />
            </div>

            <!-- Mini price pill -->
            <div
                class="px-3 py-1.5 rounded-xl text-xs font-black mb-1"
                :class="theme.priceBg"
            >
                {{ displayPrice }}
            </div>
        </div>

        <!-- ===== Content ===== -->
        <div class="flex-1 px-5 pt-3 pb-2 flex flex-col">
            <h3 class="text-[15px] font-bold text-slate-800 dark:text-slate-100 leading-snug mb-1.5 group-hover:text-slate-950 dark:group-hover:text-white transition-colors">
                {{ product.name }}
            </h3>

            <p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed flex-1">
                {{ shortDesc }}
            </p>

            <!-- Variant count hint -->
            <div v-if="product.variants?.length" class="flex items-center gap-1.5 mt-2">
                <div class="flex -space-x-1">
                    <div
                        v-for="i in Math.min(product.variants.length, 3)" :key="i"
                        class="w-4 h-4 rounded-full border-2 border-white dark:border-slate-900 bg-gradient-to-br"
                        :class="[
                            i === 1 ? 'from-sky-300 to-sky-400' : '',
                            i === 2 ? 'from-amber-300 to-amber-400' : '',
                            i === 3 ? 'from-rose-300 to-rose-400' : '',
                        ]"
                    ></div>
                </div>
                <span class="text-[10px] font-bold text-slate-400 dark:text-slate-500">
                    {{ product.variants.length }} pilihan
                </span>
            </div>
        </div>

        <!-- ===== CTA Button ===== -->
        <div class="px-5 pb-5 pt-2 mt-auto">
            <button
                @click="handleButtonClick"
                class="w-full h-11 rounded-xl flex items-center justify-center gap-2 text-sm font-bold shadow-md transition-all duration-200 active:scale-[0.97] btn-snack"
                :class="theme.btnClass"
            >
                <template v-if="isComplex">
                    <Settings2 :size="16" />
                    Atur Pesanan
                </template>
                <template v-else>
                    <Plus :size="16" stroke-width="3" />
                    Tambah
                </template>
                <ChevronRight :size="14" class="opacity-50 -mr-1 group-hover:translate-x-0.5 transition-transform" />
            </button>
        </div>
    </article>
</template>

<style scoped>
/* ===== Snack Card Hover ===== */
.snack-card {
    transition:
        transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1),
        box-shadow 0.3s ease;
    will-change: transform;
}

.snack-card:hover {
    transform: translateY(-6px) rotate(0.5deg);
    box-shadow:
        0 20px 40px -15px rgba(0, 0, 0, 0.1),
        0 8px 16px -8px rgba(0, 0, 0, 0.06);
}

.snack-card:active {
    transform: translateY(-2px) scale(0.98);
}

:root.dark .snack-card:hover,
.dark .snack-card:hover {
    box-shadow:
        0 20px 40px -15px rgba(0, 0, 0, 0.4),
        0 0 0 1px rgba(255, 255, 255, 0.06);
}

/* ===== Playful floating doodles ===== */
.doodle-1 {
    animation: doodle-float 4s ease-in-out infinite;
}
.doodle-2 {
    animation: doodle-float 3.5s ease-in-out infinite 0.5s;
}
.doodle-3 {
    animation: doodle-float 5s ease-in-out infinite 1s;
}

@keyframes doodle-float {
    0%, 100% {
        transform: translateY(0) scale(1);
    }
    50% {
        transform: translateY(-4px) scale(1.1);
    }
}

/* ===== Button micro-interaction ===== */
.btn-snack {
    position: relative;
    overflow: hidden;
}
.btn-snack::after {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(
        105deg,
        transparent 40%,
        rgba(255, 255, 255, 0.2) 45%,
        rgba(255, 255, 255, 0.25) 50%,
        transparent 55%
    );
    transform: translateX(-100%);
    transition: transform 0.5s ease;
}
.snack-card:hover .btn-snack::after {
    transform: translateX(100%);
}

/* ===== Icon bounce on hover ===== */
.icon-float {
    transition:
        transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1),
        box-shadow 0.3s ease;
}

/* ===== Reduce motion ===== */
@media (prefers-reduced-motion: reduce) {
    .doodle-1,
    .doodle-2,
    .doodle-3 {
        animation: none;
    }
    .snack-card {
        transition: box-shadow 0.2s ease;
    }
    .snack-card:hover {
        transform: none;
    }
    .btn-snack::after {
        display: none;
    }
}
</style>