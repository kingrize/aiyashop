<script setup>
import { ref, computed, nextTick, reactive } from "vue";
import { products } from "../data/products";
import { useUserStore } from "../stores/user";
import ProductCard from "../components/ProductCard.vue";
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
    Zap,
    CreditCard,
    TrendingUp,
    History,
    Sparkles,
    LogOut,
    CheckCircle2,
    Settings,
} from "lucide-vue-next";
import { useRouter } from "vue-router";

import skyKidGif from "../assets/skykid.gif";
import skykidMoth from "../assets/moth.gif";

const router = useRouter();
const userStore = useUserStore();
const activeCategory = ref("all");
const selectedProduct = ref(null);
const showProductModal = ref(false);
const showHistoryModal = ref(false);
const activeFaqIndex = ref(null);

const isEditingName = ref(false);
const newNameInput = ref("");
const nameInputRef = ref(null);

// IOS ALERT STATE
const alertState = reactive({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
});

const timeGreeting = computed(() => {
    const hour = new Date().getHours();
    if (hour < 11) return "Selamat Pagi";
    if (hour < 15) return "Selamat Siang";
    if (hour < 18) return "Selamat Sore";
    return "Selamat Malam";
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
    router.push("/join-member");
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
        title: "1. Pilih Paket",
        desc: "Pilih produk yang kamu mau.",
        icon: Sparkles,
        color: "text-sky-500 bg-sky-100 dark:bg-sky-900/30",
    },
    {
        title: "2. Kirim Data",
        desc: "Login via Link/QR (Aman 100%).",
        icon: Lock,
        color: "text-rose-500 bg-rose-100 dark:bg-rose-900/30",
    },
    {
        title: "3. Proses Joki",
        desc: "Admin mengerjakan pesanan.",
        icon: Clock,
        color: "text-amber-500 bg-amber-100 dark:bg-amber-900/30",
    },
    {
        title: "4. Selesai!",
        desc: "Terima bukti & bisa login lagi.",
        icon: CheckCircle2,
        color: "text-emerald-500 bg-emerald-100 dark:bg-emerald-900/30",
    },
];

const faqs = [
    {
        q: "Apakah akun saya aman?",
        a: "Aman 100%! Kita pakai login via Link/QR Nintendo/Playstation. Gak perlu password email utama.",
    },
    {
        q: "Metode login apa saja?",
        a: "Google, Nintendo, PS, Huawei, FB, Apple ID, Email.",
    },
    {
        q: "Lama pengerjaan CR?",
        a: "Full Run 1.5 - 2 jam. CR Kilat lebih cepat.",
    },
    {
        q: "Heart dikirim instant?",
        a: "Limit 1 heart/akun/hari. 10 heart pakai 5 bot = 2 hari.",
    },
];
</script>

