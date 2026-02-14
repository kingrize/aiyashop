<script setup>
import { defineAsyncComponent, ref, computed } from "vue";
import { useCartStore } from "../stores/cart";
import { formatRupiah } from "../utils/format";
import {
    X,
    Check,
    Plus,
    Heart,
    ShoppingBag,
    CheckCircle,
    Sparkles,
    ChevronRight,
    Crown,
    Package,
} from "lucide-vue-next";
const MiniHeartCalculator = defineAsyncComponent(() => import("./MiniHeartCalculator.vue"));

const props = defineProps({
    isOpen: Boolean,
    product: Object,
});

const emit = defineEmits(["close"]);
const cart = useCartStore();
const selectedVariants = ref([]);

const isCalculator = computed(() => props.product?.isCalculator === true);
const hasVariants = computed(
    () =>
        Array.isArray(props.product?.variants) &&
        props.product.variants.length > 0,
);

// Pricing Logic
const variantsTotal = computed(() =>
    selectedVariants.value.reduce((total, v) => total + (v.price || 0), 0),
);
const basePrice = computed(() => props.product?.price || 0);
const currentPrice = computed(() => {
    if (hasVariants.value && selectedVariants.value.length > 0)
        return variantsTotal.value;
    if (props.product?.discountPrice > 0) return props.product.discountPrice;
    return basePrice.value;
});

const formatCurrency = formatRupiah;
// --- LOGIKA PEMILIHAN VARIAN (UX UPGRADE) ---
const toggleVariant = (variant) => {
    // 1. Kasus Single Selection (Radio Button) - Contoh: CR 15 vs 20
    if (props.product?.singleSelection) {
        selectedVariants.value = [variant];
        return;
    }

    // 2. Kasus Bundle (Contoh: Trials)
    // Jika user memilih varian Bundle
    if (variant.isBundle) {
        // Hapus semua pilihan lain, pilih hanya bundle ini
        selectedVariants.value = [variant];
        return;
    }

    // Jika user memilih varian BIASA
    const index = selectedVariants.value.findIndex((v) => v.id === variant.id);
    if (index === -1) {
        // Sebelum menambah varian biasa, cek apakah ada Bundle yang sedang aktif?
        // Jika ada, hapus Bundle-nya dulu (karena user ingin custom satuan)
        selectedVariants.value = selectedVariants.value.filter(
            (v) => !v.isBundle,
        );
        selectedVariants.value.push(variant);
    } else {
        selectedVariants.value.splice(index, 1);
    }
};

const isSelected = (variantId) =>
    selectedVariants.value.some((v) => v.id === variantId);

const handleAddToCart = () => {
    if (hasVariants.value && selectedVariants.value.length === 0) {
        alert("Pilih minimal satu opsi dulu ya ✨");
        return;
    }

    const itemToAdd = {
        ...props.product,
        id: hasVariants.value
            ? `${props.product.id}-custom-${Date.now()}`
            : props.product.id,
        name: hasVariants.value
            ? `${props.product.name} (${selectedVariants.value.map((v) => v.name).join(", ")})`
            : props.product.name,
        price: currentPrice.value,
        selectedVariants: selectedVariants.value,
    };

    cart.addToCart(itemToAdd);
    selectedVariants.value = [];
    emit("close");
};

const onCalculatorAdd = (item) => {
    cart.addToCart(item);
    emit("close");
};

// Category-aware accent color
const accentConfig = computed(() => {
    const cat = props.product?.category;
    if (cat === "heart") return {
        gradient: "from-rose-500 to-pink-500",
        bgLight: "bg-rose-50",
        bgDark: "dark:bg-rose-900/20",
        textAccent: "text-rose-500",
        ring: "ring-rose-500",
        borderAccent: "border-rose-200",
        borderAccentDark: "dark:border-rose-800",
        selectedBg: "bg-rose-50/60 dark:bg-rose-950/30",
        selectedBorder: "border-rose-400/50 dark:border-rose-500/40",
        shadowColor: "shadow-rose-200/50",
    };
    if (cat === "candlerun") return {
        gradient: "from-amber-500 to-orange-500",
        bgLight: "bg-amber-50",
        bgDark: "dark:bg-amber-900/20",
        textAccent: "text-amber-500",
        ring: "ring-amber-500",
        borderAccent: "border-amber-200",
        borderAccentDark: "dark:border-amber-800",
        selectedBg: "bg-amber-50/60 dark:bg-amber-950/30",
        selectedBorder: "border-amber-400/50 dark:border-amber-500/40",
        shadowColor: "shadow-amber-200/50",
    };
    return {
        gradient: "from-indigo-500 to-sky-500",
        bgLight: "bg-indigo-50",
        bgDark: "dark:bg-indigo-900/20",
        textAccent: "text-indigo-500",
        ring: "ring-indigo-500",
        borderAccent: "border-indigo-200",
        borderAccentDark: "dark:border-indigo-800",
        selectedBg: "bg-indigo-50/60 dark:bg-indigo-950/30",
        selectedBorder: "border-indigo-400/50 dark:border-indigo-500/40",
        shadowColor: "shadow-indigo-200/50",
    };
});
</script>

