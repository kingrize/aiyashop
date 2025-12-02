<!-- LOKASI FILE: src/components/ProductCard.vue -->
<script setup>
// ... (Script sama) ...
import { computed, ref } from 'vue';
import { useCartStore } from '../stores/cart';
import { Plus, Sparkles, Moon, Heart, Star, Wind, Cloud, Flame, Clock, Check, ChevronLeft, ChevronRight, Calculator, Info } from 'lucide-vue-next';
import MiniHeartCalculator from './MiniHeartCalculator.vue';

const props = defineProps({ product: { type: Object, required: true } });
const emit = defineEmits(['open-calculator']);
const cart = useCartStore();
const showOptions = ref(false); 
const selectedVariants = ref([]);
const showInfoModal = ref(false); 

const hasVariants = computed(() => props.product.variants && props.product.variants.length > 0);
const isCalculator = computed(() => props.product.isCalculator === true);

const toggleVariant = (variant) => {
  const index = selectedVariants.value.findIndex(v => v.id === variant.id);
  if (index === -1) selectedVariants.value.push(variant);
  else selectedVariants.value.splice(index, 1);
};

const isSelected = (variantId) => selectedVariants.value.some(v => v.id === variantId);

const currentPrice = computed(() => {
  if (hasVariants.value && selectedVariants.value.length > 0) {
    return selectedVariants.value.reduce((total, v) => total + v.price, 0);
  }
  return props.product.price;
});

const formatCurrency = (value) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value || 0);

const iconComponent = computed(() => {
  const icons = { Wind, Star, Heart, Flame, Cloud, Sparkles, Moon };
  return icons[props.product.iconType] || Sparkles;
});

const iconBoxClass = computed(() => props.product.color || 'bg-slate-400 text-white');

const tagColorClass = computed(() => {
  if (props.product.tag === 'Best Seller') return 'text-amber-600 bg-amber-50 ring-amber-100 dark:bg-metal/50 dark:text-amber-400 dark:ring-metal';
  if (props.product.tag === 'Custom Trial') return 'text-cyan-600 bg-cyan-50 ring-cyan-100 dark:bg-metal/50 dark:text-cyan-400 dark:ring-metal';
  if (props.product.tag === 'Calculator') return 'text-rose-600 bg-rose-50 ring-rose-100 dark:bg-metal/50 dark:text-rose-400 dark:ring-metal';
  switch (props.product.category) {
    case 'candlerun': return 'text-sky-500 bg-sky-50 ring-sky-100 dark:bg-metal/50 dark:text-sky-400 dark:ring-metal';
    case 'heart': return 'text-rose-500 bg-rose-50 ring-rose-100 dark:bg-metal/50 dark:text-rose-400 dark:ring-metal';
    default: return 'text-slate-500 bg-slate-50 ring-slate-100 dark:bg-metal/50 dark:text-slate-400 dark:ring-metal';
  }
});

const handleAction = () => {
  if ((isCalculator.value || hasVariants.value) && !showOptions.value) { showOptions.value = true; return; }
  if (hasVariants.value) {
    if (selectedVariants.value.length === 0) { alert("Pilih minimal satu opsi ya kak! ✨"); return; }
    const customProduct = { ...props.product, id: `${props.product.id}-${Date.now()}`, name: `${props.product.name} (${selectedVariants.value.length} Item)`, desc: selectedVariants.value.map(v => v.name).join(', '), price: currentPrice.value };
    cart.addToCart(customProduct);
    showOptions.value = false; selectedVariants.value = [];
  } else if (!isCalculator.value) {
    cart.addToCart(props.product);
  }
};

const onCalculatorAdd = (item) => { cart.addToCart(item); showOptions.value = false; };
</script>

