<script setup>
import { ref, computed, onMounted, onUnmounted, reactive } from 'vue';
import { useCartStore } from '../stores/cart';
import { useUserStore } from '../stores/user'; 
import { useThemeStore } from '../stores/theme'; 
import { Cloud, Sparkles, ShoppingBag, Menu, X, Star, Heart, LogIn, User, LogOut, Loader2, AlertCircle, UserPlus, UserCheck, Sun, Moon, Calculator } from 'lucide-vue-next';

const cart = useCartStore();
const userStore = useUserStore();
const themeStore = useThemeStore(); 
const totalItems = computed(() => cart.totalItems);
const mobileOpen = ref(false);
const isScrolled = ref(false);
const showProfileMenu = ref(false);
const showAuthModal = ref(false); 

const authForm = reactive({ email: '', password: '' });
const isAuthLoading = ref(false);

const handleScroll = () => { isScrolled.value = window.scrollY > 10; };
onMounted(() => { window.addEventListener('scroll', handleScroll); handleScroll(); });
onUnmounted(() => window.removeEventListener('scroll', handleScroll));

const scrollToSection = (id) => {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth' });
  mobileOpen.value = false;
};

const memberName = computed(() => {
  if (userStore.memberData?.displayName) return userStore.memberData.displayName.split(' ')[0];
  if (userStore.user?.displayName) return userStore.user.displayName.split(' ')[0];
  return 'Kakak';
});

const handleNavbarAuth = async () => {
  if (!authForm.email || !authForm.password) { alert("Email & Password wajib diisi!"); return; }
  isAuthLoading.value = true;
  const success = await userStore.login(authForm.email, authForm.password);
  isAuthLoading.value = false;
  if (success) { showAuthModal.value = false; authForm.email = ''; authForm.password = ''; }
};

const openCart = () => { cart.toggleCart(); mobileOpen.value = false; };
const formatRupiah = (val) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val || 0);
</script>

