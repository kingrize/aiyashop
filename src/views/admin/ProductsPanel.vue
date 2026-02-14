<script setup>
import { onMounted, ref, reactive, computed, watch } from "vue";
import { useProductsStore } from "../../stores/products";
import { formatRupiah } from "../../utils/format";
import {
    Search,
    Plus,
    Filter,
    Package,
    Edit2,
    Trash2,
    Image as ImageIcon,
    Check,
    X,
    ChevronRight,
    Layers,
    Settings,
    UploadCloud,
    Archive,
    Calculator,
    Database
} from "lucide-vue-next";
import { products as defaultProducts } from "../../data/products";

const productStore = useProductsStore();

// UI State
const searchQuery = ref("");
const activeFilter = ref("all");
const showModal = ref(false);
const showDeleteConfirm = ref(false);
const itemToDelete = ref(null);
const activeTab = ref("info");

// Form State
const form = reactive({
    id: "",
    type: "special", // special, dm, joki, instant-heart
    name: "",
    category: "Game",
    price: 0,
    desc: "",
    stock: 0,
    isActive: true,
    isPopular: false,
    isCalculator: false, // New Field
    thumbnail: "",
    features: [],
    variants: [], 
    config: {}
});

// Watch type to auto-enable calculator for instant-heart
watch(() => form.type, (newVal) => {
    if (!form.config) form.config = {};
    if (newVal === 'instant-heart') {
        form.isCalculator = true;
        form.category = "Heart";
        form.config.isInstant = true;
    } else {
        form.config.isInstant = false;
    }
});

// Helper: Reset Form
const resetForm = () => {
    Object.assign(form, {
        id: "",
        type: "seasonal",
        name: "",
        category: "Seasonal Pass",
        price: 0,
        desc: "",
        stock: 99999,
        isActive: true,
        isPopular: false,
        isCalculator: false,
        thumbnail: "",
        features: ["Resmi & Legal", "Proses Cepat", "Garansi"],
        variants: [], 
        config: { formFields: [{ key: "userId", label: "User ID", type: "number", required: true }], pricePerHeart: 0, quickPicks: [] }
    });
    activeTab.value = "info";
};

// Helper: Load Item to Form
const editItem = (item) => {
    resetForm();
    const data = JSON.parse(JSON.stringify(item));
    data.config = data.config || {};
    if (!data.config.formFields) data.config.formFields = [{ key: "userId", label: "User ID", type: "number", required: true }];
    if (!data.config.quickPicks) data.config.quickPicks = [];
    if (!data.config.pricePerHeart) data.config.pricePerHeart = 0;
    
    Object.assign(form, data);
    showModal.value = true;
};

// Actions
const saveProduct = async () => {
    if (!form.name || !form.price) return alert("Nama dan Harga wajib diisi!");
    
    // Auto ID generation
    if (!form.id) {
        const slug = form.name.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, "");
        form.id = slug || `prod_${Date.now()}`;
    }

    try {
        await productStore.upsert({ ...form }); 
        showModal.value = false;
        resetForm();
    } catch (e) {
        alert("Gagal simpan: " + e.message);
    }
};

const confirmDelete = (item) => {
    itemToDelete.value = item;
    showDeleteConfirm.value = true;
};

const deleteItem = async () => {
    if (itemToDelete.value) {
        await productStore.remove(itemToDelete.value.id);
        showDeleteConfirm.value = false;
        productStore.fetchAll(); // FIXED ACTION
    }
};

const seedProducts = async () => {
    if(!confirm("Sinkronkan produk default? Data dengan ID sama akan di-update.")) return;
    await productStore.seed(defaultProducts);
    alert("Produk berhasil disinkronkan dengan frontend!");
};

// Computed: Filtered List
const filteredProducts = computed(() => {
    let items = productStore.all || [];

    if (activeFilter.value === "active") items = items.filter(i => i.isActive);
    else if (activeFilter.value === "inactive") items = items.filter(i => !i.isActive);
    else if (activeFilter.value !== "all") {
        items = items.filter(i => i.category.toLowerCase().includes(activeFilter.value) || i.type.includes(activeFilter.value));
    }
    
    if (searchQuery.value) {
        const q = searchQuery.value.toLowerCase();
        items = items.filter(i => i.name.toLowerCase().includes(q));
    }

    return items;
});

// Form Helpers
const addFeature = () => form.features.push("Fitur Baru");
const removeFeature = (idx) => form.features.splice(idx, 1);

