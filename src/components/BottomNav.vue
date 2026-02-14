<script setup>
import { nextTick } from "vue";
import { useCartStore } from "../stores/cart";
import { useUserStore } from "../stores/user"; // Import User Store
import {
    Home,
    Sparkles,
    User,
    ShoppingBag,
    LogIn,
    ClipboardList,
} from "lucide-vue-next";
import { useRouter, useRoute } from "vue-router";

const cart = useCartStore();
const userStore = useUserStore();
const router = useRouter();
const route = useRoute();

const scrollToId = async (id) => {
    await nextTick();

    let tries = 0;
    const maxTries = 25; // ~1.25s
    const tick = () => {
        const el = document.getElementById(id);
        if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "start" });
            return;
        }
        tries++;
        if (tries < maxTries) setTimeout(tick, 50);
    };
    tick();
};

const navigateHomeSection = async (id) => {
    try {
        // set hash biar highlight menu juga konsisten
        if (route.path !== "/") {
            await router.push({ path: "/", hash: `#${id}` });
        } else {
            if (route.hash !== `#${id}`) await router.replace({ hash: `#${id}` });
        }

        await scrollToId(id);
    } catch (e) {
        console.error("navigateHomeSection error:", e);
    }
};

const goHome = async () => {
    try {
        if (route.path !== "/") {
            await router.push({ path: "/", hash: "" });
        } else {
            if (route.hash) await router.replace({ hash: "" });
        }

        // Scroll ke atas biar responsif
        window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) {
        console.error("goHome error:", e);
    }
};

const navigate = (path) => router.push(path);

// LOGIKA BARU UNTUK MEMBER TAB
const handleMemberClick = () => {
    if (userStore.user) {
        // Jika SUDAH LOGIN: Scroll ke atas (Dashboard)
        navigateHomeSection("home");
    } else {
        // Jika BELUM LOGIN: Buka Modal Login
        userStore.toggleAuthModal(true);
    }
};

const isActive = (path) => route.path === path;
const isActiveHash = (hash) => route.path === "/" && route.hash === `#${hash}`;
const isHomeActive = () => route.path === "/" && (!route.hash || route.hash === "#home");
const isTrackActive = () => route.path.startsWith("/track");
</script>

