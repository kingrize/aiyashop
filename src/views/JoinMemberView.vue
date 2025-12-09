<script setup>
import {
    Check,
    Crown,
    ChevronLeft,
    MessageCircle,
    Gift,
    Tag,
    Lock,
    Zap,
    Star,
} from "lucide-vue-next";
import { useRouter } from "vue-router";

const router = useRouter();

// DATA BENEFIT BARU
const benefits = [
    {
        title: "Bonus Welcome: 50 Heart!",
        desc: "Gratis 50 Instant Heart langsung setelah join.",
        icon: Gift,
        color: "text-rose-500 bg-rose-100 dark:bg-rose-900/30",
    },
    {
        title: "Diskon Otomatis Seumur Hidup",
        desc: "Potongan harga spesial di setiap transaksi.",
        icon: Tag,
        color: "text-emerald-500 bg-emerald-100 dark:bg-emerald-900/30",
    },
    {
        title: "Akses Produk Eksklusif",
        desc: "Bisa beli item langka yang tidak dijual untuk umum.",
        icon: Lock,
        color: "text-indigo-500 bg-indigo-100 dark:bg-indigo-900/30",
    },
    {
        title: "Badge Profil 'Sky Kid'",
        desc: "Tampilan profil keren dengan badge Moth/Elder.",
        icon: Star,
        color: "text-amber-500 bg-amber-100 dark:bg-amber-900/30",
    },
    {
        title: "Jalur Prioritas VIP",
        desc: "Orderan kamu dikerjakan duluan, tanpa antri!",
        icon: Zap,
        color: "text-sky-500 bg-sky-100 dark:bg-sky-900/30",
    },
];

const handleJoin = () => {
    const text = `Halo Admin Aiya! 👋%0A%0ASaya mau daftar *Member Premium* dong! Tolong infokan cara pembayarannya ya (25K). ✨`;
    window.open(`https://wa.me/6285942963323?text=${text}`, "_blank");
};
</script>

<template>
    <div
        class="min-h-screen bg-cream dark:bg-charcoal pt-24 pb-20 px-6 transition-colors duration-300"
    >
        <div class="max-w-4xl mx-auto">
            <button
                @click="router.push('/')"
                class="flex items-center gap-2 text-slate-400 hover:text-sky-500 dark:text-slate-300 dark:hover:text-sky-400 transition mb-8 font-bold text-sm"
            >
                <ChevronLeft :size="18" /> Kembali ke Home
            </button>

            <div class="grid md:grid-cols-2 gap-12 items-center">
                <div class="relative order-2 md:order-1">
                    <div
                        class="absolute inset-0 bg-gradient-to-tr from-indigo-200 to-purple-200 dark:from-indigo-900/40 dark:to-purple-900/40 rounded-[2.5rem] rotate-3 blur-sm transform scale-105"
                    ></div>

                    <div
                        class="relative bg-white dark:bg-slate-800 rounded-[2rem] p-8 shadow-xl dark:shadow-none border border-slate-100 dark:border-slate-700 overflow-hidden text-center transition-colors duration-300"
                    >
                        <div
                            class="w-24 h-24 bg-gradient-to-br from-amber-300 to-orange-400 rounded-full mx-auto flex items-center justify-center shadow-lg mb-6 animate-pulse"
                        >
                            <Crown :size="48" class="text-white" />
                        </div>

                        <h3
                            class="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2"
                        >
                            Member Premium
                        </h3>
                        <p
                            class="text-slate-400 dark:text-slate-400 text-sm mb-8"
                        >
                            Akses eksklusif seumur hidup
                        </p>

                        <div
                            class="flex items-center justify-center gap-2 mb-2"
                        >
                            <span
                                class="text-sm text-slate-400 dark:text-slate-500 line-through"
                                >Rp 50.000</span
                            >
                            <span
                                class="bg-rose-100 text-rose-500 dark:bg-rose-500/10 dark:text-rose-300 text-xs font-bold px-2 py-1 rounded-lg border border-transparent dark:border-rose-500/20"
                                >DISKON 50%</span
                            >
                        </div>

                        <p
                            class="text-5xl font-extrabold text-indigo-600 dark:text-indigo-400 mb-8"
                        >
                            25<span
                                class="text-2xl text-slate-500 dark:text-slate-300"
                                >k</span
                            >
                        </p>

                        <button
                            @click="handleJoin"
                            class="w-full btn-bouncy bg-indigo-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-indigo-200 dark:shadow-none hover:bg-indigo-700 flex items-center justify-center gap-2 transition-all"
                        >
                            <MessageCircle :size="20" /> Join Sekarang
                        </button>

                        <p
                            class="text-[10px] text-slate-400 dark:text-slate-500 mt-4"
                        >
                            *Bayar sekali, aktif selamanya
                        </p>
                    </div>
                </div>

                <div class="order-1 md:order-2">
                    <span
                        class="text-indigo-500 dark:text-indigo-300 font-bold tracking-wider text-xs uppercase bg-indigo-50 dark:bg-indigo-500/10 border border-transparent dark:border-indigo-500/20 px-3 py-1 rounded-full"
                        >Membership</span
                    >

                    <h1
                        class="text-4xl md:text-5xl font-bold text-slate-800 dark:text-slate-100 mt-4 mb-6 leading-tight"
                    >
                        Level Up Pengalaman <br />
                        <span
                            class="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500 dark:from-indigo-400 dark:to-purple-400"
                            >Nge-Sky Kamu!</span
                        >
                    </h1>

                    <p
                        class="text-slate-500 dark:text-slate-400 text-lg mb-8 leading-relaxed"
                    >
                        Gabung jadi keluarga AiyaShop dan nikmati kemudahan joki
                        tanpa ribet, lebih hemat, dan lebih prioritas.
                    </p>

                    <div class="space-y-4">
                        <div
                            v-for="(benefit, index) in benefits"
                            :key="index"
                            class="flex gap-4 p-3 rounded-2xl hover:bg-white dark:hover:bg-slate-800/50 transition duration-300 border border-transparent hover:border-slate-100 dark:hover:border-slate-700"
                        >
                            <div
                                class="w-10 h-10 rounded-full flex items-center justify-center shrink-0 mt-1"
                                :class="benefit.color"
                            >
                                <component :is="benefit.icon" :size="20" />
                            </div>
                            <div>
                                <h4
                                    class="font-bold text-slate-700 dark:text-slate-200 text-base"
                                >
                                    {{ benefit.title }}
                                </h4>
                                <p
                                    class="text-sm text-slate-500 dark:text-slate-400 leading-relaxed"
                                >
                                    {{ benefit.desc }}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
