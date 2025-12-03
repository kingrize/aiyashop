<!-- LOKASI FILE: src/views/HomeView.vue -->
<script setup>
import { ref, computed, nextTick } from "vue";
import { products } from "../data/products";
import { useUserStore } from "../stores/user";
import ProductCard from "../components/ProductCard.vue";
import HeartCalculator from "../components/HeartCalculator.vue";
import {
    Wind,
    Heart,
    Flame,
    Sparkles,
    Star,
    Moon,
    ShieldCheck,
    Smile,
    Calculator,
    X,
    Info,
    UserCheck,
    Wallet,
    Plus,
    Pencil,
    Check,
    Crown,
    TrendingUp,
    ChevronRight,
    MessageCircle,
    HelpCircle,
    ChevronDown,
    Lock,
    Clock,
    Gift,
    MapPin,
} from "lucide-vue-next";
import { useRouter } from "vue-router";

// IMPORT GAMBAR ASSETS
import skyKidGif from "../assets/skykid.gif";
import skykidMoth from "../assets/moth.gif";
import skyKey from "../assets/keySky.gif";

const router = useRouter();
const userStore = useUserStore();
const activeCategory = ref("all");
const showCalculatorModal = ref(false);
const activeFaqIndex = ref(null);

const isEditingName = ref(false);
const newNameInput = ref("");
const nameInputRef = ref(null);

const memberLevel = computed(() => {
    const totalSpent =
        userStore.memberData?.totalTopUp || userStore.memberData?.saldo || 0;
    if (totalSpent > 1000000)
        return {
            name: "Elder 👑",
            color: "text-amber-600 bg-amber-50 border-amber-200 dark:bg-metal/50 dark:text-amber-400 dark:border-metal",
            icon: Crown,
        };
    if (totalSpent > 500000)
        return {
            name: "Phoenix 🔥",
            color: "text-rose-500 bg-rose-50 border-rose-100 dark:bg-metal/50 dark:text-rose-400 dark:border-metal",
            icon: Flame,
        };
    if (totalSpent > 100000)
        return {
            name: "Butterfly 🦋",
            color: "text-indigo-500 bg-indigo-50 border-indigo-100 dark:bg-metal/50 dark:text-indigo-400 dark:border-metal",
            icon: Star,
        };
    return {
        name: "Moth 🕯️",
        color: "text-slate-500 bg-slate-50 border-slate-100 dark:bg-metal/50 dark:text-slate-400 dark:border-metal",
        icon: UserCheck,
    };
});

const nextLevelProgress = computed(() => {
    const total = userStore.memberData?.totalTopUp || 0;
    if (total > 1000000) return 100;
    if (total > 500000) return ((total - 500000) / 500000) * 100;
    if (total > 100000) return ((total - 100000) / 400000) * 100;
    return (total / 100000) * 100;
});

const filteredProducts = computed(() => {
    if (activeCategory.value === "all") return products;
    return products.filter((p) => p.category === activeCategory.value);
});

const scrollToServices = () => {
    document.getElementById("services").scrollIntoView({ behavior: "smooth" });
};
const formatRupiah = (val) =>
    new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
    }).format(val || 0);

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
    nextTick(() => {
        nameInputRef.value?.focus();
    });
};

const saveName = async () => {
    if (newNameInput.value.trim())
        await userStore.updateUserName(newNameInput.value.trim());
    isEditingName.value = false;
};

const handleTopUp = () => {
    const text = `Halo Admin Aiya! 👋%0A%0ASaya member *${userStore.memberData?.displayName || "Baru"}* (Email: ${userStore.user?.email}) mau Top Up saldo dong!`;
    window.open(`https://wa.me/6285942963323?text=${text}`, "_blank");
};

const handleJoinMember = () => {
    router.push("/join-member");
};

const categories = [
    { id: "all", label: "Semua", icon: Sparkles },
    { id: "candlerun", label: "Candle Run", icon: Wind },
    { id: "heart", label: "Heart & Gift", icon: Heart },
    { id: "special", label: "Special / Jasa", icon: Star },
];

