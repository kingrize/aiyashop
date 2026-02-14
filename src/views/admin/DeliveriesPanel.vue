<script setup>
import { onMounted, ref, computed } from "vue";
import { useDeliveryStore } from "../../stores/delivery";
import { useToastStore } from "../../stores/toast";
import { formatRupiah } from "../../utils/format";
import {
    Plus,
    RefreshCw,
    Copy,
    Link2,
    ClipboardList,
    CheckCircle2,
    PauseCircle,
    PlayCircle,
    Trash2,
    Pencil,
    Save,
    X,
    Calendar,
    Send,
    ChevronDown,
    ChevronUp,
    Package,
} from "lucide-vue-next";

const deliveryStore = useDeliveryStore();
const toast = useToastStore();

// Contact platform options with display labels and placeholders
const CONTACT_PLATFORMS = [
    { value: "whatsapp", label: "WhatsApp", placeholder: "e.g. +628123456789" },
    { value: "instagram", label: "Instagram", placeholder: "e.g. @username" },
    { value: "tiktok", label: "TikTok", placeholder: "e.g. @username" },
    { value: "x", label: "X (Twitter)", placeholder: "e.g. @handle" },
    { value: "in_game", label: "In-Game (Sky COTL)", placeholder: "Sky username" },
    { value: "other", label: "Other", placeholder: "Contact info" },
];

const getTrackingUrl = (code) => {
    const origin = window.location.origin;
    return `${origin}/track/${code}`;
};

const copyText = async (text, okMsg = "Berhasil disalin ✨") => {
    try {
        await navigator.clipboard.writeText(String(text || ""));
        toast.trigger(okMsg, "success");
    } catch (e) {
        toast.trigger("Gagal menyalin", "error");
    }
};

const isCreateOpen = ref(false);
const isLogOpen = ref(false);
const isEditOpen = ref(false);
const expandedId = ref(null);

const todayJakarta = () => {
    // YYYY-MM-DD (Asia/Jakarta)
    try {
        return new Date().toLocaleDateString("en-CA", {
            timeZone: "Asia/Jakarta",
        });
    } catch {
        // fallback local
        return new Date().toISOString().slice(0, 10);
    }
};

const createForm = ref({
    customerName: "",
    contactPlatform: "in_game",
    contactIdentifier: "",
    product: "Heart",
    total: 50,
    perDay: 10,
    startDate: todayJakarta(),
    notes: "",
    status: "ongoing",
});

const editForm = ref({
    id: "",
    customerName: "",
    contactPlatform: "in_game",
    contactIdentifier: "",
    product: "Heart",
    total: 0,
    perDay: 10,
    startDate: "",
    notes: "",
    status: "ongoing",
});

// Computed properties for dynamic placeholders
const createPlatformInfo = computed(() =>
    CONTACT_PLATFORMS.find(p => p.value === createForm.value.contactPlatform) || CONTACT_PLATFORMS[4]
);
const editPlatformInfo = computed(() =>
    CONTACT_PLATFORMS.find(p => p.value === editForm.value.contactPlatform) || CONTACT_PLATFORMS[4]
);

const logForm = ref({
    id: "",
    date: todayJakarta(),
    delivered: 10,
    note: "",
});

const sumDelivered = (logs = []) =>
    (logs || []).reduce((acc, x) => acc + Number(x?.delivered || 0), 0);

const calcProgress = (item) => {
    const total = Number(item?.total || 0);
    const sent = sumDelivered(item?.logs);
    const percent =
        total > 0 ? Math.min(100, Math.round((sent / total) * 100)) : 0;
    const remaining = Math.max(0, total - sent);
    const perDay = Math.max(1, Number(item?.perDay || 1));
    const daysLeft = remaining === 0 ? 0 : Math.ceil(remaining / perDay);
    return { total, sent, percent, remaining, daysLeft, perDay };
};

/**
 * ✅ FIX UTAMA:
 * Pastikan rows SELALU array (nggak pernah undefined),
 * jadi rows.length dan v-for aman walaupun data belum keload.
 */
