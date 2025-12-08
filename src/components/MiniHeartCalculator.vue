<script setup>
import { computed, ref } from "vue";
import { Heart, Minus, Plus, Users, Clock, Zap, Gift } from "lucide-vue-next";

const props = defineProps({
    product: {
        type: Object,
        required: true,
    },
});

const emit = defineEmits(["addToCart"]);

/* CONFIG */
const minHearts = computed(() => props.product.minHearts ?? 10);
const maxHearts = computed(() => props.product.maxHearts ?? 1000);
const heartCount = ref(props.product.defaultHearts ?? 30);

const minSlots = computed(() => props.product.minSlots ?? 1);
const maxSlots = computed(() => props.product.maxSlots ?? 15);
const slots = ref(props.product.defaultSlots ?? 5);

const pricePerHeart = computed(() => props.product.pricePerHeart ?? 3000); // Default fallback price

const formatCurrency = (value) =>
    new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
    }).format(value || 0);

// BONUS: Tiap 50 heart -> +5 heart
const bonusHearts = computed(() => {
    if (heartCount.value <= 0) return 0;
    const paket50 = Math.floor(heartCount.value / 50);
    return paket50 * 5;
});

const totalHeartsWithBonus = computed(
    () => heartCount.value + bonusHearts.value,
);
const totalPrice = computed(() => heartCount.value * pricePerHeart.value);

// Estimasi hari
const estimatedDays = computed(() => {
    if (!slots.value) return 0;
    return Math.ceil(totalHeartsWithBonus.value / slots.value);
});

/* ACTIONS */
const decreaseHearts = () => {
    if (heartCount.value > minHearts.value) heartCount.value--;
};
const increaseHearts = () => {
    if (heartCount.value < maxHearts.value) heartCount.value++;
};
const handleHeartInput = (e) => {
    let val = parseInt(e.target.value);
    if (isNaN(val)) val = minHearts.value;
    if (val < minHearts.value) val = minHearts.value;
    if (val > maxHearts.value) val = maxHearts.value;
    heartCount.value = val;
};

const presets = [10, 20, 30, 50, 100, 200];

const handleAddToCart = () => {
    emit("addToCart", {
        ...props.product,
        id: `${props.product.id}-custom-${Date.now()}`,
        name:
            bonusHearts.value > 0
                ? `Custom Heart (${heartCount.value} + ${bonusHearts.value} Bonus)`
                : `Custom Heart (${heartCount.value})`,
        price: totalPrice.value,
        qty: 1,
        desc: `Total: ${totalHeartsWithBonus.value} Heart • Via ${slots.value} Bot • Est. ${estimatedDays.value} Hari`,
        selectedVariants: [
            { name: "Jumlah Heart", value: heartCount.value },
            { name: "Slot Bot", value: slots.value },
        ],
    });
};
</script>

<template>
    <div class="flex flex-col h-full gap-5 pb-1">
        <div class="space-y-3">
            <div class="flex justify-between items-end">
                <label
                    class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider"
                >
                    Mau beli berapa?
                </label>
                <transition name="scale">
                    <span
                        v-if="bonusHearts > 0"
                        class="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-500/20 dark:text-emerald-400 px-2 py-0.5 rounded-full animate-pulse"
                    >
                        <Gift :size="10" /> +{{ bonusHearts }} Bonus
                    </span>
                </transition>
            </div>

            <div class="flex items-center gap-2">
                <button
                    @click="decreaseHearts"
                    class="w-10 h-10 flex items-center justify-center rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-rose-500 hover:border-rose-300 transition active:scale-95"
                >
                    <Minus :size="16" />
                </button>

                <div class="flex-1 relative">
                    <input
                        type="number"
                        v-model="heartCount"
                        @change="handleHeartInput"
                        class="w-full h-10 text-center font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 dark:focus:ring-rose-900 transition"
                    />
                    <div
                        class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                    >
                        <Heart
                            :size="14"
                            class="text-rose-400 fill-rose-400/20"
                        />
                    </div>
                </div>

                <button
                    @click="increaseHearts"
                    class="w-10 h-10 flex items-center justify-center rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-rose-500 hover:border-rose-300 transition active:scale-95"
                >
                    <Plus :size="16" />
                </button>
            </div>

            <div class="flex flex-wrap gap-2">
                <button
                    v-for="p in presets"
                    :key="p"
                    @click="heartCount = p"
                    class="px-3 py-1 text-[10px] font-bold rounded-lg border transition-all duration-200"
                    :class="
                        heartCount === p
                            ? 'bg-rose-500 text-white border-rose-500 shadow-md shadow-rose-200 dark:shadow-none'
                            : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-rose-300 hover:text-rose-500'
                    "
                >
                    {{ p }}
                </button>
            </div>
        </div>

        <div
            class="space-y-3 pt-2 border-t border-dashed border-slate-200 dark:border-slate-700"
        >
            <div class="flex justify-between items-center">
                <label
                    class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5"
                >
                    <Users :size="12" /> Slot Bot Kamu
                </label>
                <span
                    class="text-xs font-bold text-rose-500 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/30 px-2 py-0.5 rounded-md"
                >
                    {{ slots }} Akun
                </span>
            </div>

            <input
                type="range"
                v-model.number="slots"
                :min="minSlots"
                :max="maxSlots"
                class="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-rose-500 hover:accent-rose-400 transition-all"
            />

            <div
                class="flex justify-between text-[10px] text-slate-400 font-medium"
            >
                <span>Lambat ({{ minSlots }})</span>
                <span class="text-rose-400/80"
                    >Semakin banyak, semakin cepat selesai ⚡</span
                >
                <span>Ngebut ({{ maxSlots }})</span>
            </div>
        </div>

        <div
            class="mt-auto bg-gradient-to-br from-rose-50 to-white dark:from-slate-800 dark:to-slate-800/50 rounded-2xl p-4 border border-rose-100 dark:border-rose-900/30 shadow-sm"
        >
            <div class="flex justify-between items-start mb-3">
                <div>
                    <p
                        class="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-0.5"
                    >
                        Total Bayar
                    </p>
                    <p
                        class="text-xl font-extrabold text-slate-800 dark:text-white"
                    >
                        {{ formatCurrency(totalPrice) }}
                    </p>
                </div>
                <div class="text-right">
                    <div
                        class="inline-flex items-center gap-1.5 bg-white dark:bg-slate-700 px-2 py-1 rounded-lg border border-slate-100 dark:border-slate-600 shadow-sm"
                    >
                        <Clock :size="12" class="text-rose-500" />
                        <span
                            class="text-xs font-bold text-slate-600 dark:text-slate-200"
                            >{{ estimatedDays }} Hari</span
                        >
                    </div>
                </div>
            </div>

            <button
                @click="handleAddToCart"
                class="w-full py-3 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 text-white text-xs font-bold shadow-lg shadow-rose-200 dark:shadow-none hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 group"
            >
                <Heart
                    :size="16"
                    class="fill-white/20 group-hover:fill-white/40 transition-colors"
                />
                Masukkan Keranjang
            </button>
        </div>
    </div>
</template>

<style scoped>
/* Transisi untuk badge bonus */
.scale-enter-active,
.scale-leave-active {
    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.scale-enter-from,
.scale-leave-to {
    opacity: 0;
    transform: scale(0.8);
}
</style>