const steps = [
    {
        title: "Pilih & Checkout",
        desc: "Pilih paket di katalog, lalu checkout via WA. Bisa bayar pakai QRIS/Saldo.",
        icon: Sparkles,
        color: "bg-sky-100 text-sky-500 dark:bg-sky-900/30 dark:text-sky-300",
    },
    {
        title: "Kirim Data (Aman)",
        desc: "Kirim data login via link khusus (Link/QR) ke admin. Data dijamin aman.",
        icon: Lock,
        color: "bg-rose-100 text-rose-500 dark:bg-rose-900/30 dark:text-rose-300",
    },
    {
        title: "Proses Joki",
        desc: "Admin akan login & mengerjakan pesanan. Kamu bisa request jam login.",
        icon: Clock,
        color: "bg-amber-100 text-amber-500 dark:bg-amber-900/30 dark:text-amber-300",
    },
    {
        title: "Selesai!",
        desc: "Dapet bukti screenshot, akun logout, & kamu bisa main lagi dengan happy!",
        icon: Gift,
        color: "bg-emerald-100 text-emerald-500 dark:bg-emerald-900/30 dark:text-emerald-300",
    },
];

const faqs = [
    {
        q: "Apakah akun saya aman? Saya takut kena hack.",
        a: "Aman 100% kak! Kita menggunakan login via Link/QR Code Nintendo/Playstation yang sifatnya sementara. Jadi kakak TIDAK PERLU memberikan password email utama kakak. Setelah joki selesai, link tersebut hangus.",
    },
    {
        q: "Metode login apa saja yang diterima?",
        a: "Kita menerima semua metode login: Google, Nintendo, PlayStation, Huawei, Facebook, Apple ID, dan Email. Jika ragu, bisa konsultasi dulu sama admin ya!",
    },
    {
        q: "Berapa lama pengerjaan joki Candle Run?",
        a: "Untuk Full Run biasanya memakan waktu 1.5 - 2 jam. Untuk paket CR Kilat bisa lebih cepat. Kami akan mengabari jika sudah mau login dan sudah selesai.",
    },
    {
        q: "Apakah heart dikirim instant?",
        a: "Heart di Sky memiliki limit kirim 1 heart per akun per hari. Jika kakak pesan 10 heart, dan kami pakai 5 bot, maka selesai dalam 2 hari. Semakin banyak bot yang kakak add, semakin cepat selesai.",
    },
    {
        q: "Bagaimana cara join member?",
        a: "Cukup bayar biaya pendaftaran sekali seumur hidup (25K). Kakak akan dapat ID Member, Saldo (bisa topup), Diskon khusus, dan Prioritas antrian.",
    },
    {
        q: "Kalau ada item event limited, bisa dijokiin?",
        a: "Bisa banget! Chat admin untuk request joki khusus event (misal: Days of Bloom, Season Pass, dll).",
    },
];
</script>

