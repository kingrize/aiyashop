<!-- LOKASI FILE: src/components/CartDrawer.vue -->
<script setup>
import { ref, computed, watch, reactive } from 'vue';
import { useCartStore } from '../stores/cart';
import { usePromoStore } from '../stores/promo'; 
import { useUserStore } from '../stores/user'; 
import { ShoppingBag, X, Trash2, Wind, MessageCircle, Star, Heart, Flame, Cloud, Sparkles, Tag, Loader2, XCircle, Moon, Info, CreditCard, Wallet, QrCode, User, UserCheck, LogIn, AlertCircle } from 'lucide-vue-next';

const store = useCartStore();
const promoStore = usePromoStore();
const userStore = useUserStore();

const promoInput = ref('');
const promoMessage = ref('');
const selectedPayment = ref('qris'); 

const authForm = reactive({ email: '', password: '' });
const isAuthLoading = ref(false);

watch(() => userStore.user, (newUser) => {
  if (newUser && userStore.memberData?.saldo >= store.totalPrice) {
    selectedPayment.value = 'member';
  }
});

const paymentMethods = [
  { id: 'qris', label: 'QRIS', icon: QrCode },
  { id: 'dana', label: 'DANA', icon: Wallet },
  { id: 'gopay', label: 'GoPay', icon: Wallet },
  { id: 'shopeepay', label: 'ShopeePay', icon: Wallet },
  { id: 'transfer', label: 'Transfer Bank', icon: CreditCard },
  { id: 'member', label: 'Member (Saldo)', icon: UserCheck },
];

const MIN_ORDER_FOR_PROMO = 10000; 
const amountNeededForPromo = computed(() => Math.max(0, MIN_ORDER_FOR_PROMO - store.totalPrice));
const isPromoEligible = computed(() => store.totalPrice >= MIN_ORDER_FOR_PROMO);

const getIcon = (type) => {
  const icons = { Wind, Star, Heart, Flame, Cloud, Sparkles, Moon };
  return icons[type] || Sparkles;
};

const formatRupiah = (num) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);

const handleApplyPromo = async () => {
  if (!promoInput.value) return;
  const result = await promoStore.applyPromo(promoInput.value);
  promoMessage.value = result.message;
  setTimeout(() => promoMessage.value = '', 3000);
};

const handleAuthSubmit = async () => {
  isAuthLoading.value = true;
  if (!authForm.email || !authForm.password) {
    alert("Email & Password harus diisi!"); isAuthLoading.value = false; return;
  }
  await userStore.login(authForm.email, authForm.password);
  isAuthLoading.value = false;
};

const handleCheckout = () => {
  if (store.items.length === 0) return;
  
  if (selectedPayment.value === 'member') {
    if (!userStore.user) {
      alert("Silakan login dulu ya kak! 😊"); return;
    }
    const finalTotal = promoStore.activeCode && isPromoEligible.value ? promoStore.calculateTotal(store.totalPrice) : store.totalPrice;
    if (userStore.memberData?.saldo < finalTotal) {
      alert("Yah, saldo member kakak kurang nih 🥺 Topup dulu yuk!"); return;
    }
  }

  let message = "Halo Admin Aiya! ✨ Aku mau jajan dong:%0A%0A";
  
  store.items.forEach((item, index) => {
    message += `${index + 1}. ${item.name} (${item.qty}x) - ${formatRupiah(item.price * item.qty)}%0A`;
    if (item.desc) message += `   _${item.desc}_\n`;
  });

  if (userStore.user) {
    message += `%0A👤 User: ${userStore.user.displayName}`;
    message += `%0A📧 Email: ${userStore.user.email}`;
  }

  if (promoStore.activeCode && isPromoEligible.value) {
    message += `%0A🎟️ Kode Promo: ${promoStore.activeCode}`;
    message += `%0ADiskon: -${formatRupiah(promoStore.savings(store.totalPrice))}`;
  }

  const finalTotal = (promoStore.activeCode && isPromoEligible.value) ? promoStore.calculateTotal(store.totalPrice) : store.totalPrice;
  message += `%0A%0ATotal: *${formatRupiah(finalTotal)}*`;
  
  if (selectedPayment.value === 'member') {
    message += `%0AMetode Bayar: 💎 Potong Saldo Member (Auto)`;
  } else {
    const paymentMethod = paymentMethods.find(p => p.id === selectedPayment.value);
    message += `%0AMetode Bayar: ${paymentMethod?.label || 'QRIS'}`;
  }
  
  // UPDATE LINK WA (NOMOR BARU)
  window.open(`https://wa.me/6285942963323?text=${message}`, '_blank');
};
</script>