<template>
    <transition name="slide-up">
        <div
            v-if="isOpen"
            class="fixed inset-0 z-[100] flex items-end sm:items-center justify-center pointer-events-none"
        >
            <div
                class="absolute inset-0 bg-slate-900/50 backdrop-blur-sm pointer-events-auto transition-opacity"
                @click="emit('close')"
            ></div>

            <div
                class="modal-sheet bg-white dark:bg-charcoal w-full max-w-lg rounded-t-[2rem] sm:rounded-[2rem] shadow-2xl relative z-10 pointer-events-auto flex flex-col max-h-[85vh]"
            >
                <!-- Drag Handle (Mobile) -->
                <div class="w-full flex justify-center pt-3 pb-1 sm:hidden">
                    <div
                        class="w-10 h-1 bg-slate-200 dark:bg-slate-700 rounded-full"
                    ></div>
                </div>

                <!-- ===== HEADER ===== -->
                <div
                    class="px-6 py-4 flex justify-between items-start gap-4"
                >
                    <div class="flex-1 min-w-0">
                        <h3
                            class="font-bold text-lg text-slate-800 dark:text-slate-100 leading-snug line-clamp-2"
                        >
                            {{ product?.name }}
                        </h3>
                        <p class="text-xs text-slate-400 dark:text-slate-500 mt-1 leading-relaxed line-clamp-2">
                            {{ product?.desc }}
                        </p>
                    </div>
                    <button
                        @click="emit('close')"
                        class="shrink-0 w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all active:scale-90"
                    >
                        <X :size="16" />
                    </button>
                </div>

                <!-- Divider -->
                <div class="mx-6 h-px bg-gradient-to-r from-transparent via-slate-200/80 dark:via-slate-700/50 to-transparent"></div>

                <!-- ===== SCROLLABLE CONTENT ===== -->
                <div class="flex-1 overflow-y-auto custom-scrollbar">
                    
                    <!-- CALCULATOR VIEW -->
                    <div v-if="isCalculator" class="p-6">
                        <MiniHeartCalculator
                            :product="product"
                            @addToCart="onCalculatorAdd"
                        />
                    </div>

                    <!-- VARIANT SELECTION VIEW -->
                    <div v-else-if="hasVariants" class="p-5">
                        <!-- Selection hint -->
                        <div class="flex items-center gap-2 mb-4 px-1">
                            <div class="w-1 h-4 rounded-full bg-gradient-to-b" :class="accentConfig.gradient"></div>
                            <span class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                {{ product?.singleSelection ? 'Pilih Salah Satu' : 'Pilih Varian' }}
                            </span>
                        </div>

                        <div class="space-y-2.5">
                            <button
                                v-for="variant in product.variants"
                                :key="variant.id"
                                @click="toggleVariant(variant)"
                                class="variant-card w-full flex items-center gap-3.5 p-4 rounded-2xl border-2 text-left transition-all duration-200 active:scale-[0.98] group relative overflow-hidden"
                                :class="[
                                    isSelected(variant.id)
                                        ? [accentConfig.selectedBg, accentConfig.selectedBorder]
                                        : 'bg-white dark:bg-slate-800/60 border-slate-100 dark:border-slate-700/40 hover:border-slate-200 dark:hover:border-slate-600',
                                    variant.isBundle ? 'ring-1 ring-inset ring-amber-200/40 dark:ring-amber-500/10' : ''
                                ]"
                            >
                                <!-- Bundle Sparkle Bg -->
                                <div v-if="variant.isBundle" class="absolute inset-0 bg-gradient-to-r from-amber-50/40 via-transparent to-amber-50/20 dark:from-amber-900/10 dark:to-transparent pointer-events-none"></div>

                                <!-- Selector circle/square -->
                                <div
                                    class="relative shrink-0 w-5 h-5 border-2 flex items-center justify-center transition-all duration-200"
                                    :class="[
                                        product?.singleSelection ? 'rounded-full' : 'rounded-md',
                                        isSelected(variant.id)
                                            ? `${accentConfig.ring} bg-gradient-to-br ${accentConfig.gradient} border-transparent`
                                            : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700'
                                    ]"
                                >
                                    <div
                                        v-if="product?.singleSelection && isSelected(variant.id)"
                                        class="w-1.5 h-1.5 bg-white rounded-full"
                                    ></div>
                                    <Check
                                        v-else-if="isSelected(variant.id)"
                                        :size="11"
                                        class="text-white"
                                        stroke-width="3.5"
                                    />
                                </div>

                                <!-- Content -->
                                <div class="relative flex-1 min-w-0">
                                    <div class="flex items-center gap-2">
                                        <span
                                            class="font-semibold text-sm text-slate-700 dark:text-slate-200 truncate"
                                        >{{ variant.name }}</span>
                                        <span 
                                            v-if="variant.isBundle"
                                            class="shrink-0 inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-[9px] font-bold uppercase tracking-wide"
                                        >
                                            <Crown :size="8" /> Best
                                        </span>
                                    </div>
                                    <span
                                        v-if="variant.isBundle"
                                        class="text-[10px] text-amber-600/70 dark:text-amber-400/60 mt-0.5 block"
                                    >Hemat & Praktis!</span>
                                </div>

                                <!-- Price -->
                                <span
                                    class="relative shrink-0 font-bold text-sm tabular-nums transition-colors"
                                    :class="isSelected(variant.id)
                                        ? accentConfig.textAccent
                                        : 'text-slate-500 dark:text-slate-400'"
                                >{{ formatCurrency(variant.price) }}</span>
                            </button>
                        </div>
                    </div>

                    <!-- SIMPLE PRODUCT (no variants, no calc) -->
                    <div v-else class="p-6">
                        <div
                            class="p-5 rounded-2xl border border-slate-100/60 dark:border-slate-700/40 bg-slate-50/50 dark:bg-slate-800/40 flex items-start gap-4"
                        >
                            <div
                                class="shrink-0 p-3 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100/80 dark:border-slate-700/40"
                                :class="accentConfig.textAccent"
                            >
                                <ShoppingBag :size="22" />
                            </div>
                            <div class="min-w-0">
                                <p
                                    class="font-semibold text-slate-700 dark:text-slate-200 text-sm mb-1"
                                >
                                    Deskripsi Paket
                                </p>
                                <p
                                    class="text-sm text-slate-500 dark:text-slate-400 leading-relaxed"
                                >
                                    {{ product?.desc }}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- ===== CTA FOOTER (non-calculator) ===== -->
                <div
                    v-if="!isCalculator"
                    class="p-5 border-t border-slate-100/80 dark:border-slate-800 bg-white/80 dark:bg-charcoal rounded-b-[2rem]"
                >
                    <!-- Price display -->
                    <div class="flex justify-between items-baseline mb-4 px-1">
                        <span class="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Total</span>
                        <div class="flex items-baseline gap-1.5">
                            <span
                                class="text-2xl font-black tracking-tight"
                                :class="currentPrice > 0 ? 'text-slate-800 dark:text-white' : 'text-slate-400'"
                            >{{ currentPrice > 0 ? formatCurrency(currentPrice) : '—' }}</span>
                        </div>
                    </div>

                    <button
                        @click="handleAddToCart"
                        :disabled="hasVariants && selectedVariants.length === 0"
                        class="w-full h-12 rounded-xl text-white font-semibold shadow-lg transition-all duration-200 active:scale-[0.97] hover:shadow-xl hover:brightness-105 flex items-center justify-center gap-2 group disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-lg disabled:hover:brightness-100 bg-gradient-to-r"
                        :class="[accentConfig.gradient, accentConfig.shadowColor]"
                    >
                        <Plus :size="18" stroke-width="2.5" />
                        <span>Masukkan Keranjang</span>
                        <ChevronRight :size="14" class="opacity-50 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                </div>
            </div>
        </div>
    </transition>
</template>

<style scoped>
.slide-up-enter-active,
.slide-up-leave-active {
    transition: all 0.35s cubic-bezier(0.32, 0.72, 0, 1);
}
.slide-up-enter-from,
.slide-up-leave-to {
    transform: translateY(100%);
    opacity: 0;
}

@media (min-width: 640px) {
    .slide-up-enter-from,
    .slide-up-leave-to {
        transform: translateY(20px) scale(0.95);
        opacity: 0;
    }
}

/* Variant card hover lift */
.variant-card {
    transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease, background-color 0.2s ease;
}
.variant-card:hover {
    box-shadow: 0 2px 12px -4px rgba(0,0,0,0.06);
}

/* Custom scrollbar */
.custom-scrollbar::-webkit-scrollbar {
    width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(0,0,0,0.08);
    border-radius: 999px;
}
.dark .custom-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(255,255,255,0.06);
}
</style>