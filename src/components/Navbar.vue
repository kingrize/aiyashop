<script setup>
import { ref, computed, onMounted, onUnmounted, reactive } from "vue";
import { useCartStore } from "../stores/cart";
import { useUserStore } from "../stores/user";
import { useThemeStore } from "../stores/theme";
import {
    Cloud,
    ShoppingBag,
    LogIn,
    LogOut,
    Loader2,
    AlertCircle,
    UserPlus,
    Sun,
    Moon,
    User,
    X,
    Settings,
} from "lucide-vue-next";
import { useRouter } from "vue-router";
import { formatRupiah } from "../utils/format";

const router = useRouter();
const cart = useCartStore();
const userStore = useUserStore();
const themeStore = useThemeStore();

const totalItems = computed(() => cart.totalItems);
const isScrolled = ref(false);
const showProfileMenu = ref(false);
const authForm = reactive({ username: "", password: "" });
const isAuthLoading = ref(false);

// --- STATE ALERT IOS ---
const alertState = reactive({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
});

const handleScroll = () => {
    isScrolled.value = window.scrollY > 20;
};
onMounted(() => window.addEventListener("scroll", handleScroll));
onUnmounted(() => window.removeEventListener("scroll", handleScroll));

const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
};

const memberName = computed(() => {
    if (userStore.memberData?.displayName)
        return userStore.memberData.displayName.split(" ")[0];
    if (userStore.user?.displayName)
        return userStore.user.displayName.split(" ")[0];
    return "Kakak";
});

// --- FUNGSI KE SETTINGS ---
const goToSettings = () => {
    showProfileMenu.value = false;
    router.push("/member/settings");
};

// --- FUNGSI LOGOUT DENGAN KONFIRMASI IOS ---
const confirmLogout = () => {
    showProfileMenu.value = false; // Tutup dropdown menu

    alertState.title = "Keluar Akun?";
    alertState.message =
        "Kamu harus login lagi nanti untuk mengakses fitur member.";
    alertState.isOpen = true;
    alertState.onConfirm = async () => {
        await userStore.logout();
        alertState.isOpen = false;
    };
};

const handleNavbarAuth = async () => {
    if (!authForm.username || !authForm.password) {
        alert("Username & Password wajib diisi!");
        return;
    }
    isAuthLoading.value = true;
    const success = await userStore.login(authForm.username, authForm.password);
    isAuthLoading.value = false;
    if (success) {
        userStore.toggleAuthModal(false);
        authForm.username = "";
        authForm.password = "";
    }
};

const openCart = () => {
    cart.toggleCart();
};
</script>