<template>
  <div>
    <transition name="fade"><div v-if="store.isOpen" class="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-[60] transition-opacity" @click="store.toggleCart()"></div></transition>
    <div class="fixed top-0 right-0 h-full w-full md:w-[420px] bg-[#FDFBF7] z-[70] shadow-2xl transform transition-transform duration-500 cubic-bezier(0.32, 0.72, 0, 1)" :class="store.isOpen ? 'translate-x-0' : 'translate-x-full'">
      <!-- ... (Isi Template Sama) ... -->
      <div class="h-full flex flex-col relative overflow-hidden">
        <div class="absolute top-0 right-0 w-64 h-64 bg-sky-100 rounded-full blur-3xl -z-10 opacity-60 pointer-events-none"></div>
        <div class="p-6 flex justify-between items-center bg-white/50 backdrop-blur-md border-b border-sky-100/50">
          <h2 class="text-xl font-bold text-slate-700 flex items-center gap-2"><ShoppingBag class="text-sky-500" /> Keranjang</h2>
          <button @click="store.toggleCart()" class="p-2 hover:bg-rose-50 text-slate-400 hover:text-rose-500 rounded-full transition"><X :size="24" /></button>
        </div>

        <!-- Items -->
        <div class="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
          <div v-if="store.items.length === 0" class="text-center py-20 flex flex-col items-center">
            <div class="bg-sky-50 p-6 rounded-full mb-4 animate-float-slow"><Wind class="text-sky-300" :size="48" /></div>
            <p class="text-slate-500 font-bold mb-2">Keranjang masih kosong...</p>
            <button @click="store.toggleCart()" class="text-sky-500 font-bold hover:underline">Lihat Menu</button>
          </div>
          <div v-else v-for="item in store.items" :key="item.id" class="bg-white p-4 rounded-3xl border border-sky-50 shadow-sm flex gap-4 items-start group hover:shadow-md transition relative">
            <div :class="`w-12 h-12 rounded-2xl ${item.color || 'bg-slate-100'} flex items-center justify-center text-white shrink-0 mt-1 shadow-sm`"><component :is="getIcon(item.iconType)" :size="20" /></div>
            <div class="flex-1 min-w-0 pr-8">
              <h4 class="font-bold text-slate-700 text-sm truncate">{{ item.name }}</h4>
              <p class="text-[10px] text-slate-400 mb-2 line-clamp-2 leading-relaxed">{{ item.desc }}</p>
              <div class="flex items-center justify-between"><p class="text-sky-500 font-bold text-sm">{{ formatRupiah(item.price * item.qty) }}</p><div class="flex items-center gap-2 bg-slate-50 rounded-lg p-1 border border-slate-100"><button @click="store.updateQty(item.id, -1)" class="w-5 h-5 flex items-center justify-center text-slate-400 hover:bg-white hover:text-rose-500 rounded transition">-</button><span class="text-xs font-bold w-4 text-center text-slate-600">{{ item.qty }}</span><button @click="store.updateQty(item.id, 1)" class="w-5 h-5 flex items-center justify-center text-slate-400 hover:bg-white hover:text-emerald-500 rounded transition">+</button></div></div>
            </div>
            <button @click="store.removeItem(item.id)" class="absolute top-3 right-3 p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition" title="Hapus Item"><Trash2 :size="16" /></button>
          </div>
        </div>

        <!-- Footer -->
        <div class="bg-white border-t border-dashed border-sky-100 relative z-10 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
          <!-- Promo -->
          <div class="px-6 pt-4 pb-2">
            <div class="flex gap-2"><div class="relative flex-1 group"><div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Tag :size="16" class="text-slate-400 group-focus-within:text-sky-500 transition" /></div><input v-model="promoInput" type="text" placeholder="Kode Promo" class="pl-9 pr-8 w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 text-sm focus:outline-none focus:border-sky-300 focus:ring-4 focus:ring-sky-50 transition uppercase font-bold text-slate-600 placeholder:font-normal" @keyup.enter="handleApplyPromo" :disabled="!!promoStore.activeCode"/><button v-if="promoStore.activeCode" @click="promoStore.resetPromo(); promoInput=''" class="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-rose-500 cursor-pointer transition"><XCircle :size="16" /></button></div><button @click="handleApplyPromo" :disabled="promoStore.isLoading || !promoInput || !!promoStore.activeCode" class="bg-slate-800 text-white px-5 py-2 rounded-xl text-xs font-bold hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg shadow-slate-200 flex items-center justify-center min-w-[70px]"><Loader2 v-if="promoStore.isLoading" :size="16" class="animate-spin" /><span v-else>{{ promoStore.activeCode ? 'Aktif' : 'Pakai' }}</span></button></div>
            <p v-if="promoMessage" class="text-[10px] mt-2 font-bold ml-1 flex items-center gap-1" :class="promoStore.error ? 'text-rose-500' : 'text-emerald-500'"><Sparkles v-if="!promoStore.error" :size="12" /> {{ promoMessage }}</p>
            <div v-if="promoStore.activeCode && !isPromoEligible" class="mt-2 flex items-start gap-2 bg-amber-50 p-2 rounded-lg border border-amber-100 text-[10px] text-amber-600"><Info :size="14" class="mt-0.5 shrink-0" /><span>Kupon aktif, tapi minimal belanja <b>{{ formatRupiah(MIN_ORDER_FOR_PROMO) }}</b>.<br/>Tambah <b>{{ formatRupiah(amountNeededForPromo) }}</b> lagi ya!</span></div>
          </div>

          <!-- Payment -->
          <div class="px-6 py-2">
            <p class="text-xs font-bold text-slate-500 mb-2">Pilih Pembayaran</p>
            <div class="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
              <button @click="selectedPayment = 'member'" class="flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-medium transition whitespace-nowrap" :class="selectedPayment === 'member' ? 'bg-indigo-50 border-indigo-300 text-indigo-600 shadow-sm' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'"><UserCheck :size="14" /> Member</button>
              <button v-for="method in paymentMethods.filter(m => m.id !== 'member')" :key="method.id" @click="selectedPayment = method.id" class="flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-medium transition whitespace-nowrap" :class="selectedPayment === method.id ? 'bg-sky-50 border-sky-300 text-sky-600 shadow-sm' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'"><component :is="method.icon" :size="14" /> {{ method.label }}</button>
            </div>
            <transition name="fade">
              <div v-if="selectedPayment === 'member'" class="mt-3 bg-indigo-50 p-3 rounded-xl border border-indigo-100 relative overflow-hidden">
                <div v-if="userStore.user">
                  <div class="flex justify-between items-center mb-1"><span class="text-xs font-bold text-indigo-700">Saldo Kamu:</span><span class="text-sm font-extrabold text-indigo-600">{{ formatRupiah(userStore.memberData?.saldo) }}</span></div>
                  <div v-if="userStore.memberData?.saldo < promoStore.calculateTotal(store.totalPrice)" class="text-[10px] text-rose-500 font-bold flex items-center gap-1 mt-1"><XCircle :size="12"/> Saldo kurang, topup ke admin ya!</div>
                  <div v-else class="text-[10px] text-emerald-600 font-bold flex items-center gap-1 mt-1"><UserCheck :size="12"/> Saldo cukup, siap potong!</div>
                </div>
                <div v-else>
                  <p class="text-[10px] text-indigo-500 mb-2 font-bold text-center">Login Member Lama 🔐</p>
                  <div class="space-y-2">
                    <input v-model="authForm.email" type="email" placeholder="Email" class="w-full px-3 py-1.5 text-xs rounded-lg border border-indigo-200 focus:outline-none focus:border-indigo-400" />
                    <input v-model="authForm.password" type="password" placeholder="Password" class="w-full px-3 py-1.5 text-xs rounded-lg border border-indigo-200 focus:outline-none focus:border-indigo-400" />
                  </div>
                  <p v-if="userStore.authError" class="text-[9px] text-rose-500 mt-2 font-bold flex items-center gap-1"><AlertCircle :size="10"/> {{ userStore.authError }}</p>
                  <button @click="handleAuthSubmit" :disabled="isAuthLoading" class="w-full mt-3 bg-indigo-600 text-white py-1.5 rounded-lg text-xs font-bold hover:bg-indigo-700 disabled:opacity-50 flex justify-center items-center gap-1"><Loader2 v-if="isAuthLoading" :size="12" class="animate-spin" /> Masuk</button>
                  <p class="text-[9px] text-center text-indigo-400 mt-2">*Belum punya akun? Hubungi Admin.</p>
                </div>
              </div>
            </transition>
          </div>

          <!-- Total & Checkout -->
          <div class="p-6 pt-2 space-y-3">
            <div class="flex justify-between items-center text-xs text-slate-400"><span>Subtotal</span><span>{{ formatRupiah(store.totalPrice) }}</span></div>
            <div v-if="promoStore.activeCode && isPromoEligible" class="flex justify-between items-center text-xs font-bold text-emerald-500 bg-emerald-50 p-2 rounded-lg border border-emerald-100 animate-in slide-in-from-left-2"><span class="flex items-center gap-1"><Tag :size="12"/> Hemat ({{ promoStore.activeCode }})</span><span>- {{ formatRupiah(promoStore.savings(store.totalPrice)) }}</span></div>
            <div class="flex justify-between items-end pt-2 border-t border-slate-100"><span class="text-sm font-bold text-slate-600">Total Bayar</span><span class="text-2xl font-extrabold text-sky-500">{{ formatRupiah((promoStore.activeCode && isPromoEligible) ? promoStore.calculateTotal(store.totalPrice) : store.totalPrice) }}</span></div>
            <button @click="handleCheckout" :disabled="store.items.length === 0" class="w-full btn-bouncy bg-gradient-to-r from-emerald-500 to-teal-400 text-white font-bold py-4 rounded-2xl shadow-lg shadow-emerald-100 flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-4 hover:brightness-105"><MessageCircle :size="20" /> Checkout via WhatsApp</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background-color: #e2e8f0; border-radius: 20px; }
</style>