<script setup>
import { ref, computed, nextTick, reactive, onMounted } from "vue";
import { products as defaultProducts } from "../data/products";
import { useProductsStore } from "../stores/products";
import { useUserStore } from "../stores/user";
import ProductCard from "../components/ProductCard.vue";
import ProductSkeleton from "../components/ProductSkeleton.vue"; // IMPORT SKELETON
import MemberCard from "../components/MemberCard.vue";
import ProductActionModal from "../components/ProductActionModal.vue";
import TransactionHistoryModal from "../components/TransactionHistoryModal.vue";
import {
    Wind,
    Heart,
    Star,
    ShieldCheck,
    Plus,
    Crown,
    ChevronRight,
    MessageCircle,
    HelpCircle,
    ChevronDown,
    Lock,
    Clock,
    Gift,
    Cloud,
    History,
    Sparkles,
    LogOut,
    CheckCircle2,
    Settings,
} from "lucide-vue-next";
import { useRouter } from "vue-router";

import skykidMoth from "../assets/moth.gif";
import skykidWebm from "../assets/skykid.webm";
import skykidMp4 from "../assets/skykid.mp4";


const router = useRouter();
const userStore = useUserStore();
const productsStore = useProductsStore();
const activeCategory = ref("all");
const selectedProduct = ref(null);
const showProductModal = ref(false);
const showHistoryModal = ref(false);
const activeFaqIndex = ref(null);

const isEditingName = ref(false);
const newNameInput = ref("");
const nameInputRef = ref(null);

// LOADING STATE
const isLoading = ref(true);

// IOS ALERT STATE
const alertState = reactive({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
});

// LOAD PRODUCTS (Firestore) + minimum skeleton delay
onMounted(async () => {
    const start = Date.now();
    await productsStore.fetchAll({ fallback: defaultProducts });
    const elapsed = Date.now() - start;
    const minDelay = 650; // biar transisi kerasa premium tapi ga kelamaan
    const wait = Math.max(0, minDelay - elapsed);
    setTimeout(() => {
        isLoading.value = false;
    }, wait);
});
const timeGreeting = computed(() => {
    const hour = new Date().getHours();
    if (hour < 11) return "Selamat Pagi";
    if (hour < 15) return "Selamat Siang";
    if (hour < 18) return "Selamat Sore";
    return "Selamat Malam";
});

const filteredProducts = computed(() => {
    const list = productsStore.activeProducts;
    if (activeCategory.value === "all") return list;
    return list.filter((p) => p.category === activeCategory.value);
});


const scrollToServices = () => {
    document.getElementById("services").scrollIntoView({ behavior: "smooth" });
};
const memberName = computed(() => {
    if (userStore.memberData?.displayName)
        return userStore.memberData.displayName.split(" ")[0];
    if (userStore.user?.displayName)
        return userStore.user.displayName.split(" ")[0];
    return "Kakak";
});

const startEditName = () => {
    newNameInput.value =
        userStore.memberData?.displayName || userStore.user?.displayName || "";
    isEditingName.value = true;
    nextTick(() => nameInputRef.value?.focus());
};

const saveName = async () => {
    if (newNameInput.value.trim())
        await userStore.updateUserName(newNameInput.value.trim());
    isEditingName.value = false;
};

// ACTIONS
const handleTopUp = () => {
    router.push("/top-up");
};
const handleJoinMember = () => {
    router.push("/join");
};

// LOGOUT WITH ALERT
const confirmLogout = () => {
    alertState.title = "Keluar Akun?";
    alertState.message = "Yakin ingin keluar? Sesi loginmu akan berakhir.";
    alertState.isOpen = true;
    alertState.onConfirm = async () => {
        await userStore.logout();
        alertState.isOpen = false;
    };
};

const openProductDetail = (product) => {
    selectedProduct.value = product;
    showProductModal.value = true;
};

const categories = [
    { id: "all", label: "Semua", icon: Sparkles },
    { id: "candlerun", label: "Candle Run", icon: Wind },
    { id: "heart", label: "Heart & Gift", icon: Heart },
    { id: "special", label: "Special / Jasa", icon: Star },
];

