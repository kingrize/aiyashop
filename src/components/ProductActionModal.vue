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
} from "lucide-vue-next"; // Tambah CheckCircle
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
</script>

<template>
    <transition name="slide-up">
        <div
            v-if="isOpen"
            class="fixed inset-0 z-[100] flex items-end sm:items-center justify-center pointer-events-none"
        >
            <div
                class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm pointer-events-auto transition-opacity"
                @click="emit('close')"
            ></div>

            <div
                class="bg-white dark:bg-charcoal w-full max-w-lg rounded-t-[2rem] sm:rounded-[2rem] shadow-2xl relative z-10 pointer-events-auto flex flex-col max-h-[85vh]"
            >
                <div class="w-full flex justify-center pt-3 pb-1 sm:hidden">
                    <div
                        class="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full"
                    ></div>
                </div>

                <div
                    class="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center"
                >
                    <div>
                        <h3
                            class="font-bold text-lg text-slate-800 dark:text-slate-100 line-clamp-1"
                        >
                            {{ product?.name }}
                        </h3>
                        <p class="text-xs text-slate-400">
                            {{
                                isCalculator
                                    ? "Kalkulator"
                                    : hasVariants
                                      ? product?.singleSelection
                                          ? "Pilih Salah Satu"
                                          : "Pilih Varian"
                                      : "Konfirmasi"
                            }}
                        </p>
                    </div>
                    <button
                        @click="emit('close')"
                        class="p-2 bg-slate-50 dark:bg-slate-800 rounded-full text-slate-400 hover:text-rose-500 transition"
                    >
                        <X :size="20" />
                    </button>
                </div>

                <div class="flex-1 overflow-y-auto p-6 custom-scrollbar">
                    <div v-if="isCalculator">
                        <MiniHeartCalculator
                            :product="product"
                            @addToCart="onCalculatorAdd"
                        />
                    </div>

                    <div v-else-if="hasVariants" class="space-y-3">
                        <div
                            v-for="variant in product.variants"
                            :key="variant.id"
                            @click="toggleVariant(variant)"
                            class="flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all active:scale-[0.98]"
                            :class="
                                isSelected(variant.id)
                                    ? 'bg-sky-50 dark:bg-sky-900/30 border-sky-500 dark:border-sky-500 ring-1 ring-sky-500'
                                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-sky-300'
                            "
                        >
                            <div class="flex items-center gap-3">
                                <div
                                    class="w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors"
                                    :class="[
                                        isSelected(variant.id)
                                            ? 'border-sky-500 bg-sky-500'
                                            : 'border-slate-300 dark:border-slate-600 bg-transparent',
                                        product?.singleSelection
                                            ? 'rounded-full'
                                            : 'rounded-lg', // Visual beda (Bulat vs Kotak)
                                    ]"
                                >
                                    <div
                                        v-if="
                                            product?.singleSelection &&
                                            isSelected(variant.id)
                                        "
                                        class="w-2.5 h-2.5 bg-white rounded-full"
                                    ></div>
                                    <Check
                                        v-else-if="isSelected(variant.id)"
                                        :size="14"
                                        class="text-white"
                                        stroke-width="4"
                                    />
                                </div>
                                <div class="flex flex-col">
                                    <span
                                        class="font-bold text-slate-700 dark:text-slate-200 text-sm"
                                        >{{ variant.name }}</span
                                    >
                                    <span
                                        v-if="variant.isBundle"
                                        class="text-[10px] text-sky-500 font-bold"
                                        >Hemat & Praktis!</span
                                    >
                                </div>
                            </div>
                            <span
                                class="font-bold text-sky-600 dark:text-sky-400 text-sm"
                                >{{ formatCurrency(variant.price) }}</span
                            >
                        </div>
                    </div>

                    <div v-else>
                        <div
                            class="bg-sky-50 dark:bg-sky-900/20 p-4 rounded-2xl border border-sky-100 dark:border-sky-800 flex items-start gap-4"
                        >
                            <div
                                class="p-3 bg-white dark:bg-slate-800 rounded-xl shadow-sm text-sky-500"
                            >
                                <ShoppingBag :size="24" />
                            </div>
                            <div>
                                <p
                                    class="font-bold text-slate-700 dark:text-slate-200 text-sm mb-1"
                                >
                                    Deskripsi Paket:
                                </p>
                                <p
                                    class="text-sm text-slate-600 dark:text-slate-300 leading-relaxed"
                                >
                                    {{ product?.desc }}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div
                    v-if="!isCalculator"
                    class="p-6 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-charcoal rounded-b-[2rem]"
                >
                    <div class="flex justify-between items-end mb-4">
                        <span class="text-xs font-bold text-slate-400 uppercase"
                            >Total Harga</span
                        >
                        <span
                            class="text-2xl font-black text-slate-800 dark:text-white"
                            >{{ formatCurrency(currentPrice) }}</span
                        >
                    </div>
                    <button
                        @click="handleAddToCart"
                        class="w-full py-4 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 text-white font-bold shadow-lg shadow-sky-200 dark:shadow-none hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                        <Plus :size="20" /> Masukkan Keranjang
                    </button>
                </div>
            </div>
        </div>
    </transition>
</template>

<style scoped>
.slide-up-enter-active,
.slide-up-leave-active {
    transition: all 0.3s cubic-bezier(0.32, 0.72, 0, 1);
}
.slide-up-enter-from,
.slide-up-leave-to {
    transform: translateY(100%);
    opacity: 0;
}
.sm .slide-up-enter-from,
.sm .slide-up-leave-to {
    transform: translateY(20px) scale(0.95);
    opacity: 0;
}
</style>