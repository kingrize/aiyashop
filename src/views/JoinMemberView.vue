<!-- LOKASI FILE: src/views/JoinMemberView.vue -->
<script setup>
import {
    Check,
    Star,
    Crown,
    ChevronLeft,
    MessageCircle,
} from "lucide-vue-next";
import { useRouter } from "vue-router";

const router = useRouter();

const benefits = [
    {
        title: "Harga Spesial",
        desc: "Dapet potongan harga khusus member di setiap pembelian.",
    },
    {
        title: "Prioritas Antrian",
        desc: "Pesanan kamu dikerjain duluan dibanding non-member.",
    },
    {
        title: "Tanpa Biaya Admin",
        desc: "Top up saldo 100rb, masuk 100rb. Tanpa potongan.",
    },
    {
        title: "Badge Eksklusif",
        desc: "Tampilan profil keren dengan badge Moth/Phoenix.",
    },
    {
        title: "Simpan Data",
        desc: "Gak perlu kirim ulang data login setiap mau joki.",
    },
];

// UPDATE WA
const handleJoin = () => {
    const text = `Halo Admin Aiya! 👋%0A%0ASaya mau daftar *Member Premium* dong! Tolong infokan cara pembayarannya ya (25K). ✨`;
    window.open(`https://wa.me/6285942963323?text=${text}`, "_blank");
};
</script>

<template>
    <div class="min-h-screen bg-cream dark:bg-charcoal pt-28 pb-20 px-6">
        <div class="max-w-4xl mx-auto">
            <button
                @click="router.push('/')"
                class="flex items-center gap-2 text-slate-400 hover:text-sky-500 transition mb-8 font-bold text-sm"
            >
                <ChevronLeft :size="18" /> Kembali ke Home
            </button>
            <div class="grid md:grid-cols-2 gap-12 items-center">
                <div class="relative order-2 md:order-1">
                    <div
                        class="absolute inset-0 bg-gradient-to-tr from-indigo-200 to-purple-200 rounded-[2.5rem] rotate-3 blur-sm transform scale-105"
                    ></div>
                    <div
                        class="relative bg-white rounded-[2rem] p-8 shadow-xl border border-slate-100 overflow-hidden text-center"
                    >
                        <div
                            class="w-24 h-24 bg-gradient-to-br from-amber-300 to-orange-400 rounded-full mx-auto flex items-center justify-center shadow-lg mb-6"
                        >
                            <Crown :size="48" class="text-white" />
                        </div>
                        <h3 class="text-2xl font-bold text-slate-800 mb-2">
                            Member Premium
                        </h3>
                        <p class="text-slate-400 text-sm mb-8">
                            Akses eksklusif seumur hidup
                        </p>
                        <div
                            class="flex items-center justify-center gap-2 mb-2"
                        >
                            <span class="text-sm text-slate-400 line-through"
                                >Rp 50.000</span
                            ><span
                                class="bg-rose-100 text-rose-500 text-xs font-bold px-2 py-1 rounded-lg"
                                >DISKON 50%</span
                            >
                        </div>
                        <p class="text-5xl font-extrabold text-indigo-600 mb-8">
                            25<span class="text-2xl text-slate-500">k</span>
                        </p>
                        <button
                            @click="handleJoin"
                            class="w-full btn-bouncy bg-indigo-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 flex items-center justify-center gap-2"
                        >
                            <MessageCircle :size="20" /> Join Sekarang
                        </button>
                        <p class="text-[10px] text-slate-400 mt-4">
                            *Bayar sekali, aktif selamanya
                        </p>
                    </div>
                </div>
                <div class="order-1 md:order-2">
                    <span
                        class="text-indigo-500 font-bold tracking-wider text-xs uppercase bg-indigo-50 px-3 py-1 rounded-full"
                        >Membership</span
                    >
                    <h1
                        class="text-4xl md:text-5xl font-bold text-slate-800 mt-4 mb-6 leading-tight"
                    >
                        Level Up Pengalaman <br /><span
                            class="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500"
                            >Nge-Sky Kamu!</span
                        >
                    </h1>
                    <p class="text-slate-500 text-lg mb-10 leading-relaxed">
                        Gabung jadi keluarga AiyaShop dan nikmati kemudahan joki
                        tanpa ribet, lebih hemat, dan lebih prioritas.
                    </p>
                    <div class="space-y-6">
                        <div
                            v-for="(benefit, index) in benefits"
                            :key="index"
                            class="flex gap-4"
                        >
                            <div
                                class="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center shrink-0 mt-1"
                            >
                                <Check :size="16" class="text-indigo-600" />
                            </div>
                            <div>
                                <h4 class="font-bold text-slate-700">
                                    {{ benefit.title }}
                                </h4>
                                <p class="text-sm text-slate-500">
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