<template>
    <div class="overflow-x-hidden">
        <section
            id="home"
            class="pt-24 pb-12 md:pt-36 md:pb-20 px-6 relative overflow-hidden bg-cream dark:bg-charcoal transition-colors duration-500"
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
                        <img
                            :src="skyKidGif"
                            alt="Sky Kid Mascot"
                            class="relative z-10 w-48 h-48 md:w-72 md:h-72 object-contain scale-110 hover:scale-125 transition-transform duration-500 -mt-2 animate-float-smooth"
                        />
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
                                <img
                                    :src="skyKidGif"
                                    class="w-8 h-8 object-contain md:hidden animate-bounce-slow"
                                />
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
                                <button
                                    v-if="false"
                                    @click="router.push('/member/settings')"
                                    class="flex flex-col items-center justify-center gap-1.5 py-3 rounded-xl hover:bg-white dark:hover:bg-slate-700/50 transition duration-300 group active:scale-95"
                                >
                                    <div
                                        class="p-1.5 rounded-lg bg-slate-100 dark:bg-white/10 text-slate-500 group-hover:text-slate-700 transition"
                                    >
                                        <Settings :size="18" />
                                    </div>
                                    <span
                                        class="text-[10px] font-bold text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200"
                                        >Akun</span
                                    >
                                </button>
                            </div>
                        </div>
                    </div>

                    <div v-else class="space-y-6">
                        <div
                            class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-slate-800 border border-sky-100 dark:border-slate-700 text-sky-500 dark:text-sky-400 text-[10px] md:text-xs font-bold shadow-sm animate-bounce-slow"
                        >
                            <Sparkles :size="14" class="text-amber-400" />
                            <span>Jasa Joki Terpercaya</span>
                        </div>
                        <h1
                            class="text-3xl md:text-6xl font-black text-slate-800 dark:text-slate-100 leading-tight"
                        >
                            Kamu Rebahan,<br />
                            <span
                                class="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-cyan-400"
                                >Aiya yang Lariin</span
                            >
                        </h1>
                        <p
                            class="text-sm md:text-lg text-slate-500 dark:text-slate-400 font-medium leading-relaxed max-w-lg mx-auto md:mx-0"
                        >
                            Fokus ke momen seru bareng friends. Urusan grinding
                            serahin ke ahlinya.
                        </p>
                        <div
                            class="flex flex-col gap-3 justify-center md:justify-start pt-2"
                        >
                            <button
                                @click="scrollToServices"
                                class="btn-bouncy px-8 py-3.5 bg-gradient-to-r from-sky-500 to-cyan-500 text-white rounded-xl font-bold shadow-lg flex items-center justify-center gap-2 text-sm md:text-base"
                            >
                                Lihat Menu Jajan <ChevronRight :size="18" />
                            </button>
                            <button
                                @click="handleJoinMember"
                                class="px-8 py-3.5 bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-slate-700 rounded-xl font-bold transition flex items-center justify-center gap-2 text-sm md:text-base"
                            >
                                <Crown :size="18" /> Join Member
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <section
            v-if="!userStore.user"
            class="py-12 px-6 bg-white dark:bg-charcoal border-y border-slate-100 dark:border-slate-800"
        >
            <div class="container mx-auto max-w-6xl">
                <div class="text-center mb-8">
                    <h2
                        class="text-xl md:text-2xl font-black text-slate-800 dark:text-slate-100 mb-2"
                    >
                        Cara Order Anti Ribet
                    </h2>
                    <p
                        class="text-xs md:text-sm text-slate-500 dark:text-slate-400"
                    >
                        Pesan joki semudah update status.
                    </p>
                </div>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div
                        v-for="(step, i) in steps"
                        :key="i"
                        class="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl text-center border border-slate-100 dark:border-slate-700"
                    >
                        <div
                            class="w-10 h-10 mx-auto rounded-full flex items-center justify-center mb-3"
                            :class="step.color"
                        >
                            <component :is="step.icon" :size="20" />
                        </div>
                        <h3
                            class="font-bold text-slate-800 dark:text-slate-200 text-sm mb-1"
                        >
                            {{ step.title }}
                        </h3>
                        <p
                            class="text-[10px] md:text-xs text-slate-500 dark:text-slate-400 leading-snug"
                        >
                            {{ step.desc }}
                        </p>
                    </div>
                </div>
            </div>
        </section>

        <section
            id="services"
            class="py-12 md:py-24 px-4 md:px-6 bg-slate-50/50 dark:bg-slate-900/30"
        >
            <div class="container mx-auto max-w-6xl">
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

                <div
                    class="flex justify-start md:justify-center gap-2 mb-8 overflow-x-auto pb-2 px-2 snap-x"
                >
                    <button
                        v-for="cat in categories"
                        :key="cat.id"
                        @click="activeCategory = cat.id"
                        class="snap-center shrink-0 px-4 py-2 rounded-full text-xs md:text-sm font-bold border transition-all"
                        :class="
                            activeCategory === cat.id
                                ? 'bg-sky-500 text-white border-sky-500 shadow-md'
                                : 'bg-white dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700'
                        "
                    >
                        {{ cat.label }}
                    </button>
                </div>

                <div
                    class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8 mb-12"
                >
                    <ProductCard
                        v-for="product in filteredProducts"
                        :key="product.id"
                        :product="product"
                        @open-detail="openProductDetail"
                    />
                </div>
            </div>
        </section>

        <section
            class="py-12 px-6 bg-white dark:bg-charcoal border-t border-slate-100 dark:border-slate-800"
        >
            <div class="container mx-auto max-w-3xl">
                <div class="text-center mb-8">
                    <div
                        class="inline-flex items-center justify-center w-10 h-10 md:w-12 md:h-12 bg-rose-100 dark:bg-rose-900/20 text-rose-500 rounded-2xl mb-3 rotate-6 shadow-sm"
                    >
                        <HelpCircle :size="20" class="md:w-6 md:h-6" />
                    </div>
                    <h2
                        class="text-2xl md:text-3xl font-black text-slate-800 dark:text-slate-100"
                    >
                        Punya Pertanyaan?
                    </h2>
                </div>
                <div class="space-y-3">
                    <div
                        v-for="(faq, i) in faqs"
                        :key="i"
                        class="border rounded-2xl overflow-hidden transition-all duration-300"
                        :class="
                            activeFaqIndex === i
                                ? 'border-sky-200 dark:border-sky-900 bg-sky-50 dark:bg-sky-900/10'
                                : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900'
                        "
                    >
                        <button
                            @click="
                                activeFaqIndex = activeFaqIndex === i ? null : i
                            "
                            class="w-full flex justify-between items-center p-4 md:p-5 text-left font-bold text-slate-700 dark:text-slate-200 transition"
                        >
                            <span class="flex-1 pr-4 text-sm md:text-base">{{
                                faq.q
                            }}</span
                            ><ChevronDown
                                :size="18"
                                :class="{
                                    'rotate-180 text-sky-500':
                                        activeFaqIndex === i,
                                }"
                                class="transition-transform duration-300 text-slate-400"
                            />
                        </button>
                        <div
                            v-show="activeFaqIndex === i"
                            class="p-4 pt-0 text-xs md:text-sm text-slate-600 dark:text-slate-400 leading-relaxed border-t border-dashed border-sky-200 dark:border-sky-900 mt-2"
                        >
                            {{ faq.a }}
                        </div>
                    </div>
                </div>
                <div
                    class="mt-8 text-center bg-slate-50 dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700"
                >
                    <p
                        class="text-slate-500 dark:text-slate-400 mb-4 font-medium text-xs md:text-sm"
                    >
                        Masih ragu atau punya request khusus?
                    </p>
                    <a
                        href="https://wa.me/6285942963323"
                        target="_blank"
                        class="inline-flex items-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold shadow-lg shadow-green-200 dark:shadow-none transition btn-bouncy text-sm"
                        ><MessageCircle :size="18" /> Chat via WhatsApp</a
                    >
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
    0% {
        transform: rotate(0deg);
    }
    100% {
        transform: rotate(360deg);
    }
}
@keyframes spin-reverse-slow {
    0% {
        transform: rotate(360deg);
    }
    100% {
        transform: rotate(0deg);
    }
}
@keyframes pulse-slow {
    0%,
    100% {
        opacity: 0.2;
        transform: scale(1);
    }
    50% {
        opacity: 0.4;
        transform: scale(1.1);
    }
}
@keyframes float-particle {
    0% {
        transform: translateY(0) scale(0.8);
        opacity: 0;
    }
    50% {
        opacity: 1;
    }
    100% {
        transform: translateY(-30px) scale(1.2);
        opacity: 0;
    }
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
</style>
