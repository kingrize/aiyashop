<script setup>
import { computed, ref, watch } from "vue";
import {
    Minus,
    Plus,
    Zap,
    Gift,
    ShoppingBag,
    ShieldCheck,
    Info,
} from "lucide-vue-next";

const props = defineProps({
    product: {
        type: Object,
        required: true,
    },
});

const emit = defineEmits(["addToCart"]);

const config = computed(() => props.product.config || {});

/* CONFIG */
const minHearts = computed(() => config.value.minHearts ?? 10);
const maxHearts = computed(() => config.value.maxHearts ?? 1000);
const heartCount = ref(config.value.defaultHearts ?? 10);

const isInstant = computed(() => config.value.isInstant === true);
const hasBonus = computed(() => config.value.hasBonus === true);

// Slider Config
const minSlots = computed(() => config.value.minSlots ?? 1);
const maxSlots = computed(() => config.value.maxSlots ?? 20);
const slots = ref(5);

// Harga per Heart (Default 100)
const pricePerHeart = computed(() => config.value.pricePerHeart ?? 100);

const formatCurrency = (value) =>
    new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
    }).format(value || 0);

// BONUS LOGIC
const bonusHearts = computed(() => {
    if (!hasBonus.value || heartCount.value <= 0) return 0;
    const paket50 = Math.floor(heartCount.value / 50);
    return paket50 * 5;
});

const totalHeartsWithBonus = computed(
    () => heartCount.value + bonusHearts.value,
);
const totalPrice = computed(() => heartCount.value * pricePerHeart.value);

// ESTIMASI HARI
const estimatedDays = computed(() => {
    if (isInstant.value) return 0;
    if (!slots.value) return 0;
    return Math.ceil(totalHeartsWithBonus.value / slots.value);
});

/* ACTIONS */
const decreaseHearts = () => {
    if (heartCount.value > minHearts.value) heartCount.value--;
    if (heartCount.value < minHearts.value) heartCount.value = minHearts.value;
};
const increaseHearts = () => {
    if (heartCount.value < maxHearts.value) heartCount.value++;
    if (heartCount.value > maxHearts.value) heartCount.value = maxHearts.value;
};

const handleInput = (e) => {
    let val = parseInt(e.target.value);
    if (isNaN(val)) return;
    heartCount.value = val;
};

const handleBlur = () => {
    if (heartCount.value < minHearts.value) heartCount.value = minHearts.value;
    if (heartCount.value > maxHearts.value) heartCount.value = maxHearts.value;
};

watch(
    () => props.product,
    () => {
        heartCount.value = config.value.defaultHearts || 10;
        slots.value = 5;
    },
);

const handleAddToCart = () => {
    if (heartCount.value < minHearts.value) heartCount.value = minHearts.value;
    if (heartCount.value > maxHearts.value) heartCount.value = maxHearts.value;

    const descDaily = `Total: ${totalHeartsWithBonus.value} Heart • Via ${slots.value} Bot • Est. ${estimatedDays.value} Hari`;
    const descInstant = `Total: ${heartCount.value} Heart • INSTANT Delivery • No Bonus`;

    emit("addToCart", {
        ...props.product,
        id: `${props.product.id}-custom-${Date.now()}`,
        name:
            hasBonus.value && bonusHearts.value > 0
                ? `${props.product.name} (${heartCount.value} + ${bonusHearts.value} Bonus)`
                : `${props.product.name} (${heartCount.value})`,
        price: totalPrice.value,
        qty: 1,
        desc: isInstant.value ? descInstant : descDaily,
        selectedVariants: isInstant.value
            ? [
                  { name: "Jumlah", value: heartCount.value },
                  { name: "Metode", value: "Instant Trade" },
              ]
            : [
                  { name: "Jumlah", value: heartCount.value },
                  { name: "Add Bot", value: slots.value },
              ],
    });
};
</script>