const steps = [
    {
        title: "Pilih Paket",
        desc: "Pilih produk yang kamu mau.",
        icon: Sparkles,
        color: "text-sky-500 bg-sky-100 dark:bg-sky-900/30",
        emoji: "🛒",
    },
    {
        title: "Kirim Data",
        desc: "Login via Link/QR (Aman 100%).",
        icon: Lock,
        color: "text-rose-500 bg-rose-100 dark:bg-rose-900/30",
        emoji: "🔐",
    },
    {
        title: "Proses Joki",
        desc: "Admin mengerjakan pesanan.",
        icon: Clock,
        color: "text-amber-500 bg-amber-100 dark:bg-amber-900/30",
        emoji: "⚡",
    },
    {
        title: "Selesai!",
        desc: "Terima bukti & bisa login lagi.",
        icon: CheckCircle2,
        color: "text-emerald-500 bg-emerald-100 dark:bg-emerald-900/30",
        emoji: "🎉",
    },
];

const faqs = [
    {
        q: "Apakah akun saya aman?",
        a: "Aman 100%! Kita pakai login via Link/QR Nintendo/Playstation. Gak perlu password email utama.",
        emoji: "🔒",
    },
    {
        q: "Metode login apa saja?",
        a: "Google, Nintendo, PS, Huawei, FB, Apple ID, Email.",
        emoji: "📱",
    },
    {
        q: "Lama pengerjaan CR?",
        a: "Full Run 1.5 - 2 jam. CR Kilat lebih cepat.",
        emoji: "⏰",
    },
    {
        q: "Heart dikirim instant?",
        a: "Limit 1 heart/akun/hari. 10 heart pakai 5 bot = 2 hari.",
        emoji: "💖",
    },
];
</script>