<template>
    <header
        class="sticky top-0 z-50 transition-all duration-300 border-b"
        :class="
            isScrolled
                ? 'bg-white/90 dark:bg-charcoal/90 backdrop-blur-md border-sky-100 dark:border-white/5 shadow-sm'
                : 'bg-transparent border-transparent'
        "
    >
        <nav
            class="mx-auto flex max-w-6xl items-center justify-between px-4 md:px-6 py-3 md:py-4"
        >
            <button
                class="flex items-center gap-3 focus:outline-none group text-left rounded-2xl p-1 -ml-1 transition"
                @click="scrollToSection('home')"
            >
                <div
                    class="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-xl md:rounded-2xl bg-gradient-to-br from-sky-400 via-cyan-400 to-emerald-300 shadow-md group-hover:scale-105 transition-transform duration-300"
                >
                    <Cloud
                        :size="20"
                        class="text-white fill-white/20 md:hidden"
                    />
                    <Cloud
                        :size="26"
                        class="text-white fill-white/20 hidden md:block"
                    />
                </div>
                <div class="leading-tight">
                    <p
                        class="text-base md:text-lg font-bold tracking-tight text-slate-700 dark:text-slate-200"
                    >
                        Aiya<span class="text-sky-500">Shop</span
                        ><span class="text-amber-400 ml-0.5">✨</span>
                    </p>
                    <p
                        class="hidden md:block text-xs font-medium text-slate-400 group-hover:text-sky-400 transition-colors"
                    >
                        Teman Joki Sky Kamu ☁️
                    </p>
                </div>
            </button>

            <div
                class="hidden md:flex items-center gap-3 text-sm font-medium text-slate-500 dark:text-slate-400"
            >
                <button
                    class="rounded-full px-4 py-2 hover:bg-sky-50 dark:hover:bg-white/5 hover:text-sky-500 transition"
                    @click="scrollToSection('home')"
                >
                    Beranda
                </button>
                <button
                    class="rounded-full px-4 py-2 hover:bg-sky-50 dark:hover:bg-white/5 hover:text-sky-500 transition"
                    @click="scrollToSection('services')"
                >
                    Menu Jajan
                </button>
                <div
                    class="h-5 w-[1px] bg-slate-200 dark:bg-slate-700 mx-1"
                ></div>

                <button
                    @click="themeStore.toggleTheme"
                    class="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 hover:text-amber-500 hover:border-amber-300 hover:bg-amber-50 transition btn-bouncy dark:bg-slate-800 dark:border-slate-700 dark:hover:text-amber-300 dark:hover:bg-slate-700"
                >
                    <component
                        :is="themeStore.isDark ? Sun : Moon"
                        :size="16"
                        :class="themeStore.isDark ? 'text-amber-400' : ''"
                    />
                </button>

                <div
                    v-if="userStore.loading"
                    class="w-20 h-8 bg-slate-100 dark:bg-slate-800 rounded-full animate-pulse"
                ></div>
                <button
                    v-else-if="!userStore.user"
                    @click="userStore.toggleAuthModal(true)"
                    class="btn-bouncy px-5 py-2 rounded-full bg-slate-800 text-white text-xs font-bold shadow-md hover:bg-slate-700 flex items-center gap-2 border border-slate-700 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
                >
                    <LogIn :size="14" /> Member Login
                </button>

                <div v-else class="relative">
                    <button
                        @click="showProfileMenu = !showProfileMenu"
                        class="flex items-center gap-2 pl-1 pr-4 py-1 rounded-full border border-sky-100 bg-sky-50/50 hover:bg-sky-100 transition group dark:bg-slate-800 dark:border-slate-700 dark:hover:bg-slate-700"
                    >
                        <div
                            class="w-9 h-9 rounded-full bg-white dark:bg-slate-900 flex items-center justify-center text-sky-600 font-bold border border-sky-200 dark:border-slate-600 uppercase shadow-sm group-hover:scale-105 transition-transform"
                        >
                            {{ memberName[0] }}
                        </div>
                        <div class="text-left leading-none hidden lg:block">
                            <p class="text-[10px] text-slate-400 font-bold">
                                Hi, {{ memberName }}
                            </p>
                            <p
                                class="text-xs font-bold text-sky-600 dark:text-sky-400"
                            >
                                {{ formatRupiah(userStore.memberData?.saldo) }}
                            </p>
                        </div>
                    </button>
                    <div
                        v-if="showProfileMenu"
                        class="absolute top-full right-0 mt-3 w-56 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-sky-100 dark:border-slate-700 overflow-hidden py-1 animate-in fade-in zoom-in-95 duration-200"
                    >
                        <div
                            class="px-5 py-4 border-b border-slate-50 dark:border-slate-700 bg-gradient-to-r from-sky-50 to-white dark:from-slate-800 dark:to-slate-800"
                        >
                            <p
                                class="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1"
                            >
                                Saldo Member
                            </p>
                            <p
                                class="text-xl font-extrabold text-sky-600 dark:text-sky-400"
                            >
                                {{ formatRupiah(userStore.memberData?.saldo) }}
                            </p>
                        </div>

                        <button
                            @click="goToSettings"
                            class="w-full text-left px-5 py-3 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 flex items-center gap-2 transition-colors border-b border-slate-50 dark:border-slate-700"
                        >
                            <Settings :size="16" /> Pengaturan
                        </button>

                        <button
                            @click="confirmLogout"
                            class="w-full text-left px-5 py-3 text-sm text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 flex items-center gap-2 transition-colors"
                        >
                            <LogOut :size="16" /> Keluar
                        </button>
                    </div>
                </div>
                <button
                    class="relative ml-1 flex h-11 w-11 items-center justify-center rounded-full border border-sky-100 bg-white hover:bg-sky-50 hover:border-sky-200 transition btn-bouncy dark:bg-slate-800 dark:border-slate-700 dark:hover:bg-slate-700"
                    @click="openCart"
                >
                    <ShoppingBag
                        :size="20"
                        class="text-slate-400 hover:text-sky-500 dark:text-slate-300"
                    />
                    <span
                        v-if="totalItems > 0"
                        class="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-400 text-[10px] font-bold text-white shadow-sm ring-2 ring-white dark:ring-slate-900 animate-bounce"
                        >{{ totalItems }}</span
                    >
                </button>
            </div>

            <div class="flex items-center gap-2 md:hidden">
                <button
                    @click="themeStore.toggleTheme"
                    class="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100/50 dark:bg-slate-800 text-slate-400 transition active:scale-90"
                >
                    <component
                        :is="themeStore.isDark ? Sun : Moon"
                        :size="18"
                        :class="themeStore.isDark ? 'text-amber-400' : ''"
                    />
                </button>
            </div>
        </nav>

        <transition name="fade">
            <div
                v-if="userStore.showAuthModal"
                class="fixed inset-0 z-[100] flex items-center justify-center p-4"
            >
                <div
                    class="absolute inset-0 bg-slate-900/30 backdrop-blur-sm transition-opacity"
                    @click="userStore.toggleAuthModal(false)"
                ></div>
                <div
                    class="bg-cream dark:bg-slate-800 w-full max-w-sm rounded-[2rem] shadow-2xl relative z-10 animate-in fade-in zoom-in-95 duration-200 p-8 border-4 border-indigo-50 dark:border-indigo-900"
                >
                    <button
                        @click="userStore.toggleAuthModal(false)"
                        class="absolute top-4 right-4 p-1 text-slate-400 hover:text-rose-500 bg-slate-50 dark:bg-slate-700 rounded-full transition"
                    >
                        <X :size="20" />
                    </button>
                    <div class="text-center mb-6">
                        <div
                            class="inline-flex items-center justify-center w-14 h-14 bg-indigo-100 dark:bg-indigo-900/50 rounded-full mb-3 text-indigo-600 dark:text-indigo-400"
                        >
                            <LogIn :size="28" />
                        </div>
                        <h3
                            class="text-2xl font-bold text-slate-700 dark:text-white"
                        >
                            Area Member
                        </h3>
                        <p class="text-slate-400 text-xs mt-1">
                            Silakan masuk menggunakan akun yang diberikan admin.
                        </p>
                    </div>
                    <div class="space-y-3">
                        <div class="relative group">
                            <div
                                class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500"
                            >
                                <User :size="18" />
                            </div>
                            <input
                                v-model="authForm.username"
                                type="text"
                                placeholder="Username Member"
                                class="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900 transition font-bold text-slate-600 dark:text-slate-200"
                            />
                        </div>
                        <input
                            v-model="authForm.password"
                            type="password"
                            placeholder="Password"
                            class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900 transition font-bold text-slate-600 dark:text-slate-200"
                        />
                    </div>
                    <p
                        v-if="userStore.authError"
                        class="text-xs text-rose-500 mt-3 font-bold flex items-center gap-1 justify-center"
                    >
                        <AlertCircle :size="12" /> {{ userStore.authError }}
                    </p>
                    <button
                        @click="handleNavbarAuth"
                        :disabled="isAuthLoading"
                        class="w-full mt-6 btn-bouncy bg-indigo-600 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-indigo-200 dark:shadow-none flex justify-center items-center gap-2 disabled:opacity-50"
                    >
                        <Loader2
                            v-if="isAuthLoading"
                            :size="18"
                            class="animate-spin"
                        />
                        Masuk Akun
                    </button>
                    <div
                        class="mt-6 pt-4 border-t border-slate-100 dark:border-slate-700 text-center"
                    >
                        <p class="text-[10px] text-slate-400 mb-1">
                            Belum punya akun member?
                        </p>
                        <a
                            href="https://wa.me/6285942963323?text=Halo%20Admin%20Aiya!%20Saya%20mau%20daftar%20member%20dong%20✨"
                            target="_blank"
                            class="text-xs text-indigo-500 dark:text-indigo-400 font-bold hover:underline flex items-center justify-center gap-1"
                            >Hubungi Admin via WhatsApp <UserPlus :size="12"
                        /></a>
                    </div>
                </div>
            </div>
        </transition>

        <Teleport to="body">
            <transition name="fade">
                <div
                    v-if="alertState.isOpen"
                    class="fixed inset-0 z-[9999] flex items-center justify-center p-4"
                >
                    <div
                        class="absolute inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity"
                        @click="alertState.isOpen = false"
                    ></div>
                    <div
                        class="bg-white/95 dark:bg-[#1C1C1E]/95 backdrop-blur-2xl w-full max-w-[270px] rounded-[18px] shadow-2xl relative z-10 overflow-hidden text-center animate-in zoom-in-105 duration-200"
                    >
                        <div class="p-5 pb-5">
                            <h3
                                class="text-[17px] font-bold text-slate-900 dark:text-white mb-1 leading-snug"
                            >
                                {{ alertState.title }}
                            </h3>
                            <p
                                class="text-[13px] text-slate-500 dark:text-slate-400 leading-relaxed"
                            >
                                {{ alertState.message }}
                            </p>
                        </div>
                        <div
                            class="flex border-t border-slate-200/50 dark:border-white/10 divide-x divide-slate-200/50 dark:divide-white/10"
                        >
                            <button
                                @click="alertState.isOpen = false"
                                class="flex-1 py-3.5 text-[17px] font-normal text-blue-500 hover:bg-slate-50 dark:hover:bg-white/5 transition active:opacity-70"
                            >
                                Batal
                            </button>
                            <button
                                @click="alertState.onConfirm"
                                class="flex-1 py-3.5 text-[17px] font-bold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition active:opacity-70"
                            >
                                Keluar
                            </button>
                        </div>
                    </div>
                </div>
            </transition>
        </Teleport>
    </header>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
    opacity: 0;
    transform: translateY(-10px);
}
</style>