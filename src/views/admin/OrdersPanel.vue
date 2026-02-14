<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useOrderStore } from "../../stores/order";
import { useDeliveryStore } from "../../stores/delivery";
import {
    Package,
    Clock,
    CheckCircle2,
    XCircle,
    Loader2,
    ChevronDown,
    ChevronUp,
    StickyNote,
    Link2,
    RefreshCw,
    Search,
    Filter,
    Wallet,
    QrCode,
    User,
    Calendar,
    Truck,
    AlertCircle,
    MessageCircle,
    Save,
} from "lucide-vue-next";
import { formatRupiah } from "../../utils/format";

const orderStore = useOrderStore();
const deliveryStore = useDeliveryStore();

// State
const searchQuery = ref("");
const statusFilter = ref("all");
const expandedOrderId = ref(null);
const editingNotes = ref({});
const savingNotes = ref({});
const savingStatus = ref({});
const linkingDelivery = ref({});

// Fetch data on mount
onMounted(async () => {
    await Promise.all([
        orderStore.fetchAllOrders(),
        deliveryStore.fetchAll(),
    ]);
});

// Computed
const filteredOrders = computed(() => {
    let orders = [...orderStore.orders];
    
    // Search filter
    if (searchQuery.value.trim()) {
        const q = searchQuery.value.toLowerCase().trim();
        orders = orders.filter(o => 
            o.shortId.toLowerCase().includes(q) ||
            o.createdBy.buyerName.toLowerCase().includes(q) ||
            o.contact.contactIdentifier.toLowerCase().includes(q)
        );
    }
    
    // Status filter
    if (statusFilter.value !== "all") {
        orders = orders.filter(o => o.fulfillment.status === statusFilter.value);
    }
    
    return orders;
});

const unlinkedDeliveries = computed(() => {
    return deliveryStore.deliveries.filter(d => !d.orderId);
});