<template>
    <div class="overflow-x-hidden">
        <!-- UX: Hero section optimized for mobile-first - fits single viewport -->
        <section
            id="home"
            class="pt-20 pb-8 md:pt-36 md:pb-20 px-4 md:px-6 relative overflow-hidden bg-cream dark:bg-charcoal transition-colors duration-500"
        >
            <!-- UX: Decorative clouds hidden on mobile to reduce visual noise -->
            <div
                class="absolute top-0 right-0 w-full h-full pointer-events-none overflow-hidden hidden md:block"
            >
                <Cloud
                    :size="120"
                    class="absolute top-20 -right-20 text-sky-100 dark:text-white/5 animate-float-slow opacity-60"
                />
                <Cloud
                    :size="80"
                    class="absolute top-40 -left-10 text-indigo-50 dark:text-white/5 animate-float-fast opacity-40 delay-1000"
                />
            </div>

            <div
                class="container mx-auto max-w-6xl flex flex-col md:grid md:grid-cols-2 gap-8 md:gap-12 items-center relative z-10"
            >
                <div
                    class="relative w-full flex justify-center items-center order-1 md:order-2 animate-in fade-in zoom-in duration-700 delay-200"
                >
                    <div
                        class="w-64 h-64 md:w-96 md:h-96 relative flex items-center justify-center"
                    >
                        <div
                            class="absolute inset-0 border border-sky-300/30 dark:border-white/10 rounded-full animate-spin-slow scale-125"
                        ></div>
                        <div
                            class="absolute inset-4 border border-dashed border-indigo-300/30 dark:border-white/10 rounded-full animate-spin-reverse-slow scale-110"
                        ></div>
                        <div
                            class="absolute inset-0 bg-indigo-400/20 dark:bg-indigo-500/10 rounded-full blur-3xl animate-pulse-slow"
                        ></div>
                        <div
                            class="absolute inset-4 md:inset-0 bg-gradient-to-br from-sky-100 to-indigo-50 dark:from-slate-800 dark:to-slate-900 rounded-blob shadow-2xl border border-white/50 dark:border-white/5 animate-float-slow"
                        ></div>
                        <div
                            class="absolute inset-8 md:inset-4 bg-white/40 dark:bg-white/5 rounded-blob backdrop-blur-sm border border-white/20 dark:border-white/5 animate-float-slow delay-150"
                        ></div>
                        <video
                            class="relative z-10 w-48 h-48 md:w-72 md:h-72 object-contain scale-110 hover:scale-125 transition-transform duration-500 -mt-2 animate-float-smooth"
                            autoplay
                            muted
                            loop
                            playsinline
                            preload="metadata"
                            disablepictureinpicture
                            aria-label="Sky Kid Mascot"
                        >
                            <source :src="skykidWebm" type="video/webm" />
                            <source :src="skykidMp4" type="video/mp4" />
                        </video>
                        <div
                            class="absolute -bottom-4 md:-bottom-6 bg-white/90 dark:bg-slate-800/90 backdrop-blur px-4 py-2 md:px-5 md:py-3 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700 flex items-center gap-2 md:gap-3 animate-bounce-slow z-20"
                        >
                            <div
                                class="w-2.5 h-2.5 md:w-3 md:h-3 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.5)]"
                            ></div>
                            <span
                                class="text-[10px] md:text-xs font-bold text-slate-600 dark:text-slate-300"
                                >Open 10.00 - 23.00 WIB</span
                            >
                        </div>
                    </div>
                </div>

                <div
                    class="text-center md:text-left order-2 md:order-1 animate-in fade-in slide-in-from-bottom-8 duration-700 w-full"
                >
                    <div v-if="userStore.user" class="space-y-6 md:space-y-8">
                        <div>
                            <div
                                class="flex items-center justify-center md:justify-start gap-3 mb-2"
                            >
                                <p
                                    class="text-xs md:text-sm font-bold text-sky-500 dark:text-sky-400 tracking-widest uppercase flex items-center gap-2"
                                >
                                    <Sparkles :size="14" /> Member Dashboard
                                </p>
                                <video
                                    class="w-8 h-8 object-contain md:hidden animate-bounce-slow"
                                    autoplay
                                    muted
                                    loop
                                    playsinline
                                    preload="metadata"
                                    disablepictureinpicture
                                    aria-label="Sky Kid Mascot"
                                >
                                    <source
                                        :src="skykidWebm"
                                        type="video/webm"
                                    />
                                    <source :src="skykidMp4" type="video/mp4" />
                                </video>
                            </div>
                            <h1
                                class="text-2xl md:text-5xl font-bold text-slate-800 dark:text-slate-100 leading-tight"
                            >
                                {{ timeGreeting }},
                                <span
                                    class="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500 cursor-pointer"
                                    @click="startEditName"
                                    >{{ memberName }}!</span
                                >
                            </h1>
                        </div>
                        <div
                            class="relative max-w-[340px] md:max-w-[380px] mx-auto md:mx-0 z-20"
                        >
                            <MemberCard />
                        </div>

                        <div
                            class="flex flex-col gap-3 max-w-[340px] md:max-w-[380px] mx-auto md:mx-0"
                        >
                            <div
                                class="grid grid-cols-3 gap-3 p-1.5 rounded-2xl bg-white/50 dark:bg-black/20 border border-white/50 dark:border-white/5 shadow-sm backdrop-blur-sm"
                            >
                                <button
                                    @click="handleTopUp"
                                    class="flex flex-col items-center justify-center gap-1.5 py-3 rounded-xl hover:bg-white dark:hover:bg-slate-700/50 transition duration-300 group active:scale-95"
                                >
                                    <div
                                        class="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-500/20 text-indigo-500 group-hover:text-indigo-600 transition"
                                    >
                                        <Plus :size="18" />
                                    </div>
                                    <span
                                        class="text-[10px] font-bold text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200"
                                        >Isi Saldo</span
                                    >
                                </button>
                                <button
                                    @click="showHistoryModal = true"
                                    class="flex flex-col items-center justify-center gap-1.5 py-3 rounded-xl hover:bg-white dark:hover:bg-slate-700/50 transition duration-300 group active:scale-95"
                                >
                                    <div
                                        class="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-500/20 text-emerald-500 group-hover:text-emerald-600 transition"
                                    >
                                        <History :size="18" />
                                    </div>
                                    <span
                                        class="text-[10px] font-bold text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200"
                                        >Riwayat</span
                                    >
                                </button>
                                <button
                                    @click="confirmLogout"
                                    class="flex flex-col items-center justify-center gap-1.5 py-3 rounded-xl hover:bg-white dark:hover:bg-slate-700/50 transition duration-300 group active:scale-95"
                                >
                                    <div
                                        class="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-500/20 text-rose-500 group-hover:text-rose-600 transition"
                                    >
                                        <LogOut :size="18" />
                                    </div>
                                    <span
                                        class="text-[10px] font-bold text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200"
                                        >Keluar</span
                                    >
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- UX: Mobile-first guest hero - compact, focused on quick action -->
                    <div v-else class="space-y-4 md:space-y-6">
                        <div
                            class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-slate-800 border border-sky-100 dark:border-slate-700 text-sky-500 dark:text-sky-400 text-xs font-bold shadow-sm"
                        >
                            <Sparkles :size="14" class="text-amber-400" />
                            <span>Jasa Joki Terpercaya</span>
                        </div>
                        <h1
                            class="text-2xl md:text-6xl font-black text-slate-800 dark:text-slate-100 leading-tight"
                        >
                            Kamu Rebahan,<br />
                            <span
                                class="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-cyan-400"
                                >Aiya yang Lariin</span
                            >
                        </h1>
                        <!-- UX: Short value proposition - one line on mobile -->
                        <p
                            class="text-sm md:text-lg text-slate-500 dark:text-slate-400 font-medium leading-relaxed"
                        >
                            Urusan grinding serahin ke ahlinya ✨
                        </p>
                        <!-- UX: Two primary CTAs only, 44px+ touch targets -->
                        <div
                            class="flex flex-col gap-3 justify-center md:justify-start pt-1"
                        >
                            <button
                                @click="scrollToServices"
                                class="btn-bouncy w-full md:w-auto px-8 py-3.5 min-h-[44px] bg-gradient-to-r from-sky-500 to-cyan-500 text-white rounded-xl font-bold shadow-lg flex items-center justify-center gap-2 text-base"
                            >
                                Lihat Menu Jajan <ChevronRight :size="18" />
                            </button>
                            <button
                                @click="handleJoinMember"
                                class="w-full md:w-auto px-8 py-3.5 min-h-[44px] bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-slate-700 rounded-xl font-bold transition flex items-center justify-center gap-2 text-base"
                            >
                                <Crown :size="18" /> Join Member
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Wave divider hero → steps -->
        <div v-if="!userStore.user" class="relative -mt-1">
            <svg viewBox="0 0 1440 50" class="w-full h-auto fill-white dark:fill-charcoal" preserveAspectRatio="none">
                <path d="M0,50 L0,20 Q360,0 720,25 Q1080,50 1440,20 L1440,50 Z" />
            </svg>
        </div>

        <!-- ===== HOW IT WORKS (Timeline) ===== -->
        <section
            v-if="!userStore.user"
            class="py-10 md:py-14 px-6 bg-white dark:bg-charcoal relative overflow-hidden"
        >
            <!-- Floating decorations -->
            <div class="absolute inset-0 pointer-events-none overflow-hidden">
                <span class="absolute top-6 left-[8%] text-sky-200/20 dark:text-white/5 text-2xl animate-float-slow">☁️</span>
                <span class="absolute bottom-8 right-[12%] text-amber-200/20 dark:text-amber-500/5 text-lg animate-float-fast">✨</span>
            </div>

            <div class="container mx-auto max-w-3xl relative z-10">
                <div class="text-center mb-10">
                    <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-sky-50 dark:bg-sky-900/10 border border-sky-100 dark:border-sky-800/20 text-sky-500 text-xs font-bold mb-3">
                        <Sparkles :size="12" /> Super Gampang
                    </div>
                    <h2 class="text-xl md:text-2xl font-black text-slate-800 dark:text-slate-100 mb-2">
                        Cara Order Anti Ribet ✌️
                    </h2>
                    <p class="text-xs md:text-sm text-slate-500 dark:text-slate-400">
                        Pesan joki semudah update status.
                    </p>
                </div>

                <!-- Timeline -->
                <div class="relative">
                    <!-- Connecting line (vertical on mobile, horizontal on desktop) -->
                    <div class="hidden md:block absolute top-7 left-[12%] right-[12%] h-0.5 border-t-2 border-dashed border-slate-200 dark:border-slate-700 z-0"></div>
                    <div class="md:hidden absolute top-0 bottom-0 left-7 w-0.5 border-l-2 border-dashed border-slate-200 dark:border-slate-700 z-0"></div>

                    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-4 relative z-10">
                        <div
                            v-for="(step, i) in steps"
                            :key="i"
                            class="step-item flex md:flex-col items-start md:items-center gap-4 md:gap-2 text-left md:text-center"
                            :style="{ animationDelay: `${i * 150}ms` }"
                        >
                            <!-- Step circle -->
                            <div class="relative shrink-0">
                                <div
                                    class="w-14 h-14 rounded-2xl flex items-center justify-center border-2 border-white dark:border-charcoal shadow-md bg-white dark:bg-slate-800 step-icon-float"
                                >
                                    <span class="text-xl">{{ step.emoji }}</span>
                                </div>
                                <!-- Step number -->
                                <div
                                    class="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black text-white shadow-sm"
                                    :class="step.color.split(' ')[1]"
                                >
                                    {{ i + 1 }}
                                </div>
                            </div>

                            <div class="md:mt-2">
                                <h3 class="font-bold text-slate-800 dark:text-slate-200 text-sm mb-0.5">
                                    {{ step.title }}
                                </h3>
                                <p class="text-[10px] md:text-xs text-slate-500 dark:text-slate-400 leading-snug">
                                    {{ step.desc }}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Wave divider steps → services -->
        <div class="relative -mb-1">
            <svg viewBox="0 0 1440 50" class="w-full h-auto" preserveAspectRatio="none">
                <path d="M0,0 L0,30 Q360,50 720,25 Q1080,0 1440,30 L1440,0 Z" :class="!userStore.user ? 'fill-white dark:fill-charcoal' : 'fill-cream dark:fill-charcoal'" />
            </svg>
        </div>

        <!-- ===== PRODUCTS / MENU JAJAN ===== -->
        <section
            id="services"
            class="py-10 md:py-24 px-4 md:px-6 bg-gradient-to-b from-slate-50/80 via-white/30 to-cream dark:from-slate-900/30 dark:via-charcoal dark:to-charcoal relative overflow-hidden"
        >
            <!-- Floating decoration -->
            <div class="absolute inset-0 pointer-events-none overflow-hidden">
                <span class="absolute top-12 right-[8%] text-rose-200/15 dark:text-rose-500/5 text-3xl animate-float-slow" style="animation-delay: 1s">❤️</span>
                <span class="absolute bottom-20 left-[5%] text-sky-200/15 dark:text-white/5 text-2xl animate-float-fast">☁️</span>
            </div>

            <div class="container mx-auto max-w-6xl relative z-10">
                <div class="text-center mb-8 relative">
                    <h2
                        class="text-2xl md:text-4xl font-black text-slate-800 dark:text-slate-100 mb-2 flex items-center justify-center gap-2"
                    >
                        Menu Jajan
                        <div class="relative">
                            <img
                                :src="skykidMoth"
                                class="w-8 h-8 md:w-10 md:h-10 -mt-2 animate-bounce relative z-10"
                            />
                            <Star
                                :size="24"
                                class="absolute -top-1 -right-2 text-amber-400 fill-amber-400 animate-spin-slow opacity-80"
                            />
                        </div>
                    </h2>
                    <p
                        class="text-xs md:text-base text-slate-500 dark:text-slate-400"
                    >
                        Pilih paket joki sesuai kebutuhanmu.
                    </p>
                </div>

                <!-- Category pills with icons -->
                <div
                    class="flex justify-start md:justify-center gap-2 mb-8 overflow-x-auto pb-2 px-2 snap-x"
                >
                    <button
                        v-for="cat in categories"
                        :key="cat.id"
                        @click="activeCategory = cat.id"
                        class="snap-center shrink-0 px-4 py-2.5 rounded-full text-xs md:text-sm font-bold border transition-all duration-300 flex items-center gap-1.5 cat-pill"
                        :class="
                            activeCategory === cat.id
                                ? 'bg-sky-500 text-white border-sky-500 shadow-md shadow-sky-200/40 dark:shadow-none scale-105'
                                : 'bg-white dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700 hover:border-sky-200 dark:hover:border-sky-800'
                        "
                    >
                        <component :is="cat.icon" :size="14" :class="activeCategory === cat.id ? 'text-white' : 'text-slate-400'" />
                        {{ cat.label }}
                    </button>
                </div>

                <div
                    class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8 mb-12"
                >
                    <template v-if="isLoading">
                        <ProductSkeleton v-for="n in 6" :key="n" />
                    </template>

                    <template v-else>
                        <ProductCard
                            v-for="product in filteredProducts"
                            :key="product.id"
                            :product="product"
                            @open-detail="openProductDetail"
                        />
                    </template>
                </div>
            </div>
        </section>

        <!-- Wave divider products → FAQ -->
        <div class="relative -mt-1">
            <svg viewBox="0 0 1440 50" class="w-full h-auto fill-cream dark:fill-charcoal" preserveAspectRatio="none">
                <path d="M0,50 L0,25 Q240,0 480,30 Q720,55 960,20 Q1200,-5 1440,25 L1440,50 Z" />
            </svg>
        </div>

        <!-- ===== FAQ SECTION ===== -->
        <section
            class="py-12 px-6 bg-gradient-to-b from-cream to-amber-50/30 dark:from-charcoal dark:to-slate-950/50 relative overflow-hidden"
        >
            <!-- Playful background dots pattern -->
            <div class="absolute inset-0 pointer-events-none overflow-hidden">
                <span class="absolute top-10 left-[15%] text-amber-200/20 dark:text-amber-800/10 text-xl animate-float-slow">✦</span>
                <span class="absolute top-1/3 right-[10%] text-rose-200/15 dark:text-rose-800/10 text-2xl animate-float-fast" style="animation-delay: 2s">❤️</span>
                <span class="absolute bottom-16 left-[8%] text-sky-200/15 dark:text-sky-800/10 text-lg animate-float-slow" style="animation-delay: 1s">☁️</span>
            </div>

            <div class="container mx-auto max-w-3xl relative z-10">
                <div class="text-center mb-8">
                    <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-800/20 text-rose-500 text-xs font-bold mb-3">
                        <HelpCircle :size="12" /> FAQ
                    </div>
                    <h2
                        class="text-2xl md:text-3xl font-black text-slate-800 dark:text-slate-100"
                    >
                        Punya Pertanyaan? 🤔
                    </h2>
                    <p class="text-xs text-slate-400 dark:text-slate-500 mt-1">Jawaban buat pertanyaan yang sering ditanya</p>
                </div>
                <div class="space-y-3">
                    <div
                        v-for="(faq, i) in faqs"
                        :key="i"
                        class="faq-card border rounded-2xl overflow-hidden transition-all duration-300"
                        :class="
                            activeFaqIndex === i
                                ? 'border-sky-200 dark:border-sky-900 bg-sky-50/80 dark:bg-sky-900/10 shadow-md shadow-sky-100/30 dark:shadow-none'
                                : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-200 dark:hover:border-slate-700 hover:shadow-sm'
                        "
                    >
                        <button
                            @click="
                                activeFaqIndex = activeFaqIndex === i ? null : i
                            "
                            class="w-full flex justify-between items-center p-4 md:p-5 text-left font-bold text-slate-700 dark:text-slate-200 transition group"
                        >
                            <span class="flex items-center gap-2.5 flex-1 pr-4 text-sm md:text-base">
                                <span class="text-lg shrink-0 group-hover:scale-110 transition-transform duration-200">{{ faq.emoji }}</span>
                                {{ faq.q }}
                            </span>
                            <ChevronDown
                                :size="18"
                                :class="{
                                    'rotate-180 text-sky-500':
                                        activeFaqIndex === i,
                                }"
                                class="shrink-0 transition-transform duration-300 text-slate-400"
                            />
                        </button>
                        <transition name="faq-expand">
                            <div
                                v-if="activeFaqIndex === i"
                                class="px-4 pb-4 text-xs md:text-sm text-slate-600 dark:text-slate-400 leading-relaxed border-t border-dashed border-sky-200/60 dark:border-sky-900/40 pt-3 ml-10"
                            >
                                {{ faq.a }}
                            </div>
                        </transition>
                    </div>
                </div>

                <!-- WhatsApp CTA (more prominent) -->
                <div
                    class="mt-10 text-center relative"
                >
                    <div class="p-6 md:p-8 rounded-3xl bg-gradient-to-br from-green-50 via-emerald-50/60 to-teal-50/40 dark:from-emerald-950/20 dark:via-green-950/10 dark:to-charcoal border border-green-100/60 dark:border-green-800/20 shadow-lg shadow-green-100/20 dark:shadow-none">
                        <!-- Glow ring behind -->
                        <div class="absolute inset-0 rounded-3xl bg-green-400/5 dark:bg-green-500/5 blur-xl pointer-events-none"></div>
                        
                        <div class="relative z-10">
                            <div class="inline-flex items-center justify-center w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-2xl mb-3 text-green-500 rotate-3">
                                <MessageCircle :size="24" />
                            </div>
                            <p class="text-slate-600 dark:text-slate-300 mb-1 font-bold text-sm md:text-base">
                                Masih ragu atau punya request khusus?
                            </p>
                            <p class="text-slate-400 dark:text-slate-500 mb-5 text-xs">
                                Join channel kami untuk info & update terbaru ⚡
                            </p>
                            <a
                                href="https://whatsapp.com/channel/0029VbCf7UM5Ejy7XKh8Z31u"
                                target="_blank"
                                class="inline-flex items-center gap-2 px-7 py-3.5 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-xl font-bold shadow-lg shadow-green-200/50 dark:shadow-none transition-all duration-300 btn-bouncy text-sm group"
                            >
                                <MessageCircle :size="18" class="group-hover:rotate-12 transition-transform" />
                                Join Channel WhatsApp
                                <ChevronRight :size="14" class="opacity-60 group-hover:translate-x-0.5 transition-transform" />
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <Teleport to="body">
            <ProductActionModal
                :isOpen="showProductModal"
                :product="selectedProduct"
                @close="showProductModal = false"
            />
            <transition name="fade">
                <TransactionHistoryModal
                    v-if="showHistoryModal"
                    @close="showHistoryModal = false"
                />
            </transition>

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
    </div>
