<script setup>
import { computed, ref, watch } from "vue";
import { formatRupiah } from "../utils/format";
import { Minus, Plus, Zap, ChevronRight, Heart, Clock, Gauge, Rocket, Leaf } from "lucide-vue-next";

const props = defineProps({
    product: {
        type: Object,
        required: true,
    },
});

const emit = defineEmits(["addToCart"]);

const config = computed(() => props.product.config || {});

/* ─────────────────────────────────────────────────────────────
   CONFIG (business logic unchanged)
───────────────────────────────────────────────────────────── */
const minHearts = computed(() => config.value.minHearts ?? 10);
const maxHearts = computed(() => config.value.maxHearts ?? 1000);
const heartCount = ref(config.value.defaultHearts ?? 10);

const isInstant = computed(() => config.value.isInstant === true);
const hasBonus = computed(() => config.value.hasBonus === true);

// Bot slider config (Internal: slots = bots)
const minSlots = computed(() => config.value.minSlots ?? 1);
const maxSlots = computed(() => config.value.maxSlots ?? 20);
const slots = ref(5);

// Intent-based Presets with icons
const presets = [
    { id: 'relaxed', value: 3, label: 'Santai', desc: 'Paling hemat', icon: Leaf },
    { id: 'balanced', value: 8, label: 'Seimbang', desc: 'Paling dipilih', icon: Gauge },
    { id: 'swift', value: 15, label: 'Cepat', desc: 'Selesai lebih cepat', icon: Rocket },
];

const pricePerHeart = computed(() => config.value.pricePerHeart ?? 100);
const formatCurrency = formatRupiah;

/* ─────────────────────────────────────────────────────────────
   BONUS LOGIC (unchanged)
───────────────────────────────────────────────────────────── */
const bonusHearts = computed(() => {
    if (!hasBonus.value || heartCount.value <= 0) return 0;
    const paket50 = Math.floor(heartCount.value / 50);
    return paket50 * 5;
});

const totalHeartsWithBonus = computed(
    () => heartCount.value + bonusHearts.value,
);
const totalPrice = computed(() => heartCount.value * pricePerHeart.value);

const estimatedDays = computed(() => {
    if (isInstant.value) return 0;
    if (!slots.value) return 0;
    return Math.ceil(totalHeartsWithBonus.value / slots.value);
});

// Dynamic Label for Slider
const paceLabel = computed(() => {
    if (slots.value <= 4) return 'Santai';
    if (slots.value <= 10) return 'Seimbang';
    return 'Cepat';
});

/* ─────────────────────────────────────────────────────────────
   ACTIONS (logic unchanged)
───────────────────────────────────────────────────────────── */
const decreaseHearts = () => {
    if (heartCount.value > minHearts.value) heartCount.value -= 10;
    if (heartCount.value < minHearts.value) heartCount.value = minHearts.value;
};
const increaseHearts = () => {
    if (heartCount.value < maxHearts.value) heartCount.value += 10;
    if (heartCount.value > maxHearts.value) heartCount.value = maxHearts.value;
};

const applyPreset = (presetValue) => {
    slots.value = presetValue;
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
        slots.value = 8; // Default to balanced
    },
);

const handleAddToCart = () => {
    if (heartCount.value < minHearts.value) heartCount.value = minHearts.value;
    if (heartCount.value > maxHearts.value) heartCount.value = maxHearts.value;

    // Technical description for admin/checkout
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
                  { name: "Speed", value: paceLabel.value },
                  { name: "Bot Count", value: slots.value },
              ],
    });
};

// Computed for slider progress
const sliderProgress = computed(() => {
    return ((slots.value - minSlots.value) / (maxSlots.value - minSlots.value)) * 100;
});

// Quick preset buttons for hearts
const heartPresets = computed(() => {
    const base = [50, 100, 200, 500];
    return base.filter(v => v >= minHearts.value && v <= maxHearts.value);
});
</script>

