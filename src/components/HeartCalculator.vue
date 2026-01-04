<!-- LOKASI FILE: src/components/HeartCalculator.vue -->
<script setup>
import { ref, computed } from 'vue';
import { Heart, Sparkles, Zap, Coffee, Activity, Frown } from 'lucide-vue-next';
import { formatRupiah } from "../utils/format";

const PRICE_PER_50_HEART = 5000;
const PRICE_PER_HEART = PRICE_PER_50_HEART / 50; 
const MIN_ORDER = 10;
const BONUS_THRESHOLD = 50;
const BONUS_AMOUNT = 5;

const order = ref({ desiredHearts: null, maxDummies: 5 });

const calculatedBonus = computed(() => (!order.value.desiredHearts || order.value.desiredHearts < BONUS_THRESHOLD) ? 0 : Math.floor(order.value.desiredHearts / BONUS_THRESHOLD) * BONUS_AMOUNT);
const totalHeartsReceived = computed(() => (order.value.desiredHearts || 0) + calculatedBonus.value);
const totalPrice = computed(() => (order.value.desiredHearts || 0) * PRICE_PER_HEART);
const activeDummiesUsed = computed(() => !totalHeartsReceived.value ? 0 : Math.min(totalHeartsReceived.value, order.value.maxDummies));
const daysNeeded = computed(() => (!totalHeartsReceived.value || activeDummiesUsed.value === 0) ? 0 : Math.ceil(totalHeartsReceived.value / activeDummiesUsed.value));

const speedInfo = computed(() => {
  const limit = order.value.maxDummies;
  if (limit >= 15) return { msg: "Ngebut Banget! ⚡", color: "bg-sky-400 text-white", icon: Zap, desc: "Siapin slot friendlist yang banyak ya!" };
  if (limit >= 8) return { msg: "Kecepatan Standar 👍", color: "bg-amber-400 text-white", icon: Activity, desc: "Paling pas buat daily." };
  return { msg: "Santai Aja ☕", color: "bg-emerald-400 text-white", icon: Coffee, desc: "Cocok buat yang mager add akun." };
});

const isValidOrder = computed(() => order.value.desiredHearts >= MIN_ORDER);
const formatCurrency = formatRupiah;
const generateWhatsappLink = () => {
  if (!isValidOrder.value) return;
  const text = `Halo Admin Aiya! ✨%0A%0AAku mau jajan Heart dong (via Kalkulator):%0A` +
               `💖 Order Beli: ${order.value.desiredHearts} Heart%0A` +
               `🎁 Bonus: ${calculatedBonus.value} Heart%0A` +
               `📦 Total Terima: ${totalHeartsReceived.value} Heart%0A` +
               `🤖 Limit Bot Aku: ${order.value.maxDummies} Akun%0A` +
               `⏳ Estimasi: ${daysNeeded.value} Hari%0A` +
               `💰 Total Bayar: ${formatCurrency(totalPrice.value)}%0A%0A` +
               `Ditunggu prosesnya ya kak!`;
               
  // UPDATE LINK WA
  window.open(`https://wa.me/6285942963323?text=${text}`, '_blank');
};
</script>

