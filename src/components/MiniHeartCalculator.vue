<!-- LOKASI FILE: src/components/MiniHeartCalculator.vue -->
<script setup>
import { ref, computed } from 'vue';
import { Heart, Plus } from 'lucide-vue-next';

const props = defineProps({ product: Object });
const emit = defineEmits(['addToCart']);

const PRICE_PER_50_HEART = 5000;
const PRICE_PER_HEART = PRICE_PER_50_HEART / 50; 
const BONUS_THRESHOLD = 50;
const BONUS_AMOUNT = 5;

const hearts = ref(null);
const dummies = ref(5);

const bonus = computed(() => (!hearts.value || hearts.value < BONUS_THRESHOLD) ? 0 : Math.floor(hearts.value / BONUS_THRESHOLD) * BONUS_AMOUNT);
const totalReceive = computed(() => (hearts.value || 0) + bonus.value);
const price = computed(() => (hearts.value || 0) * PRICE_PER_HEART);
const activeDummies = computed(() => !totalReceive.value ? 0 : Math.min(totalReceive.value, dummies.value));
const days = computed(() => (!totalReceive.value || activeDummies.value === 0) ? 0 : Math.ceil(totalReceive.value / activeDummies.value));
const formatCurrency = (val) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);

const handleAdd = () => {
  if (!hearts.value || hearts.value < 10) return;
  const customItem = { ...props.product, id: `heart-${Date.now()}`, name: `Custom Heart (${hearts.value})`, desc: `${hearts.value} Heart + ${bonus.value} Bonus. Est: ${days.value} Hari via ${dummies.value} Akun.`, price: price.value };
  emit('addToCart', customItem);
};
</script>

<template>
  <div class="flex flex-col h-full space-y-3">
    <div class="relative group">
      <input type="number" v-model="hearts" placeholder="Mau brp heart?" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-lg font-bold text-slate-700 focus:outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100 transition text-center" />
      <div class="absolute right-3 top-1/2 -translate-y-1/2 text-rose-300 pointer-events-none"><Heart :size="16" class="fill-rose-300" /></div>
    </div>
    <div v-if="bonus > 0" class="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg text-center font-medium border border-emerald-100 animate-pulse">+{{ bonus }} Bonus! Total terima: {{ totalReceive }} ❤️</div>
    <div class="bg-white border border-slate-100 p-2.5 rounded-xl space-y-2">
      <div class="flex justify-between text-[10px] text-slate-400 font-medium"><span>Speed ({{ dummies }} Akun)</span><span class="text-sky-500 font-bold">{{ days }} Hari</span></div>
      <input type="range" v-model.number="dummies" min="1" max="20" class="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-sky-400">
    </div>
    <div class="mt-auto pt-2 border-t border-dashed border-rose-100">
      <div class="flex justify-between items-end mb-2"><span class="text-[10px] text-slate-400 font-bold uppercase">Total</span><span class="text-base font-extrabold text-rose-500">{{ formatCurrency(price) }}</span></div>
      <button @click="handleAdd" :disabled="!hearts || hearts < 10" class="w-full btn-bouncy bg-slate-800 text-white rounded-xl py-2 text-xs font-bold shadow-lg hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1"><Plus :size="14" class="text-amber-300" /> Masukin Keranjang</button>
    </div>
  </div>
</template>