<template>
    <div>
        <!-- HERO SECTION -->
        <section
            id="home"
            class="pt-36 pb-20 px-6 relative overflow-hidden dark:bg-charcoal transition-colors duration-300"
        >
            <div
                class="container mx-auto max-w-6xl grid md:grid-cols-2 gap-12 items-center"
            >
                <!-- KOLOM KIRI (TEXT) -->
                <div
                    class="relative z-10 text-center md:text-left order-2 md:order-1 animate-in fade-in slide-in-from-bottom-8 duration-700"
                >
                    <!-- TAMPILAN MEMBER -->
                    <div v-if="userStore.user" class="space-y-6">
                        <div
                            class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold shadow-sm transition-colors bg-white dark:bg-graphite dark:border-metal hover:scale-105 transform duration-300 cursor-default"
                            :class="memberLevel.color"
                        >
                            <component :is="memberLevel.icon" :size="14" />
                            <span>{{ memberLevel.name }} Member</span>
                        </div>
                        <div
                            class="w-full max-w-[200px] mx-auto md:mx-0"
                            v-if="memberLevel.name !== 'Elder 👑'"
                        >
                            <div
                                class="flex justify-between text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 px-1"
                            >
                                <span>Progress Level</span
                                ><span
                                    >{{ Math.round(nextLevelProgress) }}%</span
                                >
                            </div>
                            <div
                                class="w-full h-2 bg-slate-100 dark:bg-metal rounded-full overflow-hidden shadow-inner"
                            >
                                <div
                                    class="h-full bg-gradient-to-r from-indigo-300 to-purple-400 rounded-full transition-all duration-1000 ease-out relative"
                                    :style="{ width: `${nextLevelProgress}%` }"
                                >
                                    <div
                                        class="absolute inset-0 bg-white/30 animate-[shimmer_2s_infinite]"
                                    ></div>
                                </div>
                            </div>
                            <p
                                class="text-xs font-semibold text-indigo-400 mt-1.5 flex items-center gap-1"
                            >
                                <Sparkles :size="12" /> Top up lagi buat naik
                                level! 🚀
                            </p>
                        </div>
                        <div
                            class="text-4xl md:text-6xl font-bold text-slate-700 dark:text-slate-100 leading-tight"
                        >
                            <div
                                class="flex flex-wrap items-center justify-center md:justify-start gap-x-3"
                            >
                                <span>Halo,</span>
                                <div
                                    v-if="isEditingName"
                                    class="flex items-center gap-2"
                                >
                                    <input
                                        ref="nameInputRef"
                                        v-model="newNameInput"
                                        @keyup.enter="saveName"
                                        class="bg-white dark:bg-graphite border-b-2 border-indigo-400 text-indigo-500 w-40 md:w-auto min-w-[150px] focus:outline-none px-2 py-0 text-3xl md:text-5xl font-bold"
                                    />
                                    <button
                                        @click="saveName"
                                        class="bg-indigo-500 text-white p-2 rounded-full shadow-lg hover:bg-indigo-600 transition flex-shrink-0"
                                    >
                                        <Check :size="24" />
                                    </button>
                                </div>
                                <div
                                    v-else
                                    class="relative group flex items-center"
                                >
                                    <span
                                        class="cursor-pointer text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-400 border-b-2 border-transparent group-hover:border-indigo-200 transition-all pb-1"
                                        @click="startEditName"
                                        title="Klik untuk ganti nama"
                                        >{{ memberName }}</span
                                    >
                                    <span>! 🌸</span>
                                    <button
                                        @click="startEditName"
                                        class="absolute -top-5 right-1/2 translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 p-1.5 bg-white dark:bg-graphite text-indigo-400 rounded-full shadow-sm border border-indigo-50 dark:border-metal hover:bg-indigo-50 dark:hover:bg-metal hover:scale-110 z-10"
                                        title="Edit Nama"
                                    >
                                        <Pencil :size="12" />
                                    </button>
                                </div>
                            </div>
                            <span
                                class="block text-2xl md:text-3xl mt-2 font-medium text-slate-500 dark:text-slate-400"
                                >Mau jajan apa hari ini?</span
                            >
                        </div>
                        <div class="relative group max-w-md mx-auto md:mx-0">
                            <div
                                class="absolute -inset-0.5 bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 rounded-2xl opacity-30 group-hover:opacity-60 blur transition duration-500"
                            ></div>
                            <div
                                class="relative bg-white/90 dark:bg-graphite/90 backdrop-blur-md border border-slate-100 dark:border-metal p-5 rounded-2xl shadow-sm overflow-hidden"
                            >
                                <div
                                    class="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-50/50 to-transparent rounded-full -mr-10 -mt-10 pointer-events-none"
                                ></div>
                                <div
                                    class="flex items-center gap-4 relative z-10"
                                >
                                    <div
                                        class="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shrink-0 shadow-lg shadow-indigo-200 group-hover:scale-105 transition-transform duration-300"
                                    >
                                        <Wallet :size="28" />
                                    </div>
                                    <div class="text-left flex-1">
                                        <p
                                            class="text-[10px] text-slate-400 dark:text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1"
                                        >
                                            Saldo Member
                                            <Sparkles
                                                :size="10"
                                                class="text-amber-400 animate-pulse"
                                            />
                                        </p>
                                        <p
                                            class="text-2xl font-extrabold text-slate-700 dark:text-white tracking-tight"
                                        >
                                            {{
                                                formatRupiah(
                                                    userStore.memberData?.saldo,
                                                )
                                            }}
                                        </p>
                                    </div>
                                    <button
                                        @click="handleTopUp"
                                        class="px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800 rounded-xl text-xs font-bold hover:bg-indigo-600 hover:text-white hover:border-transparent transition-all duration-300 flex items-center gap-1.5 shadow-sm group-hover:shadow-md"
                                    >
                                        <Plus :size="16" /> Top Up
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div
                            class="flex gap-4 justify-center md:justify-start pt-2"
                        >
                            <button
                                @click="scrollToServices"
                                class="btn-bouncy px-8 py-3.5 bg-sky-400 hover:bg-sky-500 text-white rounded-2xl font-bold shadow-lg shadow-sky-200 flex items-center justify-center gap-2"
                            >
                                Order Jasa
                                <Star :size="16" class="text-amber-200" />
                            </button>
                        </div>
                    </div>

                    <!-- TAMPILAN TAMU -->
                    <div v-else class="space-y-6">
                        <div
                            class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-graphite border border-sky-100 dark:border-metal text-sky-400 text-xs font-bold shadow-sm animate-float-slow mx-auto md:mx-0"
                        >
                            <Sparkles :size="14" class="text-amber-400" />
                            <span>Jasa khusus Sky: Children of the Light</span>
                        </div>
                        <h1
                            class="text-4xl md:text-6xl font-bold text-slate-700 dark:text-slate-100 leading-tight"
                        >
                            Kamu rebahan <br /><span
                                class="text-sky-400 underline decoration-wavy decoration-amber-400 decoration-4"
                                >manis</span
                            >
                            aja,<span
                                class="block text-2xl md:text-3xl mt-2 font-normal text-slate-500 dark:text-slate-400"
                                >biar Aiya yang lariin candlenya ✨</span
                            >
                        </h1>
                        <p
                            class="text-lg text-slate-500 dark:text-slate-400 font-medium leading-relaxed max-w-lg mx-auto md:mx-0"
                        >
                            Fokus ke momen seru bareng friends & ngumpulin cape.
                            Urusan
                            <span class="text-sky-500 font-bold"
                                >CR, Heart, WL</span
                            >
                            serahin ke Aiya. Amanah & Friendly! 🌈
                        </p>
                        <div
                            class="flex flex-col sm:flex-row gap-3 justify-center md:justify-start pt-2 items-center"
                        >
                            <button
                                @click="scrollToServices"
                                class="btn-bouncy px-8 py-3.5 bg-sky-400 hover:bg-sky-500 text-white rounded-2xl font-bold shadow-lg shadow-sky-200 flex items-center justify-center gap-2"
                            >
                                Aiya, Bantuin Dong!
                                <Star :size="16" class="text-amber-200" />
                            </button>
                            <button
                                @click="scrollToServices"
                                class="btn-bouncy w-full sm:w-auto px-6 py-3.5 bg-white dark:bg-graphite text-slate-600 dark:text-slate-300 border-2 border-slate-100 dark:border-metal rounded-2xl font-bold hover:bg-slate-50 dark:hover:bg-metal/50 hover:border-sky-200 transition"
                            >
                                Lihat Menu
                            </button>
                        </div>
                        <div
                            @click="handleJoinMember"
                            class="mt-6 mx-auto md:mx-0 max-w-md bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 rounded-2xl shadow-lg shadow-indigo-200/50 cursor-pointer hover:scale-[1.02] transition-transform relative overflow-hidden group"
                        >
                            <div
                                class="absolute -right-4 -top-4 w-16 h-16 bg-white/10 rounded-full blur-xl group-hover:bg-white/20 transition"
                            ></div>
                            <div class="flex items-center gap-3 relative z-10">
                                <div
                                    class="bg-white/20 p-2.5 rounded-xl backdrop-blur-sm shadow-inner"
                                >
                                    <Crown :size="24" class="text-amber-300" />
                                </div>
                                <div class="flex-1 text-left">
                                    <p
                                        class="text-[10px] font-bold text-indigo-100 uppercase tracking-widest mb-0.5 flex items-center gap-1"
                                    >
                                        <Sparkles :size="10" /> Limited Offer
                                    </p>
                                    <p class="text-sm font-bold leading-tight">
                                        Join Member Hanya
                                        <span class="text-amber-300 text-base"
                                            >25K!</span
                                        ><br /><span
                                            class="text-xs font-normal opacity-90"
                                            >Banyak untungnya, hubungi admin
                                            sekarang! ✨</span
                                        >
                                    </p>
                                </div>
                                <div
                                    class="bg-white/10 p-1.5 rounded-full group-hover:bg-white/30 transition"
                                >
                                    <ChevronRight
                                        :size="20"
                                        class="text-white"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- VISUAL (UPDATE SKY KID IMAGE) -->
                <div
                    class="relative z-10 order-1 md:order-2 flex justify-center items-center animate-in fade-in slide-in-from-right-8 duration-700"
                >
                    <div
                        class="w-72 h-72 md:w-96 md:h-96 bg-sky-100 dark:bg-graphite rounded-blob flex items-center justify-center relative animate-float-slow shadow-xl shadow-sky-100 dark:shadow-none"
                    >
                        <div
                            class="absolute inset-4 bg-white/40 dark:bg-metal/40 rounded-blob"
                        ></div>

                        <!-- GANTI ICON DENGAN IMAGE SKY KID -->
                        <img
                            :src="skyKidGif"
                            alt="Sky Kid Mascot"
                            class="relative z-10 w-64 h-64 object-contain drop-shadow-xl animate-float-slow"
                        />

                        <!-- Floating elements tetap ada sebagai hiasan -->
                        <div
                            class="absolute -top-4 -right-4 bg-white dark:bg-slate-700 p-4 rounded-3xl shadow-lg animate-float-fast rotate-12 z-20"
                        >
                            <Heart
                                :size="32"
                                class="text-rose-400 fill-rose-400"
                            />
                        </div>
                        <div
                            class="absolute bottom-10 right-0 bg-white/90 dark:bg-graphite/90 backdrop-blur px-4 py-2 rounded-xl shadow-sm border border-sky-100 dark:border-metal text-xs font-bold text-sky-500 dark:text-sky-400 animate-float-slow"
                            style="animation-delay: 2s"
                        >
                            ✨ Open 10.00 - 23.00 WIB
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- CARA ORDER SECTION (DENGAN GIF & ANIMASI FADE UP) -->
        <section
            class="py-20 px-6 bg-white dark:bg-charcoal border-y border-sky-50 dark:border-metal animate-in fade-in slide-in-from-bottom-8 duration-700"
        >
            <div class="container mx-auto max-w-6xl">
                <div class="text-center mb-12">
                    <div class="flex items-center justify-center gap-2">
                        <h2
                            class="text-3xl md:text-4xl font-bold text-slate-700 dark:text-slate-200 mt-2"
                        >
                            Cara Order
                        </h2>
                        <!-- GIF Sky Kid Kecil -->
                        <img
                            :src="skyKidGif"
                            class="w-12 h-12 object-contain"
                        />
                    </div>
                    <span
                        class="text-xs font-bold text-sky-400 uppercase tracking-wider bg-sky-50 dark:bg-graphite px-3 py-1 rounded-full inline-block mt-2"
                        >Easy Peasy</span
                    >
                    <p class="text-slate-400 mt-2 max-w-lg mx-auto">
                        Ga perlu ribet, tinggal pilih, bayar, dan terima beres.
                        Akun aman!
                    </p>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
                    <div
                        class="hidden md:block absolute top-12 left-0 w-full h-0.5 bg-slate-100 dark:bg-metal -z-10"
                    ></div>
                    <div
                        v-for="(step, index) in steps"
                        :key="index"
                        class="text-center group relative"
                    >
                        <div
                            class="w-24 h-24 mx-auto rounded-3xl flex items-center justify-center mb-6 shadow-sm transition-all duration-300 transform group-hover:-translate-y-2 group-hover:shadow-md bg-white dark:bg-graphite border-4 border-white dark:border-charcoal ring-1 ring-slate-100 dark:ring-metal relative z-10"
                        >
                            <div
                                :class="`w-full h-full rounded-2xl flex items-center justify-center ${step.color.replace('bg-', 'bg-opacity-20 bg-').replace('text-', 'text-')}`"
                            >
                                <component :is="step.icon" :size="32" />
                            </div>
                            <div
                                class="absolute -top-3 -right-3 w-8 h-8 bg-slate-800 dark:bg-metal text-white rounded-full flex items-center justify-center text-sm font-bold border-4 border-white dark:border-charcoal shadow-sm"
                            >
                                {{ index + 1 }}
                            </div>
                        </div>
                        <h3
                            class="font-bold text-lg text-slate-700 dark:text-slate-200 mb-2"
                        >
                            {{ step.title }}
                        </h3>
                        <p
                            class="text-sm text-slate-500 dark:text-slate-400 leading-relaxed px-2"
                        >
                            {{ step.desc }}
                        </p>
                    </div>
                </div>
            </div>
        </section>

        <!-- SERVICES SECTION (DENGAN GIF & ANIMASI) -->
        <section
            id="services"
            class="py-20 px-6 bg-sky-50/30 dark:bg-graphite/30 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100"
        >
            <div class="container mx-auto max-w-6xl">
                <div class="text-center mb-10 relative">
                    <div class="flex items-center justify-center gap-2 mb-2">
                        <h2
                            class="text-3xl font-bold text-slate-700 dark:text-slate-200"
                        >
                            Menu Jajan Aiya
                        </h2>
                        <!-- GIF Sky Kid Kecil -->
                        <img
                            :src="skykidMoth"
                            class="w-12 h-12 object-contain"
                        />
                    </div>
                    <p class="text-slate-400 font-medium">
                        Mau Aiya bantuin candle run, heart, atau wing? Pilih di
                        sini 💌
                    </p>
                    <Star
                        class="absolute top-0 left-1/2 -translate-x-32 -translate-y-4 text-amber-400 animate-spin-slow"
                        :size="24"
                    />
                </div>
                <div class="flex justify-center gap-3 mb-8 flex-wrap">
                    <button
                        v-for="cat in categories"
                        :key="cat.id"
                        @click="activeCategory = cat.id"
                        class="px-5 py-2.5 rounded-full text-sm font-bold transition btn-bouncy flex items-center gap-2"
                        :class="
                            activeCategory === cat.id
                                ? 'bg-sky-400 text-white shadow-lg shadow-sky-200'
                                : 'bg-white dark:bg-graphite text-slate-400 border border-slate-100 dark:border-metal hover:text-sky-400 hover:border-sky-200'
                        "
                    >
                        <component :is="cat.icon" :size="16" />{{ cat.label }}
                    </button>
                </div>
                <div
                    class="card-soft mb-12 flex flex-wrap items-center justify-between gap-4 p-4 text-sm text-slate-500 dark:text-slate-400 border border-sky-50 dark:border-metal mx-auto max-w-4xl bg-white dark:bg-graphite shadow-sm"
                >
                    <div class="flex items-center gap-3">
                        <div
                            class="flex h-8 w-8 items-center justify-center rounded-full bg-sky-100 dark:bg-metal shrink-0"
                        >
                            <ShieldCheck :size="16" class="text-sky-500" />
                        </div>
                        <p class="leading-snug">
                            Jasa
                            <span class="font-bold text-sky-500"
                                >Full Manual</span
                            >, no cheat. Login aman.<br /><span
                                class="text-xs opacity-70"
                                >Bisa request bukti screenshot 📸</span
                            >
                        </p>
                    </div>
                    <span
                        class="rounded-full bg-sky-50 dark:bg-metal px-4 py-1.5 font-bold text-sky-600 dark:text-sky-400 text-xs"
                        >💭 Wajib baca aturan order ya!</span
                    >
                </div>
                <div
                    class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20"
                >
                    <ProductCard
                        v-for="product in filteredProducts"
                        :key="product.id"
                        :product="product"
                        @open-calculator="showCalculatorModal = true"
                    />
                </div>
            </div>
        </section>

        <!-- FAQ SECTION -->
        <section
            class="py-20 px-6 bg-white dark:bg-charcoal border-t border-slate-50 dark:border-metal animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200"
        >
            <div class="container mx-auto max-w-3xl">
                <div class="text-center mb-12">
                    <div
                        class="inline-flex items-center justify-center w-14 h-14 bg-rose-100 dark:bg-rose-900/20 text-rose-500 rounded-2xl mb-4 shadow-sm rotate-3"
                    >
                        <HelpCircle :size="28" />
                    </div>
                    <h2
                        class="text-3xl font-bold text-slate-700 dark:text-slate-200"
                    >
                        Punya Pertanyaan?
                    </h2>
                    <p class="text-slate-400 mt-2">
                        Tenang, Aiya siap jawab keraguan kamu!
                    </p>
                </div>
                <div class="space-y-4">
                    <div
                        v-for="(faq, i) in faqs"
                        :key="i"
                        class="border border-slate-100 dark:border-metal rounded-2xl overflow-hidden transition-all duration-300"
                        :class="
                            activeFaqIndex === i
                                ? 'shadow-md border-sky-100 bg-sky-50/30 dark:bg-graphite'
                                : 'bg-white dark:bg-graphite hover:border-sky-100 dark:hover:border-metal'
                        "
                    >
                        <button
                            @click="
                                activeFaqIndex = activeFaqIndex === i ? null : i
                            "
                            class="w-full flex justify-between items-center p-5 text-left font-bold text-slate-700 dark:text-slate-300 hover:text-sky-600 transition"
                        >
                            <span class="flex-1 pr-4">{{ faq.q }}</span>
                            <div
                                class="w-8 h-8 rounded-full bg-white dark:bg-metal border border-slate-100 dark:border-metal flex items-center justify-center shrink-0 transition-transform duration-300 text-sky-400"
                                :class="{
                                    'rotate-180 bg-sky-400 text-white border-transparent':
                                        activeFaqIndex === i,
                                }"
                            >
                                <ChevronDown :size="18" />
                            </div>
                        </button>
                        <div
                            v-show="activeFaqIndex === i"
                            class="p-5 pt-0 text-sm text-slate-500 dark:text-slate-400 leading-relaxed animate-in slide-in-from-top-2 duration-200"
                        >
                            {{ faq.a }}
                        </div>
                    </div>
                </div>
                <div class="mt-12 text-center">
                    <p class="text-sm text-slate-400 mb-4">
                        Masih bingung? Chat admin aja langsung!
                    </p>
                    <a
                        href="https://wa.me/6285942963323"
                        target="_blank"
                        class="inline-flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-full font-bold shadow-lg shadow-green-200 hover:bg-green-600 transition btn-bouncy"
                        ><MessageCircle :size="18" /> Chat via WhatsApp</a
                    >
                </div>
            </div>
        </section>

        <Teleport to="body">
            <transition name="fade">
                <div
                    v-if="showCalculatorModal"
                    class="fixed inset-0 z-[100] flex items-center justify-center p-4"
                >
                    <div
                        class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
                        @click="showCalculatorModal = false"
                    ></div>
                    <div
                        class="bg-cream dark:bg-charcoal w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[2.5rem] shadow-2xl relative z-10 animate-in fade-in zoom-in-95 duration-200 p-6 md:p-10 border-4 border-white dark:border-metal"
                    >
                        <button
                            @click="showCalculatorModal = false"
                            class="absolute top-6 right-6 p-2 bg-white dark:bg-graphite rounded-full text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition border border-slate-100 dark:border-metal"
                        >
                            <X :size="24" />
                        </button>
                        <div class="text-center mb-8">
                            <div
                                class="inline-flex items-center gap-2 bg-white dark:bg-graphite px-4 py-1.5 rounded-full text-xs font-bold text-pink-500 border border-pink-100 dark:border-metal mb-3 shadow-sm"
                            >
                                <Calculator :size="14" /><span
                                    >Fitur Pintar Aiya</span
                                >
                            </div>
                            <h2
                                class="text-2xl md:text-3xl font-bold text-slate-700 dark:text-slate-200"
                            >
                                Kalkulator Jajan Heart 💖
                            </h2>
                            <p class="text-slate-400 mt-2 text-sm md:text-base">
                                Hitung budget & estimasi waktu selesai biar pas!
                            </p>
                        </div>
                        <HeartCalculator />
                    </div>
                </div>
            </transition>
        </Teleport>

        <footer
            class="border-t border-sky-100 dark:border-metal bg-white/60 dark:bg-charcoal/60 mt-0"
        >
            <div
                class="mx-auto flex max-w-6xl flex-col md:flex-row items-center justify-between gap-4 px-6 py-6 text-xs text-slate-400"
            >
                <div class="flex flex-col items-center md:items-start gap-1">
                    <p>
                        © {{ new Date().getFullYear() }} Aiya Sky Service. All
                        cozy rights reserved 💗
                    </p>
                    <div
                        class="flex items-center gap-1 opacity-70 hover:opacity-100 transition-opacity"
                    >
                        <MapPin :size="12" /><span>Manado, Sulawesi Utara</span>
                    </div>
                </div>
                <p class="flex items-center gap-1.5">
                    <span
                        class="w-2 h-2 rounded-full bg-green-400 animate-pulse"
                    ></span>
                    <a
                        href="https://wa.me/6285942963323"
                        target="_blank"
                        class="hover:text-green-600 transition"
                        >Fast response via WhatsApp ✨</a
                    >
                </p>
            </div>
        </footer>
    </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
@keyframes shimmer {
    0% {
        transform: translateX(-100%);
    }
    100% {
        transform: translateX(100%);
    }
}
</style>
