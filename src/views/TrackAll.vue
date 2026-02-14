<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import {
    Heart,
    Package,
    Sparkles,
    Search,
    ChevronRight,
    Flame,
    PauseCircle,
    CheckCircle2,
    Filter,
    Clock3,
    PackageSearch,
    ArrowRight,
    CalendarDays,
    User,
} from "lucide-vue-next";
import { useDeliveryStore } from "../stores/delivery";

const router = useRouter();
const delivery = useDeliveryStore();

const q = ref("");
const loading = ref(false);

// filter lucu
const filter = ref("all"); // all | process | paused | done

const chipBase =
    "px-3.5 py-2.5 rounded-2xl border text-xs font-black tracking-wide transition-all duration-200 flex items-center gap-2 shadow-sm";
const chipOff =
    "bg-white/80 dark:bg-slate-900/40 border-slate-200/80 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800/60 hover:border-slate-300 dark:hover:border-white/20 hover:shadow-md";
const chipOn = {
    all: "bg-rose-500 border-rose-500 text-white shadow-lg shadow-rose-200/50 dark:shadow-rose-900/30",
    process: "bg-sky-500 border-sky-500 text-white shadow-lg shadow-sky-200/50 dark:shadow-sky-900/30",
    paused: "bg-amber-500 border-amber-500 text-white shadow-lg shadow-amber-200/50 dark:shadow-amber-900/30",
    done: "bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-200/50 dark:shadow-emerald-900/30",
};

const statusLabel = (status) => {
    const s = String(status || "process").toLowerCase();
    if (s === "done") return "Selesai";
    if (s === "paused") return "Pause";
    return "Proses";
};

const statusIcon = (status) => {
    const s = String(status || "process").toLowerCase();
    if (s === "done") return CheckCircle2;
    if (s === "paused") return PauseCircle;
    return Flame;
};

const statusBadge = (status) => {
    const s = String(status || "process").toLowerCase();
    if (s === "done")
        return "bg-emerald-500/10 text-emerald-700 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/30";
    if (s === "paused")
        return "bg-amber-500/10 text-amber-700 border-amber-200 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/30";
    return "bg-sky-500/10 text-sky-700 border-sky-200 dark:bg-sky-500/20 dark:text-sky-300 dark:border-sky-500/30";
};

// --- Cute product mapping ---
const kindOf = (o) => {
    const name = `${o?.productName || ""} ${o?.title || ""}`.toLowerCase();
    if (/(heart|❤|♡|💗|💖|💞)/i.test(name)) return "heart";
    if (/(bot|add bot|via bot)/i.test(name)) return "bot";
    if (/(member|vip|premium)/i.test(name)) return "member";
    return "default";
};

const kindIcon = (k) => {
    if (k === "heart") return Heart;
    return Package;
};

const kindBadge = (k) => {
    if (k === "heart")
        return "bg-rose-500/10 text-rose-600 border-rose-200 dark:bg-rose-500/20 dark:text-rose-300 dark:border-rose-500/30";
    if (k === "bot")
        return "bg-indigo-500/10 text-indigo-600 border-indigo-200 dark:bg-indigo-500/20 dark:text-indigo-300 dark:border-indigo-500/30";
    if (k === "member")
        return "bg-amber-500/10 text-amber-600 border-amber-200 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/30";
    return "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700";
};

const kindGradient = (k) => {
    if (k === "heart") return "from-rose-500 via-pink-500 to-red-500";
    if (k === "bot") return "from-indigo-500 via-violet-500 to-fuchsia-500";
    if (k === "member") return "from-amber-500 via-orange-500 to-rose-500";
    return "from-sky-500 via-indigo-500 to-violet-500";
};

const progressOf = (o) => {
    const total = Number(o.totalTarget || o.total || 0);
    const delivered = Number(o.deliveredTotal || o.delivered || 0);
    if (total <= 0) return 0;
    return Math.max(0, Math.min(100, (delivered / total) * 100));
};

const prettyDate = (ts) => {
    if (!ts) return "-";
    const d = ts?.toDate ? ts.toDate() : new Date(ts);
    return new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" }).format(d);
};