const rows = computed(() => {
    const s = deliveryStore.sorted;
    return Array.isArray(s) ? s : [];
});

const statusBadge = (s) => {
    if (s === "done")
        return "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border-emerald-200/30";
    if (s === "paused")
        return "bg-amber-500/15 text-amber-600 dark:text-amber-300 border-amber-200/30";
    return "bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 border-indigo-200/30";
};

const statusLabel = (s) => {
    if (s === "done") return "Selesai";
    if (s === "paused") return "Pause";
    return "Proses";
};

const resetCreate = () => {
    createForm.value = {
        customerName: "",
        contactPlatform: "in_game",
        contactIdentifier: "",
        product: "Heart",
        total: 50,
        perDay: 10,
        startDate: todayJakarta(),
        notes: "",
        status: "ongoing",
    };
};

const openLog = (item) => {
    const p = calcProgress(item);
    logForm.value = {
        id: item.id,
        date: todayJakarta(),
        delivered: p.perDay,
        note: "",
    };
    isLogOpen.value = true;
};

const openEdit = (item) => {
    editForm.value = {
        id: item.id,
        customerName: item.customerName || "",
        contactPlatform: item.contactPlatform || "in_game",
        contactIdentifier: item.contactIdentifier || item.account || "",
        product: item.product || "Heart",
        total: Number(item.total || 0),
        perDay: Number(item.perDay || 10),
        startDate: item.startDate || todayJakarta(),
        notes: item.notes || "",
        status: item.status || "ongoing",
    };
    isEditOpen.value = true;
};

const toggleExpand = (id) => {
    expandedId.value = expandedId.value === id ? null : id;
};

const handleCreate = async () => {
    try {
        await deliveryStore.createDelivery(createForm.value);
        toast.trigger("Order tracker ditambahkan ✨", "success");
        isCreateOpen.value = false;
        resetCreate();
    } catch (e) {
        toast.trigger(e?.message || "Gagal menambah order.", "error");
    }
};

const handleUpdate = async () => {
    try {
        const { id, ...patch } = editForm.value;
        await deliveryStore.updateDelivery(id, patch);
        toast.trigger("Order berhasil diupdate ✅", "success");
        isEditOpen.value = false;
    } catch (e) {
        toast.trigger(e?.message || "Gagal update order.", "error");
    }
};

const handleLogSave = async () => {
    try {
        await deliveryStore.upsertLog(logForm.value.id, {
            date: logForm.value.date,
            delivered: Number(logForm.value.delivered),
            note: logForm.value.note,
        });
        toast.trigger("Log harian tersimpan 📦", "success");
        isLogOpen.value = false;
    } catch (e) {
        toast.trigger(e?.message || "Gagal simpan log.", "error");
    }
};

const handleDelete = async (item) => {
    const displayName = item.contactIdentifier || item.account || "unknown";
    const ok = window.confirm(
        `Hapus tracker untuk ${item.customerName} (${displayName})?`,
    );
    if (!ok) return;
    try {
        await deliveryStore.removeDelivery(item.id);
        toast.trigger("Tracker dihapus.", "info");
    } catch (e) {
        toast.trigger(e?.message || "Gagal menghapus.", "error");
    }
};

const toggleStatus = async (item) => {
    try {
        if (item.status === "paused") {
            await deliveryStore.setStatus(item.id, "ongoing");
            toast.trigger("Dilanjutkan ✅", "success");
        } else if (item.status === "ongoing") {
            await deliveryStore.setStatus(item.id, "paused");
            toast.trigger("Dipause ⏸️", "info");
        }
    } catch (e) {
        toast.trigger(e?.message || "Gagal ubah status.", "error");
    }
};

const markDone = async (item) => {
    try {
        await deliveryStore.setStatus(item.id, "done");
        toast.trigger("Ditandai selesai ✨", "success");
    } catch (e) {
        toast.trigger(e?.message || "Gagal menandai selesai.", "error");
    }
};

