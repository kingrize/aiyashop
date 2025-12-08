<script setup>
import { computed, ref } from "vue";
import { useCartStore } from "../stores/cart";
import {
    Plus,
    Sparkles,
    Moon,
    Heart,
    Star,
    Wind,
    Cloud,
    Flame,
    ChevronLeft,
    ChevronRight,
    Info,
    Clock,
    Check,
    X,
    Zap,
} from "lucide-vue-next";
import MiniHeartCalculator from "./MiniHeartCalculator.vue";

const props = defineProps({
    product: {
        type: Object,
        required: true,
    },
});

const emit = defineEmits(["open-calculator"]);
const cart = useCartStore();

const showOptions = ref(false);
const selectedVariants = ref([]);
const showInfoModal = ref(false);

const hasVariants = computed(
    () =>
        Array.isArray(props.product.variants) &&
        props.product.variants.length > 0,
);
const isCalculator = computed(() => props.product.isCalculator === true);

// --- ICON LOGIC ---
const iconComponent = computed(() => {
    if (isCalculator.value || props.product.category === "heart") return Heart;
    const map = {
        moon: Moon,
        star: Star,
        wind: Wind,
        cloud: Cloud,
        flame: Flame,
        zap: Zap,
    };
    return map[props.product.iconType?.toLowerCase()] || Sparkles;
});

// --- STYLING LOGIC (THEME BASED ON CATEGORY) ---
const theme = computed(() => {
    if (isCalculator.value || props.product.category === "heart") {
        return {
            bg: "bg-rose-50/80 dark:bg-rose-900/10",
            border: "border-rose-100 dark:border-rose-500/20",
            iconBg: "bg-gradient-to-br from-rose-400 to-rose-600",
            iconGlow: "shadow-rose-300/50 dark:shadow-rose-900/50",
            text: "text-rose-600 dark:text-rose-300",
            button: "bg-gradient-to-r from-rose-400 to-rose-600 shadow-rose-200 dark:shadow-none",
        };
    }
    if (props.product.category === "candlerun") {
        return {
            bg: "bg-amber-50/80 dark:bg-amber-900/10",
            border: "border-amber-100 dark:border-amber-500/20",
            iconBg: "bg-gradient-to-br from-amber-400 to-orange-500",
            iconGlow: "shadow-amber-300/50 dark:shadow-amber-900/50",
            text: "text-amber-600 dark:text-amber-300",
            button: "bg-gradient-to-r from-amber-400 to-orange-500 shadow-amber-200 dark:shadow-none",
        };
    }
    if (props.product.category === "special") {
        return {
            bg: "bg-indigo-50/80 dark:bg-indigo-900/10",
            border: "border-indigo-100 dark:border-indigo-500/20",
            iconBg: "bg-gradient-to-br from-indigo-400 to-purple-600",
            iconGlow: "shadow-indigo-300/50 dark:shadow-indigo-900/50",
            text: "text-indigo-600 dark:text-indigo-300",
            button: "bg-gradient-to-r from-indigo-400 to-purple-600 shadow-indigo-200 dark:shadow-none",
        };
    }
    // Default (Cloud/Sky)
    return {
        bg: "bg-sky-50/80 dark:bg-sky-900/10",
        border: "border-sky-100 dark:border-sky-500/20",
        iconBg: "bg-gradient-to-br from-sky-400 to-cyan-500",
        iconGlow: "shadow-sky-300/50 dark:shadow-sky-900/50",
        text: "text-sky-600 dark:text-sky-300",
        button: "bg-gradient-to-r from-sky-400 to-cyan-500 shadow-sky-200 dark:shadow-none",
    };
});

// --- PRICING LOGIC ---
const variantsTotal = computed(() =>
    selectedVariants.value.reduce((total, v) => total + (v.price || 0), 0),
);
const basePrice = computed(() => props.product.price || 0);
const currentPrice = computed(() => {
    if (hasVariants.value && selectedVariants.value.length > 0)
        return variantsTotal.value;
    if (props.product.discountPrice > 0) return props.product.discountPrice;
    return basePrice.value;
});

const formatCurrency = (val) =>
    new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
    }).format(val || 0);

// --- ACTIONS ---
const toggleVariant = (variant) => {
    const index = selectedVariants.value.findIndex((v) => v.id === variant.id);
    if (index === -1) selectedVariants.value.push(variant);
    else selectedVariants.value.splice(index, 1);
};

const isSelected = (variantId) =>
    selectedVariants.value.some((v) => v.id === variantId);