const prettyTime = (ts) => {
    if (!ts) return "";
    const d = ts?.toDate ? ts.toDate() : new Date(ts);
    return new Intl.DateTimeFormat("id-ID", { timeStyle: "short" }).format(d);
};

const filtered = computed(() => {
    const list = delivery.publicList || [];

    // 1) status filter (lucu chips)
    const byStatus = list.filter((o) => {
        const s = String(o.status || "process").toLowerCase();
        if (filter.value === "all") return true;
        return s === filter.value;
    });

    // 2) search filter
    const term = String(q.value || "")
        .trim()
        .toLowerCase();
    if (!term) return byStatus;

    return byStatus.filter((o) => {
        const hay = `${o.trackingCode || ""} ${o.title || ""} ${
            o.productName || ""
        } ${o.customerName || ""} ${o.customerAlias || o.customerMasked || ""}`
            .toLowerCase()
            .trim();
        return hay.includes(term);
    });

    // Sorting A (paling baru): sudah di-handle dari Firestore query (orderBy updatedAt desc)
    // jadi kita pertahankan urutan byStatus yang sudah newest.
});

async function loadAll() {
    loading.value = true;
    try {
        await delivery.fetchPublicList(); // harus orderBy updatedAt desc di store
    } finally {
        loading.value = false;
    }
}

onMounted(loadAll);
</script>

