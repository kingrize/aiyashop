<!-- LOKASI FILE: src/components/HeartCalculator.vue -->
<script setup>
import { ref, computed } from 'vue';
import { 
  Heart, 
  Sparkles, 
  Zap, 
  Coffee, 
  Activity, 
  MessageCircle, 
  Frown, 
  Info, 
  CheckCircle2,
  AlertCircle
} from 'lucide-vue-next';

// --- BUSINESS LOGIC CONSTANTS ---
const PRICE_PER_50_HEART = 5000;
const PRICE_PER_HEART = PRICE_PER_50_HEART / 50; // Rp 100 per heart
const MIN_ORDER = 10;
const BONUS_THRESHOLD = 50;
const BONUS_AMOUNT = 5;

// State reactive
const order = ref({
  desiredHearts: null,
  maxDummies: 5 // Default santai
});

// 1. Logika Bonus (Buy 50 Get 5)
const calculatedBonus = computed(() => {
  const hearts = order.value.desiredHearts;
  if (!hearts || hearts < BONUS_THRESHOLD) return 0;
  
  // Hitung kelipatan 50
  const multiplier = Math.floor(hearts / BONUS_THRESHOLD);
  return multiplier * BONUS_AMOUNT;
});

// Total Heart yang didapat (Beli + Bonus)
const totalHeartsReceived = computed(() => {
  return (order.value.desiredHearts || 0) + calculatedBonus.value;
});

// 2. Logika Harga (Hanya hitung yang dibeli)
const totalPrice = computed(() => {
  const hearts = order.value.desiredHearts || 0;
  return hearts * PRICE_PER_HEART;
});

// 3. Logika Bot & Durasi
// Bot aktif = Min(Total Heart, Limit User)
const activeDummiesUsed = computed(() => {
  const total = totalHeartsReceived.value;
  if (!total) return 0;
  return Math.min(total, order.value.maxDummies);
});

// Estimasi Hari = Total Heart / Bot Aktif (Dibulatkan ke atas)
const daysNeeded = computed(() => {
  const total = totalHeartsReceived.value;
  const bandwidth = activeDummiesUsed.value;
  if (!total || bandwidth === 0) return 0;
  return Math.ceil(total / bandwidth);
});

// --- UI HELPERS ---
const speedInfo = computed(() => {
  const limit = order.value.maxDummies;
  if (limit >= 15) return { 
    msg: "Ngebut Banget! ⚡", 
    color: "bg-sky-400 text-white", 
    icon: Zap,
    desc: "Siapin slot friendlist yang banyak ya!" 
  };
  if (limit >= 8) return { 
    msg: "Kecepatan Standar 👍", 
    color: "bg-amber-400 text-white", 
    icon: Activity,
    desc: "Paling pas buat daily." 
  };
  return { 
    msg: "Santai Aja ☕", 
    color: "bg-emerald-400 text-white", 
    icon: Coffee,
    desc: "Cocok buat yang mager add akun." 
  };
});

const isValidOrder = computed(() => {
  return (order.value.desiredHearts >= MIN_ORDER);
});

const formatCurrency = (val) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
};

const generateWhatsappLink = () => {
  if (!isValidOrder.value) return;
  
  const text = `Halo Aiya! ✨%0A%0AAku mau jajan Heart dong (via Kalkulator):%0A` +
               `💖 Order Beli: ${order.value.desiredHearts} Heart%0A` +
               `🎁 Bonus: ${calculatedBonus.value} Heart%0A` +
               `📦 Total Terima: ${totalHeartsReceived.value} Heart%0A` +
               `🤖 Limit Bot Aku: ${order.value.maxDummies} Akun%0A` +
               `⏳ Estimasi: ${daysNeeded.value} Hari%0A` +
               `💰 Total Bayar: ${formatCurrency(totalPrice.value)}%0A%0A` +
               `Ditunggu prosesnya ya kak!`;
  
  window.open(`https://wa.me/6281234567890?text=${text}`, '_blank');
};
</script>