<template>
    <div
        class="fixed bottom-0 left-0 w-full bg-white/90 dark:bg-charcoal/90 backdrop-blur-lg border-t border-slate-100 dark:border-slate-800 pb-safe z-50 md:hidden transition-all duration-300"
    >
        <div class="flex justify-around items-center h-16 px-2">
            <!-- Home -->
            <button
                @click="goHome"
                class="nav-item flex flex-col items-center gap-0.5 p-2 w-16 transition-all duration-300 group"
            >
                <div class="relative">
                    <Home
                        :size="22"
                        class="transition-all duration-300"
                        :class="
                            isHomeActive()
                                ? 'text-sky-500 fill-sky-500/20 scale-110'
                                : 'text-slate-400 dark:text-slate-500 group-active:scale-90'
                        "
                    />
                </div>
                <span
                    class="text-[10px] font-bold transition-colors duration-300"
                    :class="
                        isHomeActive()
                            ? 'text-sky-500'
                            : 'text-slate-400 dark:text-slate-500'
                    "
                >Home</span>
                <div class="h-1 w-1 rounded-full transition-all duration-300" :class="isHomeActive() ? 'bg-sky-400 scale-100' : 'bg-transparent scale-0'"></div>
            </button>

            <!-- Jajan -->
            <button
                @click="navigateHomeSection('services')"
                class="nav-item flex flex-col items-center gap-0.5 p-2 w-16 transition-all duration-300 group"
            >
                <div class="relative">
                    <Sparkles
                        :size="22"
                        class="transition-all duration-300"
                        :class="
                            isActiveHash('services')
                                ? 'text-amber-400 scale-110'
                                : 'text-slate-400 dark:text-slate-500 group-active:scale-90'
                        "
                    />
                </div>
                <span
                    class="text-[10px] font-bold transition-colors duration-300"
                    :class="isActiveHash('services') ? 'text-amber-500' : 'text-slate-400 dark:text-slate-500'"
                >Jajan</span>
                <div class="h-1 w-1 rounded-full transition-all duration-300" :class="isActiveHash('services') ? 'bg-amber-400 scale-100' : 'bg-transparent scale-0'"></div>
            </button>

            <!-- Cart FAB -->
            <div class="relative -top-5">
                <button
                    @click="cart.toggleCart()"
                    class="cart-fab flex items-center justify-center w-14 h-14 bg-gradient-to-tr from-sky-400 to-indigo-500 rounded-full shadow-lg shadow-sky-300/50 dark:shadow-none border-4 border-white dark:border-charcoal transition-all duration-300 active:scale-90 hover:shadow-xl"
                >
                    <ShoppingBag :size="24" class="text-white" />
                    <transition name="badge-pop">
                        <span
                            v-if="cart.totalItems > 0"
                            :key="cart.totalItems"
                            class="absolute -top-0.5 -right-0.5 w-5 h-5 bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white dark:border-charcoal badge-wiggle"
                        >
                            {{ cart.totalItems }}
                        </span>
                    </transition>
                </button>
                <!-- Glow ring -->
                <div class="absolute inset-0 rounded-full bg-sky-400/20 dark:bg-indigo-500/10 animate-ping-slow pointer-events-none"></div>
            </div>

            <!-- Track -->
            <button
                @click="navigate('/track/all')"
                class="nav-item flex flex-col items-center gap-0.5 p-2 w-16 transition-all duration-300 group"
            >
                <div class="relative">
                    <ClipboardList
                        :size="22"
                        class="transition-all duration-300"
                        :class="
                            route.path.startsWith('/track')
                                ? 'text-indigo-500 scale-110'
                                : 'text-slate-400 dark:text-slate-500 group-active:scale-90'
                        "
                    />
                </div>
                <span
                    class="text-[10px] font-bold transition-colors duration-300"
                    :class="
                        route.path.startsWith('/track')
                            ? 'text-indigo-500'
                            : 'text-slate-400 dark:text-slate-500'
                    "
                >
                    Track
                </span>
                <div class="h-1 w-1 rounded-full transition-all duration-300" :class="route.path.startsWith('/track') ? 'bg-indigo-400 scale-100' : 'bg-transparent scale-0'"></div>
            </button>

            <!-- Member / Login -->
            <button
                @click="handleMemberClick"
                class="nav-item flex flex-col items-center gap-0.5 p-2 w-16 transition-all duration-300 group"
            >
                <div v-if="userStore.user" class="relative">
                    <User
                        :size="22"
                        class="text-indigo-500 fill-indigo-500/20 transition-all duration-300"
                    />
                    <span
                        class="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full border border-white animate-pulse"
                    ></span>
                </div>
                <LogIn
                    v-else
                    :size="22"
                    class="text-slate-400 dark:text-slate-500 transition-all duration-300 group-active:scale-90"
                />

                <span
                    class="text-[10px] font-bold transition-colors duration-300"
                    :class="
                        userStore.user
                            ? 'text-indigo-500'
                            : 'text-slate-400 dark:text-slate-500'
                    "
                >
                    {{ userStore.user ? "Akun" : "Login" }}
                </span>
                <div class="h-1 w-1 rounded-full transition-all duration-300" :class="userStore.user ? 'bg-indigo-400 scale-100' : 'bg-transparent scale-0'"></div>
            </button>
        </div>
    </div>
</template>

<style scoped>
.pb-safe {
    padding-bottom: env(safe-area-inset-bottom);
}

/* Nav item press */
.nav-item:active {
    transform: scale(0.92);
}

/* Cart FAB juicy bounce */
.cart-fab:active {
    animation: fab-squish 0.3s ease;
}
@keyframes fab-squish {
    0% { transform: scale(1); }
    40% { transform: scale(0.85); }
    70% { transform: scale(1.08); }
    100% { transform: scale(1); }
}

/* Badge pop-in */
.badge-pop-enter-active {
    animation: badge-pop-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.badge-pop-leave-active {
    animation: badge-pop-in 0.2s ease reverse;
}
@keyframes badge-pop-in {
    0% { transform: scale(0); opacity: 0; }
    60% { transform: scale(1.3); }
    100% { transform: scale(1); opacity: 1; }
}

/* Badge wiggle on appear */
.badge-wiggle {
    animation: wiggle 0.5s ease 0.1s;
}
@keyframes wiggle {
    0%, 100% { transform: rotate(0deg); }
    20% { transform: rotate(-12deg); }
    40% { transform: rotate(10deg); }
    60% { transform: rotate(-6deg); }
    80% { transform: rotate(4deg); }
}

/* Slow ping for glow */
.animate-ping-slow {
    animation: ping-slow 3s cubic-bezier(0, 0, 0.2, 1) infinite;
}
@keyframes ping-slow {
    0% { transform: scale(1); opacity: 0.3; }
    75%, 100% { transform: scale(1.3); opacity: 0; }
}
</style>