<template>
    <div class="min-h-screen bg-gradient-to-b from-cream via-amber-50/20 to-cream dark:from-charcoal dark:via-slate-900 dark:to-charcoal relative overflow-hidden">
        <!-- Floating decorations -->
        <div class="absolute inset-0 pointer-events-none overflow-hidden">
            <span class="absolute top-20 right-[8%] text-rose-200/15 dark:text-rose-500/5 text-2xl animate-float-slow">❤️</span>
            <span class="absolute top-1/3 left-[5%] text-sky-200/15 dark:text-white/5 text-xl animate-float-fast" style="animation-delay: 1.2s">☁️</span>
            <span class="absolute bottom-32 right-[12%] text-amber-200/20 dark:text-amber-500/5 text-lg animate-float-slow" style="animation-delay: 0.5s">✨</span>
            <span class="absolute bottom-20 left-[10%] text-indigo-200/10 dark:text-indigo-500/5 text-xl animate-float-fast" style="animation-delay: 2s">⭐</span>
        </div>

        <div class="w-full max-w-5xl mx-auto px-4 py-8 md:py-12 relative z-10">
            <!-- Header Section -->
            <header class="mb-8 md:mb-10">
                <div class="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                    <div>
                        <div
                            class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border bg-white dark:bg-slate-900/60 border-slate-200/80 dark:border-white/10 text-slate-600 dark:text-slate-300 shadow-sm mb-4"
                        >
                            <Package class="w-4 h-4 text-indigo-500" />
                            <span class="text-[11px] font-black tracking-widest uppercase">
                                Tracking / Progress
                            </span>
                        </div>

                        <h1 class="text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
                            Daftar Pengiriman
                        </h1>
                        <p class="mt-2 text-sm md:text-base text-slate-500 dark:text-slate-400 max-w-lg leading-relaxed">
                            Pantau progress pesanan secara real-time. Semua order ditampilkan dari yang terbaru.
                        </p>
                    </div>

                    <button
                        @click="router.push({ name: 'track' })"
                        class="shrink-0 px-5 py-3 rounded-2xl font-bold text-sm bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white shadow-lg shadow-rose-200/60 dark:shadow-rose-900/30 transition-all duration-200 active:scale-[0.98] flex items-center gap-2 group"
                    >
                        <Sparkles class="w-4 h-4" />
                        Cari Kode
                        <ArrowRight class="w-4 h-4 opacity-70 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                </div>
            </header>

            <!-- Search + Filters Card -->
            <div
                class="rounded-3xl p-5 md:p-6 border mb-8 bg-white/70 dark:bg-slate-900/50 border-white/60 dark:border-white/10 shadow-xl shadow-slate-200/40 dark:shadow-none backdrop-blur-sm"
            >
                <div class="flex flex-col lg:flex-row lg:items-start gap-5">
                    <!-- Search Input -->
                    <div class="flex-1">
                        <label class="text-[11px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5 mb-2">
                            <Search class="w-3.5 h-3.5" />
                            Pencarian
                        </label>
                        <div class="relative">
                            <input
                                v-model="q"
                                placeholder="Cari nama / produk / kode tracking..."
                                class="w-full px-4 py-3.5 rounded-2xl border bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 font-medium tracking-wide outline-none focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900/50 focus:border-indigo-300 dark:focus:border-indigo-700 transition-all duration-200"
                            />
                            <span class="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                                <Search class="w-5 h-5" />
                            </span>
                        </div>

                        <div class="mt-2.5 flex items-center gap-2 text-[11px] text-slate-400">
                            <Clock3 class="w-4 h-4" />
                            <span>Tips: Gunakan kode tracking untuk pencarian cepat</span>
                        </div>
                    </div>

                    <!-- Divider -->
                    <div class="hidden lg:block w-px h-24 bg-slate-200 dark:bg-slate-700/50"></div>

                    <!-- Filter Chips -->
                    <div class="lg:min-w-[280px]">
                        <div class="flex items-center gap-2 mb-2">
                            <Filter class="w-3.5 h-3.5 text-slate-400" />
                            <p class="text-[11px] font-black uppercase tracking-widest text-slate-400">
                                Filter Status
                            </p>
                        </div>

                        <div class="flex flex-wrap gap-2">
                            <button
                                @click="filter = 'all'"
                                :class="[chipBase, filter === 'all' ? chipOn.all : chipOff]"
                            >
                                <Sparkles class="w-4 h-4" />
                                Semua
                            </button>

                            <button
                                @click="filter = 'process'"
                                :class="[chipBase, filter === 'process' ? chipOn.process : chipOff]"
                            >
                                <Flame class="w-4 h-4" />
                                Proses
                            </button>

                            <button
                                @click="filter = 'paused'"
                                :class="[chipBase, filter === 'paused' ? chipOn.paused : chipOff]"
                            >
                                <PauseCircle class="w-4 h-4" />
                                Pause
                            </button>

                            <button
                                @click="filter = 'done'"
                                :class="[chipBase, filter === 'done' ? chipOn.done : chipOff]"
                            >
                                <CheckCircle2 class="w-4 h-4" />
                                Selesai
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Loading Skeleton -->
            <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div
                    v-for="i in 6"
                    :key="i"
                    class="rounded-3xl p-5 border animate-pulse bg-white dark:bg-slate-900/40 border-slate-200/80 dark:border-white/10"
                >
                    <div class="flex items-start gap-4">
                        <div class="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-2xl"></div>
                        <div class="flex-1 space-y-2">
                            <div class="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
                            <div class="h-5 w-48 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
                            <div class="h-3 w-32 bg-slate-100 dark:bg-slate-800 rounded-lg"></div>
                        </div>
                    </div>
                    <div class="mt-4 space-y-2">
                        <div class="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full"></div>
                        <div class="h-2 w-2/3 bg-slate-100 dark:bg-slate-800 rounded-full"></div>
                    </div>
                </div>
            </div>

            <!-- Empty State -->
            <div
                v-else-if="filtered.length === 0"
                class="rounded-3xl p-8 md:p-12 border bg-white dark:bg-slate-900/40 border-slate-200/80 dark:border-white/10 text-center"
            >
                <div class="w-20 h-20 mx-auto mb-4 rounded-3xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    <PackageSearch class="w-10 h-10 text-slate-400" />
                </div>
                <h3 class="text-lg font-bold text-slate-700 dark:text-slate-200 mb-2">
                    Tidak Ada Data
                </h3>
                <p class="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                    Belum ada progress yang dipublikasikan, atau pencarian tidak menemukan hasil.
                </p>
                <button
                    v-if="q || filter !== 'all'"
                    @click="q = ''; filter = 'all'"
                    class="mt-4 px-4 py-2 rounded-xl text-sm font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition"
                >
                    Reset Filter
                </button>
            </div>

            <!-- Tracking Cards Grid -->
            <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                    v-for="o in filtered"
                    :key="o.trackingCode"
                    @click="
                        router.push({
                            name: 'track-code',
                            params: {
                                code: (o.trackingCode || '').toUpperCase(),
                            },
                        })
                    "
                    class="group text-left rounded-3xl p-5 border transition-all duration-200 bg-white dark:bg-slate-900/50 border-slate-200/80 dark:border-white/10 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-none hover:border-slate-300 dark:hover:border-white/20 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.995]"
                >
                    <!-- Card Header -->
                    <div class="flex items-start justify-between gap-3 mb-4">
                        <div class="flex items-start gap-3 min-w-0">
                            <!-- Icon Bubble -->
                            <div
                                class="w-12 h-12 rounded-2xl border shrink-0 flex items-center justify-center shadow-sm transition-transform duration-200 group-hover:scale-105"
                                :class="kindBadge(kindOf(o))"
                            >
                                <component :is="kindIcon(kindOf(o))" class="w-5 h-5" />
                            </div>

                            <!-- Title & Meta -->
                            <div class="min-w-0">
                                <!-- Badges Row -->
                                <div class="flex items-center gap-1.5 flex-wrap mb-1.5">
                                    <span
                                        class="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wide border"
                                        :class="statusBadge(o.status)"
                                    >
                                        <component :is="statusIcon(o.status)" class="w-3 h-3" />
                                        {{ statusLabel(o.status) }}
                                    </span>

                                    <span
                                        class="px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold tracking-wider border bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
                                    >
                                        {{ (o.trackingCode || "").toUpperCase() }}
                                    </span>
                                </div>

                                <!-- Product Title -->
                                <h3 class="text-base font-bold text-slate-800 dark:text-white truncate leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                    {{ o.title || o.productName || "Pesanan" }}
                                </h3>
                            </div>
                        </div>

                        <!-- Arrow Icon -->
                        <div class="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 opacity-50 group-hover:opacity-100 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/30 transition-all">
                            <ChevronRight class="w-4 h-4 text-slate-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" />
                        </div>
                    </div>

                    <!-- Customer Info -->
                    <div class="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-4">
                        <User class="w-4 h-4 shrink-0" />
                        <span class="font-semibold text-slate-700 dark:text-slate-200">
                            {{ o.customerName || "Customer" }}
                        </span>
                        <span v-if="o.usernameAlias" class="text-slate-300 dark:text-slate-600">•</span>
                        <span v-if="o.usernameAlias" class="font-medium text-slate-500 dark:text-slate-400">
                            {{ o.usernameAlias }}
                        </span>
                    </div>

                    <!-- Progress Section -->
                    <div class="space-y-2">
                        <div class="flex items-center justify-between">
                            <p class="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                Progress
                            </p>
                            <p class="text-xs font-bold text-slate-700 dark:text-slate-200">
                                {{ Number(o.deliveredTotal || o.delivered || 0) }} / {{ Number(o.totalTarget || o.total || 0) }}
                                <span class="text-slate-400 font-medium ml-1">({{ Math.round(progressOf(o)) }}%)</span>
                            </p>
                        </div>

                        <!-- Progress Bar -->
                        <div class="relative h-2.5 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                            <div
                                class="h-full rounded-full bg-gradient-to-r transition-all duration-700 ease-out"
                                :class="kindGradient(kindOf(o))"
                                :style="{ width: `${progressOf(o)}%` }"
                            ></div>
                        </div>
                    </div>

                    <!-- Footer -->
                    <div class="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <div class="flex items-center gap-1.5 text-[11px] text-slate-400">
                            <CalendarDays class="w-3.5 h-3.5" />
                            <span>{{ prettyDate(o.updatedAt) }}</span>
                            <span class="mx-1">•</span>
                            <span>{{ prettyTime(o.updatedAt) }}</span>
                        </div>
                        <span class="text-[11px] font-bold text-indigo-500 dark:text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity">
                            Lihat Detail →
                        </span>
                    </div>
                </button>
            </div>

            <!-- Footer Note -->
            <p class="mt-8 text-center text-[11px] text-slate-400 max-w-lg mx-auto leading-relaxed">
                Halaman ini bersifat publik. Admin menggunakan nama yang aman untuk ditampilkan.
            </p>
        </div>
    </div>
</template>

<style scoped>
@keyframes shine {
    100% {
        transform: translateX(100%);
    }
}
.animate-shine {
    animation: shine 2.2s infinite linear;
}
</style>