const addVariant = () => {
    form.variants.push({ id: `var_${Date.now()}`, name: "Varian Baru", price: 0 });
};
const removeVariant = (idx) => form.variants.splice(idx, 1);

const addField = () => {
    if(!form.config.formFields) form.config.formFields = [];
    form.config.formFields.push({ key: "new_field", label: "Label", type: "text", required: true });
};
const removeField = (idx) => form.config.formFields.splice(idx, 1);

onMounted(() => {
    productStore.fetchAll({ fallback: defaultProducts });
});

// Constants
const filters = [
    { id: "all", label: "Semua" },
    { id: "seasonal", label: "Seasonal Pass" },
    { id: "candle", label: "Candle Run" },
    { id: "heart", label: "Heart" },
    { id: "bundle", label: "Bundles" },
    { id: "cosmetic", label: "Cosmetics" },
];

const modalTabs = [
    { id: "info", label: "Info", icon: Package },
    { id: "config", label: "Config", icon: Settings },
    { id: "system", label: "System", icon: Layers },
];
</script>

<template>
    <div class="h-[calc(100vh-8rem)] lg:h-auto flex flex-col">
        <!-- STICKY HEADER -->
        <div class="sticky top-0 z-30 bg-[#f8fafc]/95 dark:bg-[#0b1120]/95 backdrop-blur-xl lg:static lg:bg-transparent pb-4">
            
            <div class="flex items-center gap-3 mb-4">
                <div class="relative flex-1">
                    <Search :size="18" class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        v-model="searchQuery"
                        type="text"
                        placeholder="Cari produk..."
                        class="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-white/5 font-bold text-sm text-slate-800 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 transition shadow-sm"
                    />
                </div>
                <!-- Seed Button -->
                <button @click="seedProducts" class="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-white/5 text-slate-400 hover:text-indigo-600 transition shadow-sm" title="Sync Default Products">
                    <Database :size="18" />
                </button>
            </div>

            <div class="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                <button
                    v-for="f in filters"
                    :key="f.id"
                    @click="activeFilter = f.id"
                    class="px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wide whitespace-nowrap transition-all border"
                    :class="activeFilter === f.id ? 'bg-indigo-600 text-white border-indigo-600 shadow-indigo-500/30' : 'bg-white dark:bg-slate-900 text-slate-500 border-slate-200 dark:border-white/5'"
                >
                    {{ f.label }}
                </button>
            </div>
        </div>

        <!-- PRODUCTS LIST -->
        <div class="flex-1 overflow-y-auto custom-scroll -mx-4 px-4 lg:mx-0 lg:px-0 pb-20 lg:pb-0">
            <div v-if="filteredProducts.length === 0" class="flex flex-col items-center justify-center py-20 text-slate-400">
                <Package :size="48" class="mb-4 opacity-50" stroke-width="1.5" />
                <p class="font-bold">Tidak ada produk</p>
            </div>

            <div class="space-y-3">
                <div
                    v-for="item in filteredProducts"
                    :key="item.id"
                    @click="editItem(item)"
                    class="group relative bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm active:scale-[0.99] transition-transform duration-200 flex items-center gap-4 cursor-pointer"
                >
                    <div class="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 shrink-0 flex items-center justify-center text-slate-400 relative">
                        <Package :size="24" />
                        <div class="absolute top-1 right-1 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-slate-900" :class="item.isActive ? 'bg-emerald-500' : 'bg-slate-400'"></div>
                    </div>

                    <div class="flex-1 min-w-0">
                        <div class="flex items-start justify-between">
                            <h3 class="font-black text-slate-800 dark:text-white text-sm truncate pr-2 leading-tight">{{ item.name }}</h3>
                            <div>
                                <p v-if="item.variants && item.variants.length > 0" class="font-black text-indigo-600 dark:text-indigo-400 text-[10px] shrink-0 text-right">
                                    Mulai {{ formatRupiah(Math.min(...item.variants.map(v => v.price))) }}
                                </p>
                                <p v-else class="font-black text-indigo-600 dark:text-indigo-400 text-sm shrink-0 text-right">
                                    {{ formatRupiah(item.price) }}
                                </p>
                            </div>
                        </div>
                        <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1 mb-1.5">{{ item.category }} • {{ item.type }}</p>
                        
                        <div class="flex items-center gap-3">
                             <span v-if="item.isCalculator" class="inline-flex items-center gap-1 text-[10px] font-bold text-pink-500 bg-pink-50 dark:bg-pink-900/20 px-2 py-0.5 rounded-md">
                                <Calculator :size="10" /> Heart Calc
                            </span>
                             <span v-if="item.variants && item.variants.length > 0" class="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-0.5 rounded-md">
                                <Layers :size="10" /> {{ item.variants.length }} Varian
                            </span>
                        </div>
                    </div>

                    <div class="w-8 h-8 rounded-full bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition shrink-0">
                        <Edit2 :size="14" />
                    </div>
                </div>
            </div>
        </div>

        <!-- FAB -->
        <button
            @click="resetForm(); showModal = true"
            class="fixed bottom-24 right-4 lg:bottom-10 lg:right-10 w-14 h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl shadow-xl shadow-indigo-600/30 flex items-center justify-center z-40 transition active:scale-90"
        >
            <Plus :size="28" stroke-width="2.5" />
        </button>

        <!-- MODAL -->
        <Teleport to="body">
            <template v-if="showModal">
                <div class="fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-sm transition-opacity" @click="showModal = false"></div>
                <div class="fixed inset-0 lg:inset-auto lg:top-1/2 lg:left-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2 z-[70] bg-[#f8fafc] dark:bg-[#0b1120] lg:rounded-[2.5rem] lg:w-[900px] lg:h-[85vh] lg:shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom lg:zoom-in-95 duration-300">
                    
                    <div class="px-6 py-4 bg-white dark:bg-slate-900 border-b border-slate-200/50 dark:border-white/5 flex items-center justify-between shrink-0">
                        <div class="flex items-center gap-3">
                            <button @click="showModal = false" class="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-500 hover:text-indigo-600 transition">
                                <ChevronRight :size="18" class="rotate-180" />
                            </button>
                            <h2 class="text-lg font-black text-slate-800 dark:text-white">{{ form.id ? 'Edit Produk' : 'Produk Baru' }}</h2>
                        </div>
                        <div class="flex gap-2">
                             <button v-if="form.id" @click="confirmDelete({id: form.id})" class="text-rose-500 p-2 hover:bg-rose-50 rounded-xl transition">
                                <Trash2 :size="20"/>
                            </button>
                        </div>
                    </div>

                    <div class="flex border-b border-slate-200/50 dark:border-white/5 bg-white dark:bg-slate-900 shrink-0">
                        <button v-for="tab in modalTabs" :key="tab.id" @click="activeTab = tab.id"
                            class="flex-1 py-4 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 border-b-2 transition-colors relative"
                            :class="activeTab === tab.id ? 'text-indigo-600 border-indigo-600 bg-indigo-50/50 dark:bg-indigo-900/10' : 'text-slate-400 border-transparent hover:bg-slate-50 dark:hover:bg-white/5'">
                            <component :is="tab.icon" :size="16" /> {{ tab.label }}
                        </button>
                    </div>

                    <div class="flex-1 overflow-y-auto p-6 custom-scroll bg-[#f8fafc] dark:bg-[#0b1120]">
                        <div class="max-w-3xl mx-auto space-y-6">
                            
                            <!-- INFO TAB -->
                            <div v-if="activeTab === 'info'" class="space-y-6 animate-in fade-in">
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div class="md:col-span-2">
                                        <label class="text-[10px] font-black uppercase text-slate-400 pl-1 mb-1 block">Nama Produk</label>
                                        <input v-model="form.name" class="w-full bg-white dark:bg-slate-900 border-none rounded-xl px-4 py-3.5 text-sm font-bold shadow-sm focus:ring-2 focus:ring-indigo-500 placeholder-slate-300">
                                    </div>
                                    <div class="md:col-span-2">
                                        <label class="text-[10px] font-black uppercase text-slate-400 pl-1 mb-1 block">Harga (IDR)</label>
                                        <input v-model.number="form.price" type="number" class="w-full bg-white dark:bg-slate-900 border-none rounded-xl px-4 py-3.5 text-lg font-black text-indigo-600 shadow-sm focus:ring-2 focus:ring-indigo-500">
                                    </div>
                                </div>
                                <div>
                                    <label class="text-[10px] font-black uppercase text-slate-400 pl-1 mb-1 block">Deskripsi</label>
                                    <textarea v-model="form.desc" rows="3" class="w-full bg-white dark:bg-slate-900 border-none rounded-xl px-4 py-3.5 text-sm font-medium shadow-sm focus:ring-2 focus:ring-indigo-500 resize-none"></textarea>
                                </div>
                            </div>

                            <!-- CONFIG TAB -->
                            <div v-else-if="activeTab === 'config'" class="space-y-6 animate-in fade-in">
                                <div class="bg-white dark:bg-slate-900 p-5 rounded-3xl shadow-sm border border-slate-100 dark:border-white/5">
                                    <h3 class="font-black text-sm mb-4">Kategori & Tipe</h3>
                                    <div class="grid grid-cols-2 gap-4">
                                        <div>
                                            <label class="text-[10px] font-bold text-slate-400 uppercase">Kategori</label>
                                            <select v-model="form.category" class="w-full mt-1 bg-slate-50 dark:bg-black/20 border-none rounded-xl px-3 py-3 text-sm font-bold">
                                                <option>Seasonal Pass</option>
                                                <option>Candle Run</option>
                                                <option>Heart</option>
                                                <option>Bundles</option>
                                                <option>Cosmetics</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label class="text-[10px] font-bold text-slate-400 uppercase">Tipe</label>
                                            <select v-model="form.type" class="w-full mt-1 bg-slate-50 dark:bg-black/20 border-none rounded-xl px-3 py-3 text-sm font-bold">
                                                <option value="seasonal">Seasonal Pass</option>
                                                <option value="daily-cr">Daily CR</option>
                                                <option value="pilot">Joki Akun</option>
                                                <option value="instant-heart">Instant Heart</option>
                                                <option value="item-gift">Gift Item (IAP)</option>
                                            </select>
                                        </div>
                                    </div>
                                    
                                    <!-- Variants Management -->
                                    <div class="mt-6 border-t border-slate-100 dark:border-white/5 pt-4">
                                        <div class="flex items-center justify-between mb-3">
                                            <h3 class="font-black text-xs uppercase text-slate-400">Varian Produk</h3>
                                            <button @click="addVariant" class="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-bold">+ Varian</button>
                                        </div>
                                        <div v-if="form.variants.length === 0" class="text-center py-6 border-2 border-dashed border-slate-100 dark:border-white/5 rounded-2xl">
                                            <p class="text-xs text-slate-400 font-medium">Single Price (Harga Tunggal)</p>
                                        </div>
                                        <div v-else class="space-y-3">
                                            <div v-for="(v, idx) in form.variants" :key="idx" class="flex items-start gap-2 bg-slate-50 dark:bg-black/20 p-3 rounded-xl relative group">
                                                <div class="flex-1 space-y-2">
                                                    <input v-model="v.name" placeholder="Nama Varian" class="w-full bg-white dark:bg-slate-800 border-none rounded-lg px-3 py-2 text-xs font-bold shadow-sm">
                                                    <input v-model.number="v.price" type="number" placeholder="Rp 0" class="w-full bg-white dark:bg-slate-800 border-none rounded-lg px-3 py-2 text-xs font-mono text-indigo-600 shadow-sm">
                                                </div>
                                                <button @click="removeVariant(idx)" class="absolute top-2 right-2 text-rose-400 hover:text-rose-600 p-1"><X :size="14"/></button>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Calculator Toggle & Config -->
                                    <div v-if="form.type === 'instant-heart' || form.isCalculator" class="mt-4 p-4 bg-pink-50 dark:bg-pink-900/10 rounded-2xl border border-pink-100 dark:border-pink-900/20 space-y-4">
                                        <div class="flex items-center justify-between">
                                            <div class="flex items-center gap-3">
                                                <div class="w-10 h-10 rounded-xl bg-pink-100 dark:bg-pink-800/30 text-pink-500 flex items-center justify-center"><Calculator :size="20"/></div>
                                                <div>
                                                    <p class="font-black text-sm text-pink-600 dark:text-pink-300">MiniHeart Calculator</p>
                                                    <p class="text-xs text-pink-400">Aktifkan mode kalkulator</p>
                                                </div>
                                            </div>
                                            <button @click="form.isCalculator = !form.isCalculator" class="w-12 h-7 rounded-full transition-colors relative" :class="form.isCalculator ? 'bg-pink-500' : 'bg-slate-300'">
                                                <div class="absolute top-1 left-1 bg-white w-5 h-5 rounded-full transition-transform shadow-md" :class="form.isCalculator ? 'translate-x-5' : 'translate-x-0'"></div>
                                            </button>
                                        </div>

                                        <!-- Instant Heart Specific Configs -->
                                        <div v-if="form.isCalculator" class="pt-4 border-t border-pink-200 dark:border-pink-800/30 space-y-4 animate-in fade-in">
                                            
                                            <!-- Manual Unit Price -->
                                            <div>
                                                <label class="text-[10px] font-black uppercase text-pink-500 mb-1 block">Harga Manual Per Unit (Eceran)</label>
                                                <div class="relative">
                                                    <span class="absolute left-4 top-3.5 text-xs font-bold text-pink-400">Rp</span>
                                                    <input v-model.number="form.config.pricePerHeart" type="number" placeholder="Contoh: 1500" class="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-900 border-none rounded-xl text-sm font-bold shadow-sm focus:ring-2 focus:ring-pink-500">
                                                </div>
                                                <p class="text-[10px] text-pink-400 mt-1">*Harga dasar per heart jika beli eceran.</p>
                                            </div>

                                            <!-- Quick Picks / Bundles -->
                                            <div>
                                                <div class="flex items-center justify-between mb-2">
                                                    <label class="text-[10px] font-black uppercase text-pink-500">Quick Picks (Paket Hemat)</label>
                                                    <button @click="() => { if(!form.config.quickPicks) form.config.quickPicks = []; form.config.quickPicks.push({ amount: 10, price: 0, label: '' }) }" class="px-3 py-1 bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-300 rounded-lg text-[10px] font-bold">+ Tambah Paket</button>
                                                </div>
                                                
                                                <div class="space-y-2">
                                                    <div v-if="!form.config.quickPicks || form.config.quickPicks.length === 0" class="p-4 rounded-xl bg-white/50 dark:bg-black/20 text-center text-xs text-pink-400 font-medium border border-dashed border-pink-200 dark:border-pink-800/30">
                                                        Belum ada paket Quick Pick
                                                    </div>
                                                    <div v-for="(bundle, idx) in form.config.quickPicks" :key="idx" class="p-3 bg-white dark:bg-slate-900 rounded-xl border border-pink-100 dark:border-pink-800/20 shadow-sm relative group">
                                                        <button @click="form.config.quickPicks.splice(idx, 1)" class="absolute -top-2 -right-2 bg-rose-500 text-white w-6 h-6 rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition"><X :size="12" /></button>
                                                        
                                                        <div class="grid grid-cols-3 gap-2 mb-2">
                                                            <div>
                                                                <label class="text-[10px] text-slate-400">Jumlah (Qty)</label>
                                                                <input v-model.number="bundle.amount" type="number" class="w-full bg-slate-50 dark:bg-black/20 border-none rounded-lg px-2 py-1.5 text-xs font-bold">
                                                            </div>
                                                            <div class="col-span-2">
                                                                <label class="text-[10px] text-slate-400">Total Harga Paket</label>
                                                                <input v-model.number="bundle.price" type="number" class="w-full bg-slate-50 dark:bg-black/20 border-none rounded-lg px-2 py-1.5 text-xs font-bold text-pink-600">
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <label class="text-[10px] text-slate-400">Label (Opsional)</label>
                                                            <input v-model="bundle.label" placeholder="Cth: Paket S" class="w-full bg-slate-50 dark:bg-black/20 border-none rounded-lg px-2 py-1.5 text-xs font-medium">
                                                        </div>
                                                        
                                                        <!-- Helper: Unit Price Calculation -->
                                                        <div v-if="bundle.amount > 0 && bundle.price > 0" class="mt-2 text-[10px] text-emerald-500 font-bold bg-emerald-50 dark:bg-emerald-900/10 px-2 py-1 rounded-lg inline-block">
                                                            ~{{ Math.round(bundle.price / bundle.amount) }} / unit
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                        </div>
                                    </div>
                                </div>
                                <div class="bg-white dark:bg-slate-900 p-5 rounded-3xl shadow-sm border border-slate-100 dark:border-white/5">
                                    <h3 class="font-black text-sm mb-4">Fitur Badge</h3>
                                    <div class="space-y-2">
                                        <div v-for="(feat, idx) in form.features" :key="idx" class="flex gap-2">
                                            <input v-model="form.features[idx]" class="flex-1 bg-slate-50 dark:bg-black/20 border-none rounded-xl px-3 py-2 text-sm font-medium">
                                            <button @click="removeFeature(idx)" class="text-rose-500 p-2"><X :size="16"/></button>
                                        </div>
                                        <button @click="addFeature" class="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-bold">+ Tambah Fitur</button>
                                    </div>
                                </div>
                            </div>

                            <!-- SYSTEM TAB -->
                            <div v-else-if="activeTab === 'system'" class="space-y-6 animate-in fade-in">
                                 <div class="flex items-center justify-between bg-white dark:bg-slate-900 p-5 rounded-3xl shadow-sm border border-slate-100 dark:border-white/5">
                                    <div>
                                        <p class="font-black text-sm text-slate-800 dark:text-white">Status</p>
                                        <p class="text-xs text-slate-400">Tampilkan di toko?</p>
                                    </div>
                                    <button @click="form.isActive = !form.isActive" class="w-14 h-8 rounded-full transition-colors relative" :class="form.isActive ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'">
                                        <div class="absolute top-1 left-1 bg-white w-6 h-6 rounded-full transition-transform shadow-md" :class="form.isActive ? 'translate-x-6' : 'translate-x-0'"></div>
                                    </button>
                                </div>
                                <div class="bg-white dark:bg-slate-900 p-5 rounded-3xl shadow-sm border border-slate-100 dark:border-white/5">
                                    <h3 class="font-black text-sm mb-4 text-rose-500">User Input Fields</h3>
                                    <div class="space-y-3">
                                        <div v-for="(field, idx) in form.config.formFields" :key="idx" class="p-3 bg-slate-50 dark:bg-black/20 rounded-2xl space-y-2 relative">
                                            <button @click="removeField(idx)" class="absolute top-2 right-2 text-rose-400"><X :size="14"/></button>
                                            <div class="grid grid-cols-2 gap-2">
                                                <input v-model="field.label" placeholder="Label" class="bg-white dark:bg-slate-800 border-none rounded-lg px-2 py-1.5 text-xs font-bold">
                                                <input v-model="field.key" placeholder="Key" class="bg-white dark:bg-slate-800 border-none rounded-lg px-2 py-1.5 text-xs font-mono">
                                            </div>
                                            <div class="flex gap-2 items-center text-xs">
                                                <input type="checkbox" v-model="field.required" class="rounded text-indigo-600 focus:ring-indigo-500 border-none bg-white">
                                                <span class="font-bold text-slate-500">Wajib Diisi</span>
                                            </div>
                                        </div>
                                        <button @click="addField" class="w-full py-3 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-bold border border-indigo-100 border-dashed">+ Tambah Field</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="p-4 bg-white dark:bg-slate-900 border-t border-slate-200/50 dark:border-white/5 shrink-0">
                        <button @click="saveProduct" class="w-full py-4 rounded-2xl bg-indigo-600 text-white font-black text-sm shadow-xl shadow-indigo-600/30 active:scale-[0.98] transition flex items-center justify-center gap-2">
                            <Check :size="18" stroke-width="3" />
                            Simpan Perubahan
                        </button>
                    </div>
                </div>
            </template>
        </Teleport>

        <!-- DELETE MODAL -->
        <Teleport to="body">
            <div v-if="showDeleteConfirm" class="fixed inset-0 z-[80] flex items-center justify-center p-8">
                <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" @click="showDeleteConfirm = false"></div>
                <div class="relative bg-white dark:bg-slate-900 w-full max-w-xs rounded-[2rem] p-6 text-center shadow-2xl">
                    <div class="w-16 h-16 bg-rose-100 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Trash2 :size="28" />
                    </div>
                    <h3 class="font-black text-lg mb-2">Hapus Produk?</h3>
                    <p class="text-sm text-slate-500 mb-6">Yakin ingin menghapus <b>{{ itemToDelete?.name }}</b>? Tidak bisa dibatalkan.</p>
                    <div class="flex gap-3">
                        <button @click="showDeleteConfirm = false" class="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold rounded-xl">Batal</button>
                        <button @click="deleteItem" class="flex-1 py-3 bg-rose-500 text-white font-bold rounded-xl shadow-lg shadow-rose-500/30">Hapus</button>
                    </div>
                </div>
            </div>
        </Teleport>
    </div>
</template>

<style scoped>
.custom-scroll::-webkit-scrollbar { display: none; }
.custom-scroll { -ms-overflow-style: none; scrollbar-width: none; }
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
</style>