onMounted(async () => {
    /**
     * ✅ FIX tambahan:
     * guard items biar gak error kalau items undefined.
     */
    const items = deliveryStore.items;
    if (!Array.isArray(items) || items.length === 0) {
        await deliveryStore.fetchAll();
    }
});
</script>

<template>
    <div class="space-y-5">
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
                <h2 class="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <ClipboardList :size="20" class="text-indigo-500" />
                    Delivery Tracker
                </h2>
                <p class="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md">
                    Catat pengiriman harian biar kamu gampang pantau progress.
                </p>
            </div>

            <div class="flex gap-2">
                <button
                    @click="deliveryStore.fetchAll()"
                    class="flex-1 sm:flex-none px-4 py-3 rounded-2xl font-bold text-sm border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition flex items-center justify-center gap-2"
                >
                    <RefreshCw :size="16" />
                    <span class="sm:inline">Refresh</span>
                </button>
                <button
                    @click="isCreateOpen = !isCreateOpen"
                    class="flex-1 sm:flex-none px-4 py-3 rounded-2xl font-bold text-sm bg-indigo-500 text-white hover:bg-indigo-600 shadow-lg shadow-indigo-500/30 transition flex items-center justify-center gap-2 active:scale-[0.98]"
                >
                    <Plus :size="16" />
                    <span>Tambah</span>
                </button>
            </div>
        </div>

        <!-- Create form -->
        <div
            v-if="isCreateOpen"
            class="bg-white dark:bg-slate-900/80 p-5 rounded-3xl shadow-lg border border-slate-200/80 dark:border-white/10 animate-in slide-in-from-top-2"
        >
            <div class="flex items-center justify-between mb-4">
                <h3 class="font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <Package :size="18" class="text-indigo-500" />
                    Tambah Tracker
                </h3>
                <button
                    class="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 transition"
                    @click="isCreateOpen = false"
                >
                    <X :size="18" />
                </button>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                    <label class="text-[10px] font-black tracking-widest uppercase text-slate-400">Nama Pembeli</label>
                    <input
                        v-model="createForm.customerName"
                        class="mt-1 w-full px-4 py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white font-bold focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                        placeholder="mis. Jiya"
                    />
                </div>

                <div>
                    <label class="text-[10px] font-black tracking-widest uppercase text-slate-400">Platform Kontak</label>
                    <select
                        v-model="createForm.contactPlatform"
                        class="mt-1 w-full px-4 py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white font-bold focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                    >
                        <option v-for="p in CONTACT_PLATFORMS" :key="p.value" :value="p.value">{{ p.label }}</option>
                    </select>
                </div>

                <div>
                    <label class="text-[10px] font-black tracking-widest uppercase text-slate-400">{{ createPlatformInfo.label }}</label>
                    <input
                        v-model="createForm.contactIdentifier"
                        class="mt-1 w-full px-4 py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white font-bold focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                        :placeholder="createPlatformInfo.placeholder"
                    />
                </div>

                <div>
                    <label class="text-[10px] font-black tracking-widest uppercase text-slate-400">Produk</label>
                    <input
                        v-model="createForm.product"
                        class="mt-1 w-full px-4 py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white font-bold focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                        placeholder="Heart"
                    />
                </div>

                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label class="text-[10px] font-black tracking-widest uppercase text-slate-400">Total</label>
                        <input
                            v-model.number="createForm.total"
                            type="number"
                            min="1"
                            class="mt-1 w-full px-4 py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white font-bold focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                        />
                    </div>
                    <div>
                        <label class="text-[10px] font-black tracking-widest uppercase text-slate-400">Kirim/Hari</label>
                        <input
                            v-model.number="createForm.perDay"
                            type="number"
                            min="1"
                            class="mt-1 w-full px-4 py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white font-bold focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                        />
                    </div>
                </div>

                <div>
                    <label class="text-[10px] font-black tracking-widest uppercase text-slate-400">Mulai</label>
                    <div class="relative mt-1">
                        <Calendar :size="16" class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            v-model="createForm.startDate"
                            type="date"
                            class="pl-11 w-full px-4 py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white font-bold focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                        />
                    </div>
                </div>

                <div>
                    <label class="text-[10px] font-black tracking-widest uppercase text-slate-400">Catatan</label>
                    <input
                        v-model="createForm.notes"
                        class="mt-1 w-full px-4 py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white font-bold focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                        placeholder="opsional"
                    />
                </div>
            </div>

            <div class="mt-5 flex flex-col sm:flex-row items-center justify-between gap-3">
                <p class="text-sm text-slate-500 dark:text-slate-400">
                    Estimasi:
                    <span class="font-black text-slate-800 dark:text-white">
                        {{ Math.ceil(Math.max(0, Number(createForm.total || 0)) / Math.max(1, Number(createForm.perDay || 1))) }} hari
                    </span>
                </p>

                <button
                    @click="handleCreate"
                    class="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-indigo-500 hover:bg-indigo-600 text-white font-black transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/30 active:scale-[0.98]"
                >
                    <Save :size="18" />
                    Simpan
                </button>
            </div>
        </div>

        <!-- List Container -->
        <div class="bg-white dark:bg-slate-900/50 rounded-3xl shadow-sm border border-slate-200/80 dark:border-white/10 overflow-hidden">
            <div class="px-5 py-4 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
                <div>
                    <p class="text-sm font-black text-slate-900 dark:text-white">Daftar Pengiriman</p>
                    <p class="text-xs text-slate-500 dark:text-slate-400">Total: {{ rows.length }} tracker</p>
                </div>
                <div v-if="deliveryStore.isLoading" class="flex items-center gap-2 text-xs text-slate-400">
                    <RefreshCw :size="14" class="animate-spin" />
                    Memuat...
                </div>
            </div>

            <div v-if="deliveryStore.error" class="px-5 py-4 text-rose-500 text-sm font-bold bg-rose-50 dark:bg-rose-900/20">
                {{ deliveryStore.error }}
            </div>

            <!-- Responsive rows -->
            <div class="divide-y divide-slate-100 dark:divide-white/5">
                <div v-for="item in rows" :key="item.id" class="p-4 sm:p-5 hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition">
                    <!-- Card Header -->
                    <div class="flex items-start justify-between gap-3">
                        <div class="min-w-0 flex-1">
                            <div class="flex flex-wrap items-center gap-2">
                                <p class="text-base font-black text-slate-900 dark:text-white">
                                    {{ item.customerName }}
                                </p>
                                <span class="px-2.5 py-1 rounded-full text-[10px] font-black border" :class="statusBadge(item.status)">
                                    {{ statusLabel(item.status) }}
                                </span>
                            </div>
                            <div class="flex flex-wrap items-center gap-2 mt-1.5">
                                <span class="text-xs font-bold text-slate-600 dark:text-slate-300">{{ item.product || "Heart" }}</span>
                                <span class="text-slate-300 dark:text-slate-600">•</span>
                                <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold border bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400">
                                    <span v-if="item.contactPlatform === 'whatsapp'">📱</span>
                                    <span v-else-if="item.contactPlatform === 'instagram'">📸</span>
                                    <span v-else-if="item.contactPlatform === 'tiktok'">🎵</span>
                                    <span v-else-if="item.contactPlatform === 'x'">𝕏</span>
                                    <span v-else-if="item.contactPlatform === 'in_game'">🎮</span>
                                    <span v-else>📝</span>
                                    {{ item.contactIdentifier || item.account || "-" }}
                                </span>
                                <span class="text-slate-300 dark:text-slate-600">•</span>
                                <span class="text-xs text-slate-400">{{ item.startDate || "-" }}</span>
                            </div>
                            <!-- Tracking Code Badge -->
                            <div v-if="item.trackingCode" class="mt-2">
                                <button
                                    @click.stop="copyText(item.trackingCode, 'Kode tracking disalin ✨')"
                                    class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 active:scale-[0.98] transition"
                                    title="Salin kode tracking"
                                >
                                    <Copy :size="12" />
                                    <span class="font-mono">{{ item.trackingCode }}</span>
                                </button>
                            </div>
                        </div>

                        <button
                            class="p-3 -m-1 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 transition shrink-0"
                            @click="toggleExpand(item.id)"
                            :title="expandedId === item.id ? 'Tutup' : 'Detail'"
                        >
                            <ChevronUp v-if="expandedId === item.id" :size="18" />
                            <ChevronDown v-else :size="18" />
                        </button>
                    </div>

                    <!-- Progress Bar -->
                    <div class="mt-4">
                        <div class="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
                            <p>
                                <span class="font-black text-slate-800 dark:text-white">{{ calcProgress(item).sent }}</span>
                                / {{ calcProgress(item).total }} terkirim
                            </p>
                            <p>
                                sisa <span class="font-black text-slate-800 dark:text-white">{{ calcProgress(item).remaining }}</span>
                                • ~{{ calcProgress(item).daysLeft }} hari
                            </p>
                        </div>
                        <div class="h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                            <div
                                class="h-full rounded-full transition-all duration-500"
                                :class="item.status === 'done' ? 'bg-emerald-500' : item.status === 'paused' ? 'bg-amber-400' : 'bg-indigo-500'"
                                :style="{ width: calcProgress(item).percent + '%' }"
                            ></div>
                        </div>
                    </div>

                    <!-- Actions - Mobile optimized -->
                    <div class="mt-4 grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
                        <button
                            v-if="item.status !== 'done'"
                            @click="openLog(item)"
                            class="px-4 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm transition flex items-center justify-center gap-2 shadow-md shadow-emerald-500/20 active:scale-[0.98]"
                        >
                            <Send :size="16" />
                            Log Hari Ini
                        </button>

                        <button
                            v-if="item.status !== 'done'"
                            @click="toggleStatus(item)"
                            class="px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition font-bold text-sm flex items-center justify-center gap-2 active:scale-[0.98]"
                        >
                            <PauseCircle v-if="item.status === 'ongoing'" :size="16" />
                            <PlayCircle v-else :size="16" />
                            {{ item.status === "ongoing" ? "Pause" : "Lanjut" }}
                        </button>

                        <button
                            v-if="item.status !== 'done'"
                            @click="markDone(item)"
                            class="px-4 py-3 rounded-2xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition font-bold text-sm text-emerald-700 dark:text-emerald-300 flex items-center justify-center gap-2 active:scale-[0.98]"
                        >
                            <CheckCircle2 :size="16" />
                            Selesai
                        </button>

                        <button
                            @click="openEdit(item)"
                            class="px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition font-bold text-sm flex items-center justify-center gap-2 active:scale-[0.98]"
                        >
                            <Pencil :size="16" />
                            Edit
                        </button>

                        <button
                            v-if="item.trackingCode"
                            @click="copyText(getTrackingUrl(item.trackingCode), 'Link tracking disalin ✨')"
                            class="px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition font-bold text-sm flex items-center justify-center gap-2 active:scale-[0.98]"
                        >
                            <Link2 :size="16" />
                            Salin Link
                        </button>

                        <button
                            @click="handleDelete(item)"
                            class="px-4 py-3 rounded-2xl border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-900/20 hover:bg-rose-100 dark:hover:bg-rose-900/30 transition font-bold text-sm text-rose-600 dark:text-rose-300 flex items-center justify-center gap-2 active:scale-[0.98]"
                        >
                            <Trash2 :size="16" />
                            Hapus
                        </button>
                    </div>

                    <!-- Expanded Logs -->
                    <div
                        v-if="expandedId === item.id"
                        class="mt-4 rounded-2xl border border-slate-200/80 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-4 animate-in slide-in-from-top-2"
                    >
                        <div class="flex items-center justify-between mb-3">
                            <p class="text-sm font-black text-slate-700 dark:text-slate-200">Riwayat Log</p>
                            <p class="text-xs text-slate-400">
                                kirim/hari: <span class="font-bold">{{ calcProgress(item).perDay }}</span>
                            </p>
                        </div>

                        <div v-if="!item.logs || item.logs.length === 0" class="text-sm text-slate-400 py-4 text-center">
                            Belum ada log.
                        </div>

                        <div v-else class="space-y-2 max-h-48 overflow-y-auto custom-scroll">
                            <div
                                v-for="l in item.logs"
                                :key="l.date"
                                class="flex items-start justify-between gap-3 p-3 rounded-xl bg-white dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700"
                            >
                                <div>
                                    <p class="text-sm font-black text-slate-800 dark:text-white">{{ l.date }}</p>
                                    <p v-if="l.note" class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{{ l.note }}</p>
                                </div>
                                <div class="text-right">
                                    <p class="text-sm font-black text-emerald-600 dark:text-emerald-400">+{{ l.delivered }}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Empty State -->
                <div v-if="!deliveryStore.isLoading && rows.length === 0" class="px-5 py-12 text-center">
                    <div class="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                        <ClipboardList :size="28" class="text-slate-400" />
                    </div>
                    <p class="text-slate-500 dark:text-slate-400 font-medium">Belum ada tracker.</p>
                    <button
                        @click="isCreateOpen = true"
                        class="mt-4 px-5 py-2.5 rounded-xl bg-indigo-500 text-white font-bold text-sm shadow-md shadow-indigo-500/30 active:scale-[0.98] transition"
                    >
                        Tambah Tracker
                    </button>
                </div>
            </div>
        </div>

        <!-- LOG MODAL -->
        <Teleport to="body">
            <div v-if="isLogOpen" class="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-4">
                <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" @click="isLogOpen = false"></div>

                <div class="relative z-10 w-full max-w-md rounded-t-3xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/10 shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 sm:zoom-in-95">
                    <div class="p-5 border-b border-slate-100 dark:border-white/10 flex items-center justify-between">
                        <p class="font-black text-slate-900 dark:text-white flex items-center gap-2">
                            <Send :size="18" class="text-emerald-500" />
                            Log Pengiriman
                        </p>
                        <button class="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 transition" @click="isLogOpen = false">
                            <X :size="18" />
                        </button>
                    </div>

                    <div class="p-5 space-y-4">
                        <div>
                            <label class="text-[10px] font-black tracking-widest uppercase text-slate-400">Tanggal</label>
                            <input
                                v-model="logForm.date"
                                type="date"
                                class="mt-1 w-full px-4 py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white font-bold focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                            />
                        </div>

                        <div>
                            <label class="text-[10px] font-black tracking-widest uppercase text-slate-400">Jumlah Terkirim</label>
                            <input
                                v-model.number="logForm.delivered"
                                type="number"
                                min="1"
                                class="mt-1 w-full px-4 py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white font-bold focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                            />
                        </div>

                        <div>
                            <label class="text-[10px] font-black tracking-widest uppercase text-slate-400">Catatan</label>
                            <input
                                v-model="logForm.note"
                                class="mt-1 w-full px-4 py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white font-bold focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                                placeholder="opsional (mis. sudah dikirim via bot A)"
                            />
                        </div>
                    </div>

                    <div class="p-5 pt-0 flex gap-3">
                        <button
                            class="flex-1 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold text-slate-600 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition active:scale-[0.98]"
                            @click="isLogOpen = false"
                        >
                            Batal
                        </button>
                        <button
                            class="flex-1 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30 active:scale-[0.98]"
                            @click="handleLogSave"
                        >
                            <Save :size="18" />
                            Simpan Log
                        </button>
                    </div>
                </div>
            </div>
        </Teleport>

        <!-- EDIT MODAL -->
        <Teleport to="body">
            <div v-if="isEditOpen" class="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-4 overflow-y-auto">
                <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" @click="isEditOpen = false"></div>

                <div class="relative z-10 w-full max-w-md rounded-t-3xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/10 shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 sm:zoom-in-95 my-auto">
                    <div class="p-5 border-b border-slate-100 dark:border-white/10 flex items-center justify-between">
                        <p class="font-black text-slate-900 dark:text-white flex items-center gap-2">
                            <Pencil :size="18" class="text-indigo-500" />
                            Edit Tracker
                        </p>
                        <button class="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 transition" @click="isEditOpen = false">
                            <X :size="18" />
                        </button>
                    </div>

                    <div class="p-5 grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto">
                        <div class="sm:col-span-2">
                            <label class="text-[10px] font-black tracking-widest uppercase text-slate-400">Nama Pembeli</label>
                            <input
                                v-model="editForm.customerName"
                                class="mt-1 w-full px-4 py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white font-bold focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                            />
                        </div>

                        <div>
                            <label class="text-[10px] font-black tracking-widest uppercase text-slate-400">Platform Kontak</label>
                            <select
                                v-model="editForm.contactPlatform"
                                class="mt-1 w-full px-4 py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white font-bold focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                            >
                                <option v-for="p in CONTACT_PLATFORMS" :key="p.value" :value="p.value">{{ p.label }}</option>
                            </select>
                        </div>

                        <div>
                            <label class="text-[10px] font-black tracking-widest uppercase text-slate-400">{{ editPlatformInfo.label }}</label>
                            <input
                                v-model="editForm.contactIdentifier"
                                class="mt-1 w-full px-4 py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white font-bold focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                                :placeholder="editPlatformInfo.placeholder"
                            />
                        </div>

                        <div>
                            <label class="text-[10px] font-black tracking-widest uppercase text-slate-400">Produk</label>
                            <input
                                v-model="editForm.product"
                                class="mt-1 w-full px-4 py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white font-bold focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                            />
                        </div>

                        <div>
                            <label class="text-[10px] font-black tracking-widest uppercase text-slate-400">Mulai</label>
                            <input
                                v-model="editForm.startDate"
                                type="date"
                                class="mt-1 w-full px-4 py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white font-bold focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                            />
                        </div>

                        <div>
                            <label class="text-[10px] font-black tracking-widest uppercase text-slate-400">Total</label>
                            <input
                                v-model.number="editForm.total"
                                type="number"
                                min="1"
                                class="mt-1 w-full px-4 py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white font-bold focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                            />
                        </div>

                        <div>
                            <label class="text-[10px] font-black tracking-widest uppercase text-slate-400">Kirim/Hari</label>
                            <input
                                v-model.number="editForm.perDay"
                                type="number"
                                min="1"
                                class="mt-1 w-full px-4 py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white font-bold focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                            />
                        </div>

                        <div class="sm:col-span-2">
                            <label class="text-[10px] font-black tracking-widest uppercase text-slate-400">Catatan</label>
                            <input
                                v-model="editForm.notes"
                                class="mt-1 w-full px-4 py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white font-bold focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                            />
                        </div>

                        <div class="sm:col-span-2">
                            <label class="text-[10px] font-black tracking-widest uppercase text-slate-400">Status</label>
                            <select
                                v-model="editForm.status"
                                class="mt-1 w-full px-4 py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white font-bold focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                            >
                                <option value="ongoing">Proses</option>
                                <option value="paused">Pause</option>
                                <option value="done">Selesai</option>
                            </select>
                        </div>
                    </div>

                    <div class="p-5 pt-0 flex gap-3">
                        <button
                            class="flex-1 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold text-slate-600 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition active:scale-[0.98]"
                            @click="isEditOpen = false"
                        >
                            Batal
                        </button>
                        <button
                            class="flex-1 py-3.5 rounded-2xl bg-indigo-500 hover:bg-indigo-600 text-white font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/30 active:scale-[0.98]"
                            @click="handleUpdate"
                        >
                            <Save :size="18" />
                            Update
                        </button>
                    </div>
                </div>
            </div>
        </Teleport>
    </div>
</template>

<style scoped>
.custom-scroll::-webkit-scrollbar {
    width: 5px;
}
.custom-scroll::-webkit-scrollbar-thumb {
    background: rgba(148, 163, 184, 0.6);
    border-radius: 999px;
}
:global(.dark) .custom-scroll::-webkit-scrollbar-thumb {
    background: rgba(148, 163, 184, 0.25);
}
</style>