<template>
  <header class="sticky top-0 z-50 transition-all duration-500 ease-in-out border-b" :class="isScrolled ? 'bg-white/90 dark:bg-charcoal/90 backdrop-blur-md border-sky-100 dark:border-metal shadow-sm py-2' : 'bg-transparent border-transparent py-4'">
    <nav class="mx-auto flex max-w-6xl items-center justify-between px-6">
      <!-- BRAND -->
      <button class="flex items-center gap-3 focus:outline-none group text-left rounded-2xl p-1 -ml-1 transition" @click="scrollToSection('home')">
        <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 via-cyan-400 to-emerald-300 shadow-md group-hover:scale-105 transition-transform duration-300"><Cloud :size="26" class="text-white fill-white/20" /></div>
        <div class="leading-tight"><p class="text-lg font-bold tracking-tight text-slate-700 dark:text-slate-200">Aiya<span class="text-sky-500 dark:text-sky-400">Shop</span><span class="text-amber-400 ml-0.5">✨</span></p><p class="text-xs font-medium text-slate-400 dark:text-slate-500 group-hover:text-sky-400 transition-colors">Teman Joki Sky Kamu ☁️</p></div>
      </button>

      <!-- DESKTOP -->
      <div class="hidden md:flex items-center gap-3 text-sm font-medium text-slate-500 dark:text-slate-400">
        <button class="rounded-full px-4 py-2 hover:bg-sky-50 dark:hover:bg-graphite hover:text-sky-500 transition" @click="scrollToSection('home')">Beranda</button>
        <button class="rounded-full px-4 py-2 hover:bg-sky-50 dark:hover:bg-graphite hover:text-sky-500 transition" @click="scrollToSection('services')">Menu Jajan</button>
        <div class="h-5 w-[1px] bg-slate-200 dark:bg-metal mx-1"></div>
        
        <button @click="themeStore.toggleTheme" class="p-2 rounded-full hover:bg-sky-50 dark:hover:bg-graphite text-slate-400 hover:text-amber-400 transition"><Sun v-if="themeStore.isDark" :size="20" /><Moon v-else :size="20" /></button>

        <div v-if="userStore.loading" class="w-20 h-8 bg-slate-100 dark:bg-graphite rounded-full animate-pulse"></div>
        <button v-else-if="!userStore.user" @click="showAuthModal = true" class="btn-bouncy px-5 py-2 rounded-full bg-slate-800 dark:bg-graphite text-white text-xs font-bold shadow-md hover:bg-slate-700 dark:hover:bg-slate-600 flex items-center gap-2 border border-slate-700 dark:border-metal"><LogIn :size="14" /> Member Login</button>
        
        <div v-else class="relative">
          <button @click="showProfileMenu = !showProfileMenu" class="flex items-center gap-2 pl-1 pr-4 py-1 rounded-full border border-sky-100 dark:border-metal bg-sky-50/50 dark:bg-graphite hover:bg-sky-100 dark:hover:bg-metal transition group">
            <div class="w-9 h-9 rounded-full bg-white dark:bg-metal flex items-center justify-center text-sky-600 dark:text-sky-400 font-bold border border-sky-200 dark:border-metal uppercase shadow-sm group-hover:scale-105 transition-transform">{{ memberName[0] }}</div>
            <div class="text-left leading-none hidden lg:block"><p class="text-[10px] text-slate-400 dark:text-slate-400 font-bold">Hi, {{ memberName }}</p><p class="text-xs font-bold text-sky-600 dark:text-sky-400">{{ formatRupiah(userStore.memberData?.saldo) }}</p></div>
          </button>
          <div v-if="showProfileMenu" class="absolute top-full right-0 mt-3 w-56 bg-white dark:bg-graphite rounded-2xl shadow-xl border border-sky-100 dark:border-metal overflow-hidden py-1 animate-in fade-in zoom-in-95 duration-200">
            <div class="px-5 py-4 border-b border-slate-50 dark:border-metal bg-gradient-to-r from-sky-50 to-white dark:from-metal/30 dark:to-graphite"><p class="text-xs text-slate-400 dark:text-slate-400 font-bold uppercase tracking-wider mb-1">Saldo Member</p><p class="text-xl font-extrabold text-sky-600 dark:text-sky-400">{{ formatRupiah(userStore.memberData?.saldo) }}</p></div>
            <button @click="userStore.logout(); showProfileMenu = false" class="w-full text-left px-5 py-3 text-sm text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 flex items-center gap-2 transition-colors"><LogOut :size="16" /> Keluar</button>
          </div>
        </div>

        <button class="relative ml-1 flex h-11 w-11 items-center justify-center rounded-full border border-sky-100 dark:border-metal bg-white dark:bg-graphite hover:bg-sky-50 dark:hover:bg-metal hover:border-sky-200 dark:hover:border-slate-600 transition btn-bouncy" @click="openCart" :class="{ 'scale-110 bg-sky-100 dark:bg-metal border-sky-300 dark:border-slate-500': cart.lastAddedTime }">
          <ShoppingBag :size="20" class="text-slate-400 dark:text-slate-400 hover:text-sky-500 dark:hover:text-sky-400" />
          <span v-if="totalItems > 0" class="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-400 text-[10px] font-bold text-white shadow-sm ring-2 ring-white animate-bounce">{{ totalItems }}</span>
        </button>
      </div>

      <!-- MOBILE TOGGLE -->
      <div class="flex items-center gap-3 md:hidden">
        <button @click="themeStore.toggleTheme" class="p-2 rounded-full hover:bg-sky-50 dark:hover:bg-metal/30 text-slate-400 hover:text-amber-400 transition"><Sun v-if="themeStore.isDark" :size="20" /><Moon v-else :size="20" /></button>
        <button class="relative flex h-10 w-10 items-center justify-center rounded-full border border-sky-100 dark:border-metal bg-white dark:bg-graphite hover:bg-sky-50 dark:hover:bg-metal transition" @click="openCart"><ShoppingBag :size="20" class="text-sky-500 dark:text-sky-400" /><span v-if="totalItems > 0" class="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-rose-400 ring-2 ring-white"></span></button>
        <button class="flex h-10 w-10 items-center justify-center rounded-full bg-sky-50 dark:bg-graphite text-sky-500 dark:text-sky-400 hover:bg-sky-100 dark:hover:bg-metal transition border border-sky-100 dark:border-metal" @click="mobileOpen = !mobileOpen"><component :is="mobileOpen ? X : Menu" :size="22" /></button>
      </div>
    </nav>

    <!-- AUTH MODAL -->
    <transition name="fade">
      <div v-if="showAuthModal" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-slate-900/30 backdrop-blur-sm transition-opacity" @click="showAuthModal = false"></div>
        <div class="bg-cream dark:bg-charcoal w-full max-w-sm rounded-[2rem] shadow-2xl relative z-10 animate-in fade-in zoom-in-95 duration-200 p-8 border-4 border-indigo-50 dark:border-metal">
          <button @click="showAuthModal = false" class="absolute top-4 right-4 p-1 text-slate-400 hover:text-rose-500 bg-slate-50 dark:bg-metal rounded-full transition"><X :size="20" /></button>
          <div class="text-center mb-6"><div class="inline-flex items-center justify-center w-14 h-14 bg-indigo-100 dark:bg-indigo-900/30 rounded-full mb-3 text-indigo-600 dark:text-indigo-400"><LogIn :size="28" /></div><h3 class="text-2xl font-bold text-slate-700 dark:text-slate-200">Area Member</h3><p class="text-slate-400 text-xs mt-1">Silakan masuk menggunakan akun yang diberikan admin.</p></div>
          <div class="space-y-3">
            <input v-model="authForm.email" type="email" placeholder="Alamat Email" class="w-full px-4 py-3 bg-slate-50 dark:bg-graphite border border-slate-200 dark:border-metal rounded-xl focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900 transition font-bold text-slate-600 dark:text-slate-300" />
            <input v-model="authForm.password" type="password" placeholder="Password" class="w-full px-4 py-3 bg-slate-50 dark:bg-graphite border border-slate-200 dark:border-metal rounded-xl focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900 transition font-bold text-slate-600 dark:text-slate-300" />
          </div>
          <p v-if="userStore.authError" class="text-xs text-rose-500 mt-3 font-bold flex items-center gap-1 justify-center"><AlertCircle :size="12"/> {{ userStore.authError }}</p>
          <button @click="handleNavbarAuth" :disabled="isAuthLoading" class="w-full mt-6 btn-bouncy bg-indigo-600 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-indigo-200 dark:shadow-none flex justify-center items-center gap-2 disabled:opacity-50"><Loader2 v-if="isAuthLoading" :size="18" class="animate-spin" /> Masuk Akun</button>
          <div class="mt-6 pt-4 border-t border-slate-100 dark:border-metal text-center"><p class="text-[10px] text-slate-400 mb-1">Belum punya akun member?</p><a href="https://wa.me/6285942963323?text=Halo%20Admin%20Aiya!%20Saya%20mau%20daftar%20member%20AiyaShop%20dong%20✨" target="_blank" class="text-xs text-indigo-500 font-bold hover:underline flex items-center justify-center gap-1">Hubungi Admin via WhatsApp <UserPlus :size="12"/></a></div>
        </div>
      </div>
    </transition>

    <!-- MOBILE DROPDOWN -->
    <transition name="fade">
      <div v-if="mobileOpen" class="md:hidden absolute top-full left-0 w-full bg-white/95 dark:bg-charcoal/95 backdrop-blur-md border-b border-sky-100 dark:border-metal shadow-xl">
        <div class="p-4 space-y-2 max-w-md mx-auto">
          <div v-if="userStore.user" class="bg-sky-50 dark:bg-graphite rounded-2xl p-4 flex items-center justify-between mb-4 border border-sky-100 dark:border-metal shadow-sm">
            <div class="flex items-center gap-3"><div class="w-10 h-10 rounded-full bg-sky-200 dark:bg-metal flex items-center justify-center text-sky-600 dark:text-sky-400 font-bold uppercase border-2 border-white dark:border-metal">{{ memberName[0] }}</div><div><p class="text-xs text-slate-500 dark:text-slate-400">Saldo Member</p><p class="text-lg font-bold text-sky-600 dark:text-sky-400">{{ formatRupiah(userStore.memberData?.saldo) }}</p></div></div>
            <button @click="userStore.logout()" class="p-2 bg-white dark:bg-metal rounded-full text-rose-400 shadow-sm border border-slate-100 dark:border-metal"><LogOut :size="18"/></button>
          </div>
          <button v-else @click="showAuthModal = true; mobileOpen = false" class="w-full bg-slate-800 dark:bg-graphite text-white py-3 rounded-xl font-bold flex justify-center gap-2 mb-4 shadow-lg shadow-slate-200 dark:shadow-none border border-slate-700 dark:border-metal"><LogIn :size="18" /> Member Login</button>
          <button class="flex w-full items-start gap-4 rounded-2xl p-4 hover:bg-sky-50 dark:hover:bg-metal transition text-left group" @click="scrollToSection('home')"><div class="mt-1 flex h-9 w-9 items-center justify-center rounded-full bg-sky-100 dark:bg-metal group-hover:bg-sky-200 transition"><Cloud :size="18" class="text-sky-500 dark:text-sky-400" /></div><div><span class="block text-base font-bold text-slate-700 dark:text-slate-200">Beranda</span></div></button>
          <button class="flex w-full items-start gap-4 rounded-2xl p-4 hover:bg-amber-50 dark:hover:bg-metal transition text-left group" @click="scrollToSection('services')"><div class="mt-1 flex h-9 w-9 items-center justify-center rounded-full bg-amber-100 dark:bg-metal group-hover:bg-amber-200 transition"><Star :size="18" class="text-amber-500" /></div><div><span class="block text-base font-bold text-slate-700 dark:text-slate-200">Menu Jajan</span><span class="text-xs text-slate-400">Pilih paket joki</span></div></button>
        </div>
      </div>
    </transition>
  </header>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translateY(-10px); }
</style>