<template>
  <article class="card-soft group relative flex h-full flex-col overflow-hidden transition-all duration-300 bg-white dark:bg-graphite hover:shadow-xl hover:shadow-sky-100 dark:hover:shadow-none hover:-translate-y-1">
    <div v-if="!showOptions" :class="`absolute -top-10 -right-10 w-32 h-32 rounded-full ${product.blobColor || 'bg-slate-100 dark:bg-metal'} opacity-40 blur-2xl transition-transform duration-500 group-hover:scale-150`"></div>
    <div class="relative z-10 flex items-center justify-between gap-3 border-b border-sky-50/50 dark:border-metal bg-white/40 dark:bg-graphite/40 px-5 py-4 backdrop-blur-sm">
      <div class="flex items-center gap-3">
        <button v-if="showOptions" @click.stop="showOptions = false" class="flex h-8 w-8 items-center justify-center rounded-xl bg-white dark:bg-metal border border-slate-100 dark:border-metal text-slate-400 hover:text-sky-500 transition"><ChevronLeft :size="18" /></button>
        <div v-else class="flex h-10 w-10 items-center justify-center rounded-2xl shadow-sm transition-transform duration-300 group-hover:rotate-6 shrink-0" :class="iconBoxClass"><component :is="iconComponent" :size="20" class="drop-shadow-sm" /></div>
        <div class="leading-tight"><p class="font-bold text-slate-700 dark:text-slate-200 text-sm line-clamp-1">{{ showOptions ? (isCalculator ? 'Hitung Heart' : 'Pilih Varian') : (product.tag || 'Service') }}</p><p class="text-[10px] font-medium text-slate-400">Sky CoTL</p></div>
      </div>
      <div v-if="!showOptions && (product.tag === 'Promo')" class="rounded-full bg-rose-100 dark:bg-rose-900/30 px-2 py-0.5 text-[10px] font-bold text-rose-500 dark:text-rose-300 flex items-center gap-1 shrink-0 animate-pulse"><Sparkles :size="10" /> Promo</div>
    </div>
    <div class="relative z-10 flex flex-1 flex-col gap-3 px-5 py-4 overflow-hidden">
      <transition name="slide-fade" mode="out-in">
        <div v-if="!showOptions" class="space-y-2 h-full flex flex-col">
          <h3 class="text-base font-bold text-slate-700 dark:text-slate-200 group-hover:text-sky-500 transition-colors leading-tight">{{ product.name }}</h3>
          <p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium line-clamp-3">{{ product.desc }}</p>
          <div class="flex flex-wrap gap-2 pt-2 mt-auto"><span class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold ring-1 ring-inset" :class="tagColorClass"><Clock :size="10" /> {{ product.eta }}</span></div>
        </div>
        <div v-else-if="isCalculator" class="h-full"><MiniHeartCalculator :product="product" @addToCart="onCalculatorAdd" /></div>
        <div v-else class="space-y-2 h-full overflow-y-auto pr-1 custom-scrollbar">
          <p class="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Daftar Pilihan:</p>
          <div v-for="variant in product.variants" :key="variant.id" @click="toggleVariant(variant)" class="flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-all duration-200" :class="isSelected(variant.id) ? 'bg-sky-50 dark:bg-metal border-sky-200 dark:border-slate-500 shadow-sm' : 'bg-white dark:bg-graphite border-slate-100 dark:border-metal hover:border-sky-100'">
            <div class="flex items-center gap-2.5"><div class="w-5 h-5 rounded-md border flex items-center justify-center transition-colors" :class="isSelected(variant.id) ? 'bg-sky-500 border-sky-500' : 'border-slate-300 dark:border-slate-500 bg-white dark:bg-graphite'"><Check v-if="isSelected(variant.id)" :size="12" class="text-white" /></div><span class="text-xs font-bold text-slate-600 dark:text-slate-300" :class="{'text-sky-600 dark:text-sky-400': isSelected(variant.id)}">{{ variant.name }}</span></div><span class="text-[10px] font-bold text-slate-400 dark:text-slate-400 bg-slate-50 dark:bg-metal px-1.5 py-0.5 rounded">{{ formatCurrency(variant.price) }}</span>
          </div>
        </div>
      </transition>
    </div>
    <div v-if="!isCalculator || (isCalculator && !showOptions)" class="relative z-10 mt-auto border-t border-dashed border-sky-100 dark:border-metal bg-white/60 dark:bg-graphite/60 px-5 py-4 backdrop-blur-md">
      <span class="pointer-events-none absolute -left-2.5 top-0 h-5 w-5 -translate-y-1/2 rounded-full bg-[#FDFBF7] dark:bg-charcoal shadow-inner"></span>
      <span class="pointer-events-none absolute -right-2.5 top-0 h-5 w-5 -translate-y-1/2 rounded-full bg-[#FDFBF7] dark:bg-charcoal shadow-inner"></span>
      <div class="flex items-center justify-between gap-3">
        <div class="flex flex-col"><span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{{ showOptions ? 'Total' : 'Mulai dari' }}</span><span class="text-base font-extrabold text-sky-500 dark:text-sky-400 transition-all duration-300">{{ formatCurrency(currentPrice) }}</span></div>
        <div class="flex items-center gap-2">
          <button v-if="isCalculator" @click.stop="showInfoModal = true" class="flex items-center justify-center w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-900/20 text-rose-400 border border-rose-100 dark:border-rose-900 hover:bg-rose-100 transition shadow-sm active:scale-95"><Info :size="18" /></button>
          <button @click="handleAction" class="btn-bouncy inline-flex items-center gap-1.5 rounded-2xl px-4 py-2 text-xs font-bold text-white shadow-lg transition-all duration-300" :class="isCalculator ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-200 dark:shadow-none' : (showOptions ? 'bg-gradient-to-r from-emerald-500 to-teal-400' : 'bg-slate-800 dark:bg-metal hover:bg-slate-700')">
            <component :is="isCalculator ? Calculator : (showOptions ? Plus : (hasVariants ? ChevronRight : Plus))" :size="14" :class="showOptions ? 'text-white' : 'text-amber-300'" /><span>{{ isCalculator ? 'Hitung' : (showOptions ? 'Add' : (hasVariants ? 'Pilih Opsi' : 'Order')) }}</span>
          </button>
        </div>
      </div>
    </div>
    <Teleport to="body">
      <transition name="fade">
        <div v-if="showInfoModal" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-slate-900/30 backdrop-blur-sm transition-opacity" @click="showInfoModal = false"></div>
          <div class="bg-white dark:bg-graphite w-full max-w-sm rounded-3xl shadow-2xl relative z-10 animate-in fade-in zoom-in-95 duration-200 p-6 border-4 border-rose-50 dark:border-metal">
            <button @click="showInfoModal = false" class="absolute top-4 right-4 p-1 text-slate-400 hover:text-rose-500 bg-slate-50 dark:bg-metal rounded-full transition"><X :size="20" /></button>
            <div class="text-center mb-4"><div class="inline-flex items-center justify-center w-12 h-12 bg-rose-100 dark:bg-rose-900/20 rounded-full mb-3 text-rose-500"><Info :size="24" /></div><h3 class="text-lg font-bold text-slate-700 dark:text-slate-200">Mekanisme Heart ❤️</h3></div>
            <div class="space-y-3 text-sm text-slate-600 dark:text-slate-300">
              <div class="flex gap-3 bg-rose-50 dark:bg-metal/50 p-3 rounded-xl border border-rose-100 dark:border-metal"><Check :size="16" class="text-rose-500 mt-0.5"/><p>Wajib add akun bot admin dulu.</p></div>
              <div class="flex gap-3 bg-rose-50 dark:bg-metal/50 p-3 rounded-xl border border-rose-100 dark:border-metal"><Clock :size="16" class="text-rose-500 mt-0.5"/><p>1 Heart per hari per akun (Limit Game).</p></div>
              <div class="flex gap-3 bg-rose-50 dark:bg-metal/50 p-3 rounded-xl border border-rose-100 dark:border-metal"><img src="" class="hidden"/><Wind :size="16" class="text-rose-500 mt-0.5"/><p>Makin banyak slot bot yang kamu add, makin cepat selesai!</p></div>
            </div>
            <button @click="showInfoModal = false" class="w-full mt-6 btn-bouncy bg-rose-500 text-white py-3 rounded-xl font-bold shadow-lg shadow-rose-200 dark:shadow-none">Oke, Paham! 👍</button>
          </div>
        </div>
      </transition>
    </Teleport>
  </article>
</template>

<style scoped>
.slide-fade-enter-active { transition: all 0.3s ease-out; }
.slide-fade-leave-active { transition: all 0.2s cubic-bezier(1, 0.5, 0.8, 1); }
.slide-fade-enter-from { transform: translateX(20px); opacity: 0; }
.slide-fade-leave-to { transform: translateX(-20px); opacity: 0; }
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background-color: #e2e8f0; border-radius: 20px; }
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>