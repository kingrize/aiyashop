<script setup>
import { useRouter } from "vue-router";
import { CloudFog, Home, ArrowLeft } from "lucide-vue-next";
import mothGif from "../assets/moth.gif"; // Kita pakai gif moth yang lucu

const router = useRouter();
</script>

<template>
    <div
        class="min-h-screen bg-cream dark:bg-charcoal flex flex-col items-center justify-center p-6 text-center transition-colors duration-300 relative overflow-hidden"
    >
        <div class="absolute inset-0 pointer-events-none">
            <div
                class="absolute top-20 left-10 text-slate-200 dark:text-slate-800 opacity-60 animate-float-slow"
            >
                <CloudFog :size="120" />
            </div>
            <div
                class="absolute bottom-40 right-10 text-slate-200 dark:text-slate-800 opacity-60 animate-float-delayed"
            >
                <CloudFog :size="80" />
            </div>
            <div
                class="absolute top-1/3 right-1/4 w-4 h-4 bg-rose-200 dark:bg-rose-900 rounded-full blur-md animate-pulse"
            ></div>
            <div
                class="absolute bottom-1/4 left-1/3 w-6 h-6 bg-indigo-200 dark:bg-indigo-900 rounded-full blur-md animate-pulse delay-700"
            ></div>
        </div>

        <div
            class="relative z-10 flex flex-col items-center max-w-md animate-in fade-in zoom-in duration-500"
        >
            <div class="relative w-48 h-48 mb-4">
                <div
                    class="absolute inset-0 bg-indigo-400/20 dark:bg-indigo-500/10 rounded-full blur-3xl animate-pulse-slow"
                ></div>
                <img
                    :src="mothGif"
                    alt="Lost Moth"
                    class="w-full h-full object-contain drop-shadow-xl animate-bounce-slow"
                />
            </div>

            <h1
                class="text-8xl font-black text-slate-200 dark:text-slate-800/50 mb-[-20px] select-none z-0"
            >
                404
            </h1>
            <h2
                class="text-2xl md:text-3xl font-black text-slate-800 dark:text-slate-100 mb-3 relative z-10"
            >
                Yah, Nyasar ke OOB? 🙈
            </h2>
            <p
                class="text-slate-500 dark:text-slate-400 mb-8 leading-relaxed max-w-xs mx-auto"
            >
                Halaman yang kamu cari sepertinya terbawa angin atau belum
                kebuka di map ini.
            </p>

            <div class="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <button
                    @click="router.back()"
                    class="px-6 py-3.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition flex items-center justify-center gap-2"
                >
                    <ArrowLeft :size="20" /> Balik Aja
                </button>

                <button
                    @click="router.push('/')"
                    class="px-6 py-3.5 rounded-xl bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-200 dark:shadow-none hover:bg-indigo-700 transition flex items-center justify-center gap-2 btn-bouncy"
                >
                    <Home :size="20" /> Pulang ke Home
                </button>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* Animations */
.animate-float-slow {
    animation: float 8s ease-in-out infinite;
}
.animate-float-delayed {
    animation: float 10s ease-in-out infinite reverse;
}
.animate-pulse-slow {
    animation: pulse 4s ease-in-out infinite;
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
        transform: translateY(-20px);
    }
}
@keyframes pulse {
    0%,
    100% {
        opacity: 0.3;
        transform: scale(1);
    }
    50% {
        opacity: 0.6;
        transform: scale(1.1);
    }
}
</style>
