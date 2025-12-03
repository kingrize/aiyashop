<script setup>
import { computed, ref } from 'vue';
import { Heart, Minus, Plus, Users, Clock } from 'lucide-vue-next';

const props = defineProps({
  product: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['addToCart']);

/* CONFIG (boleh di-override lewat product) */
const minHearts = computed(() => props.product.minHearts ?? 10);
const maxHearts = computed(() => props.product.maxHearts ?? null); // null = no limit
const heartCount = ref(props.product.defaultHearts ?? 30);

const minSlots = computed(() => props.product.minSlots ?? 1);
const maxSlots = computed(() => props.product.maxSlots ?? 10);
const slots = ref(props.product.defaultSlots ?? 5);

const pricePerHeart = computed(() => props.product.pricePerHeart ?? 100);

const formatCurrency = (value) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(value || 0);

// BONUS: tiap 50 heart → +5 heart
const bonusHearts = computed(() => {
  if (heartCount.value <= 0) return 0;
  const paket50 = Math.floor(heartCount.value / 50);
  return paket50 * 5;
});

const totalHeartsWithBonus = computed(
  () => heartCount.value + bonusHearts.value
);

const totalPrice = computed(() => heartCount.value * pricePerHeart.value);

// estimasi hari (pakai total heart termasuk bonus)
const estimatedDays = computed(() => {
  if (!slots.value) return 0;
  return Math.ceil(totalHeartsWithBonus.value / slots.value);
});

const heartsPerDay = computed(() => slots.value);

/* HEART CONTROL */
const decreaseHearts = () => {
  let next = heartCount.value - 1;
  if (next < minHearts.value) next = minHearts.value;
  heartCount.value = next;
};

const increaseHearts = () => {
  let next = heartCount.value + 1;
  if (maxHearts.value != null && next > maxHearts.value) next = maxHearts.value;
  heartCount.value = next;
};

const handleHeartInput = (event) => {
  let value = Math.floor(Number(event.target.value || 0));
  if (Number.isNaN(value)) return;
  if (value < minHearts.value) value = minHearts.value;
  if (maxHearts.value != null && value > maxHearts.value) value = maxHearts.value;
  heartCount.value = value;
};

/* SLOTS CONTROL */
const decreaseSlots = () => {
  let next = slots.value - 1;
  if (next < minSlots.value) next = minSlots.value;
  slots.value = next;
};

const increaseSlots = () => {
  let next = slots.value + 1;
  if (next > maxSlots.value) next = maxSlots.value;
  slots.value = next;
};

const handleSlotInput = (event) => {
  let value = Math.floor(Number(event.target.value || 0));
  if (Number.isNaN(value)) return;
  if (value < minSlots.value) value = minSlots.value;
  if (value > maxSlots.value) value = maxSlots.value;
  slots.value = value;
};

/* PRESET */
const presets = computed(() => {
  const arr = [10, 20, 30, 50, 100, 150, 200];
  return arr.filter((v) =>
    maxHearts.value != null ? v >= minHearts.value && v <= maxHearts.value : v >= minHearts.value
  );
});

const handlePresetClick = (value) => {
  heartCount.value = value;
};

/* ADD TO CART */
const handleAddToCart = () => {
  const item = {
    ...props.product,
    id: `${props.product.id || props.product.slug || props.product.name}-heart-${heartCount.value}`,
    name:
      bonusHearts.value > 0
        ? `${props.product.name} (${heartCount.value} Heart + ${bonusHearts.value} Bonus)`
        : `${props.product.name} (${heartCount.value} Heart)`,
    price: totalPrice.value,
    heartCountPaid: heartCount.value,
    heartBonus: bonusHearts.value,
    heartTotal: totalHeartsWithBonus.value,
    slots: slots.value,
    estimatedDays: estimatedDays.value
  };

  emit('addToCart', item);
};
</script>

<template>
  <section
    class="flex flex-col rounded-2xl bg-white/85 px-4 py-4 backdrop-blur-sm shadow-inner shadow-rose-100/60
           dark:bg-rose-950/40 dark:shadow-none"
  >
    <!-- HEADER MINI -->
    <header class="flex items-start justify-between gap-3 mb-3">
      <div class="flex items-center gap-3">
        <div
          class="flex h-9 w-9 aspect-square items-center justify-center rounded-[16px]
                 bg-gradient-to-br from-rose-400 via-rose-500 to-rose-600 text-white shadow-md shadow-rose-400/60"
        >
          <Heart class="w-4 h-4" />
        </div>

        <div class="leading-tight">
          <p class="text-sm font-semibold text-rose-600 dark:text-rose-200">
            Custom Heart Calculator
          </p>
          <p class="text-[11px] text-slate-600 dark:text-slate-300">
            1 Heart = {{ formatCurrency(pricePerHeart) }} • Bonus tiap 50 ❤️
          </p>
        </div>
      </div>
    </header>

    <div class="space-y-3.5 text-[13px]">
      <!-- JUMLAH HEART -->
      <div
        class="rounded-xl border border-rose-100 bg-white/85 px-3.5 py-3
               dark:border-rose-500/40 dark:bg-rose-950/60"
      >
        <div class="flex items-center justify-between">
          <span class="text-[11px] font-semibold text-slate-600 dark:text-slate-200 tracking-[0.12em] uppercase">
            Jumlah Heart
          </span>
          <span class="text-[11px] text-rose-400 dark:text-rose-200">
            Min {{ minHearts }}
            <span v-if="maxHearts !== null"> • Max {{ maxHearts }}</span>
          </span>
        </div>

        <div class="mt-2.5 flex items-center gap-3">
          <button
            @click="decreaseHearts"
            class="flex h-9 w-9 aspect-square items-center justify-center rounded-full border border-rose-100 bg-white text-rose-400 hover:bg-rose-50 active:scale-95 transition dark:border-rose-500/40 dark:bg-rose-950 dark:hover:bg-rose-900"
          >
            <Minus class="w-4 h-4" />
          </button>

          <div
            class="flex-1 rounded-full border border-rose-100 bg-white/80 px-3 py-1.5 text-center text-sm font-semibold text-slate-700 dark:border-rose-500/40 dark:bg-rose-950/80 dark:text-rose-50"
          >
            <input
              type="number"
              :value="heartCount"
              @input="handleHeartInput"
              class="w-full bg-transparent text-center outline-none text-sm font-semibold"
            />
          </div>

          <button
            @click="increaseHearts"
            class="flex h-9 w-9 aspect-square items-center justify-center rounded-full border border-rose-100 bg-white text-rose-400 hover:bg-rose-50 active:scale-95 transition dark:border-rose-500/40 dark:bg-rose-950 dark:hover:bg-rose-900"
          >
            <Plus class="w-4 h-4" />
          </button>
        </div>

        <!-- BONUS INFO -->
        <p class="mt-1.5 text-[11px] text-rose-500 dark:text-rose-200">
          Bonus: setiap 50 heart → <strong>+5 heart</strong>
        </p>
        <p
          v-if="bonusHearts > 0"
          class="mt-0.5 text-[11px] text-slate-600 dark:text-slate-200"
        >
          Kamu bayar <strong>{{ heartCount }}</strong> → menerima
          <strong>{{ totalHeartsWithBonus }}</strong> (termasuk {{ bonusHearts }} bonus)
        </p>
      </div>

      <!-- SLOT BOT -->
      <div
        class="rounded-xl border border-rose-100 bg-white/85 px-3.5 py-3
               dark:border-rose-500/40 dark:bg-rose-950/60"
      >
        <div class="flex items-center justify-between">
          <span class="text-[11px] font-semibold text-slate-600 dark:text-slate-200 tracking-[0.12em] uppercase">
            Slot Bot (Akun Admin)
          </span>
          <span class="text-[11px] text-rose-400 dark:text-rose-200">
            {{ minSlots }}–{{ maxSlots }} akun
          </span>
        </div>

        <div class="mt-2.5 flex items-center gap-3">
          <button
            @click="decreaseSlots"
            class="flex h-9 w-9 aspect-square items-center justify-center rounded-full border border-rose-100 bg-white text-rose-400 hover:bg-rose-50 active:scale-95 transition dark:border-rose-500/40 dark:bg-rose-950 dark:hover:bg-rose-900"
          >
            <Minus class="w-4 h-4" />
          </button>

          <div
            class="flex-1 rounded-full border border-rose-100 bg-white/80 px-3 py-1.5 text-center text-sm font-semibold text-slate-700 dark:border-rose-500/40 dark:bg-rose-950/80 dark:text-rose-50"
          >
            <input
              type="number"
              :value="slots"
              @input="handleSlotInput"
              class="w-full bg-transparent text-center outline-none text-sm font-semibold"
            />
          </div>

          <button
            @click="increaseSlots"
            class="flex h-9 w-9 aspect-square items-center justify-center rounded-full border border-rose-100 bg-white text-rose-400 hover:bg-rose-50 active:scale-95 transition dark:border-rose-500/40 dark:bg-rose-950 dark:hover:bg-rose-900"
          >
            <Plus class="w-4 h-4" />
          </button>
        </div>

        <p class="mt-1.5 flex items-center gap-1.5 text-[11px] text-slate-600 dark:text-slate-300">
          <Users class="w-3.5 h-3.5" />
          <span>
            Perkiraan kirim ±<strong>{{ heartsPerDay }}</strong> heart/hari
            ({{ slots }} akun × 1 heart)
          </span>
        </p>
      </div>

      <!-- QUICK SELECT -->
      <div v-if="presets.length" class="space-y-1">
        <p class="text-[11px] text-slate-500 dark:text-slate-300">Quick select:</p>
        <div class="flex flex-wrap gap-1.5">
          <button
            v-for="preset in presets"
            :key="preset"
            @click="handlePresetClick(preset)"
            class="inline-flex items-center justify-center rounded-full border px-2.5 py-1.5 text-[11px] font-medium border-rose-100 bg-white/80 text-slate-500 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-500 transition dark:border-rose-500/40 dark:bg-rose-950/70 dark:text-rose-100 dark:hover:border-rose-400 dark:hover:bg-rose-900/80"
            :class="preset === heartCount
              ? 'border-rose-400 bg-rose-50 text-rose-600 dark:bg-rose-900/80 dark:text-rose-100'
              : ''"
          >
            {{ preset }} Heart
          </button>
        </div>
      </div>

      <!-- ESTIMASI -->
      <div
        class="rounded-xl border border-rose-100 bg-white/90 px-3.5 py-3 text-[13px]
               dark:border-rose-500/40 dark:bg-rose-950/70"
      >
        <div class="flex items-center justify-between">
          <span class="text-[11px] font-semibold text-slate-600 dark:text-slate-200 tracking-[0.12em] uppercase">
            Estimasi Biaya
          </span>
          <span class="text-[11px] text-slate-400 dark:text-slate-300">
            {{ heartCount }} × {{ formatCurrency(pricePerHeart) }}
          </span>
        </div>

        <p class="mt-1.5 text-sm font-semibold text-slate-900 dark:text-rose-50">
          {{ formatCurrency(totalPrice) }}
        </p>

        <p class="mt-2 flex items-center gap-1.5 text-[11px] text-slate-600 dark:text-slate-300">
          <Clock class="w-3.5 h-3.5" />
          <span>
            Estimasi selesai ± <strong>{{ estimatedDays }}</strong> hari
            (total kirim <strong>{{ totalHeartsWithBonus }}</strong> heart)
          </span>
        </p>
      </div>
    </div>

    <!-- TOMBOL -->
    <div class="mt-4 flex justify-end">
      <button
        @click="handleAddToCart"
        class="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-rose-400 via-rose-500 to-rose-500 px-6 py-2.5 text-xs font-semibold text-white shadow-md shadow-rose-300/70 hover:brightness-110 active:scale-95 transition"
      >
        <Heart class="w-3.5 h-3.5" />
        Tambah ke Keranjang
      </button>
    </div>
  </section>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #fecaca;
  border-radius: 9999px;
}
</style>
