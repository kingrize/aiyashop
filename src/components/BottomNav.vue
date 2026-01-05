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
            <button
                @click="goHome"
                class="flex flex-col items-center gap-1 p-2 w-16 transition group"
            >
                <Home
                    :size="22"
                    :class="
                        isHomeActive()
                            ? 'text-sky-500 fill-sky-500/20'
                            : 'text-slate-400 dark:text-slate-500'
                    "
                />
                <span
                    class="text-[10px] font-bold"
                    :class="
                        isHomeActive()
                            ? 'text-sky-500'
                            : 'text-slate-400 dark:text-slate-500'
                    "
                    >Home</span
                >
            </button>

            <button
                @click="navigateHomeSection('services')"
                class="flex flex-col items-center gap-1 p-2 w-16 transition group"
            >
                <Sparkles
                    :size="22"
                    :class="
                        isActiveHash('services')
                            ? 'text-amber-400'
                            : 'text-slate-400 dark:text-slate-500'
                    "
                />
                <span
                    class="text-[10px] font-bold text-slate-400 dark:text-slate-500"
                    :class="isActiveHash('services') ? 'text-amber-500' : ''"
                    >Jajan</span
                >
            </button>

            <div class="relative -top-5">
                <button
                    @click="cart.toggleCart()"
                    class="flex items-center justify-center w-14 h-14 bg-gradient-to-tr from-sky-400 to-indigo-500 rounded-full shadow-lg shadow-sky-300/50 dark:shadow-none border-4 border-white dark:border-charcoal transform active:scale-95 transition"
                >
                    <ShoppingBag :size="24" class="text-white" />
                    <span
                        v-if="cart.totalItems > 0"
                        class="absolute top-0 right-0 w-5 h-5 bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white dark:border-charcoal"
                    >
                        {{ cart.totalItems }}
                    </span>
                </button>
            </div>

            <button
                @click="navigate('/track/all')"
                class="flex flex-col items-center gap-1 p-2 w-16 transition group"
            >
                <ClipboardList
                    :size="22"
                    :class="
                        route.path.startsWith('/track')
                            ? 'text-indigo-500'
                            : 'text-slate-400 dark:text-slate-500'
                    "
                />
                <span
                    class="text-[10px] font-bold"
                    :class="
                        route.path.startsWith('/track')
                            ? 'text-indigo-500'
                            : 'text-slate-400 dark:text-slate-500'
                    "
                >
                    Track
                </span>
            </button>

            <button
                @click="handleMemberClick"
                class="flex flex-col items-center gap-1 p-2 w-16 transition group"
            >
                <div v-if="userStore.user" class="relative">
                    <User
                        :size="22"
                        class="text-indigo-500 fill-indigo-500/20"
                    />
                    <span
                        class="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full border border-white"
                    ></span>
                </div>
                <LogIn
                    v-else
                    :size="22"
                    class="text-slate-400 dark:text-slate-500"
                />

                <span
                    class="text-[10px] font-bold"
                    :class="
                        userStore.user
                            ? 'text-indigo-500'
                            : 'text-slate-400 dark:text-slate-500'
                    "
                >
                    {{ userStore.user ? "Akun" : "Login" }}
                </span>
            </button>
        </div>
    </div>
</template>

<style scoped>
.pb-safe {
    padding-bottom: env(safe-area-inset-bottom);
}
</style>