<template>
  <div class="grid md:grid-cols-12 gap-8 items-start relative z-10">
    
    <!-- LEFT COLUMN: INPUTS -->
    <div class="md:col-span-7 space-y-6">
      
      <!-- Input Card -->
      <div class="card-soft p-6 md:p-8 relative overflow-hidden bg-white/60">
        <label class="block text-lg font-bold text-slate-700 mb-4">
          Mau jajan berapa heart? 💖
        </label>

        <div class="relative group">
          <input 
            type="number" 
            v-model.number="order.desiredHearts" 
            class="w-full bg-white border-2 border-sky-100 rounded-2xl px-6 py-4 text-3xl font-bold text-slate-600 focus:outline-none focus:border-sky-300 focus:ring-4 focus:ring-sky-100 transition placeholder-slate-200"
            placeholder="0"
          >
          <Heart :size="32" class="absolute right-6 top-1/2 -translate-y-1/2 text-rose-300 animate-pulse" />
        </div>
        
        <!-- Alerts Validation -->
        <transition name="fade">
          <div v-if="order.desiredHearts > 0 && order.desiredHearts < 10" class="mt-3 flex items-start gap-3 text-sm font-bold text-amber-500 bg-amber-50 p-4 rounded-2xl border border-amber-100 animate-pulse">
            <Frown :size="20" class="shrink-0 mt-0.5" />
            <span>Yah.. minimal order 10 heart ya bestie, biar nanggung kirimnya~</span>
          </div>
        </transition>

        <transition name="fade">
          <div v-if="calculatedBonus > 0" class="mt-3 flex items-start gap-3 text-sm font-bold text-emerald-600 bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
            <Sparkles :size="20" class="shrink-0 mt-0.5 text-emerald-500" />
            <div class="flex flex-col">
              <span>Yeay! Kamu dapet Bonus {{ calculatedBonus }} Heart! 🎉</span>
              <span class="text-xs font-normal text-emerald-500">Setiap kelipatan 50 heart dapet bonus 5 heart.</span>
            </div>
          </div>
        </transition>
      </div>

      <!-- Slider Card -->
      <div class="card-soft p-6 md:p-8 relative bg-white/60">
        <div class="flex justify-between items-start mb-6">
          <div>
            <label class="block text-lg font-bold text-slate-700 flex items-center gap-2">
              Slot Friendlist Kamu
              <div class="group relative cursor-help">
                <Info :size="16" class="text-slate-400" />
                <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-slate-800 text-white text-[10px] p-2 rounded-lg opacity-0 group-hover:opacity-100 transition pointer-events-none">
                  Semakin banyak slot bot yang kamu add, semakin cepat heart terkumpul!
                </div>
              </div>
            </label>
            <p class="text-xs text-slate-400 mt-1 max-w-xs">Geser buat tentuin berapa akun bot yang sanggup kamu add.</p>
          </div>
          <div class="bg-sky-100 text-sky-600 px-4 py-1.5 rounded-xl font-bold text-lg shadow-sm">
            {{ order.maxDummies }} <span class="text-xs font-normal">Akun</span>
          </div>
        </div>

        <div class="px-2 mb-8 relative">
          <!-- Custom Range Style handle di CSS global -->
          <input 
            type="range" 
            v-model.number="order.maxDummies" 
            min="1" 
            max="20" 
            step="1"
            class="w-full h-3 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-sky-400"
          >
          <div class="flex justify-between mt-3 text-[10px] font-bold text-slate-300 uppercase tracking-widest">
            <span>🐢 Santai (1)</span>
            <span>🚀 Ngebut (20)</span>
          </div>
        </div>

        <!-- Speed Indicator -->
        <div class="bg-white rounded-2xl p-4 flex items-center gap-4 border border-slate-100 shadow-sm transition-all duration-300">
          <div 
            class="w-12 h-12 rounded-2xl flex items-center justify-center shadow-md transition-colors duration-300"
            :class="speedInfo.color"
          >
            <component :is="speedInfo.icon" :size="24" />
          </div>
          <div>
            <p class="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Mode Kirim</p>
            <p class="text-slate-700 font-bold text-lg leading-tight">{{ speedInfo.msg }}</p>
            <p class="text-xs text-slate-400">{{ speedInfo.desc }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- RIGHT COLUMN: RECEIPT -->
    <div class="md:col-span-5 sticky top-24">
      <div class="bg-white rounded-3xl p-6 shadow-xl border-4 border-sky-100 relative transform rotate-1 hover:rotate-0 transition duration-500">
        
        <!-- Hiasan Selotip -->
        <div class="absolute -top-3 left-1/2 -translate-x-1/2 w-24 h-8 bg-sky-200/50 -rotate-1 backdrop-blur-sm shadow-sm"></div>

        <!-- Header Struk -->
        <div class="text-center border-b-2 border-dashed border-slate-100 pb-6 mb-6 pt-2">
          <div class="inline-flex items-center justify-center w-12 h-12 bg-sky-50 rounded-full mb-3 text-2xl">🧾</div>
          <h3 class="text-xl font-bold text-slate-700">Simulasi Jajan</h3>
          <p class="text-slate-400 text-xs font-medium">Aiya Shop • Sky CoTL Service</p>
        </div>

        <!-- Rincian -->
        <div class="space-y-4 text-sm font-medium text-slate-600">
          <div class="flex justify-between items-center">
            <span class="text-slate-400">Heart Dipesan</span>
            <span class="font-bold text-slate-700 text-base">{{ order.desiredHearts || 0 }} 💖</span>
          </div>
          
          <div class="flex justify-between items-center" :class="calculatedBonus > 0 ? 'text-emerald-500' : 'text-slate-300'">
            <span>Bonus Spesial</span>
            <span class="font-bold">+{{ calculatedBonus }} 🎁</span>
          </div>

          <!-- Info Teknis -->
          <div class="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3 mt-4">
            <div class="flex justify-between items-center text-xs">
              <span class="flex items-center gap-1.5 text-slate-500">
                <CheckCircle2 :size="14" /> Bot Bekerja
              </span>
              <span class="font-bold text-slate-700">{{ activeDummiesUsed }} / {{ order.maxDummies }} Akun</span>
            </div>
            <div class="h-[1px] bg-slate-200 w-full"></div>
            <div class="flex justify-between items-center">
              <span class="text-xs text-slate-500">Estimasi Selesai</span>
              <span class="font-bold text-sky-600 bg-sky-100 px-2 py-0.5 rounded text-xs">{{ daysNeeded }} Hari</span>
            </div>
          </div>

          <!-- Total Section -->
          <div class="border-t-2 border-dashed border-slate-200 pt-5 mt-4">
             <div class="flex justify-between items-center mb-2">
                <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Terima</span>
                <span class="text-lg font-bold text-rose-500">{{ totalHeartsReceived }} Heart</span>
             </div>

             <!-- Price Tag -->
             <div class="flex justify-between items-end bg-slate-800 text-white p-5 rounded-2xl shadow-lg shadow-slate-200 mt-2 relative overflow-hidden">
                <div class="absolute -right-6 -top-6 w-24 h-24 bg-slate-700 rounded-full opacity-50"></div>
                <div class="relative z-10">
                  <p class="text-[10px] text-slate-400 mb-1">Total yang harus dibayar</p>
                  <p class="text-xs text-slate-500">via Dana/Gopay/QRIS</p>
                </div>
                <div class="relative z-10 text-right">
                  <span class="text-2xl font-bold text-amber-400 tracking-tight">{{ formatCurrency(totalPrice) }}</span>
                </div>
             </div>
          </div>
        </div>

        <!-- Action Button -->
        <button 
          :disabled="!isValidOrder"
          @click="generateWhatsappLink"
          class="w-full mt-6 py-4 rounded-xl font-bold text-white transition-all duration-300 transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg group relative overflow-hidden"
          :class="isValidOrder ? 'bg-gradient-to-r from-emerald-500 to-teal-400 hover:brightness-105 shadow-emerald-200' : 'bg-slate-300 cursor-not-allowed'"
        >
           <MessageCircle :size="20" class="relative z-10 group-hover:-rotate-12 transition-transform" />
           <span class="relative z-10">Pesan via WhatsApp</span>
           
           <!-- Shine Effect -->
           <div v-if="isValidOrder" class="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 transform skew-x-12"></div>
        </button>
        
        <p class="text-center text-[10px] text-slate-400 mt-4 font-medium flex items-center justify-center gap-1">
          <AlertCircle :size="10" />
          Harga belum termasuk fee admin jika ada
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>