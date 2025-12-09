<script setup>
import { computed, ref, watch } from "vue";
import {
    Heart,
    Minus,
    Plus,
    Users,
    Clock,
    Zap,
    Gift,
    CheckCircle2,
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

const pricePerHeart = computed(() => config.value.pricePerHeart ?? 100);

const formatCurrency = (value) =>
    new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
    }).format(value || 0);

// BONUS LOGIC (Hanya Daily)
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
// UPDATE: Step kini 1, bukan 10
const decreaseHearts = () => {
    if (heartCount.value > minHearts.value) heartCount.value--;
    if (heartCount.value < minHearts.value) heartCount.value = minHearts.value;
};
const increaseHearts = () => {
    if (heartCount.value < maxHearts.value) heartCount.value++;
    if (heartCount.value > maxHearts.value) heartCount.value = maxHearts.value;
};

// Handle manual input typing
const handleInput = (e) => {
    let val = parseInt(e.target.value);
    if (isNaN(val)) return; // Allow typing
    // Jangan langsung clamp saat mengetik agar user bisa hapus angka,
    // validasi akhir bisa saat blur atau submit
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
    // Final Validation before add
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
    <div class="flex flex-col h-full gap-6 pb-1">
        <div class="space-y-4">
            <div class="flex justify-between items-end">
                <label
                    class="text-sm font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wide"
                >
                    Mau beli berapa?
                </label>
                <transition name="scale">
                    <span
                        v-if="bonusHearts > 0"
                        class="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100 dark:bg-emerald-500/20 dark:text-emerald-300 px-2.5 py-1 rounded-full animate-pulse border border-emerald-200 dark:border-emerald-800"
                    >
                        <Gift :size="12" /> +{{ bonusHearts }} Bonus
                    </span>
                </transition>
            </div>

            <div class="flex items-center gap-3">
                <button
                    @click="decreaseHearts"
                    class="w-14 h-14 flex items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-rose-400 hover:text-rose-500 dark:hover:border-rose-500 transition active:scale-95 shadow-sm"
                >
                    <Minus :size="24" />
                </button>

                <div class="flex-1 relative group">
                    <input
                        type="number"
                        :value="heartCount"
                        @input="handleInput"
                        @blur="handleBlur"
                        class="w-full h-14 text-center font-black text-3xl text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-600 rounded-2xl focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition"
                    />
                    <div
                        class="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-50 group-focus-within:opacity-100 transition-opacity"
                    >
                        <Heart
                            :size="20"
                            class="text-indigo-500 fill-indigo-500/20"
                        />
                    </div>
                </div>

                <button
                    @click="increaseHearts"
                    class="w-14 h-14 flex items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-emerald-400 hover:text-emerald-500 dark:hover:border-emerald-500 transition active:scale-95 shadow-sm"
                >
                    <Plus :size="24" />
                </button>
            </div>

            <p
                class="text-xs text-center font-medium text-slate-500 dark:text-slate-400"
            >
                Minimal Order:
                <span class="text-slate-800 dark:text-slate-200 font-bold">{{
                    minHearts
                }}</span>
                • Max: {{ maxHearts }}
            </p>
        </div>

        <div
            v-if="!isInstant"
            class="space-y-4 pt-4 border-t border-dashed border-slate-200 dark:border-slate-700"
        >
            <div class="flex justify-between items-center">
                <label
                    class="text-sm font-bold text-slate-700 dark:text-slate-200 tracking-wide flex items-center gap-2"
                >
                    <Users :size="16" class="text-indigo-500" /> Mau add berapa
                    bot?
                </label>
                <span
                    class="text-sm font-bold text-white bg-indigo-500 px-3 py-1 rounded-lg shadow-sm"
                >
                    {{ slots }} Akun
                </span>
            </div>

            <input
                type="range"
                v-model.number="slots"
                :min="minSlots"
                :max="maxSlots"
                class="w-full h-3 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500 hover:accent-indigo-400 transition-all"
            />

            <div
                class="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-xl border border-blue-100 dark:border-blue-800 flex gap-3 items-start"
            >
                <Info
                    :size="18"
                    class="text-blue-600 dark:text-blue-400 mt-0.5 shrink-0"
                />
                <p
                    class="text-xs text-blue-800 dark:text-blue-200 leading-relaxed font-medium"
                >
                    1 Akun Bot = 1 Heart/Hari (Limit Game).<br />
                    Dengan add <b>{{ slots }} bot</b>, pesanan kamu selesai
                    dalam estimasi <b>{{ estimatedDays }} hari</b>.
                </p>
            </div>
        </div>

        <div
            v-else
            class="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-xl border border-amber-200 dark:border-amber-800 flex items-start gap-3"
        >
            <Zap
                :size="24"
                class="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5"
            />
            <div>
                <p class="text-sm font-bold text-amber-800 dark:text-amber-300">
                    Mode Kilat Aktif ⚡
                </p>
                <p
                    class="text-xs text-amber-700 dark:text-amber-400 leading-relaxed mt-1 font-medium"
                >
                    Heart dikirim manual hari ini juga via Trade. Tidak perlu
                    add bot. Pastikan kamu online ya!
                </p>
            </div>
        </div>

        <div
            class="mt-auto bg-slate-50 dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700"
        >
            <div class="flex justify-between items-end mb-4">
                <div>
                    <p
                        class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1"
                    >
                        Total Bayar
                    </p>
                    <p
                        class="text-3xl font-black text-slate-800 dark:text-white tracking-tight"
                    >
                        {{ formatCurrency(totalPrice) }}
                    </p>
                </div>
                <div class="text-right">
                    <div
                        class="inline-flex items-center gap-2 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-600 shadow-sm"
                    >
                        <Clock :size="14" class="text-rose-500" />
                        <span
                            v-if="!isInstant"
                            class="text-sm font-bold text-slate-700 dark:text-slate-200"
                            >{{ estimatedDays }} Hari</span
                        >
                        <span
                            v-else
                            class="text-sm font-bold text-slate-700 dark:text-slate-200"
                            >Hari Ini</span
                        >
                    </div>
                </div>
            </div>

            <button
                @click="handleAddToCart"
                class="w-full py-4 rounded-xl bg-indigo-600 text-white text-sm font-bold shadow-lg shadow-indigo-200 dark:shadow-none hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
                <CheckCircle2 :size="18" class="text-white/80" />
                Konfirmasi Pesanan
            </button>
        </div>
    </div>
</template>

<style scoped>
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
