<script setup>
import { computed, ref, onMounted, onUnmounted } from "vue";
import { useUserStore } from "../stores/user";
import { Star, Shield, Sparkles, CloudFog } from "lucide-vue-next";

const userStore = useUserStore();
const cardRef = ref(null);

// State Visual
const transformString = ref("");
const glareString = ref("");
let rafId = null;
let isMobile = false;

// --- LOGIC LEVEL BARU (Tema Sky) ---
const memberLevel = computed(() => {
    const totalSpent =
        userStore.memberData?.totalTopUp || userStore.memberData?.saldo || 0;

    if (totalSpent > 1000000)
        return {
            name: "Elder",
            wedges: 11, // Jumlah sayap
            // Gold/White Glowing Theme
            bg: "bg-gradient-to-br from-[#FDBB2D] via-[#F7C59F] to-[#EF629F]",
            accent: "text-amber-900",
            border: "border-amber-300/50",
            shadow: "shadow-amber-500/30",
            starColor:
                "text-amber-100 fill-amber-100 filter drop-shadow-[0_0_10px_rgba(251,191,36,0.8)]",
        };
    if (totalSpent > 500000)
        return {
            name: "Phoenix",
            wedges: 9,
            // Red/Orange Sunset Theme
            bg: "bg-gradient-to-br from-[#FF512F] via-[#F09819] to-[#FF512F]",
            accent: "text-white",
            border: "border-orange-300/50",
            shadow: "shadow-orange-500/30",
            starColor:
                "text-orange-100 fill-orange-100 filter drop-shadow-[0_0_10px_rgba(249,115,22,0.8)]",
        };
    if (totalSpent > 100000)
        return {
            name: "Butterfly",
            wedges: 7,
            // Blue/Purple Night Sky Theme
            bg: "bg-gradient-to-br from-[#4A00E0] via-[#8E2DE2] to-[#4A00E0]",
            accent: "text-white",
            border: "border-indigo-300/50",
            shadow: "shadow-indigo-500/30",
            starColor:
                "text-indigo-100 fill-indigo-100 filter drop-shadow-[0_0_10px_rgba(99,102,241,0.8)]",
        };
    return {
        name: "Moth",
        wedges: 5,
        // Brownish/Cyan Daylight Theme
        bg: "bg-gradient-to-br from-[#78869B] via-[#B4C6D8] to-[#78869B]",
        accent: "text-slate-800",
        border: "border-slate-400/50",
        shadow: "shadow-slate-400/30",
        starColor:
            "text-slate-100 fill-slate-100 filter drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]",
    };
});

const formatRupiah = (val) =>
    new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
    }).format(val || 0);