<template>
  <!-- Template sama -->
  <div class="grid md:grid-cols-12 gap-8 items-start relative z-10">
    <div class="md:col-span-7 space-y-6">
      <div class="card-soft p-6 md:p-8 relative overflow-hidden bg-white/60">
        <label class="block text-lg font-bold text-slate-700 mb-4">Mau jajan berapa heart? 💖</label>
        <div class="relative group">
          <input type="number" v-model.number="order.desiredHearts" class="w-full bg-white border-2 border-sky-100 rounded-2xl px-6 py-4 text-3xl font-bold text-slate-600 focus:outline-none focus:border-sky-300 focus:ring-4 focus:ring-sky-100 transition placeholder-slate-200" placeholder="0">
          <Heart :size="32" class="absolute right-6 top-1/2 -translate-y-1/2 text-rose-300 animate-pulse" />
        </div>
        <div v-if="order.desiredHearts > 0 && order.desiredHearts < 10" class="mt-3 flex items-start gap-3 text-sm font-bold text-amber-500 bg-amber-50 p-4 rounded-2xl border border-amber-100 animate-pulse"><Frown :size="20" class="shrink-0 mt-0.5" /><span>Yah.. minimal order 10 heart ya bestie~</span></div>
        <div v-if="calculatedBonus > 0" class="mt-3 flex items-start gap-3 text-sm font-bold text-emerald-600 bg-emerald-50 p-4 rounded-2xl border border-emerald-100"><Sparkles :size="20" class="shrink-0 mt-0.5 text-emerald-500" /><div class="flex flex-col"><span>Yeay! Kamu dapet Bonus {{ calculatedBonus }} Heart! 🎉</span><span class="text-xs font-normal text-emerald-500">Setiap kelipatan 50 heart dapet bonus 5 heart.</span></div></div>
      </div>
      <div class="card-soft p-6 md:p-8 relative bg-white/60">
        <div class="flex justify-between items-start mb-6"><div><label class="block text-lg font-bold text-slate-700 flex items-center gap-2">Slot Friendlist Kamu</label><p class="text-xs text-slate-400 mt-1 max-w-xs">Geser buat tentuin berapa akun bot yang sanggup kamu add.</p></div><div class="bg-sky-100 text-sky-600 px-4 py-1.5 rounded-xl font-bold text-lg shadow-sm">{{ order.maxDummies }} <span class="text-xs font-normal">Akun</span></div></div>
        <div class="px-2 mb-8 relative"><input type="range" v-model.number="order.maxDummies" min="1" max="20" step="1" class="w-full h-3 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-sky-400"><div class="flex justify-between mt-3 text-[10px] font-bold text-slate-300 uppercase tracking-widest"><span>🐢 Santai (1)</span><span>🚀 Ngebut (20)</span></div></div>
        <div class="bg-white rounded-2xl p-4 flex items-center gap-4 border border-slate-100 shadow-sm transition-all duration-300"><div class="w-12 h-12 rounded-2xl flex items-center justify-center shadow-md transition-colors duration-300" :class="speedInfo.color"><component :is="speedInfo.icon" :size="24" /></div><div><p class="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Mode Kirim</p><p class="text-slate-700 font-bold text-lg leading-tight">{{ speedInfo.msg }}</p><p class="text-xs text-slate-400">{{ speedInfo.desc }}</p></div></div>
      </div>
    </div>
    <div class="md:col-span-5 sticky top-24">
      <div class="bg-white rounded-3xl p-6 shadow-xl border-4 border-sky-100 relative transform rotate-1 hover:rotate-0 transition duration-500">
        <div class="absolute -top-3 left-1/2 -translate-x-1/2 w-24 h-8 bg-sky-200/50 -rotate-1 backdrop-blur-sm shadow-sm"></div>
        <div class="text-center border-b-2 border-dashed border-slate-100 pb-6 mb-6 pt-2"><div class="inline-flex items-center justify-center w-12 h-12 bg-sky-50 rounded-full mb-3 text-2xl">🧾</div><h3 class="text-xl font-bold text-slate-700">Simulasi Jajan</h3><p class="text-slate-400 text-xs font-medium">Aiya Shop • Sky CoTL Service</p></div>
        <div class="space-y-4 text-sm font-medium text-slate-600">
          <div class="flex justify-between items-center"><span class="text-slate-400">Heart Dipesan</span><span class="font-bold text-slate-700 text-base">{{ order.desiredHearts || 0 }} 💖</span></div>
          <div class="flex justify-between items-center" :class="calculatedBonus > 0 ? 'text-emerald-500' : 'text-slate-300'"><span>Bonus Spesial</span><span class="font-bold">+{{ calculatedBonus }} 🎁</span></div>
          <div class="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3 mt-4"><div class="flex justify-between items-center text-xs"><span class="flex items-center gap-1.5 text-slate-500">Bot Bekerja</span><span class="font-bold text-slate-700">{{ activeDummiesUsed }} / {{ order.maxDummies }} Akun</span></div><div class="h-[1px] bg-slate-200 w-full"></div><div class="flex justify-between items-center"><span class="text-xs text-slate-500">Estimasi Selesai</span><span class="font-bold text-sky-600 bg-sky-100 px-2 py-0.5 rounded text-xs">{{ daysNeeded }} Hari</span></div></div>
          <div class="border-t-2 border-dashed border-slate-200 pt-5 mt-4"><div class="flex justify-between items-center mb-2"><span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Terima</span><span class="text-lg font-bold text-rose-500">{{ totalHeartsReceived }} Heart</span></div><div class="flex justify-between items-end bg-slate-800 text-white p-5 rounded-2xl shadow-lg shadow-slate-200 mt-2 relative overflow-hidden"><div class="absolute -right-6 -top-6 w-24 h-24 bg-slate-700 rounded-full opacity-50"></div><div class="relative z-10"><p class="text-[10px] text-slate-400 mb-1">Total yang harus dibayar</p><p class="text-xs text-slate-500">via Dana/Gopay/QRIS</p></div><div class="relative z-10 text-right"><span class="text-2xl font-bold text-amber-400 tracking-tight">{{ formatCurrency(totalPrice) }}</span></div></div></div>
        </div>
        <button :disabled="!isValidOrder" @click="generateWhatsappLink" class="w-full mt-6 py-4 rounded-xl font-bold text-white transition-all duration-300 transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg group relative overflow-hidden" :class="isValidOrder ? 'bg-gradient-to-r from-emerald-500 to-teal-400 hover:brightness-105 shadow-emerald-200' : 'bg-slate-300 cursor-not-allowed'">
           <MessageCircle :size="20" class="relative z-10 group-hover:-rotate-12 transition-transform" /><span class="relative z-10">Pesan via WhatsApp</span><div v-if="isValidOrder" class="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 transform skew-x-12"></div>
        </button>
      </div>
    </div>
  </div>
</template>