// Status configurations
const FULFILLMENT_STATUSES = [
    { value: "queued", label: "Antrian", icon: Clock, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-500/10" },
    { value: "in_progress", label: "Dikerjakan", icon: Loader2, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-500/10" },
    { value: "completed", label: "Selesai", icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-500/10" },
    { value: "cancelled", label: "Dibatalkan", icon: XCircle, color: "text-rose-500", bg: "bg-rose-50 dark:bg-rose-500/10" },
];

const PAYMENT_STATUSES = {
    pending: { label: "Menunggu", color: "text-amber-600 bg-amber-50 dark:bg-amber-500/10" },
    paid: { label: "Lunas", color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10" },
    failed: { label: "Gagal", color: "text-rose-600 bg-rose-50 dark:bg-rose-500/10" },
};

const PAYMENT_METHODS = {
    balance: { label: "Saldo", icon: Wallet },
    qris: { label: "QRIS", icon: QrCode },
    manual: { label: "Manual", icon: Wallet },
};

const PLATFORM_EMOJIS = {
    whatsapp: "💬",
    instagram: "📸",
    tiktok: "🎵",
    x: "𝕏",
    in_game: "🎮",
    other: "📝",
};

// Methods
const toggleExpand = (orderId) => {
    expandedOrderId.value = expandedOrderId.value === orderId ? null : orderId;
};

const getStatusConfig = (status) => {
    return FULFILLMENT_STATUSES.find(s => s.value === status) || FULFILLMENT_STATUSES[0];
};

const formatDate = (date) => {
    if (!date) return "-";
    return new Intl.DateTimeFormat("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(date);
};

const handleStatusChange = async (orderId, newStatus) => {
    savingStatus.value[orderId] = true;
    try {
        await orderStore.updateFulfillmentStatus(orderId, newStatus);
    } finally {
        savingStatus.value[orderId] = false;
    }
};

const handlePaymentStatusChange = async (orderId, newStatus) => {
    savingStatus.value[orderId] = true;
    try {
        await orderStore.updatePaymentStatus(orderId, newStatus);
    } finally {
        savingStatus.value[orderId] = false;
    }
};

const startEditNotes = (order) => {
    editingNotes.value[order.id] = order.fulfillment.notes || "";
};

const cancelEditNotes = (orderId) => {
    delete editingNotes.value[orderId];
};

const saveNotes = async (orderId) => {
    savingNotes.value[orderId] = true;
    try {
        await orderStore.updateOrderNotes(orderId, editingNotes.value[orderId]);
        delete editingNotes.value[orderId];
    } finally {
        savingNotes.value[orderId] = false;
    }
};

const handleLinkDelivery = async (orderId, deliveryId) => {
    if (!deliveryId) return;
    linkingDelivery.value[orderId] = true;
    try {
        await orderStore.linkDelivery(orderId, deliveryId);
    } finally {
        linkingDelivery.value[orderId] = false;
    }
};

const refreshOrders = async () => {
    await orderStore.fetchAllOrders();
};
</script>

<template>
    <div class="space-y-6">
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
                <h2 class="text-xl font-black text-slate-900 dark:text-white">
                    Orders
                </h2>
                <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Kelola semua pesanan pelanggan
                </p>
            </div>
            
            <button
                @click="refreshOrders"
                class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition"
            >
                <RefreshCw :size="16" :class="{ 'animate-spin': orderStore.loading }" />
                Refresh
            </button>
        </div>

        <!-- Quick Stats -->
        <div class="grid grid-cols-2 lg:grid-cols-5 gap-3">
            <div class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-2xl p-4">
                <p class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Total</p>
                <p class="text-2xl font-black text-slate-900 dark:text-white mt-1">
                    {{ orderStore.orderStats.total }}
                </p>
            </div>
            <div class="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-2xl p-4">
                <p class="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wide">Antrian</p>
                <p class="text-2xl font-black text-amber-700 dark:text-amber-300 mt-1">
                    {{ orderStore.orderStats.queued }}
                </p>
            </div>
            <div class="bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-2xl p-4">
                <p class="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wide">Dikerjakan</p>
                <p class="text-2xl font-black text-blue-700 dark:text-blue-300 mt-1">
                    {{ orderStore.orderStats.inProgress }}
                </p>
            </div>
            <div class="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-2xl p-4">
                <p class="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">Selesai</p>
                <p class="text-2xl font-black text-emerald-700 dark:text-emerald-300 mt-1">
                    {{ orderStore.orderStats.completed }}
                </p>
            </div>
            <div class="bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-2xl p-4 col-span-2 lg:col-span-1">
                <p class="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wide">Belum Bayar</p>
                <p class="text-2xl font-black text-rose-700 dark:text-rose-300 mt-1">
                    {{ orderStore.orderStats.pendingPayment }}
                </p>
            </div>
        </div>

        <!-- Filters -->
        <div class="flex flex-col sm:flex-row gap-3">
            <div class="relative flex-1">
                <Search :size="18" class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                    v-model="searchQuery"
                    type="text"
                    placeholder="Cari order ID, nama pembeli..."
                    class="w-full pl-11 pr-4 py-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                />
            </div>
            
            <div class="flex gap-2 overflow-x-auto pb-1">
                <button
                    v-for="status in [{ value: 'all', label: 'Semua' }, ...FULFILLMENT_STATUSES]"
                    :key="status.value"
                    @click="statusFilter = status.value"
                    class="px-4 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition"
                    :class="statusFilter === status.value 
                        ? 'bg-indigo-600 text-white' 
                        : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'"
                >
                    {{ status.label }}
                </button>
            </div>
        </div>

        <!-- Loading State -->
        <div v-if="orderStore.loading" class="flex items-center justify-center py-12">
            <Loader2 :size="32" class="animate-spin text-indigo-500" />
        </div>

        <!-- Empty State -->
        <div v-else-if="filteredOrders.length === 0" class="text-center py-12">
            <Package :size="48" class="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
            <p class="text-lg font-bold text-slate-700 dark:text-slate-300">Tidak ada pesanan</p>
            <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">
                {{ searchQuery || statusFilter !== 'all' ? 'Coba ubah filter pencarian' : 'Pesanan baru akan muncul di sini' }}
            </p>
        </div>

        <!-- Orders List -->
        <div v-else class="space-y-3">
            <div
                v-for="order in filteredOrders"
                :key="order.id"
                class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden"
            >
                <!-- Order Header (Clickable) -->
                <button
                    @click="toggleExpand(order.id)"
                    class="w-full p-4 flex items-center gap-4 text-left hover:bg-slate-50 dark:hover:bg-slate-700/50 transition"
                >
                    <!-- Status Icon -->
                    <div
                        class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                        :class="getStatusConfig(order.fulfillment.status).bg"
                    >
                        <component 
                            :is="getStatusConfig(order.fulfillment.status).icon" 
                            :size="20" 
                            :class="[getStatusConfig(order.fulfillment.status).color, order.fulfillment.status === 'in_progress' ? 'animate-spin' : '']"
                        />
                    </div>

                    <!-- Order Info -->
                    <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-2 flex-wrap">
                            <span class="font-mono font-black text-sm text-indigo-600 dark:text-indigo-400">
                                {{ order.shortId }}
                            </span>
                            <span 
                                class="px-2 py-0.5 rounded-full text-[10px] font-bold"
                                :class="PAYMENT_STATUSES[order.payment.status]?.color"
                            >
                                {{ PAYMENT_STATUSES[order.payment.status]?.label }}
                            </span>
                            <span v-if="order.metadata.whatsappMessageSent" class="text-emerald-500" title="WA Terkirim">
                                <MessageCircle :size="14" />
                            </span>
                        </div>
                        <p class="text-sm font-bold text-slate-900 dark:text-white mt-1 truncate">
                            {{ order.createdBy.buyerName }}
                        </p>
                        <p class="text-xs text-slate-500 dark:text-slate-400">
                            {{ PLATFORM_EMOJIS[order.contact.contactPlatform] || "📝" }}
                            {{ order.contact.contactIdentifier || "-" }}
                        </p>
                    </div>

                    <!-- Price & Date -->
                    <div class="text-right shrink-0">
                        <p class="font-black text-slate-900 dark:text-white">
                            {{ formatRupiah(order.pricing.total) }}
                        </p>
                        <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            {{ formatDate(order.createdAt) }}
                        </p>
                    </div>

                    <!-- Expand Arrow -->
                    <component 
                        :is="expandedOrderId === order.id ? ChevronUp : ChevronDown" 
                        :size="20" 
                        class="text-slate-400 shrink-0"
                    />
                </button>

                <!-- Expanded Details -->
                <div 
                    v-if="expandedOrderId === order.id"
                    class="border-t border-slate-100 dark:border-white/10 p-4 space-y-4 bg-slate-50 dark:bg-slate-900/50"
                >
                    <!-- Items -->
                    <div>
                        <p class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
                            Items
                        </p>
                        <div class="space-y-2">
                            <div 
                                v-for="(item, idx) in order.items" 
                                :key="idx"
                                class="flex items-center justify-between text-sm"
                            >
                                <span class="text-slate-700 dark:text-slate-200">
                                    {{ item.productName }} × {{ item.quantity }}
                                </span>
                                <span class="font-bold text-slate-900 dark:text-white">
                                    {{ formatRupiah(item.subtotal) }}
                                </span>
                            </div>
                        </div>
                        <div class="mt-2 pt-2 border-t border-slate-200 dark:border-white/10 flex justify-between text-sm">
                            <span class="text-slate-500">Subtotal</span>
                            <span class="font-bold">{{ formatRupiah(order.pricing.subtotal) }}</span>
                        </div>
                        <div v-if="order.pricing.discount > 0" class="flex justify-between text-sm text-emerald-600">
                            <span>Diskon {{ order.pricing.promoCode ? `(${order.pricing.promoCode})` : '' }}</span>
                            <span>-{{ formatRupiah(order.pricing.discount) }}</span>
                        </div>
                        <div class="flex justify-between text-sm font-black">
                            <span class="text-slate-900 dark:text-white">Total</span>
                            <span class="text-indigo-600 dark:text-indigo-400">{{ formatRupiah(order.pricing.total) }}</span>
                        </div>
                    </div>

                    <!-- Status Controls -->
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <!-- Fulfillment Status -->
                        <div>
                            <label class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                                Status Pengerjaan
                            </label>
                            <select
                                :value="order.fulfillment.status"
                            @change="handleStatusChange(order.id, $event.target.value)"
                                class="mt-1 w-full px-3 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                :disabled="savingStatus[order.id]"
                            >
                                <option v-for="s in FULFILLMENT_STATUSES" :key="s.value" :value="s.value">
                                    {{ s.label }}
                                </option>
                            </select>
                        </div>

                        <!-- Payment Status -->
                        <div>
                            <label class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                                Status Pembayaran
                            </label>
                            <select
                                :value="order.payment.status"
                                @change="handlePaymentStatusChange(order.id, $event.target.value)"
                                class="mt-1 w-full px-3 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                :disabled="savingStatus[order.id]"
                            >
                                <option value="pending">Menunggu</option>
                                <option value="paid">Lunas</option>
                                <option value="failed">Gagal</option>
                            </select>
                        </div>
                    </div>

                    <!-- Link Delivery -->
                    <div v-if="!order.fulfillment.deliveryId">
                        <label class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                            Hubungkan ke Tracking
                        </label>
                        <div class="flex gap-2 mt-1">
                            <select
                                :id="`delivery-${order.id}`"
                                class="flex-1 px-3 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                            >
                                <option value="">Pilih Delivery...</option>
                                <option v-for="d in unlinkedDeliveries" :key="d.id" :value="d.id">
                                    {{ d.title }} - {{ d.buyerName }}
                                </option>
                            </select>
                            <button
                            @click="handleLinkDelivery(order.id, document.getElementById(`delivery-${order.id}`)?.value)"
                                class="px-4 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-700 transition flex items-center gap-2"
                                :disabled="linkingDelivery[order.id]"
                            >
                                <Link2 :size="16" />
                                Link
                            </button>
                        </div>
                    </div>
                    <div v-else class="flex items-center gap-2 text-sm">
                        <Truck :size="16" class="text-emerald-500" />
                        <span class="text-slate-600 dark:text-slate-300">
                            Terhubung ke tracking: 
                            <span class="font-mono font-bold text-emerald-600">{{ order.fulfillment.deliveryId.slice(0, 8) }}</span>
                        </span>
                    </div>

                    <!-- Admin Notes -->
                    <div>
                        <label class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide flex items-center gap-2">
                            <StickyNote :size="14" />
                            Catatan Admin
                        </label>
                        
                        <div v-if="editingNotes[order.id] !== undefined" class="mt-1">
                            <textarea
                                v-model="editingNotes[order.id]"
                                rows="3"
                                class="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-sm resize-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                placeholder="Tambah catatan..."
                            ></textarea>
                            <div class="flex justify-end gap-2 mt-2">
                                <button
                                    @click="cancelEditNotes(order.id)"
                                    class="px-3 py-1.5 rounded-lg text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                                >
                                    Batal
                                </button>
                                <button
                                    @click="saveNotes(order.id)"
                                    class="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 flex items-center gap-1"
                                    :disabled="savingNotes[order.id]"
                                >
                                    <Save :size="14" />
                                    Simpan
                                </button>
                            </div>
                        </div>
                        
                        <div v-else class="mt-1">
                            <p 
                                v-if="order.fulfillment.notes"
                                class="text-sm text-slate-700 dark:text-slate-200 whitespace-pre-wrap"
                            >
                                {{ order.fulfillment.notes }}
                            </p>
                            <button
                                @click="startEditNotes(order)"
                                class="text-sm text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
                            >
                                {{ order.fulfillment.notes ? 'Edit Catatan' : '+ Tambah Catatan' }}
                            </button>
                        </div>
                    </div>

                    <!-- Metadata -->
                    <div class="pt-3 border-t border-slate-200 dark:border-white/10 grid grid-cols-2 gap-3 text-xs text-slate-500 dark:text-slate-400">
                        <div class="flex items-center gap-2">
                            <User :size="14" />
                            <span>{{ order.createdBy.userId ? 'Member' : 'Guest' }}</span>
                        </div>
                        <div class="flex items-center gap-2">
                            <component :is="PAYMENT_METHODS[order.payment.method]?.icon || Wallet" :size="14" />
                            <span>{{ PAYMENT_METHODS[order.payment.method]?.label || order.payment.method }}</span>
                        </div>
                        <div class="flex items-center gap-2">
                            <Calendar :size="14" />
                            <span>{{ formatDate(order.createdAt) }}</span>
                        </div>
                        <div class="flex items-center gap-2">
                            <span class="font-mono text-[10px]">ID: {{ order.id.slice(0, 12) }}...</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