// --- GYROSCOPE & TILT EFFECT (Sama seperti sebelumnya, dioptimalkan) ---
const handleMouseMove = (e) => {
    if (isMobile || !cardRef.value) return;
    if (rafId) cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(() => {
        const rect = cardRef.value.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateY = ((x - centerX) / centerX) * 8;
        const rotateX = -((y - centerY) / centerY) * 8;
        transformString.value = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
        const glareX = (x / rect.width) * 100;
        const glareY = (y / rect.height) * 100;
        glareString.value = `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 50%)`;
    });
};
const handleMouseLeave = () => {
    if (isMobile) return;
    if (rafId) cancelAnimationFrame(rafId);
    transformString.value =
        "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)";
    glareString.value = "";
};
const handleOrientation = (event) => {
    if (!isMobile || !cardRef.value) return;
    if (rafId) cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(() => {
        let x = event.gamma || 0;
        let y = event.beta || 0;
        if (x > 20) x = 20;
        if (x < -20) x = -20;
        if (y > 40) y = 40;
        if (y < -40) y = -40;
        y = y - 30;
        const rotateY = x * 0.5;
        const rotateX = -y * 0.5;
        transformString.value = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1, 1, 1)`;
        const glareX = 50 + x * 2;
        const glareY = 50 + y * 2;
        glareString.value = `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 60%)`;
    });
};

onMounted(() => {
    isMobile = window.matchMedia("(pointer: coarse)").matches;
    if (isMobile && window.DeviceOrientationEvent) {
        window.addEventListener("deviceorientation", handleOrientation);
        transformString.value =
            "perspective(1000px) rotateX(0deg) rotateY(0deg)";
    }
});
onUnmounted(() => {
    if (rafId) cancelAnimationFrame(rafId);
    if (isMobile)
        window.removeEventListener("deviceorientation", handleOrientation);
});
</script>

<template>
    <div class="w-full h-full py-2">
        <div
            ref="cardRef"
            class="relative w-full aspect-[1.5/1] md:aspect-[1.6/1] rounded-[2rem] shadow-2xl overflow-hidden select-none card-smooth will-change-transform border-2"
            @mousemove="handleMouseMove"
            @mouseleave="handleMouseLeave"
            :style="{ transform: transformString }"
            :class="[memberLevel.bg, memberLevel.border, memberLevel.shadow]"
        >
            <div
                class="absolute inset-0 opacity-20 mix-blend-overlay pointer-events-none z-0"
                style="
                    background-image: url(&quot;data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l15 30-15 30L15 30z' fill='%23ffffff' fill-opacity='0.4' fill-rule='evenodd'/%3E%3C/svg%3E&quot;);
                    background-size: 30px 30px;
                "
            ></div>
            <div
                class="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent mix-blend-overlay z-0"
            ></div>

            <div
                class="absolute inset-1 rounded-[1.8rem] border-2 border-white/30 opacity-50 z-10 pointer-events-none"
            ></div>

            <div
                class="absolute inset-0 pointer-events-none mix-blend-soft-light transition-all duration-500 ease-out z-20"
                :style="{ background: glareString }"
            >
                <div
                    v-if="isMobile"
                    class="absolute inset-0 w-[200%] h-full bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-shimmer"
                ></div>
            </div>

            <div
                class="relative z-30 h-full flex flex-col justify-between p-5 md:p-6 transform translate-z-10"
            >
                <div class="flex justify-between items-start">
                    <div class="flex items-center gap-2">
                        <div
                            class="px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/40 shadow-sm flex items-center gap-1.5"
                        >
                            <Shield
                                :size="14"
                                :class="memberLevel.accent"
                                class="fill-current opacity-80"
                            />
                            <span
                                class="text-[10px] md:text-xs font-black uppercase tracking-wider"
                                :class="memberLevel.accent"
                                >{{ memberLevel.name }} Rank</span
                            >
                        </div>
                    </div>
                    <div class="flex items-center gap-1">
                        <Star
                            v-for="i in memberLevel.wedges"
                            :key="i"
                            :size="12"
                            :class="memberLevel.starColor"
                            class="animate-pulse-slow"
                            :style="{ animationDelay: `${i * 0.1}s` }"
                        />
                    </div>
                </div>

                <div class="flex items-center justify-between">
                    <div>
                        <p
                            class="text-[9px] md:text-[10px] font-bold uppercase opacity-70 mb-0.5"
                            :class="memberLevel.accent"
                        >
                            Saldo Candle
                        </p>
                        <h2
                            class="text-2xl md:text-4xl font-black tracking-tighter filter drop-shadow-sm"
                            :class="memberLevel.accent"
                        >
                            {{ formatRupiah(userStore.memberData?.saldo) }}
                        </h2>
                    </div>
                    <div
                        class="relative w-16 h-16 md:w-20 md:h-20 flex items-center justify-center animate-float-slow"
                    >
                        <Star
                            :size="64"
                            :class="memberLevel.starColor"
                            class="absolute blur-md opacity-50 animate-pulse-slow"
                        />
                        <Star
                            :size="48"
                            :class="memberLevel.starColor"
                            class="relative z-10 md:w-[56px] md:h-[56px]"
                        />
                        <Sparkles
                            :size="20"
                            class="absolute top-0 right-0 text-white animate-ping-slow"
                        />
                    </div>
                </div>

                <div class="flex justify-between items-end">
                    <div>
                        <p
                            class="font-bold text-sm md:text-lg tracking-wide uppercase truncate max-w-[150px]"
                            :class="memberLevel.accent"
                            style="text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1)"
                        >
                            {{
                                userStore.memberData?.displayName ||
                                userStore.user.displayName
                            }}
                        </p>
                        <div class="flex items-center gap-1 opacity-60">
                            <CloudFog :size="12" :class="memberLevel.accent" />
                            <p
                                class="text-[8px] md:text-[9px] font-bold uppercase"
                                :class="memberLevel.accent"
                            >
                                Sky Kid ID: {{ userStore.user.uid.slice(0, 8) }}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.card-smooth {
    transition: transform 0.1s cubic-bezier(0.2, 0.8, 0.2, 1);
}
.will-change-transform {
    will-change: transform;
}
.translate-z-10 {
    transform: translateZ(30px);
}

/* Animations */
@keyframes float {
    0%,
    100% {
        transform: translateY(0);
    }
    50% {
        transform: translateY(-8px);
    }
}
.animate-float-slow {
    animation: float 5s ease-in-out infinite;
}

@keyframes pulse-glow {
    0%,
    100% {
        opacity: 0.8;
        transform: scale(1);
    }
    50% {
        opacity: 1;
        transform: scale(1.1);
    }
}
.animate-pulse-slow {
    animation: pulse-glow 3s ease-in-out infinite;
}

@keyframes shimmer {
    0% {
        transform: translateX(-150%) skewX(-20deg);
    }
    100% {
        transform: translateX(150%) skewX(-20deg);
    }
}
.animate-shimmer {
    animation: shimmer 5s infinite linear;
}

@keyframes ping-slow {
    75%,
    100% {
        transform: scale(2);
        opacity: 0;
    }
}
.animate-ping-slow {
    animation: ping-slow 3s cubic-bezier(0, 0, 0.2, 1) infinite;
}
</style>
