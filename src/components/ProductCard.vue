<script setup>
import { computed, ref } from "vue";
import { useCartStore } from "../stores/cart";
import {
    Sparkles,
    Moon,
    Heart,
    Star,
    Wind,
    Cloud,
    Flame,
    Zap,
    ChevronRight,
    Plus,
} from "lucide-vue-next";

const props = defineProps({
    product: { type: Object, required: true },
});

const emit = defineEmits(["open-detail"]);
const cart = useCartStore();

// --- STATE LOVE (MICRO-INTERACTION) ---
const isLiked = ref(false);
const toggleLike = (e) => {
    e.stopPropagation(); // Mencegah card ikut terklik
    isLiked.value = !isLiked.value;
};

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

const isComplex = computed(() => {
    return (
        props.product.isCalculator === true ||
        (Array.isArray(props.product.variants) &&
            props.product.variants.length > 0)
    );
});

// Styling Logic
const theme = computed(() => {
    const type = props.product.category;
    if (type === "heart" || props.product.isCalculator)
        return {
            bg: "bg-rose-50/80 dark:bg-rose-900/10 border-rose-100 dark:border-rose-500/20",
            iconBg: "bg-gradient-to-br from-rose-400 to-rose-600",
            iconGlow: "shadow-rose-300/50 dark:shadow-rose-900/50",
            text: "text-rose-600 dark:text-rose-300",
            btn: "bg-rose-500 text-white",
        };
    if (type === "candlerun")
        return {
            bg: "bg-amber-50/80 dark:bg-amber-900/10 border-amber-100 dark:border-amber-500/20",
            iconBg: "bg-gradient-to-br from-amber-400 to-orange-500",
            iconGlow: "shadow-amber-300/50 dark:shadow-amber-900/50",
            text: "text-amber-600 dark:text-amber-300",
            btn: "bg-amber-500 text-white",
        };
    return {
        bg: "bg-sky-50/80 dark:bg-sky-900/10 border-sky-100 dark:border-sky-500/20",
        iconBg: "bg-gradient-to-br from-sky-400 to-cyan-500",
        iconGlow: "shadow-sky-300/50 dark:shadow-sky-900/50",
        text: "text-sky-600 dark:text-sky-300",
        btn: "bg-sky-500 text-white",
    };
});

const formatCurrency = (val) =>
    new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
    }).format(val || 0);

const handleButtonClick = () => {
    if (isComplex.value) {
        emit("open-detail", props.product);
    } else {
        cart.addToCart(props.product);
    }
};
</script>

<template>
    <article
        class="group relative flex flex-col h-full rounded-3xl overflow-hidden border transition-all duration-300 hover:-translate-y-1 hover:shadow-lg backdrop-blur-sm cursor-pointer"
        :class="[theme.bg]"
        @click="emit('open-detail', product)"
    >
        <div
            class="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-white/40 to-transparent dark:from-white/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"
        ></div>

        <div class="p-5 flex-1 flex flex-col relative z-10">
            <div class="flex justify-between items-start mb-4">
                <div
                    class="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg transition-transform group-hover:scale-110 group-hover:rotate-6"
                    :class="[theme.iconBg, theme.iconGlow]"
                >
                    <component
                        :is="iconComponent"
                        :size="24"
                        stroke-width="2.5"
                    />
                </div>

                <button
                    @click="toggleLike"
                    class="w-8 h-8 rounded-full flex items-center justify-center transition-all active:scale-90 hover:bg-white/50 dark:hover:bg-white/10"
                    :class="
                        isLiked
                            ? 'text-rose-500'
                            : 'text-slate-300 dark:text-slate-600'
                    "
                >
                    <Heart
                        :size="20"
                        :class="{ 'fill-rose-500 animate-pop': isLiked }"
                    />
                </button>
            </div>

            <div class="mb-2">
                <p
                    class="text-[10px] font-bold tracking-widest uppercase opacity-70 mb-1"
                    :class="theme.text"
                >
                    {{ product.category || "Service" }}
                </p>
                <h3
                    class="font-bold text-slate-800 dark:text-slate-100 text-lg leading-tight line-clamp-2"
                >
                    {{ product.name }}
                </h3>
            </div>

            <p
                class="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-4 leading-relaxed"
            >
                {{ product.desc }}
            </p>

            <div
                class="mt-auto flex items-center justify-between pt-4 border-t border-slate-200/50 dark:border-white/5"
            >
                <div class="flex flex-col">
                    <span
                        class="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500"
                        >Harga</span
                    >
                    <span
                        class="text-base font-extrabold text-slate-800 dark:text-slate-100"
                    >
                        {{ formatCurrency(product.price) }}
                    </span>
                </div>

                <button
                    @click.stop="handleButtonClick"
                    class="w-10 h-10 rounded-full flex items-center justify-center shadow-md transition-all active:scale-90 group-hover:scale-110 border"
                    :class="[
                        isComplex
                            ? 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-100 dark:border-slate-700'
                            : 'bg-indigo-500 text-white border-indigo-500 shadow-indigo-200 dark:shadow-none',
                    ]"
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
@keyframes pop {
    0% {
        transform: scale(1);
    }
    50% {
        transform: scale(1.4);
    }
    100% {
        transform: scale(1);
    }
}
.animate-pop {
    animation: pop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
</style>
