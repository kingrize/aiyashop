<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import {
    Package,
    Sparkles,
    Search,
    ChevronRight,
    Flame,
    PauseCircle,
    CheckCircle2,
    Filter,
    Clock3,
} from "lucide-vue-next";
import { useDeliveryStore } from "../stores/delivery";

const router = useRouter();
const delivery = useDeliveryStore();

const q = ref("");
const loading = ref(false);

// filter lucu
const filter = ref("all"); // all | process | paused | done

const chipBase =
    "px-3 py-2 rounded-full border text-xs font-black tracking-wide transition flex items-center gap-2";
const chipOff =
    "bg-white/70 dark:bg-slate-950/20 border-slate-200/70 dark:border-white/10 text-slate-700 dark:text-slate-200 hover:bg-white/90 dark:hover:bg-white/5";
const chipOn = {
    all: "bg-rose-500/15 border-rose-300/30 text-rose-700 dark:text-rose-200",
    process: "bg-sky-500/15 border-sky-300/30 text-sky-700 dark:text-sky-200",
    paused: "bg-amber-500/15 border-amber-300/30 text-amber-800 dark:text-amber-200",
    done: "bg-emerald-500/15 border-emerald-300/30 text-emerald-800 dark:text-emerald-200",
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
        return "bg-emerald-500/15 text-emerald-300 border-emerald-400/20";
    if (s === "paused")
        return "bg-amber-500/15 text-amber-200 border-amber-400/20";
    return "bg-sky-500/15 text-sky-200 border-sky-400/20";
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
    <div class="w-full max-w-5xl mx-auto px-4 py-6 md:py-10">
        <!-- Header -->
        <div
            class="mb-6 md:mb-8 flex items-end justify-between gap-3 flex-wrap"
        >
            <div>
                <div
                    class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border bg-white/60 dark:bg-slate-900/25 border-white/60 dark:border-white/10 text-slate-700 dark:text-slate-200 shadow-sm"
                >
                    <Package class="w-4 h-4 text-indigo-400" />
                    <span
                        class="text-[11px] font-black tracking-widest uppercase"
                        >Progress Publik</span
                    >
                </div>

                <h1
                    class="mt-3 text-2xl md:text-4xl font-black tracking-tight text-slate-800 dark:text-white"
                >
                    Daftar Pengiriman
                </h1>
                <p
                    class="mt-1 text-sm md:text-base text-slate-500 dark:text-slate-400"
                >
                    Semua progress yang dipublikasikan admin. Urutan default:
                    <span class="font-black text-slate-700 dark:text-slate-200"
                        >paling baru</span
                    >.
                </p>
            </div>

            <button
                @click="router.push({ name: 'track' })"
                class="px-4 py-3 rounded-2xl font-black text-sm bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-200/60 dark:shadow-none transition active:scale-[0.98] flex items-center gap-2"
            >
                <Sparkles class="w-4 h-4" />
                Cari Kode
                <ChevronRight class="w-4 h-4 opacity-70" />
            </button>
        </div>

        <!-- Search + Filters -->
        <div
            class="rounded-3xl p-4 md:p-5 border mb-6 bg-white/70 dark:bg-slate-900/30 border-white/60 dark:border-white/10 shadow-xl shadow-slate-200/40 dark:shadow-none"
        >
            <div class="flex items-start justify-between gap-3 flex-wrap">
                <div class="flex-1 min-w-[240px]">
                    <label
                        class="text-[10px] font-black uppercase tracking-widest text-slate-400"
                        >Pencarian</label
                    >
                    <div class="mt-2 relative">
                        <input
                            v-model="q"
                            placeholder="Cari nama / produk / kode..."
                            class="w-full px-4 py-3 rounded-2xl border bg-white/70 dark:bg-slate-950/20 border-slate-200/70 dark:border-white/10 text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 font-bold tracking-wide outline-none focus:ring-2 focus:ring-indigo-300/40"
                        />
                        <span
                            class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                        >
                            <Search class="w-4 h-4" />
                        </span>
                    </div>

                    <div
                        class="mt-2 flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400"
                    >
                        <Clock3 class="w-4 h-4" />
                        <span>Tips: pakai kode tracking biar cepat</span>
                    </div>
                </div>

                <div class="min-w-[260px]">
                    <div class="flex items-center gap-2">
                        <Filter class="w-4 h-4 text-slate-400" />
                        <p
                            class="text-[10px] font-black uppercase tracking-widest text-slate-400"
                        >
                            Filter Lucu
                        </p>
                    </div>

                    <div class="mt-2 flex flex-wrap gap-2">
                        <button
                            @click="filter = 'all'"
                            :class="[
                                chipBase,
                                filter === 'all' ? chipOn.all : chipOff,
                            ]"
                        >
                            <Sparkles class="w-4 h-4 text-rose-400" />
                            Semua
                        </button>

                        <button
                            @click="filter = 'process'"
                            :class="[
                                chipBase,
                                filter === 'process' ? chipOn.process : chipOff,
                            ]"
                        >
                            <Flame class="w-4 h-4 text-sky-400" />
                            Proses
                        </button>

                        <button
                            @click="filter = 'paused'"
                            :class="[
                                chipBase,
                                filter === 'paused' ? chipOn.paused : chipOff,
                            ]"
                        >
                            <PauseCircle class="w-4 h-4 text-amber-400" />
                            Pause
                        </button>

                        <button
                            @click="filter = 'done'"
                            :class="[
                                chipBase,
                                filter === 'done' ? chipOn.done : chipOff,
                            ]"
                        >
                            <CheckCircle2 class="w-4 h-4 text-emerald-400" />
                            Selesai
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- List -->
        <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div
                v-for="i in 6"
                :key="i"
                class="rounded-3xl p-5 border animate-pulse bg-white/60 dark:bg-slate-900/25 border-white/60 dark:border-white/10"
            >
                <div
                    class="h-4 w-40 bg-slate-200/70 dark:bg-white/10 rounded-lg"
                ></div>
                <div
                    class="mt-3 h-3 w-full bg-slate-200/60 dark:bg-white/10 rounded-full"
                ></div>
                <div
                    class="mt-2 h-3 w-2/3 bg-slate-200/60 dark:bg-white/10 rounded-full"
                ></div>
            </div>
        </div>

        <div
            v-else-if="filtered.length === 0"
            class="rounded-3xl p-6 border bg-white/60 dark:bg-slate-900/25 border-white/60 dark:border-white/10"
        >
            <p class="text-sm font-bold text-slate-600 dark:text-slate-300">
                Belum ada progress publik, atau pencarian tidak ketemu.
            </p>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-3">
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
                class="text-left rounded-3xl p-5 border transition bg-white/70 dark:bg-slate-900/30 border-white/60 dark:border-white/10 shadow-xl shadow-slate-200/35 dark:shadow-none hover:translate-y-[-1px] active:translate-y-[0px]"
            >
                <div class="flex items-start justify-between gap-3">
                    <div class="min-w-0">
                        <div class="flex items-center gap-2">
                            <span
                                class="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border"
                                :class="statusBadge(o.status)"
                            >
                                {{ statusLabel(o.status) }}
                            </span>

                            <span
                                class="px-2.5 py-1 rounded-full text-[10px] font-black tracking-widest border bg-white/60 dark:bg-white/5 border-slate-200/60 dark:border-white/10 text-slate-700 dark:text-slate-200"
                            >
                                {{ (o.trackingCode || "").toUpperCase() }}
                            </span>
                        </div>

                        <h3
                            class="mt-2 text-lg font-black tracking-tight text-slate-800 dark:text-white truncate"
                        >
                            {{ o.title || o.productName || "Pesanan" }}
                        </h3>

                        <p
                            class="mt-1 text-sm text-slate-500 dark:text-slate-400"
                        >
                            Nama:
                            <span
                                class="font-black text-slate-700 dark:text-slate-200"
                            >
                                {{
                                    o.customerName ||
                                    o.customerAlias ||
                                    o.customerMasked ||
                                    "Customer"
                                }}
                            </span>
                            <span
                                v-if="o.usernameAlias"
                                class="text-slate-400 font-bold"
                            >
                                •
                            </span>
                            <span
                                v-if="o.usernameAlias"
                                class="font-black text-slate-600 dark:text-slate-300"
                            >
                                {{ o.usernameAlias }}
                            </span>
                        </p>
                    </div>

                    <component
                        :is="statusIcon(o.status)"
                        class="w-6 h-6 shrink-0 text-rose-400"
                    />
                </div>

                <div class="mt-4">
                    <div class="flex items-center justify-between mb-2">
                        <p
                            class="text-[11px] font-black tracking-widest uppercase text-slate-400"
                        >
                            Progress
                        </p>
                        <p
                            class="text-xs font-black text-slate-700 dark:text-slate-200"
                        >
                            {{
                                Number(o.deliveredTotal || o.delivered || 0)
                            }}/{{ Number(o.totalTarget || o.total || 0) }}
                        </p>
                    </div>

                    <div
                        class="h-3 rounded-full overflow-hidden border bg-slate-100/80 dark:bg-white/5 border-slate-200/60 dark:border-white/10"
                    >
                        <div
                            class="h-full rounded-full bg-gradient-to-r from-rose-500 via-pink-500 to-indigo-500 transition-all duration-700 ease-out"
                            :style="{ width: `${progressOf(o)}%` }"
                        />
                    </div>

                    <div class="mt-2 flex items-center justify-between">
                        <p
                            class="text-[11px] font-black text-slate-500 dark:text-slate-400"
                        >
                            {{ Math.round(progressOf(o)) }}%
                        </p>
                        <p
                            class="text-[11px] font-black text-slate-500 dark:text-slate-400"
                        >
                            Update:
                            <span class="text-slate-700 dark:text-slate-200">
                                {{ prettyDate(o.updatedAt) }}
                            </span>
                            <span class="text-slate-400 font-bold">•</span>
                            <span class="text-slate-700 dark:text-slate-200">
                                {{ prettyTime(o.updatedAt) }}
                            </span>
                        </p>
                    </div>
                </div>
            </button>
        </div>

        <p class="mt-6 text-[11px] text-slate-500 dark:text-slate-400">
            Halaman ini publik. Admin sebaiknya memakai <b>customerName</b> yang
            aman ditampilkan, dan <b>usernameAlias</b> disamarkan (mis. ji***).
        </p>
    </div>
</template>
