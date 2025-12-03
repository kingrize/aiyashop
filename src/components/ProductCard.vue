<script setup>
import { computed, ref } from 'vue';
import { useCartStore } from '../stores/cart';
import {
  Plus,
  Sparkles,
  Moon,
  Heart,
  Star,
  Wind,
  Cloud,
  Flame,
  ChevronLeft,
  ChevronRight,
  Calculator,
  Info,
  Clock,
  Check,
  X
} from 'lucide-vue-next';
import MiniHeartCalculator from './MiniHeartCalculator.vue';

const props = defineProps({
  product: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['open-calculator']);

const cart = useCartStore();

const showOptions = ref(false);
const selectedVariants = ref([]);
const showInfoModal = ref(false);

const hasVariants = computed(
  () => Array.isArray(props.product.variants) && props.product.variants.length > 0
);
const isCalculator = computed(() => props.product.isCalculator === true);

// ICON UTAMA CARD
const iconComponent = computed(() => {
  // kalau ini card kalkulator heart → pakai ikon Heart
  if (isCalculator.value || props.product.category === 'heart') {
    return Heart;
  }
  const map = {
    moon: Moon,
    heart: Heart,
    star: Star,
    wind: Wind,
    cloud: Cloud,
    flame: Flame
  };
  return map[props.product.iconType] || Sparkles;
});

// WRAPPER ICON (TEGAS & TIMBUL, ROUNDED SAMA)
const iconWrapperClass = computed(() => {
  if (isCalculator.value || props.product.category === 'heart' || props.product.tag === 'Calculator') {
    return 'bg-gradient-to-br from-rose-400 via-rose-500 to-rose-600 text-white';
  }
  if (props.product.category === 'candlerun') {
    return 'bg-gradient-to-br from-sky-400 via-sky-500 to-cyan-500 text-white';
  }
  if (props.product.category === 'ascend') {
    return 'bg-gradient-to-br from-indigo-400 via-indigo-500 to-violet-500 text-white';
  }
  // default
  return 'bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 text-white';
});

// WARNA CARD (sedikit warna per kategori, TANPA glow di dark mode)
const cardAccentClass = computed(() => {
  if (isCalculator.value || props.product.category === 'heart' || props.product.tag === 'Calculator') {
    // HEART / CALCULATOR → agak pink
    return 'border border-rose-100 bg-rose-50/80 shadow-[0_18px_40px_rgba(244,114,182,0.18)] dark:border-rose-500/40 dark:bg-rose-950/40 dark:shadow-none';
  }
  if (props.product.category === 'candlerun') {
    return 'border border-sky-100 bg-sky-50/80 shadow-[0_18px_40px_rgba(56,189,248,0.15)] dark:border-sky-500/40 dark:bg-sky-950/40 dark:shadow-none';
  }
  if (props.product.category === 'ascend') {
    return 'border border-indigo-100 bg-indigo-50/80 shadow-[0_18px_40px_rgba(129,140,248,0.16)] dark:border-indigo-500/40 dark:bg-indigo-950/40 dark:shadow-none';
  }
  // default: netral
  return 'border border-slate-200 bg-white shadow-[0_18px_40px_rgba(15,23,42,0.08)] dark:border-slate-800 dark:bg-[#050c1a] dark:shadow-none';
});

// badge atas (tag)
const tagColorClass = computed(() => {
  switch (props.product.tag) {
    case 'Best Seller':
      return 'bg-sky-100 text-sky-700 border-sky-200 dark:bg-sky-500/15 dark:text-sky-300 dark:border-sky-500/40';
    case 'Custom Trial':
      return 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/40';
    case 'Calculator':
      return 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-500/15 dark:text-rose-300 dark:border-rose-500/40';
    default:
      return 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-500/10 dark:text-slate-300 dark:border-slate-600/40';
  }
});

// badge kategori
const categoryBadgeClass = computed(() => {
  switch (props.product.category) {
    case 'candlerun':
      return 'bg-sky-100 text-sky-700 border-sky-200 dark:bg-sky-500/10 dark:text-sky-300 dark:border-sky-500/40';
    case 'ascend':
      return 'bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-300 dark:border-indigo-500/40';
    case 'heart':
      return 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:border-rose-500/40';
    default:
      return 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-500/10 dark:text-slate-300 dark:border-slate-600/40';
  }
});

const variantsTotal = computed(() =>
  selectedVariants.value.reduce((total, v) => total + (v.price || 0), 0)
);

const basePrice = computed(() => props.product.price || 0);

const currentPrice = computed(() => {
  if (hasVariants.value && selectedVariants.value.length > 0) {
    return variantsTotal.value;
  }
  if (props.product.discountPrice && props.product.discountPrice > 0) {
    return props.product.discountPrice;
  }
  return basePrice.value;
});

const formatCurrency = (value) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(value || 0);

const toggleVariant = (variant) => {
  const index = selectedVariants.value.findIndex((v) => v.id === variant.id);
  if (index === -1) selectedVariants.value.push(variant);
  else selectedVariants.value.splice(index, 1);
};

const isSelected = (variantId) =>
  selectedVariants.value.some((v) => v.id === variantId);

const handleAction = () => {
  // klik pertama: buka opsi / kalkulator
  if ((isCalculator.value || hasVariants.value) && !showOptions.value) {
    showOptions.value = true;
    return;
  }

  // varian: wajib pilih dulu
  if (hasVariants.value) {
    if (selectedVariants.value.length === 0) {
      alert('Pilih minimal satu opsi dulu ya ✨');
      return;
    }

    const customProduct = {
      ...props.product,
      id: `${props.product.id || props.product.slug || props.product.name}-custom`,
      name: `${props.product.name} (${selectedVariants.value
        .map((v) => v.name)
        .join(', ')})`,
      price: currentPrice.value,
      selectedVariants: selectedVariants.value
    };

    cart.addToCart(customProduct);
    showOptions.value = false;
    selectedVariants.value = [];
  } else if (!isCalculator.value) {
    // tanpa varian & bukan kalkulator → langsung add
    cart.addToCart(props.product);
  }
};

const onCalculatorAdd = (item) => {
  cart.addToCart(item);
  showOptions.value = false;
};
</script>

<template>
  <article
    class="group relative flex h-full flex-col rounded-3xl overflow-hidden transition-all duration-300 hover:-translate-y-1"
    :class="cardAccentClass"
  >
    <!-- HEADER di dalam template ProductCard.vue -->
<header
  class="flex items-center justify-between gap-3 border-b px-5 py-4 bg-white/70 backdrop-blur-sm
         border-slate-200/80 dark:border-white/10 dark:bg-slate-950/60"
>
  <div class="flex items-center gap-3">
    <!-- back saat show options -->
    <button
      v-if="showOptions"
      type="button"
      @click.stop="showOptions = false"
      class="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 hover:text-sky-600 hover:border-sky-400 transition-all duration-200
             dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:text-sky-300 dark:hover:border-sky-500"
    >
      <ChevronLeft :size="18" />
    </button>

    <!-- ICON UTAMA – dibikin seragam & nggak keliatan vertikal -->
    <div
      v-else
      class="flex h-11 w-11 aspect-square items-center justify-center rounded-[18px] ring-1 ring-white/70 shadow-md shadow-black/10
             dark:ring-white/10 dark:shadow-black/40"
      :class="iconWrapperClass"
    >
      <component
        :is="iconComponent"
        class="w-5 h-5 drop-shadow-sm"
        :stroke-width="2.4"
      />
    </div>

    <div class="leading-tight">
      <p class="text-sm font-semibold text-slate-900 dark:text-slate-50 line-clamp-1">
        {{ product.name }}
      </p>
      <p class="text-[11px] font-medium text-slate-400 dark:text-slate-400 tracking-[0.18em] uppercase">
        Sky CoTL Service
      </p>
    </div>
  </div>

  <div
    v-if="product.tag"
    class="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-semibold border"
    :class="tagColorClass"
  >
    <Sparkles :size="12" />
    <span class="tracking-wide">{{ product.tag }}</span>
  </div>
</header>

    <!-- BODY -->
    <main class="flex-1 px-5 py-4">
      <transition name="slide-fade" mode="out-in">
        <!-- mode normal -->
        <div
          v-if="!showOptions"
          class="flex h-full flex-col gap-3"
        >
          <div>
            <h3 class="text-sm font-semibold text-slate-900 dark:text-slate-50">
              {{ product.headline || product.name }}
            </h3>
            <p class="mt-1 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {{ product.desc }}
            </p>
          </div>

          <!-- badges -->
          <div class="mt-2 flex flex-wrap gap-2">
            <span
              v-if="product.category"
              class="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-medium"
              :class="categoryBadgeClass"
            >
              <span class="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
              <span class="capitalize">{{ product.category }}</span>
            </span>

            <span
              v-if="product.eta"
              class="inline-flex items-center gap-1.5 rounded-full bg-white/70 text-slate-500 px-2.5 py-1 text-[10px] border border-slate-200/80
                     dark:bg-slate-900/70 dark:text-slate-200 dark:border-slate-700"
            >
              <Clock :size="11" />
              <span>{{ product.eta }}</span>
            </span>

            <span
              v-if="product.badge"
              class="inline-flex items-center gap-1.5 rounded-full bg-white/70 text-slate-500 px-2.5 py-1 text-[10px] border border-slate-200/80
                     dark:bg-slate-900/70 dark:text-slate-200 dark:border-slate-700"
            >
              <Heart :size="11" />
              <span>{{ product.badge }}</span>
            </span>
          </div>
        </div>

        <!-- mode kalkulator -->
        <div v-else-if="isCalculator" class="h-full">
          <MiniHeartCalculator
            :product="product"
            @addToCart="onCalculatorAdd"
          />
        </div>

        <!-- mode pilih varian -->
        <div
          v-else
          class="space-y-2 h-full overflow-y-auto pr-1 custom-scrollbar"
        >
          <p
            class="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-[0.16em] mb-1"
          >
            Pilih varian:
          </p>
          <div
            v-for="variant in product.variants"
            :key="variant.id"
            @click="toggleVariant(variant)"
            class="flex items-center justify-between gap-3 rounded-2xl border px-3.5 py-2.5 text-xs cursor-pointer transition-all duration-200
                   bg-white/70 hover:bg-sky-50/80 border-slate-200/80 hover:border-sky-300
                   dark:bg-slate-900/70 dark:border-slate-700 dark:hover:bg-sky-500/10 dark:hover:border-sky-400"
            :class="isSelected(variant.id)
              ? 'border-sky-400 bg-sky-50/90 dark:bg-sky-500/20 dark:border-sky-400'
              : ''"
          >
            <div class="flex items-center gap-2.5">
              <div
                class="flex h-5 w-5 items-center justify-center rounded-full border border-slate-300 bg-white/80
                       dark:border-slate-500 dark:bg-slate-900/80"
              >
                <Check
                  :size="14"
                  :class="isSelected(variant.id) ? 'text-sky-500 dark:text-sky-300' : 'text-transparent'"
                />
              </div>
              <div class="flex flex-col">
                <p class="font-semibold text-slate-900 dark:text-slate-50 leading-tight">
                  {{ variant.name }}
                </p>
                <p
                  v-if="variant.desc"
                  class="text-[11px] text-slate-500 dark:text-slate-400"
                >
                  {{ variant.desc }}
                </p>
              </div>
            </div>

            <span
              v-if="variant.price"
              class="inline-flex items-center rounded-full bg-slate-900 text-white px-2.5 py-0.5 text-[11px] font-semibold
                     dark:bg-slate-50 dark:text-slate-900"
            >
              {{ formatCurrency(variant.price) }}
            </span>
          </div>
        </div>
      </transition>
    </main>

    <!-- FOOTER -->
    <footer
      v-if="!isCalculator || (isCalculator && !showOptions)"
      class="border-t border-white/70 bg-white/70 px-5 py-3 backdrop-blur-sm
             dark:border-white/10 dark:bg-slate-950/60"
    >
      <div class="flex items-center justify-between gap-3">
        <div class="flex flex-col">
          <span class="text-[10px] font-semibold tracking-[0.18em] text-slate-500 uppercase dark:text-slate-400">
            Estimasi biaya
          </span>
          <span class="text-sm font-semibold text-slate-900 dark:text-slate-50 mt-0.5">
            {{ formatCurrency(currentPrice) }}
          </span>
          <span
            v-if="hasVariants"
            class="text-[10px] text-slate-500 dark:text-slate-400"
          >
            Harga menyesuaikan pilihanmu
          </span>
        </div>

        <div class="flex items-center gap-2">
          <button
            v-if="isCalculator"
            type="button"
            @click.stop="showInfoModal = true"
            class="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white/80 text-slate-500 hover:text-rose-500 hover:border-rose-300 transition-all duration-200
                   dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:text-rose-300 dark:hover:border-rose-400"
          >
            <Info :size="18" />
          </button>

          <button
            type="button"
            @click="handleAction"
            class="btn-bouncy inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold tracking-wide text-white active:scale-95 transition-all duration-200"
            :class="isCalculator
              ? 'bg-gradient-to-r from-rose-400 via-rose-500 to-rose-500 hover:brightness-110'
              : 'bg-sky-500 hover:bg-sky-400'"
          >
            <!-- ICON TOMBOL: kalkulator heart ⇒ Heart -->
            <component
              :is="isCalculator ? Heart : (showOptions ? Plus : (hasVariants ? ChevronRight : Plus))"
              :size="14"
            />
            <span>
              {{ isCalculator
                ? (showOptions ? 'Tambah ke Keranjang' : 'Hitung & Order')
                : (showOptions ? 'Tambah ke Keranjang' : (hasVariants ? 'Pilih Opsi' : 'Order')) }}
            </span>
          </button>
        </div>
      </div>
    </footer>

    <!-- MODAL MEKANISME HEART -->
    <Teleport to="body">
      <transition name="fade">
        <div
          v-if="showInfoModal"
          class="fixed inset-0 z-[100] flex items-center justify-center p-4"
        >
          <div
            class="absolute inset-0 bg-black/60 backdrop-blur-sm"
            @click="showInfoModal = false"
          ></div>

          <div
            class="relative w-full max-w-sm rounded-2xl bg-white/85 border border-white/70 shadow-2xl p-5 backdrop-blur-xl
                   dark:bg-slate-950/85 dark:border-white/10"
          >
            <button
              @click="showInfoModal = false"
              type="button"
              class="absolute top-4 right-4 p-1 rounded-full text-slate-400 hover:text-rose-500 hover:bg-slate-100/70 transition
                     dark:hover:text-rose-300 dark:hover:bg-slate-900/70"
            >
              <X :size="18" />
            </button>

            <div class="text-center mb-4">
              <h3 class="text-sm font-semibold text-slate-900 dark:text-slate-50 mb-1">
                Mekanisme Heart ❤️
              </h3>
              <p class="text-xs text-slate-500 dark:text-slate-400">
                Beberapa hal yang perlu kamu tahu sebelum order paket heart.
              </p>
            </div>

            <div class="space-y-3 text-sm text-slate-700 dark:text-slate-200">
              <div class="flex gap-3">
                <Check :size="16" class="text-rose-500 dark:text-rose-300 mt-0.5" />
                <p>Wajib add akun bot admin dulu.</p>
              </div>

              <div class="flex gap-3">
                <Clock :size="16" class="text-rose-500 dark:text-rose-300 mt-0.5" />
                <p>1 Heart per hari per akun (limit game).</p>
              </div>

              <div class="flex gap-3">
                <Wind :size="16" class="text-rose-500 dark:text-rose-300 mt-0.5" />
                <p>Makin banyak slot bot, makin cepat selesai.</p>
              </div>
            </div>

            <button
              @click="showInfoModal = false"
              type="button"
              class="mt-5 w-full inline-flex items-center justify-center rounded-full bg-gradient-to-r from-rose-400 via-rose-500 to-rose-500 text-white text-sm font-semibold py-2.5 hover:brightness-110 transition"
            >
              Oke, paham 👍
            </button>
          </div>
        </div>
      </transition>
    </Teleport>
  </article>
</template>

<style scoped>
.slide-fade-enter-active {
  transition: all 0.25s ease-out;
}
.slide-fade-leave-active {
  transition: all 0.2s ease-in;
}
.slide-fade-enter-from {
  transform: translateX(12px);
  opacity: 0;
}
.slide-fade-leave-to {
  transform: translateX(-12px);
  opacity: 0;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #e2e8f0;
  border-radius: 9999px;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.btn-bouncy {
  transform-origin: center;
}
.btn-bouncy:active {
  transform: scale(0.96);
}
</style>
