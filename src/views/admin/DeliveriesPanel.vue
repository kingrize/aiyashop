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
} from "lucide-vue-next";

const deliveryStore = useDeliveryStore();
const toast = useToastStore();

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
    account: "",
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
    account: "",
    product: "Heart",
    total: 0,
    perDay: 10,
    startDate: "",
    notes: "",
    status: "ongoing",
});

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
        account: "",
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
        account: item.account || "",
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
    const ok = window.confirm(
        `Hapus tracker untuk ${item.customerName} (${item.account})?`,
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
        <div class="flex items-start justify-between gap-3">
            <div>
                <h2
                    class="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2"
                >
                    <ClipboardList :size="20" />
                    Delivery Tracker
                </h2>
                <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Catat pengiriman harian (misal Heart) biar kamu gampang
                    pantau progress.
                </p>
            </div>

            <div class="flex gap-2">
                <button
                    @click="deliveryStore.fetchAll()"
                    class="px-3 py-2 rounded-xl font-bold text-xs border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-white/5 hover:bg-white transition flex items-center gap-2"
                >
                    <RefreshCw :size="16" />
                    Refresh
                </button>
                <button
                    @click="isCreateOpen = !isCreateOpen"
                    class="px-3 py-2 rounded-xl font-bold text-xs bg-indigo-500 text-white hover:bg-indigo-600 transition flex items-center gap-2"
                >
                    <Plus :size="16" />
                    Tambah
                </button>
            </div>
        </div>

        <!-- Create form -->
        <div
            v-if="isCreateOpen"
            class="bg-white dark:bg-[#1C1C1E] p-5 rounded-[2rem] shadow-sm border border-slate-100 dark:border-white/5"
        >
            <div class="flex items-center justify-between">
                <h3 class="font-black text-slate-900 dark:text-white">
                    Tambah Tracker
                </h3>
                <button
                    class="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 transition"
                    @click="isCreateOpen = false"
                >
                    <X :size="18" />
                </button>
            </div>

            <div class="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                    <label
                        class="text-[10px] font-black tracking-widest uppercase text-slate-400"
                        >Nama Pembeli</label
                    >
                    <input
                        v-model="createForm.customerName"
                        class="mt-1 w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="mis. Jiya"
                    />
                </div>

                <div>
                    <label
                        class="text-[10px] font-black tracking-widest uppercase text-slate-400"
                        >Akun / Username</label
                    >
                    <input
                        v-model="createForm.account"
                        class="mt-1 w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="mis. jiya_sky"
                    />
                </div>

                <div>
                    <label
                        class="text-[10px] font-black tracking-widest uppercase text-slate-400"
                        >Produk</label
                    >
                    <input
                        v-model="createForm.product"
                        class="mt-1 w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="Heart"
                    />
                </div>

                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label
                            class="text-[10px] font-black tracking-widest uppercase text-slate-400"
                            >Total</label
                        >
                        <input
                            v-model.number="createForm.total"
                            type="number"
                            min="1"
                            class="mt-1 w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                    </div>
                    <div>
                        <label
                            class="text-[10px] font-black tracking-widest uppercase text-slate-400"
                            >Kirim/Hari</label
                        >
                        <input
                            v-model.number="createForm.perDay"
                            type="number"
                            min="1"
                            class="mt-1 w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                    </div>
                </div>

                <div>
                    <label
                        class="text-[10px] font-black tracking-widest uppercase text-slate-400"
                        >Mulai</label
                    >
                    <div class="relative mt-1">
                        <Calendar
                            :size="16"
                            class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                        />
                        <input
                            v-model="createForm.startDate"
                            type="date"
                            class="pl-10 w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                    </div>
                </div>

                <div>
                    <label
                        class="text-[10px] font-black tracking-widest uppercase text-slate-400"
                        >Catatan</label
                    >
                    <input
                        v-model="createForm.notes"
                        class="mt-1 w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="opsional"
                    />
                </div>
            </div>

            <div class="mt-4 flex items-center justify-between">
                <p class="text-xs text-slate-500 dark:text-slate-400">
                    Estimasi:
                    <span class="font-black text-slate-800 dark:text-white">
                        {{
                            Math.ceil(
                                Math.max(0, Number(createForm.total || 0)) /
                                    Math.max(1, Number(createForm.perDay || 1)),
                            )
                        }}
                        hari
                    </span>
                </p>

                <button
                    @click="handleCreate"
                    class="px-4 py-3 rounded-2xl bg-indigo-500 hover:bg-indigo-600 text-white font-black transition flex items-center gap-2"
                >
                    <Save :size="18" />
                    Simpan
                </button>
            </div>
        </div>

        <!-- list -->
        <div
            class="bg-white dark:bg-[#1C1C1E] rounded-[2rem] shadow-sm border border-slate-100 dark:border-white/5 overflow-hidden"
        >
            <div
                class="px-5 py-4 border-b border-slate-100 dark:border-white/5 flex items-center justify-between"
            >
                <div>
                    <p
                        class="text-sm font-black text-slate-900 dark:text-white"
                    >
                        Daftar Pengiriman
                    </p>
                    <p class="text-xs text-slate-500 dark:text-slate-400">
                        Total: {{ rows.length }} tracker
                    </p>
                </div>
                <p
                    v-if="deliveryStore.isLoading"
                    class="text-xs text-slate-400"
                >
                    Memuat...
                </p>
            </div>

            <div
                v-if="deliveryStore.error"
                class="px-5 py-4 text-rose-500 text-sm font-bold"
            >
                {{ deliveryStore.error }}
            </div>

            <!-- Responsive rows -->
            <div class="divide-y divide-slate-100 dark:divide-white/5">
                <div v-for="item in rows" :key="item.id" class="px-5 py-4">
                    <div class="flex items-start justify-between gap-3">
                        <div class="min-w-0">
                            <div class="flex items-center gap-2">
                                <p
                                    class="text-base font-black text-slate-900 dark:text-white truncate"
                                >
                                    {{ item.customerName }}
                                </p>
                                <div
                                    v-if="item.trackingCode"
                                    class="self-center"
                                >
                                    <button
                                        @click.stop="
                                            copyText(
                                                item.trackingCode,
                                                'Kode tracking disalin ✨',
                                            )
                                        "
                                        class="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-black border border-slate-200/70 dark:border-white/10 bg-white/70 dark:bg-slate-900/25 text-slate-600 dark:text-slate-200 hover:scale-[1.01] active:scale-[0.99] transition"
                                        title="Salin kode tracking"
                                    >
                                        <Copy :size="12" />
                                        {{ item.trackingCode }}
                                    </button>
                                </div>
                                <span
                                    class="px-2 py-0.5 rounded-full text-[10px] font-black border"
                                    :class="statusBadge(item.status)"
                                >
                                    {{ statusLabel(item.status) }}
                                </span>
                            </div>
                            <p
                                class="text-xs text-slate-500 dark:text-slate-400 mt-0.5"
                            >
                                <span class="font-bold">{{
                                    item.product || "Heart"
                                }}</span>
                                • akun:
                                <span class="font-mono font-bold">{{
                                    item.account
                                }}</span>
                                • mulai {{ item.startDate || "-" }}
                            </p>
                        </div>

                        <button
                            class="p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-white/10 transition"
                            @click="toggleExpand(item.id)"
                            :title="expandedId === item.id ? 'Tutup' : 'Detail'"
                        >
                            <ChevronUp
                                v-if="expandedId === item.id"
                                :size="18"
                            />
                            <ChevronDown v-else :size="18" />
                        </button>
                    </div>

                    <!-- progress -->
                    <div class="mt-3">
                        <div
                            class="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400"
                        >
                            <p>
                                <span
                                    class="font-black text-slate-800 dark:text-white"
                                >
                                    {{ calcProgress(item).sent }}
                                </span>
                                / {{ calcProgress(item).total }} terkirim
                            </p>
                            <p>
                                sisa
                                <span
                                    class="font-black text-slate-800 dark:text-white"
                                >
                                    {{ calcProgress(item).remaining }}
                                </span>
                                • ~{{ calcProgress(item).daysLeft }} hari
                            </p>
                        </div>
                        <div
                            class="mt-2 h-2 rounded-full bg-slate-100 dark:bg-white/10 overflow-hidden"
                        >
                            <div
                                class="h-full rounded-full bg-indigo-500 transition-all duration-500"
                                :style="{
                                    width: calcProgress(item).percent + '%',
                                }"
                            ></div>
                        </div>
                    </div>

                    <!-- actions -->
                    <div class="mt-3 flex flex-wrap gap-2">
                        <button
                            v-if="item.status !== 'done'"
                            @click="openLog(item)"
                            class="px-3 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs transition flex items-center gap-2"
                        >
                            <Send :size="16" />
                            Log Hari Ini
                        </button>

                        <button
                            v-if="item.status !== 'done'"
                            @click="toggleStatus(item)"
                            class="px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white/60 dark:bg-white/5 hover:bg-white transition font-black text-xs flex items-center gap-2"
                        >
                            <PauseCircle
                                v-if="item.status === 'ongoing'"
                                :size="16"
                            />
                            <PlayCircle v-else :size="16" />
                            {{ item.status === "ongoing" ? "Pause" : "Lanjut" }}
                        </button>

                        <button
                            v-if="item.status !== 'done'"
                            @click="markDone(item)"
                            class="px-3 py-2 rounded-xl border border-emerald-200/50 dark:border-emerald-300/20 bg-emerald-500/10 hover:bg-emerald-500/15 transition font-black text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2"
                        >
                            <CheckCircle2 :size="16" />
                            Selesai
                        </button>

                        <button
                            @click="openEdit(item)"
                            class="px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white/60 dark:bg-white/5 hover:bg-white transition font-black text-xs flex items-center gap-2"
                        >
                            <Pencil :size="16" />
                            Edit
                        </button>

                        <button
                            v-if="item.trackingCode"
                            @click="
                                copyText(
                                    getTrackingUrl(item.trackingCode),
                                    'Link tracking disalin ✨',
                                )
                            "
                            class="px-3 py-2 rounded-xl border border-slate-200/70 dark:border-white/10 bg-white/60 dark:bg-white/5 hover:bg-white/80 dark:hover:bg-white/10 transition font-black text-xs flex items-center gap-2"
                        >
                            <Link2 :size="16" />
                            Salin Link
                        </button>

                        <button
                            @click="handleDelete(item)"
                            class="px-3 py-2 rounded-xl border border-rose-200/40 dark:border-rose-300/20 bg-rose-500/10 hover:bg-rose-500/15 transition font-black text-xs text-rose-600 dark:text-rose-300 flex items-center gap-2"
                        >
                            <Trash2 :size="16" />
                            Hapus
                        </button>
                    </div>

                    <!-- expanded logs -->
                    <div
                        v-if="expandedId === item.id"
                        class="mt-4 rounded-2xl border border-slate-100 dark:border-white/10 bg-slate-50/60 dark:bg-white/5 p-4"
                    >
                        <div class="flex items-center justify-between mb-2">
                            <p
                                class="text-xs font-black text-slate-700 dark:text-slate-200"
                            >
                                Riwayat Log
                            </p>
                            <p class="text-[10px] text-slate-400">
                                kirim/hari:
                                <span class="font-bold">{{
                                    calcProgress(item).perDay
                                }}</span>
                            </p>
                        </div>

                        <div
                            v-if="!item.logs || item.logs.length === 0"
                            class="text-xs text-slate-400"
                        >
                            Belum ada log.
                        </div>

                        <div
                            v-else
                            class="space-y-2 max-h-40 overflow-y-auto custom-scroll"
                        >
                            <div
                                v-for="l in item.logs"
                                :key="l.date"
                                class="flex items-start justify-between gap-2 p-3 rounded-xl bg-white/70 dark:bg-black/20 border border-slate-100 dark:border-white/10"
                            >
                                <div>
                                    <p
                                        class="text-xs font-black text-slate-800 dark:text-white"
                                    >
                                        {{ l.date }}
                                    </p>
                                    <p
                                        v-if="l.note"
                                        class="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5"
                                    >
                                        {{ l.note }}
                                    </p>
                                </div>
                                <div class="text-right">
                                    <p
                                        class="text-xs font-black text-slate-800 dark:text-white"
                                    >
                                        +{{ l.delivered }}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div
                    v-if="!deliveryStore.isLoading && rows.length === 0"
                    class="px-5 py-8 text-center text-slate-400"
                >
                    Belum ada tracker. Klik
                    <span class="font-black">Tambah</span> untuk mulai.
                </div>
            </div>
        </div>

        <!-- LOG MODAL -->
        <div
            v-if="isLogOpen"
            class="fixed inset-0 z-[9999] flex items-center justify-center p-4"
        >
            <div
                class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                @click="isLogOpen = false"
            ></div>

            <div
                class="relative z-10 w-full max-w-md rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/10 shadow-2xl overflow-hidden"
            >
                <div
                    class="p-5 border-b border-slate-100 dark:border-white/10 flex items-center justify-between"
                >
                    <p class="font-black text-slate-900 dark:text-white">
                        Log Pengiriman
                    </p>
                    <button
                        class="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 transition"
                        @click="isLogOpen = false"
                    >
                        <X :size="18" />
                    </button>
                </div>

                <div class="p-5 space-y-3">
                    <div>
                        <label
                            class="text-[10px] font-black tracking-widest uppercase text-slate-400"
                            >Tanggal</label
                        >
                        <input
                            v-model="logForm.date"
                            type="date"
                            class="mt-1 w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white font-bold focus:ring-2 focus:ring-emerald-500 outline-none"
                        />
                    </div>

                    <div>
                        <label
                            class="text-[10px] font-black tracking-widest uppercase text-slate-400"
                            >Jumlah Terkirim</label
                        >
                        <input
                            v-model.number="logForm.delivered"
                            type="number"
                            min="1"
                            class="mt-1 w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white font-bold focus:ring-2 focus:ring-emerald-500 outline-none"
                        />
                    </div>

                    <div>
                        <label
                            class="text-[10px] font-black tracking-widest uppercase text-slate-400"
                            >Catatan</label
                        >
                        <input
                            v-model="logForm.note"
                            class="mt-1 w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white font-bold focus:ring-2 focus:ring-emerald-500 outline-none"
                            placeholder="opsional (mis. sudah dikirim via bot A)"
                        />
                    </div>
                </div>

                <div
                    class="p-5 pt-2 border-t border-slate-100 dark:border-white/10 flex gap-2"
                >
                    <button
                        class="flex-1 py-3 rounded-2xl border border-slate-200 dark:border-white/10 bg-white/60 dark:bg-white/5 font-black text-slate-600 dark:text-slate-200 hover:bg-white transition"
                        @click="isLogOpen = false"
                    >
                        Batal
                    </button>
                    <button
                        class="flex-1 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-black transition flex items-center justify-center gap-2"
                        @click="handleLogSave"
                    >
                        <Save :size="18" />
                        Simpan Log
                    </button>
                </div>
            </div>
        </div>

        <!-- EDIT MODAL -->
        <div
            v-if="isEditOpen"
            class="fixed inset-0 z-[9999] flex items-center justify-center p-4"
        >
            <div
                class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                @click="isEditOpen = false"
            ></div>

            <div
                class="relative z-10 w-full max-w-md rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/10 shadow-2xl overflow-hidden"
            >
                <div
                    class="p-5 border-b border-slate-100 dark:border-white/10 flex items-center justify-between"
                >
                    <p class="font-black text-slate-900 dark:text-white">
                        Edit Tracker
                    </p>
                    <button
                        class="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 transition"
                        @click="isEditOpen = false"
                    >
                        <X :size="18" />
                    </button>
                </div>

                <div class="p-5 grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div class="md:col-span-2">
                        <label
                            class="text-[10px] font-black tracking-widest uppercase text-slate-400"
                            >Nama Pembeli</label
                        >
                        <input
                            v-model="editForm.customerName"
                            class="mt-1 w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                    </div>

                    <div class="md:col-span-2">
                        <label
                            class="text-[10px] font-black tracking-widest uppercase text-slate-400"
                            >Akun / Username</label
                        >
                        <input
                            v-model="editForm.account"
                            class="mt-1 w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                    </div>

                    <div>
                        <label
                            class="text-[10px] font-black tracking-widest uppercase text-slate-400"
                            >Produk</label
                        >
                        <input
                            v-model="editForm.product"
                            class="mt-1 w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                    </div>

                    <div>
                        <label
                            class="text-[10px] font-black tracking-widest uppercase text-slate-400"
                            >Mulai</label
                        >
                        <input
                            v-model="editForm.startDate"
                            type="date"
                            class="mt-1 w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                    </div>

                    <div>
                        <label
                            class="text-[10px] font-black tracking-widest uppercase text-slate-400"
                            >Total</label
                        >
                        <input
                            v-model.number="editForm.total"
                            type="number"
                            min="1"
                            class="mt-1 w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                    </div>

                    <div>
                        <label
                            class="text-[10px] font-black tracking-widest uppercase text-slate-400"
                            >Kirim/Hari</label
                        >
                        <input
                            v-model.number="editForm.perDay"
                            type="number"
                            min="1"
                            class="mt-1 w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                    </div>

                    <div class="md:col-span-2">
                        <label
                            class="text-[10px] font-black tracking-widest uppercase text-slate-400"
                            >Catatan</label
                        >
                        <input
                            v-model="editForm.notes"
                            class="mt-1 w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                    </div>

                    <div class="md:col-span-2">
                        <label
                            class="text-[10px] font-black tracking-widest uppercase text-slate-400"
                            >Status</label
                        >
                        <select
                            v-model="editForm.status"
                            class="mt-1 w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                        >
                            <option value="ongoing">Proses</option>
                            <option value="paused">Pause</option>
                            <option value="done">Selesai</option>
                        </select>
                    </div>
                </div>

                <div
                    class="p-5 pt-2 border-t border-slate-100 dark:border-white/10 flex gap-2"
                >
                    <button
                        class="flex-1 py-3 rounded-2xl border border-slate-200 dark:border-white/10 bg-white/60 dark:bg-white/5 font-black text-slate-600 dark:text-slate-200 hover:bg-white transition"
                        @click="isEditOpen = false"
                    >
                        Batal
                    </button>
                    <button
                        class="flex-1 py-3 rounded-2xl bg-indigo-500 hover:bg-indigo-600 text-white font-black transition flex items-center justify-center gap-2"
                        @click="handleUpdate"
                    >
                        <Save :size="18" />
                        Update
                    </button>
                </div>
            </div>
        </div>
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