const handleAction = () => {
    if ((isCalculator.value || hasVariants.value) && !showOptions.value) {
        showOptions.value = true;
        return;
    }
    if (hasVariants.value) {
        if (selectedVariants.value.length === 0) {
            alert("Pilih minimal satu opsi dulu ya ✨");
            return;
        }
        const customProduct = {
            ...props.product,
            id: `${props.product.id}-custom-${Date.now()}`,
            name: `${props.product.name} (${selectedVariants.value.map((v) => v.name).join(", ")})`,
            price: currentPrice.value,
            selectedVariants: selectedVariants.value,
        };
        cart.addToCart(customProduct);
        showOptions.value = false;
        selectedVariants.value = [];
    } else if (!isCalculator.value) {
        cart.addToCart(props.product);
    }
};

const onCalculatorAdd = (item) => {
    cart.addToCart(item);
    showOptions.value = false;
};
</script>

<template>
    <article
        class="group relative flex h-full flex-col rounded-[2rem] overflow-hidden transition-all duration-500 hover:-translate-y-2 border backdrop-blur-sm"
        :class="[theme.bg, theme.border]"
    >
        <div
            class="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-white/40 to-transparent dark:from-white/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700 pointer-events-none"
        ></div>

        <header
            class="relative px-6 pt-6 pb-2 flex justify-between items-start z-10"
        >
            <div class="flex items-center gap-4">
                <button
                    v-if="showOptions"
                    @click.stop="showOptions = false"
                    class="flex h-10 w-10 items-center justify-center rounded-2xl bg-white dark:bg-slate-800 text-slate-400 hover:text-sky-500 shadow-sm border border-slate-100 dark:border-slate-700 transition-all"
                >
                    <ChevronLeft :size="20" />
                </button>

                <div
                    v-else
                    class="relative flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3"
                    :class="[theme.iconBg, theme.iconGlow]"
                >
                    <component
                        :is="iconComponent"
                        :size="22"
                        stroke-width="2.5"
                    />
                    <div
                        class="absolute inset-0 rounded-2xl bg-gradient-to-tr from-transparent via-white/20 to-transparent opacity-50"
                    ></div>
                </div>

                <div class="leading-tight">
                    <p
                        class="text-[10px] font-bold tracking-widest uppercase opacity-70 mb-1"
                        :class="theme.text"
                    >
                        {{ product.category || "Service" }}
                    </p>
                    <h3
                        class="font-bold text-slate-800 dark:text-slate-100 text-lg leading-tight line-clamp-1 group-hover:text-sky-500 dark:group-hover:text-sky-400 transition-colors"
                    >
                        {{ product.name }}
                    </h3>
                </div>
            </div>

            <div v-if="product.tag" class="absolute top-6 right-6">
                <span
                    class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700 text-slate-500 dark:text-slate-400"
                >
                    <Star :size="10" class="text-amber-400 fill-amber-400" />
                    {{ product.tag }}
                </span>
            </div>
        </header>

        <div class="flex-1 px-6 py-2 relative z-10 flex flex-col">
            <transition name="fade" mode="out-in">
                <div v-if="!showOptions" class="h-full flex flex-col">
                    <p
                        class="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-4 line-clamp-3"
                    >
                        {{ product.desc }}
                    </p>

                    <div class="mt-auto flex flex-wrap gap-2">
                        <div
                            v-if="product.eta"
                            class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/60 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/50 text-xs font-medium text-slate-500 dark:text-slate-400"
                        >
                            <Clock :size="12" class="text-sky-500" />
                            {{ product.eta }}
                        </div>
                        <div
                            v-if="product.note"
                            class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/60 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/50 text-xs font-medium text-slate-500 dark:text-slate-400"
                        >
                            <Info :size="12" class="text-indigo-500" />
                            {{ product.note }}
                        </div>
                    </div>
                </div>

                <div v-else-if="isCalculator" class="h-full">
                    <MiniHeartCalculator
                        :product="product"
                        @addToCart="onCalculatorAdd"
                    />
                </div>

                <div
                    v-else
                    class="h-full flex flex-col gap-2 overflow-y-auto custom-scrollbar pr-1 max-h-[180px]"
                >
                    <p
                        class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1"
                    >
                        Pilih Paket:
                    </p>
                    <div
                        v-for="variant in product.variants"
                        :key="variant.id"
                        @click="toggleVariant(variant)"
                        class="group/item flex items-center justify-between p-3 rounded-2xl border cursor-pointer transition-all duration-200 hover:scale-[1.02]"
                        :class="
                            isSelected(variant.id)
                                ? 'bg-sky-50 dark:bg-sky-900/30 border-sky-200 dark:border-sky-500/50'
                                : 'bg-white/60 dark:bg-slate-800/40 border-slate-100 dark:border-slate-700 hover:border-sky-200 dark:hover:border-sky-700'
                        "
                    >
                        <div class="flex items-center gap-3">
                            <div
                                class="w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors"
                                :class="
                                    isSelected(variant.id)
                                        ? 'border-sky-500 bg-sky-500'
                                        : 'border-slate-300 dark:border-slate-600 bg-transparent'
                                "
                            >
                                <Check
                                    v-if="isSelected(variant.id)"
                                    :size="12"
                                    class="text-white"
                                    stroke-width="4"
                                />
                            </div>
                            <div
                                class="text-sm font-medium text-slate-700 dark:text-slate-200 group-hover/item:text-sky-600 dark:group-hover/item:text-sky-400 transition-colors"
                            >
                                {{ variant.name }}
                            </div>
                        </div>
                        <span
                            class="text-xs font-bold bg-white dark:bg-slate-900 px-2 py-1 rounded-lg border border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-300"
                        >
                            {{ formatCurrency(variant.price) }}
                        </span>
                    </div>
                </div>
            </transition>
        </div>

        <div
            v-if="!isCalculator || (isCalculator && !showOptions)"
            class="mt-auto px-6 py-5 border-t border-slate-100/50 dark:border-white/5 bg-white/40 dark:bg-black/20 backdrop-blur-md flex items-center justify-between gap-4"
        >
            <div class="flex flex-col">
                <span
                    class="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider"
                >
                    {{ hasVariants ? "Estimasi Total" : "Harga" }}
                </span>
                <div class="flex items-baseline gap-1">
                    <span
                        class="text-lg font-extrabold text-slate-800 dark:text-slate-100"
                    >
                        {{ formatCurrency(currentPrice) }}
                    </span>
                    <span
                        v-if="hasVariants && selectedVariants.length === 0"
                        class="text-xs text-slate-400 font-normal"
                    >
                        / start
                    </span>
                </div>
            </div>

            <button
                @click="handleAction"
                class="relative overflow-hidden pl-5 pr-6 py-3 rounded-xl font-bold text-white text-sm shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 flex items-center gap-2 group/btn"
                :class="theme.button"
            >
                <span class="relative z-10 flex items-center gap-2">
                    <component
                        :is="
                            isCalculator
                                ? showOptions
                                    ? Plus
                                    : Heart
                                : showOptions
                                  ? Plus
                                  : hasVariants
                                    ? ChevronRight
                                    : Plus
                        "
                        :size="18"
                    />
                    {{
                        isCalculator
                            ? showOptions
                                ? "Add"
                                : "Hitung"
                            : showOptions
                              ? "Add"
                              : hasVariants
                                ? "Pilih"
                                : "Order"
                    }}
                </span>
                <div
                    class="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/30 to-transparent z-0"
                ></div>
            </button>
        </div>

        <Teleport to="body">
            <transition name="fade">
                <div
                    v-if="showInfoModal"
                    class="fixed inset-0 z-[100] flex items-center justify-center p-4"
                >
                    <div
                        class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                        @click="showInfoModal = false"
                    ></div>
                    <div
                        class="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-200"
                    >
                        <h3 class="font-bold text-lg mb-2 dark:text-white">
                            Info Heart ❤️
                        </h3>
                        <p class="text-slate-500 dark:text-slate-400 text-sm">
                            Sistem heart menggunakan bot admin yang mengirim
                            gift setiap hari. Pastikan slot friendlist kamu
                            cukup!
                        </p>
                        <button
                            @click="showInfoModal = false"
                            class="mt-4 w-full py-3 bg-slate-100 dark:bg-slate-800 rounded-xl font-bold text-slate-600 dark:text-slate-300"
                        >
                            Oke Paham
                        </button>
                    </div>
                </div>
            </transition>
        </Teleport>
    </article>
</template>

<style scoped>
/* Custom Scrollbar untuk list varian */
.custom-scrollbar::-webkit-scrollbar {
    width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
    background-color: #cbd5e1;
    border-radius: 20px;
}
:global(.dark) .custom-scrollbar::-webkit-scrollbar-thumb {
    background-color: #475569;
}

.fade-enter-active,
.fade-leave-active {
    transition:
        opacity 0.2s ease,
        transform 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
    opacity: 0;
    transform: translateY(5px);
}
</style>
