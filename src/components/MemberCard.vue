<script setup>
import { computed, ref, onMounted, onUnmounted } from "vue";
import { useUserStore } from "../stores/user";
import { Cloud, Sparkles } from "lucide-vue-next";

const userStore = useUserStore();
const cardRef = ref(null);

// State Visual
const transformString = ref("");
const glareString = ref("");
const opacity = ref(0);

// Animation Frame
let rafId = null;
let isMobile = false;

// --- LOGIC LEVEL (Tetap Sama) ---
const memberLevel = computed(() => {
    const totalSpent =
        userStore.memberData?.totalTopUp || userStore.memberData?.saldo || 0;

    if (totalSpent > 1000000)
        return {
            name: "Elder",
            emoji: "👑",
            bg: "bg-gradient-to-br from-[#BF953F] via-[#FCF6BA] to-[#B38728]",
            text: "text-amber-900",
            particle: "bg-amber-400",
            border: "border-amber-200/50",
        };
    if (totalSpent > 500000)
        return {
            name: "Phoenix",
            emoji: "🔥",
            bg: "bg-gradient-to-br from-rose-600 via-orange-500 to-red-600",
            text: "text-white",
            particle: "bg-orange-200",
            border: "border-rose-400/50",
        };
    if (totalSpent > 100000)
        return {
            name: "Butterfly",
            emoji: "🦋",
            bg: "bg-gradient-to-br from-indigo-500 via-purple-500 to-fuchsia-600",
            text: "text-white",
            particle: "bg-fuchsia-200",
            border: "border-indigo-300/50",
        };
    return {
        name: "Moth",
        emoji: "🕯️",
        bg: "bg-gradient-to-br from-slate-600 via-slate-700 to-slate-800",
        text: "text-slate-200",
        particle: "bg-slate-400",
        border: "border-slate-500/50",
    };
});

const formatRupiah = (val) =>
    new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
    }).format(val || 0);

// --- 1. DESKTOP LOGIC (MOUSE) ---
const handleMouseMove = (e) => {
    if (isMobile || !cardRef.value) return; // Skip jika mobile

    if (rafId) cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(() => {
        const rect = cardRef.value.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateY = ((x - centerX) / centerX) * 10;
        const rotateX = -((y - centerY) / centerY) * 10;

        transformString.value = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;

        const glareX = (x / rect.width) * 100;
        const glareY = (y / rect.height) * 100;
        glareString.value = `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0) 50%)`;
        opacity.value = 1;
    });
};

const handleMouseLeave = () => {
    if (isMobile) return;
    if (rafId) cancelAnimationFrame(rafId);
    transformString.value =
        "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)";
    opacity.value = 0;
};