</template>

<style scoped>
.animate-spin-slow {
    animation: spin-slow 20s linear infinite;
}
.animate-spin-reverse-slow {
    animation: spin-reverse-slow 15s linear infinite;
}
.animate-pulse-slow {
    animation: pulse-slow 4s ease-in-out infinite;
}
.animate-float-particle {
    animation: float-particle 3s ease-in-out infinite;
}
.animate-float-slow {
    animation: float 6s ease-in-out infinite;
}
.animate-float-fast {
    animation: float 4s ease-in-out infinite;
}
.animate-bounce-slow {
    animation: bounce 3s infinite;
}
.animate-float-smooth {
    animation: float 5s ease-in-out infinite;
}
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
@keyframes spin-slow {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}
@keyframes spin-reverse-slow {
    0% { transform: rotate(360deg); }
    100% { transform: rotate(0deg); }
}
@keyframes pulse-slow {
    0%, 100% { opacity: 0.2; transform: scale(1); }
    50% { opacity: 0.4; transform: scale(1.1); }
}
@keyframes float-particle {
    0% { transform: translateY(0) scale(0.8); opacity: 0; }
    50% { opacity: 1; }
    100% { transform: translateY(-30px) scale(1.2); opacity: 0; }
}
@keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-15px); }
}

/* ===== STEP TIMELINE ANIMATIONS ===== */
.step-item {
    animation: step-appear 0.5s ease both;
}
@keyframes step-appear {
    from {
        opacity: 0;
        transform: translateY(16px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.step-icon-float {
    animation: step-float 3s ease-in-out infinite;
}
@keyframes step-float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-4px); }
}

/* ===== FAQ ANIMATIONS ===== */
.faq-card {
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.faq-card:active {
    transform: scale(0.98);
}

.faq-expand-enter-active {
    animation: faq-slide-down 0.3s ease;
}
.faq-expand-leave-active {
    animation: faq-slide-down 0.2s ease reverse;
}
@keyframes faq-slide-down {
    from {
        opacity: 0;
        max-height: 0;
        transform: translateY(-8px);
    }
    to {
        opacity: 1;
        max-height: 200px;
        transform: translateY(0);
    }
}

/* ===== CATEGORY PILL BOUNCE ===== */
.cat-pill {
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.cat-pill:active {
    transform: scale(0.93);
}
</style>
