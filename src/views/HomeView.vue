<script setup>
import { ref, computed, nextTick, onMounted } from "vue";
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
    ShieldCheck,
    Calculator,
    X,
    UserCheck,
    Wallet,
    Plus,
    Pencil,
    Check,
    Crown,
    ChevronRight,
    MessageCircle,
    HelpCircle,
    ChevronDown,
    Lock,
    Clock,
    Gift,
    MapPin,
    Cloud,
    Zap,
    CreditCard,
    TrendingUp,
} from "lucide-vue-next";
import { useRouter } from "vue-router";

// IMPORT GAMBAR ASSETS
import skyKidGif from "../assets/skykid.gif";
import skykidMoth from "../assets/moth.gif";

const router = useRouter();
const userStore = useUserStore();
const activeCategory = ref("all");
const showCalculatorModal = ref(false);
const activeFaqIndex = ref(null);

const isEditingName = ref(false);
const newNameInput = ref("");
const nameInputRef = ref(null);

// LOGIC TIME GREETING
const timeGreeting = computed(() => {
    const hour = new Date().getHours();
    if (hour < 11) return "Selamat Pagi";
    if (hour < 15) return "Selamat Siang";
    if (hour < 18) return "Selamat Sore";
    return "Selamat Malam";
});

// LOGIC MEMBER LEVEL & CARD THEME
const memberLevel = computed(() => {
    const totalSpent =
        userStore.memberData?.totalTopUp || userStore.memberData?.saldo || 0;

    if (totalSpent > 1000000)
        return {
            name: "Elder",
            emoji: "👑",
            // Gold/Amber Theme
            cardBg: "bg-gradient-to-br from-amber-300 via-yellow-400 to-orange-500",
            shadow: "shadow-amber-500/30",
            border: "border-amber-200/50",
            text: "text-amber-950",
            badge: "bg-amber-100 text-amber-800",
        };
    if (totalSpent > 500000)
        return {
            name: "Phoenix",
            emoji: "🔥",
            // Rose/Red Theme
            cardBg: "bg-gradient-to-br from-rose-400 via-red-400 to-orange-400",
            shadow: "shadow-rose-500/30",
            border: "border-rose-200/50",
            text: "text-white",
            badge: "bg-rose-100 text-rose-800",
        };
    if (totalSpent > 100000)
        return {
            name: "Butterfly",
            emoji: "🦋",
            // Indigo/Purple Theme
            cardBg: "bg-gradient-to-br from-indigo-400 via-purple-400 to-fuchsia-400",
            shadow: "shadow-indigo-500/30",
            border: "border-indigo-200/50",
            text: "text-white",
            badge: "bg-indigo-100 text-indigo-800",
        };
    return {
        name: "Moth",
        emoji: "🕯️",
        // Slate/Sky Theme
        cardBg: "bg-gradient-to-br from-slate-600 via-slate-700 to-slate-800",
        shadow: "shadow-slate-500/30",
        border: "border-slate-500/50",
        text: "text-slate-100",
        badge: "bg-slate-100 text-slate-800",
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
        color: "bg-sky-100 text-sky-500 dark:bg-sky-900/30 dark:text-sky-400",
    },
    {
        title: "Kirim Data (Aman)",
        desc: "Kirim data login via link khusus (Link/QR) ke admin. Data dijamin aman.",
        icon: Lock,
        color: "bg-rose-100 text-rose-500 dark:bg-rose-900/30 dark:text-rose-400",
    },
    {
        title: "Proses Joki",
        desc: "Admin akan login & mengerjakan pesanan. Kamu bisa request jam login.",
        icon: Clock,
        color: "bg-amber-100 text-amber-500 dark:bg-amber-900/30 dark:text-amber-400",
    },
    {
        title: "Selesai!",
        desc: "Dapet bukti screenshot, akun logout, & kamu bisa main lagi dengan happy!",
        icon: Gift,
        color: "bg-emerald-100 text-emerald-500 dark:bg-emerald-900/30 dark:text-emerald-400",
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
    <div class="overflow-x-hidden">
        <section
            id="home"
            class="pt-36 pb-20 px-6 relative overflow-hidden bg-cream dark:bg-charcoal transition-colors duration-500"
        >
            <div
                class="absolute top-0 right-0 w-full h-full pointer-events-none overflow-hidden"
            >
                <Cloud
                    :size="120"
                    class="absolute top-20 -right-20 text-sky-100 dark:text-white/5 animate-float-slow opacity-60"
                />
                <Cloud
                    :size="80"
                    class="absolute top-40 -left-10 text-indigo-50 dark:text-white/5 animate-float-fast opacity-40 delay-1000"
                />
                <Star
                    :size="40"
                    class="absolute bottom-32 right-1/4 text-amber-200 dark:text-amber-900/20 animate-pulse"
                />
            </div>

            <div
                class="container mx-auto max-w-6xl grid md:grid-cols-2 gap-12 items-center relative z-10"
            >
                <div
                    class="text-center md:text-left order-2 md:order-1 animate-in fade-in slide-in-from-bottom-8 duration-700"
                >
                    <div v-if="userStore.user" class="space-y-8">
                        <div>
                            <p
                                class="text-sm font-bold text-sky-500 dark:text-sky-400 tracking-widest uppercase mb-1 flex items-center justify-center md:justify-start gap-2"
                            >
                                <Sparkles :size="14" /> Member Dashboard
                            </p>
                            <h1
                                class="text-3xl md:text-5xl font-bold text-slate-800 dark:text-slate-100 leading-tight"
                            >
                                {{ timeGreeting }},
                                <span
                                    v-if="!isEditingName"
                                    class="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500 dark:from-indigo-400 dark:to-purple-400 cursor-pointer hover:underline decoration-wavy decoration-indigo-300"
                                    @click="startEditName"
                                    title="Ganti Nama"
                                >
                                    {{ memberName }}!
                                </span>
                                <span
                                    v-else
                                    class="inline-flex items-center gap-2"
                                >
                                    <input
                                        ref="nameInputRef"
                                        v-model="newNameInput"
                                        @keyup.enter="saveName"
                                        class="bg-transparent border-b-2 border-indigo-500 text-indigo-600 dark:text-indigo-400 w-32 focus:outline-none"
                                    />
                                    <button
                                        @click="saveName"
                                        class="p-1 bg-indigo-500 text-white rounded-full"
                                    >
                                        <Check :size="16" />
                                    </button>
                                </span>
                            </h1>
                            <p class="text-slate-500 dark:text-slate-400 mt-2">
                                Siap meluncur ke dunia Sky hari ini? ☁️
                            </p>
                        </div>

                        <div
                            class="relative group max-w-[380px] mx-auto md:mx-0 perspective"
                        >
                            <div
                                class="relative w-full aspect-[1.6/1] rounded-3xl p-6 flex flex-col justify-between overflow-hidden transition-transform duration-500 hover:rotate-1 hover:scale-[1.02]"
                                :class="[
                                    memberLevel.cardBg,
                                    memberLevel.shadow,
                                    'shadow-xl',
                                ]"
                            >
                                <div
                                    class="absolute inset-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay"
                                ></div>

                                <div
                                    class="relative z-10 flex justify-between items-start"
                                >
                                    <div class="flex items-center gap-2">
                                        <div
                                            class="w-8 h-8 rounded-full bg-white/20 backdrop-blur flex items-center justify-center border border-white/30"
                                        >
                                            <Cloud
                                                :size="16"
                                                :class="memberLevel.text"
                                            />
                                        </div>
                                        <span
                                            class="text-xs font-bold uppercase tracking-widest opacity-80"
                                            :class="memberLevel.text"
                                            >AiyaShop ID</span
                                        >
                                    </div>
                                    <span
                                        class="text-2xl filter drop-shadow-md"
                                        >{{ memberLevel.emoji }}</span
                                    >
                                </div>

                                <div class="relative z-10">
                                    <p
                                        class="text-xs font-medium opacity-80 mb-1"
                                        :class="memberLevel.text"
                                    >
                                        Saldo Aktif
                                    </p>
                                    <h2
                                        class="text-3xl md:text-4xl font-black tracking-tight"
                                        :class="memberLevel.text"
                                    >
                                        {{
                                            formatRupiah(
                                                userStore.memberData?.saldo,
                                            )
                                        }}
                                    </h2>
                                </div>

                                <div
                                    class="relative z-10 flex justify-between items-end"
                                >
                                    <div>
                                        <p
                                            class="text-[10px] font-bold uppercase opacity-60"
                                            :class="memberLevel.text"
                                        >
                                            Pemilik
                                        </p>
                                        <p
                                            class="font-bold text-lg truncate max-w-[150px]"
                                            :class="memberLevel.text"
                                        >
                                            {{
                                                userStore.memberData
                                                    ?.displayName ||
                                                userStore.user.displayName
                                            }}
                                        </p>
                                    </div>
                                    <div
                                        class="px-3 py-1 rounded-lg bg-white/20 backdrop-blur border border-white/20"
                                    >
                                        <p
                                            class="text-xs font-bold"
                                            :class="memberLevel.text"
                                        >
                                            {{ memberLevel.name }}
                                        </p>
                                    </div>
                                </div>

                                <div
                                    class="absolute -bottom-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"
                                ></div>
                                <div
                                    class="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl"
                                ></div>
                            </div>
                        </div>

                        <div
                            class="flex flex-col gap-4 max-w-[380px] mx-auto md:mx-0"
                        >
                            <div class="flex gap-3">
                                <div
                                    class="flex-1 bg-white dark:bg-slate-800 p-3 rounded-2xl border border-slate-100 dark:border-slate-700 flex items-center gap-3 shadow-sm"
                                >
                                    <div
                                        class="p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-500 rounded-xl"
                                    >
                                        <TrendingUp :size="18" />
                                    </div>
                                    <div>
                                        <p
                                            class="text-[10px] text-slate-400 font-bold uppercase"
                                        >
                                            Total Topup
                                        </p>
                                        <p
                                            class="text-xs font-bold text-slate-700 dark:text-slate-200"
                                        >
                                            {{
                                                formatRupiah(
                                                    userStore.memberData
                                                        ?.totalTopUp || 0,
                                                )
                                            }}
                                        </p>
                                    </div>
                                </div>
                                <div
                                    class="flex-1 bg-white dark:bg-slate-800 p-3 rounded-2xl border border-slate-100 dark:border-slate-700 flex items-center gap-3 shadow-sm"
                                >
                                    <div
                                        class="p-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-500 rounded-xl"
                                    >
                                        <CreditCard :size="18" />
                                    </div>
                                    <div class="w-full">
                                        <p
                                            class="text-[10px] text-slate-400 font-bold uppercase flex justify-between"
                                        >
                                            Next Level
                                            <span
                                                >{{
                                                    Math.round(
                                                        nextLevelProgress,
                                                    )
                                                }}%</span
                                            >
                                        </p>
                                        <div
                                            class="w-full h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full mt-1 overflow-hidden"
                                        >
                                            <div
                                                class="h-full bg-emerald-400 rounded-full transition-all duration-1000"
                                                :style="{
                                                    width: `${nextLevelProgress}%`,
                                                }"
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="grid grid-cols-2 gap-3">
                                <button
                                    @click="handleTopUp"
                                    class="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-white dark:bg-slate-800 border-2 border-indigo-100 dark:border-slate-600 text-indigo-600 dark:text-indigo-300 font-bold hover:bg-indigo-50 dark:hover:bg-slate-700 transition"
                                >
                                    <Plus :size="18" /> Isi Saldo
                                </button>
                                <button
                                    @click="scrollToServices"
                                    class="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-200 dark:shadow-none hover:bg-indigo-700 transition btn-bouncy"
                                >
                                    <Star :size="18" class="text-amber-300" />
                                    Jajan
                                </button>
                            </div>
                        </div>
                    </div>

                    <div v-else class="space-y-6">
                        <div
                            class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-slate-800 border border-sky-100 dark:border-slate-700 text-sky-500 dark:text-sky-400 text-xs font-bold shadow-sm mx-auto md:mx-0 animate-bounce-slow"
                        >
                            <Sparkles :size="14" class="text-amber-400" />
                            <span>Jasa Joki Terpercaya & Amanah</span>
                        </div>
                        <h1
                            class="text-4xl md:text-6xl font-black text-slate-800 dark:text-slate-100 leading-tight"
                        >
                            Kamu Rebahan,<br />
                            <span
                                class="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-cyan-400"
                                >Aiya yang Lariin</span
                            >
                            <span
                                class="block text-2xl md:text-3xl mt-3 font-medium text-slate-500 dark:text-slate-400"
                                >Candle Run, Heart & Eden? Beres! ✨</span
                            >
                        </h1>
                        <p
                            class="text-lg text-slate-500 dark:text-slate-400 font-medium leading-relaxed max-w-lg mx-auto md:mx-0"
                        >
                            Fokus ke momen seru bareng friends & ngumpulin cape
                            impian. Urusan
                            <span
                                class="text-sky-500 dark:text-sky-400 font-bold"
                                >grinding</span
                            >
                            serahin ke ahlinya.
                        </p>

                        <div
                            class="flex flex-col sm:flex-row gap-4 justify-center md:justify-start pt-4 items-center"
                        >
                            <button
                                @click="scrollToServices"
                                class="btn-bouncy px-8 py-4 bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-400 hover:to-cyan-400 text-white rounded-2xl font-bold shadow-xl shadow-sky-200 dark:shadow-none flex items-center justify-center gap-2 w-full sm:w-auto"
                            >
                                Lihat Menu Jajan <ChevronRight :size="20" />
                            </button>
                            <button
                                @click="handleJoinMember"
                                class="px-8 py-4 bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-slate-700 rounded-2xl font-bold hover:bg-indigo-50 dark:hover:bg-slate-700 transition w-full sm:w-auto flex items-center justify-center gap-2"
                            >
                                <Crown :size="18" /> Join Member
                            </button>
                        </div>
                    </div>
                </div>

                <div
                    class="relative z-10 order-1 md:order-2 flex justify-center items-center animate-in fade-in slide-in-from-right-8 duration-700 delay-200"
                >
                    <div
                        class="w-72 h-72 md:w-96 md:h-96 relative flex items-center justify-center animate-float-slow"
                    >
                        <div
                            class="absolute top-0 right-0 w-32 h-32 bg-rose-300/30 dark:bg-rose-500/20 rounded-full blur-3xl -z-10 mix-blend-multiply dark:mix-blend-screen"
                        ></div>
                        <div
                            class="absolute bottom-0 left-0 w-40 h-40 bg-indigo-300/30 dark:bg-indigo-500/20 rounded-full blur-3xl -z-10 mix-blend-multiply dark:mix-blend-screen"
                        ></div>

                        <div
                            class="absolute inset-0 bg-gradient-to-br from-sky-100 to-white dark:from-slate-800 dark:to-slate-900 rounded-blob shadow-2xl shadow-sky-200/50 dark:shadow-none border border-white/50 dark:border-white/5"
                        ></div>

                        <div
                            class="absolute inset-4 bg-white/40 dark:bg-white/5 rounded-blob backdrop-blur-sm border border-white/20 dark:border-white/5"
                        ></div>

                        <img
                            :src="skyKidGif"
                            alt="Sky Kid Mascot"
                            class="relative z-10 w-72 h-72 object-contain drop-shadow-2xl scale-110 hover:scale-125 transition-transform duration-500 -mt-4"
                        />

                        <div
                            class="absolute -top-2 -right-2 bg-white dark:bg-slate-800 p-3 rounded-full shadow-lg animate-float-fast z-20"
                        >
                            <Heart
                                :size="24"
                                class="text-rose-400 fill-rose-400"
                            />
                        </div>

                        <div
                            class="absolute -bottom-6 bg-white/90 dark:bg-slate-800/90 backdrop-blur px-5 py-3 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700 flex items-center gap-3 animate-bounce-slow z-20"
                        >
                            <div
                                class="w-3 h-3 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.5)]"
                            ></div>
                            <span
                                class="text-xs font-bold text-slate-600 dark:text-slate-300"
                                >Open 10.00 - 23.00 WIB</span
                            >
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <section
            class="py-24 px-6 bg-white dark:bg-charcoal border-y border-slate-50 dark:border-slate-800/50 relative"
        >
            <div class="container mx-auto max-w-6xl">
                <div class="text-center mb-16">
                    <div
                        class="inline-flex items-center gap-2 bg-sky-50 dark:bg-sky-900/20 text-sky-600 dark:text-sky-300 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-4"
                    >
                        <Zap :size="14" /> Easy Process
                    </div>
                    <h2
                        class="text-3xl md:text-4xl font-black text-slate-800 dark:text-slate-100"
                    >
                        Cara Order Anti Ribet
                    </h2>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
                    <div
                        class="hidden md:block absolute top-12 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-700 to-transparent -z-10"
                    ></div>

                    <div
                        v-for="(step, index) in steps"
                        :key="index"
                        class="text-center group relative p-4 rounded-3xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors duration-300"
                    >
                        <div
                            class="w-24 h-24 mx-auto rounded-3xl flex items-center justify-center mb-6 shadow-sm transition-all duration-500 transform group-hover:-translate-y-2 group-hover:shadow-md bg-white dark:bg-slate-800 border-4 border-white dark:border-slate-700 ring-1 ring-slate-100 dark:ring-slate-700/50 relative z-10"
                        >
                            <div
                                :class="`w-full h-full rounded-2xl flex items-center justify-center ${step.color.replace('bg-', 'bg-opacity-20 bg-').replace('text-', 'text-')}`"
                            >
                                <component :is="step.icon" :size="32" />
                            </div>
                            <div
                                class="absolute -top-3 -right-3 w-8 h-8 bg-slate-800 dark:bg-white text-white dark:text-slate-900 rounded-full flex items-center justify-center text-sm font-bold border-4 border-white dark:border-slate-800 shadow-sm"
                            >
                                {{ index + 1 }}
                            </div>
                        </div>
                        <h3
                            class="font-bold text-lg text-slate-800 dark:text-slate-200 mb-2"
                        >
                            {{ step.title }}
                        </h3>
                        <p
                            class="text-sm text-slate-500 dark:text-slate-400 leading-relaxed"
                        >
                            {{ step.desc }}
                        </p>
                    </div>
                </div>
            </div>
        </section>

        <section
            id="services"
            class="py-24 px-6 bg-slate-50/50 dark:bg-slate-900/30"
        >
            <div class="container mx-auto max-w-6xl">
                <div class="text-center mb-10 relative">
                    <h2
                        class="text-4xl font-black text-slate-800 dark:text-slate-100 mb-4 flex items-center justify-center gap-3"
                    >
                        Menu Jajan Aiya
                        <img
                            :src="skykidMoth"
                            class="w-10 h-10 -mt-2 animate-bounce"
                        />
                    </h2>
                    <p
                        class="text-slate-500 dark:text-slate-400 max-w-lg mx-auto"
                    >
                        Pilih paket joki sesuai kebutuhanmu. Aman, cepat, dan
                        pastinya murah!
                    </p>
                </div>

                <div class="flex justify-center gap-2 mb-10 flex-wrap">
                    <button
                        v-for="cat in categories"
                        :key="cat.id"
                        @click="activeCategory = cat.id"
                        class="px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300 flex items-center gap-2 border"
                        :class="
                            activeCategory === cat.id
                                ? 'bg-sky-500 text-white border-sky-500 shadow-lg shadow-sky-200 dark:shadow-none transform scale-105'
                                : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-sky-300 hover:text-sky-500'
                        "
                    >
                        <component :is="cat.icon" :size="16" />{{ cat.label }}
                    </button>
                </div>

                <div
                    class="max-w-3xl mx-auto mb-12 p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm flex items-center justify-between gap-4"
                >
                    <div
                        class="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300"
                    >
                        <div
                            class="p-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg"
                        >
                            <ShieldCheck :size="18" />
                        </div>
                        <span
                            >Joki
                            <span class="font-bold">100% Manual</span> tanpa
                            cheat/script.</span
                        >
                    </div>
                    <span
                        class="hidden sm:inline-block text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded"
                        >Safe Login</span
                    >
                </div>

                <div
                    class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-20"
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

        <section
            class="py-24 px-6 bg-white dark:bg-charcoal border-t border-slate-100 dark:border-slate-800"
        >
            <div class="container mx-auto max-w-3xl">
                <div class="text-center mb-12">
                    <div
                        class="inline-flex items-center justify-center w-12 h-12 bg-rose-100 dark:bg-rose-900/20 text-rose-500 rounded-2xl mb-4 rotate-6 shadow-sm"
                    >
                        <HelpCircle :size="24" />
                    </div>
                    <h2
                        class="text-3xl font-black text-slate-800 dark:text-slate-100"
                    >
                        Punya Pertanyaan?
                    </h2>
                </div>

                <div class="space-y-4">
                    <div
                        v-for="(faq, i) in faqs"
                        :key="i"
                        class="border rounded-2xl overflow-hidden transition-all duration-300 group"
                        :class="
                            activeFaqIndex === i
                                ? 'border-sky-200 dark:border-sky-900 bg-sky-50 dark:bg-sky-900/10'
                                : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-sky-100 dark:hover:border-slate-700'
                        "
                    >
                        <button
                            @click="
                                activeFaqIndex = activeFaqIndex === i ? null : i
                            "
                            class="w-full flex justify-between items-center p-5 text-left font-bold text-slate-700 dark:text-slate-200 transition"
                        >
                            <span class="flex-1 pr-4">{{ faq.q }}</span>
                            <div
                                class="w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-transform duration-300"
                                :class="
                                    activeFaqIndex === i
                                        ? 'rotate-180 bg-sky-500 text-white'
                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                                "
                            >
                                <ChevronDown :size="18" />
                            </div>
                        </button>
                        <div
                            v-show="activeFaqIndex === i"
                            class="p-5 pt-0 text-sm text-slate-600 dark:text-slate-400 leading-relaxed border-t border-dashed border-sky-200 dark:border-sky-900 mt-2"
                        >
                            {{ faq.a }}
                        </div>
                    </div>
                </div>

                <div
                    class="mt-12 text-center bg-slate-50 dark:bg-slate-800 p-8 rounded-3xl border border-slate-100 dark:border-slate-700"
                >
                    <p
                        class="text-slate-500 dark:text-slate-400 mb-4 font-medium"
                    >
                        Masih ragu atau punya request khusus?
                    </p>
                    <a
                        href="https://wa.me/6285942963323"
                        target="_blank"
                        class="inline-flex items-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold shadow-lg shadow-green-200 dark:shadow-none transition btn-bouncy"
                    >
                        <MessageCircle :size="18" /> Chat via WhatsApp
                    </a>
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
                        class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
                        @click="showCalculatorModal = false"
                    ></div>
                    <div
                        class="bg-white dark:bg-charcoal w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[2.5rem] shadow-2xl relative z-10 animate-in zoom-in-95 duration-200 p-6 md:p-10 border border-slate-100 dark:border-slate-700"
                    >
                        <button
                            @click="showCalculatorModal = false"
                            class="absolute top-6 right-6 p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-400 hover:text-rose-500 transition"
                        >
                            <X :size="20" />
                        </button>
                        <div class="text-center mb-8">
                            <div
                                class="inline-flex items-center gap-2 bg-rose-50 dark:bg-rose-900/20 px-4 py-1.5 rounded-full text-xs font-bold text-rose-500 dark:text-rose-300 mb-3"
                            >
                                <Calculator :size="14" /> Fitur Pintar Aiya
                            </div>
                            <h2
                                class="text-2xl md:text-3xl font-black text-slate-800 dark:text-slate-100"
                            >
                                Kalkulator Jajan Heart 💖
                            </h2>
                            <p
                                class="text-slate-500 dark:text-slate-400 mt-2 text-sm"
                            >
                                Hitung budget & estimasi waktu selesai biar pas!
                            </p>
                        </div>
                        <HeartCalculator />
                    </div>
                </div>
            </transition>
        </Teleport>

        <footer
            class="bg-white dark:bg-charcoal border-t border-slate-100 dark:border-slate-800 py-8 px-6"
        >
            <div
                class="mx-auto flex max-w-6xl flex-col md:flex-row items-center justify-between gap-6 text-sm text-slate-400 dark:text-slate-500"
            >
                <div class="flex flex-col items-center md:items-start gap-2">
                    <p class="font-bold text-slate-600 dark:text-slate-300">
                        © {{ new Date().getFullYear() }} Aiya Sky Service
                    </p>
                    <div class="flex items-center gap-1.5 text-xs">
                        <MapPin :size="12" /> <span>Manado, Indonesia</span>
                    </div>
                </div>
                <div class="flex items-center gap-6">
                    <a href="#" class="hover:text-sky-500 transition"
                        >Privacy</a
                    >
                    <a href="#" class="hover:text-sky-500 transition">Terms</a>
                    <span
                        class="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700"
                    >
                        <span
                            class="w-2 h-2 rounded-full bg-green-400 animate-pulse"
                        ></span>
                        <span
                            class="text-xs font-bold text-green-600 dark:text-green-400"
                            >Online</span
                        >
                    </span>
                </div>
            </div>
        </footer>
    </div>
</template>

<style scoped>
@keyframes shimmer {
    0% {
        transform: translateX(-100%);
    }
    100% {
        transform: translateX(100%);
    }
}

.perspective {
    perspective: 1000px;
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

@keyframes float {
    0%,
    100% {
        transform: translateY(0);
    }
    50% {
        transform: translateY(-15px);
    }
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>