<template>
    <div class="flex flex-col h-full relative">
        <div
            class="flex-1 flex flex-col justify-center items-center py-2 space-y-6"
        >
            <div class="text-center space-y-2">
                <h3
                    class="text-slate-400 dark:text-slate-500 font-bold text-[10px] uppercase tracking-[0.2em]"
                >
                    Jumlah Heart
                </h3>
                <transition name="scale">
                    <div
                        v-if="bonusHearts > 0"
                        class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold border border-emerald-100 dark:border-emerald-500/20"
                    >
                        <Gift :size="10" /> +{{ bonusHearts }} Bonus
                    </div>
                </transition>
            </div>

            <div class="flex items-center gap-6 md:gap-8">
                <button
                    @click="decreaseHearts"
                    class="w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center bg-slate-50 dark:bg-slate-800 text-slate-400 hover:bg-rose-50 hover:text-rose-500 dark:hover:text-rose-400 transition-all active:scale-90"
                >
                    <Minus :size="20" />
                </button>

                <div class="relative group text-center">
                    <input
                        type="number"
                        :value="heartCount"
                        @input="handleInput"
                        @blur="handleBlur"
                        class="no-arrow w-32 text-center text-5xl md:text-6xl font-black bg-transparent text-slate-800 dark:text-white focus:outline-none p-0 border-none transition-colors placeholder-slate-200"
                        placeholder="0"
                    />
                    <div
                        class="text-[10px] font-medium text-slate-400 mt-1 flex justify-center gap-1"
                    >
                        <span>Min: {{ minHearts }}</span>
                        <span class="text-slate-300">•</span>
                        <span>Max: {{ maxHearts }}</span>
                    </div>
                </div>

                <button
                    @click="increaseHearts"
                    class="w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center bg-slate-50 dark:bg-slate-800 text-slate-400 hover:bg-indigo-50 hover:text-indigo-500 dark:hover:text-indigo-400 transition-all active:scale-90"
                >
                    <Plus :size="20" />
                </button>
            </div>

            <div v-if="!isInstant" class="w-full max-w-[85%] space-y-4 pt-2">
                <div class="flex justify-between items-end px-1">
                    <span
                        class="text-[10px] font-bold text-slate-400 uppercase tracking-wider"
                    >
                        Kecepatan ({{ slots }} Bot)
                    </span>
                    <span
                        class="text-xs font-bold text-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5 rounded-md"
                    >
                        {{ estimatedDays }} Hari
                    </span>
                </div>

                <div class="relative w-full h-6 flex items-center">
                    <input
                        type="range"
                        v-model.number="slots"
                        :min="minSlots"
                        :max="maxSlots"
                        class="custom-slider w-full absolute z-20 opacity-0 cursor-pointer h-full"
                    />
                    <div
                        class="absolute w-full h-2 bg-slate-100 dark:bg-slate-700/50 rounded-full overflow-hidden"
                    >
                        <div
                            class="h-full bg-indigo-200 dark:bg-indigo-500/30 transition-all duration-100 ease-out"
                            :style="{
                                width: `${((slots - minSlots) / (maxSlots - minSlots)) * 100}%`,
                            }"
                        ></div>
                    </div>
                    <div
                        class="absolute h-5 w-5 bg-indigo-500 rounded-full border-[3px] border-white dark:border-slate-800 shadow-md transition-all duration-100 ease-out pointer-events-none z-10"
                        :style="{
                            left: `calc(${((slots - minSlots) / (maxSlots - minSlots)) * 100}% - 10px)`,
                        }"
                    ></div>
                </div>

                <p
                    class="text-[10px] text-center text-slate-400 dark:text-slate-500 leading-relaxed"
                >
                    <Info
                        :size="10"
                        class="inline mb-0.5 text-slate-300 dark:text-slate-600"
                    />
                    Wajib akun Linked (Gmail/Nintendo/PS).
                </p>
            </div>

            <div
                v-else
                class="flex flex-col items-center gap-1 text-amber-500/80"
            >
                <Zap :size="20" class="fill-amber-100 dark:fill-amber-900/20" />
                <span class="text-[10px] font-bold uppercase tracking-widest"
                    >Mode Kilat Aktif</span
                >
            </div>
        </div>

        <div
            class="mt-auto pt-5 border-t border-slate-50 dark:border-slate-800/50"
        >
            <div class="flex items-center justify-between mb-4 px-1">
                <div class="flex flex-col">
                    <span
                        class="text-[10px] font-bold text-slate-400 uppercase tracking-wider"
                        >Total Tagihan</span
                    >
                    <span
                        class="text-2xl font-black text-slate-800 dark:text-slate-100"
                        >{{ formatCurrency(totalPrice) }}</span
                    >
                </div>
                <div class="text-right flex flex-col items-end gap-1">
                    <div
                        v-if="!isInstant"
                        class="flex items-center gap-1 text-[10px] font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-md"
                    >
                        <ShieldCheck :size="10" /> Aman 100%
                    </div>
                </div>
            </div>

            <button
                @click="handleAddToCart"
                class="group w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-lg shadow-indigo-200 dark:shadow-none active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
                <ShoppingBag
                    :size="18"
                    class="group-hover:-translate-y-0.5 transition-transform"
                />
                Masuk Keranjang
            </button>
        </div>
    </div>
</template>

<style scoped>
/* HILANGKAN PANAH INPUT ANGKA */
.no-arrow::-webkit-outer-spin-button,
.no-arrow::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
}
.no-arrow {
    -moz-appearance: textfield;
}

/* ANIMASI HALUS */
.scale-enter-active,
.scale-leave-active {
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.scale-enter-from,
.scale-leave-to {
    opacity: 0;
    transform: scale(0.8);
}
</style>