<template>
    <div class="calc-container flex flex-col min-h-full pb-20 sm:pb-4 relative">

        <!-- ═══════════════════════════════════════════════════════════════
             1️⃣ QUANTITY SECTION
        ═══════════════════════════════════════════════════════════════ -->
        <div class="mb-6">
            <!-- Section label -->
            <div class="flex items-center gap-2 mb-4">
                <div class="w-1 h-4 rounded-full bg-gradient-to-b from-rose-400 to-pink-400"></div>
                <label class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Jumlah Heart
                </label>
            </div>

            <!-- Quantity Stepper -->
            <div class="flex items-center gap-3 mb-4">
                <!-- Minus -->
                <button
                    @click="decreaseHearts"
                    :disabled="heartCount <= minHearts"
                    class="shrink-0 w-11 h-11 rounded-xl flex items-center justify-center bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/40 text-slate-500 dark:text-slate-400 hover:bg-rose-50 hover:border-rose-200 dark:hover:bg-slate-700 disabled:opacity-25 disabled:cursor-not-allowed transition-all active:scale-90 shadow-sm"
                >
                    <Minus :size="18" stroke-width="2.5" />
                </button>

                <!-- Number Input -->
                <div class="flex-1 relative">
                    <input
                        type="number"
                        :value="heartCount"
                        @input="handleInput"
                        @blur="handleBlur"
                        class="w-full text-center text-3xl font-black bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none border-2 border-slate-200/60 dark:border-slate-700/40 focus:border-rose-300 dark:focus:border-rose-500/40 no-arrow tracking-tight py-3 rounded-xl transition-colors shadow-sm"
                    />
                    <span class="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-300 dark:text-slate-600 pointer-events-none">❤️</span>
                </div>

                <!-- Plus -->
                <button
                    @click="increaseHearts"
                    :disabled="heartCount >= maxHearts"
                    class="shrink-0 w-11 h-11 rounded-xl flex items-center justify-center bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/40 text-slate-500 dark:text-slate-400 hover:bg-rose-50 hover:border-rose-200 dark:hover:bg-slate-700 disabled:opacity-25 disabled:cursor-not-allowed transition-all active:scale-90 shadow-sm"
                >
                    <Plus :size="18" stroke-width="2.5" />
                </button>
            </div>

            <!-- Quick Presets (Heart Amount) -->
            <div class="flex gap-2">
                <button
                    v-for="preset in heartPresets"
                    :key="preset"
                    @click="heartCount = preset"
                    class="flex-1 py-2 rounded-lg text-xs font-bold transition-all duration-200 active:scale-95"
                    :class="heartCount === preset
                        ? 'bg-rose-500 text-white shadow-sm shadow-rose-200/60 dark:shadow-none'
                        : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200/50 dark:border-slate-700/40 hover:border-rose-200 dark:hover:border-rose-500/30'"
                >
                    {{ preset }}
                </button>
            </div>
        </div>

        <!-- ═══════════════════════════════════════════════════════════════
             2️⃣ BONUS CALLOUT
        ═══════════════════════════════════════════════════════════════ -->
        <transition name="fade-slide">
            <div v-if="hasBonus && bonusHearts > 0" class="mb-6 p-3.5 rounded-xl bg-gradient-to-r from-rose-50/80 to-pink-50/60 dark:from-rose-950/20 dark:to-pink-950/10 border border-rose-100/60 dark:border-rose-900/20 flex items-center gap-3">
                <div class="shrink-0 w-8 h-8 rounded-lg bg-rose-100 dark:bg-rose-900/40 flex items-center justify-center text-rose-500">
                    <Heart :size="14" fill="currentColor" />
                </div>
                <div class="flex-1 min-w-0">
                    <p class="text-sm font-semibold text-rose-700 dark:text-rose-300">
                        +{{ bonusHearts }} bonus heart gratis!
                    </p>
                    <p class="text-[11px] text-rose-500/60 dark:text-rose-400/50 leading-snug mt-0.5">
                        Hadiah setiap pembelian kelipatan 50 heart
                    </p>
                </div>
            </div>
        </transition>

        <!-- ═══════════════════════════════════════════════════════════════
             3️⃣ DELIVERY PACE (non-instant only)
        ═══════════════════════════════════════════════════════════════ -->
        <div v-if="!isInstant" class="mb-6">
            <!-- Section label -->
            <div class="flex items-center gap-2 mb-4">
                <div class="w-1 h-4 rounded-full bg-gradient-to-b from-rose-400 to-pink-400"></div>
                <label class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Kecepatan Pengiriman
                </label>
            </div>

            <!-- Pace Preset Cards -->
            <div class="grid grid-cols-3 gap-2 mb-5">
                <button
                    v-for="preset in presets"
                    :key="preset.id"
                    @click="applyPreset(preset.value)"
                    class="pace-card relative p-3 rounded-xl border-2 transition-all duration-200 active:scale-[0.97] text-center group overflow-hidden"
                    :class="slots === preset.value
                        ? 'bg-rose-50/80 dark:bg-rose-950/30 border-rose-300/60 dark:border-rose-500/30'
                        : 'bg-white dark:bg-slate-800/60 border-slate-100 dark:border-slate-700/40 hover:border-rose-200/60 dark:hover:border-rose-800/40'"
                >
                    <!-- Preset Icon -->
                    <div
                        class="w-8 h-8 rounded-lg mx-auto mb-2 flex items-center justify-center transition-colors"
                        :class="slots === preset.value
                            ? 'bg-rose-100 dark:bg-rose-900/40 text-rose-500'
                            : 'bg-slate-100 dark:bg-slate-700/60 text-slate-400 dark:text-slate-500 group-hover:text-rose-400'"
                    >
                        <component :is="preset.icon" :size="16" />
                    </div>
                    <div
                        class="text-xs font-bold transition-colors"
                        :class="slots === preset.value ? 'text-rose-700 dark:text-rose-300' : 'text-slate-600 dark:text-slate-400'"
                    >{{ preset.label }}</div>
                    <div class="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                        {{ preset.desc }}
                    </div>
                    <!-- Active dot -->
                    <div
                        v-if="slots === preset.value"
                        class="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-rose-400"
                    ></div>
                </button>
            </div>

            <!-- Fine-tune Slider -->
            <div class="px-1">
                <div class="flex items-center justify-between mb-2">
                    <span class="text-[11px] text-slate-400 dark:text-slate-500">Atur manual</span>
                    <span class="text-[11px] font-bold text-rose-500 dark:text-rose-400 tabular-nums">
                        {{ slots }} bot/hari
                    </span>
                </div>
                <div class="relative w-full h-8 flex items-center">
                    <input
                        type="range"
                        v-model.number="slots"
                        :min="minSlots"
                        :max="maxSlots"
                        class="slider-input absolute z-20 w-full h-full opacity-0 cursor-pointer"
                    />
                    <!-- Track -->
                    <div class="absolute w-full h-1 bg-rose-100/80 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                            class="h-full bg-gradient-to-r from-rose-300 to-rose-400 dark:from-rose-600 dark:to-rose-500 rounded-full transition-all duration-200"
                            :style="{ width: `${sliderProgress}%` }"
                        ></div>
                    </div>
                    <!-- Thumb -->
                    <div
                        class="absolute h-5 w-5 bg-white rounded-full border-2 border-rose-300 dark:border-rose-500 shadow transition-all duration-100 pointer-events-none z-10 flex items-center justify-center"
                        :style="{ left: `calc(${sliderProgress}% - ${sliderProgress * 0.2 / 10}px)` }"
                    >
                        <div class="w-1.5 h-1.5 rounded-full bg-rose-400 dark:bg-rose-500"></div>
                    </div>
                </div>
            </div>

            <!-- Side note -->
            <p class="text-[10px] text-slate-400 dark:text-slate-500 text-center mt-3 italic">
                Akun bot ditambahkan setelah checkout
            </p>
        </div>

        <!-- Instant Mode Info -->
        <div v-else class="mb-6 p-4 rounded-xl bg-amber-50/50 dark:bg-amber-950/15 border border-amber-200/40 dark:border-amber-800/20 flex items-center gap-3">
            <div class="shrink-0 w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center text-amber-500">
                <Zap :size="16" fill="currentColor" />
            </div>
            <p class="text-sm text-amber-800/80 dark:text-amber-200/70 leading-snug">
                Langsung dikirim via <strong>in-game trade</strong> setelah pembayaran.
            </p>
        </div>

        <!-- ═══════════════════════════════════════════════════════════════
             4️⃣ ORDER SUMMARY
        ═══════════════════════════════════════════════════════════════ -->
        <div class="rounded-xl overflow-hidden border border-slate-100/60 dark:border-slate-700/40 mb-4">
            <!-- Summary header -->
            <div class="px-4 py-3 bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-100/60 dark:border-slate-700/40">
                <h3 class="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    Ringkasan
                </h3>
            </div>
            <div class="px-4 py-3 bg-white/60 dark:bg-slate-800/30 space-y-3 text-sm">
                <!-- Hearts -->
                <div class="flex justify-between">
                    <span class="text-slate-500 dark:text-slate-400">Total heart</span>
                    <span class="font-semibold text-slate-700 dark:text-slate-200 tabular-nums">
                        {{ heartCount }}
                        <span v-if="bonusHearts > 0" class="text-rose-400 text-xs ml-0.5">(+{{ bonusHearts }})</span>
                    </span>
                </div>

                <!-- Duration -->
                <div v-if="!isInstant" class="flex justify-between items-center">
                    <span class="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                        <Clock :size="12" class="opacity-50" />
                        Estimasi
                    </span>
                    <span class="font-semibold text-slate-700 dark:text-slate-200 text-xs bg-slate-100 dark:bg-slate-700/50 px-2 py-0.5 rounded-md tabular-nums">
                        ~{{ estimatedDays }} hari
                    </span>
                </div>

                <!-- Price per heart -->
                <div class="flex justify-between text-xs">
                    <span class="text-slate-400 dark:text-slate-500">Harga per heart</span>
                    <span class="text-slate-400 dark:text-slate-500 tabular-nums">
                        {{ formatCurrency(pricePerHeart) }}
                    </span>
                </div>

                <!-- Total -->
                <div class="pt-3 border-t border-slate-100 dark:border-slate-700/40 flex justify-between items-baseline">
                    <span class="text-slate-600 dark:text-slate-300 font-semibold">Total</span>
                    <span class="text-xl font-black text-slate-800 dark:text-white tracking-tight tabular-nums">
                        {{ formatCurrency(totalPrice) }}
                    </span>
                </div>
            </div>
        </div>

        <!-- ═══════════════════════════════════════════════════════════════
             5️⃣ CTA BUTTON
        ═══════════════════════════════════════════════════════════════ -->
        <div class="fixed bottom-0 left-0 right-0 p-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-t border-rose-100/20 dark:border-slate-800 z-50 sm:relative sm:p-0 sm:bg-transparent sm:dark:bg-transparent sm:border-none sm:backdrop-blur-none sm:mt-2">
            <button
                @click="handleAddToCart"
                class="cta-btn w-full h-12 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 dark:from-rose-600 dark:to-pink-600 text-white font-semibold shadow-lg shadow-rose-200/40 dark:shadow-none transition-all duration-200 active:scale-[0.97] hover:shadow-xl hover:brightness-105 flex items-center justify-center gap-2 group relative overflow-hidden"
            >
                <!-- Shimmer effect -->
                <span class="cta-shimmer absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full"></span>
                <span class="relative flex items-center gap-2">
                    <span>Lanjutkan</span>
                    <span class="opacity-40">•</span>
                    <span class="tabular-nums">{{ formatCurrency(totalPrice) }}</span>
                    <ChevronRight :size="15" class="opacity-60 group-hover:translate-x-0.5 transition-transform" />
                </span>
            </button>
        </div>
    </div>
</template>

<style scoped>
/* Remove number input arrows */
.no-arrow::-webkit-outer-spin-button,
.no-arrow::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
}
.no-arrow {
    -moz-appearance: textfield;
    appearance: textfield;
}

/* Slider thumb styling for better cross-browser support */
.slider-input::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 20px;
    height: 20px;
}
.slider-input::-moz-range-thumb {
    width: 20px;
    height: 20px;
    border: none;
    background: transparent;
}

/* Pace card */
.pace-card {
    transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease, background-color 0.2s ease;
}
.pace-card:hover {
    box-shadow: 0 2px 8px -3px rgba(0,0,0,0.05);
}

/* Fade-slide transition for bonus callout */
.fade-slide-enter-active,
.fade-slide-leave-active {
    transition: all 0.3s ease;
}
.fade-slide-enter-from,
.fade-slide-leave-to {
    opacity: 0;
    transform: translateY(-8px);
}

/* CTA shimmer */
.cta-btn:hover .cta-shimmer {
    animation: cta-shine 0.7s ease forwards;
}
@keyframes cta-shine {
    to {
        transform: translateX(100%);
    }
}
</style>