// --- 2. MOBILE LOGIC (GYROSCOPE) ---
const handleOrientation = (event) => {
    if (!isMobile || !cardRef.value) return;

    if (rafId) cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(() => {
        // Gamma: Kiri/Kanan (-90 to 90)
        // Beta: Depan/Belakang (-180 to 180)
        let x = event.gamma || 0;
        let y = event.beta || 0;

        // Batasi sudut agar tidak terbalik (Clamp)
        if (x > 20) x = 20;
        if (x < -20) x = -20;
        if (y > 40) y = 40;
        if (y < -40) y = -40;

        // Kurangi offset awal (biasanya orang pegang HP agak miring sekitar 30deg)
        y = y - 30;

        // Kalkulasi Rotasi Halus
        const rotateY = x * 0.5; // Sensitivity
        const rotateX = -y * 0.5;

        transformString.value = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1, 1, 1)`;

        // Glare bergerak otomatis berlawanan arah tilt
        const glareX = 50 + x * 2;
        const glareY = 50 + y * 2;
        glareString.value = `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0) 60%)`;
        opacity.value = 0.8; // Selalu terlihat sedikit di mobile
    });
};

onMounted(() => {
    // Deteksi apakah device support touch (Mobile/Tablet)
    isMobile = window.matchMedia("(pointer: coarse)").matches;

    if (isMobile) {
        // Cek support Gyroscope
        if (window.DeviceOrientationEvent) {
            window.addEventListener("deviceorientation", handleOrientation);
        }

        // Default animation jika HP diletakkan di meja (Breathing Effect)
        transformString.value =
            "perspective(1000px) rotateX(0deg) rotateY(0deg)";
    }
});

onUnmounted(() => {
    if (rafId) cancelAnimationFrame(rafId);
    if (isMobile) {
        window.removeEventListener("deviceorientation", handleOrientation);
    }
});
</script>

<template>
    <div class="w-full h-full">
        <div
            ref="cardRef"
            class="relative w-full aspect-[1.58/1] rounded-[1.5rem] md:rounded-[2rem] shadow-xl md:shadow-2xl overflow-hidden select-none card-smooth will-change-transform"
            @mousemove="handleMouseMove"
            @mouseleave="handleMouseLeave"
            :style="{ transform: transformString }"
            :class="[memberLevel.bg, memberLevel.border, 'border']"
        >
            <div
                class="absolute inset-0 opacity-30 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay pointer-events-none z-0"
            ></div>

            <div
                class="absolute inset-0 overflow-hidden pointer-events-none z-0"
            >
                <div
                    v-for="n in 5"
                    :key="n"
                    class="absolute rounded-full animate-float opacity-40 blur-sm"
                    :class="memberLevel.particle"
                    :style="{
                        width: Math.random() * 6 + 2 + 'px',
                        height: Math.random() * 6 + 2 + 'px',
                        left: Math.random() * 100 + '%',
                        top: Math.random() * 100 + '%',
                        animationDuration: Math.random() * 5 + 5 + 's',
                        animationDelay: Math.random() * 2 + 's',
                    }"
                ></div>
            </div>

            <div
                class="absolute inset-0 pointer-events-none mix-blend-soft-light transition-opacity duration-700 ease-out z-10"
                :style="{
                    background: glareString,
                    opacity: opacity,
                }"
            >
                <div
                    v-if="isMobile"
                    class="absolute inset-0 w-[200%] h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shimmer"
                ></div>
            </div>

            <div
                class="relative z-20 h-full flex flex-col justify-between p-5 md:p-6 transform translate-z-10"
            >
                <div class="flex justify-between items-start">
                    <div class="flex items-center gap-2">
                        <div
                            class="w-7 h-7 md:w-8 md:h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/40 shadow-inner"
                        >
                            <Cloud :size="14" :class="memberLevel.text" />
                        </div>
                        <span
                            class="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] opacity-80"
                            :class="memberLevel.text"
                            >Aiya<span class="text-white/70">Card</span></span
                        >
                    </div>
                    <span
                        class="text-2xl md:text-3xl filter drop-shadow-lg animate-pulse"
                        >{{ memberLevel.emoji }}</span
                    >
                </div>

                <div class="space-y-3 md:space-y-4">
                    <div
                        class="w-9 h-7 md:w-10 md:h-8 rounded-md bg-gradient-to-tr from-yellow-200 to-yellow-500 border border-yellow-600/30 shadow-inner flex items-center justify-center relative overflow-hidden group"
                    >
                        <div
                            class="absolute inset-0 border-[0.5px] border-black/10 opacity-50 rounded-md"
                            style="
                                background-image: repeating-linear-gradient(
                                    90deg,
                                    transparent,
                                    transparent 4px,
                                    rgba(0, 0, 0, 0.1) 4px,
                                    rgba(0, 0, 0, 0.1) 5px
                                );
                            "
                        ></div>
                        <div
                            class="absolute inset-0 bg-white/40 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 skew-x-12 animate-shimmer-slow"
                        ></div>
                    </div>
                    <div>
                        <p
                            class="text-[8px] md:text-[10px] font-bold uppercase opacity-70 mb-0.5"
                            :class="memberLevel.text"
                        >
                            Total Saldo
                        </p>
                        <h2
                            class="text-2xl md:text-4xl font-black tracking-tighter"
                            :class="memberLevel.text"
                            style="text-shadow: 0 2px 10px rgba(0, 0, 0, 0.1)"
                        >
                            {{ formatRupiah(userStore.memberData?.saldo) }}
                        </h2>
                    </div>
                </div>

                <div class="flex justify-between items-end">
                    <div>
                        <p
                            class="text-[8px] md:text-[9px] font-bold uppercase opacity-60 mb-0.5"
                            :class="memberLevel.text"
                        >
                            Member Name
                        </p>
                        <p
                            class="font-bold text-base md:text-lg tracking-wide uppercase truncate max-w-[120px] md:max-w-[150px]"
                            :class="memberLevel.text"
                            style="text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1)"
                        >
                            {{
                                userStore.memberData?.displayName ||
                                userStore.user.displayName
                            }}
                        </p>
                    </div>
                    <div
                        class="flex items-center gap-1 px-2.5 py-0.5 md:px-3 md:py-1 rounded-full bg-black/10 backdrop-blur-sm border border-white/10"
                    >
                        <Sparkles :size="10" :class="memberLevel.text" />
                        <span
                            class="text-[9px] md:text-[10px] font-bold uppercase"
                            :class="memberLevel.text"
                            >{{ memberLevel.name }}</span
                        >
                    </div>
                </div>
            </div>

            <div
                class="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-white/10 to-transparent pointer-events-none z-10"
            ></div>
        </div>
    </div>
</template>

<style scoped>
.card-smooth {
    /* Transition ini membuat gerakan Gyroscope mulus, tidak patah-patah */
    transition: transform 0.1s cubic-bezier(0.2, 0.8, 0.2, 1);
}

.will-change-transform {
    will-change: transform;
}

/* Animasi mengambang partikel */
@keyframes float {
    0%,
    100% {
        transform: translateY(0) translateX(0);
        opacity: 0.2;
    }
    50% {
        transform: translateY(-20px) translateX(10px);
        opacity: 0.6;
    }
}
.animate-float {
    animation: float infinite ease-in-out;
}

/* Animasi kilauan otomatis untuk Mobile */
@keyframes shimmer {
    0% {
        transform: translateX(-150%) skewX(-15deg);
    }
    50%,
    100% {
        transform: translateX(150%) skewX(-15deg);
    }
}
.animate-shimmer {
    animation: shimmer 4s infinite ease-in-out;
}
.animate-shimmer-slow {
    animation: shimmer 6s infinite ease-in-out;
}

.translate-z-10 {
    transform: translateZ(30px);
}
</style>
