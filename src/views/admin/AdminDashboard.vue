<script setup>
import { onMounted, ref, computed, reactive } from "vue";
import { useUserStore } from "../../stores/user";
import { usePromoStore } from "../../stores/promo";
import { useAnnouncementStore } from "../../stores/announcement";
import { useRouter } from "vue-router";
import ProductsPanel from "./ProductsPanel.vue";
import DeliveriesPanel from "./DeliveriesPanel.vue";
import OrdersPanel from "./OrdersPanel.vue";
import { formatRupiah } from "../../utils/format";
import {
    LayoutGrid,
    Users,
    Tag,
    LogOut,
    Store,
    Megaphone,
    Package,
    ClipboardList,
    ShoppingCart,
    Menu,
    X,
    ChevronRight,
    Wallet,
    TrendingUp,
    Shield,
    Check,
    UserPlus,
    Bell,
    Settings
} from "lucide-vue-next";

const userStore = useUserStore();
const promoStore = usePromoStore();
const announcementStore = useAnnouncementStore();
const router = useRouter();

// UI State
const activeTab = ref("dashboard");
const showMenuSheet = ref(false); 
const searchQuery = ref("");

// Modals State
const showTopUpModal = ref(false);
const showAddUserModal = ref(false);
const selectedUser = ref(null);
const topUpAmount = ref("");

// Alert State
const alertState = reactive({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
    isDanger: false
});

// Forms
const promoForm = reactive({ code: "", value: "", type: "percent", minOrder: 0 });
const addUserForm = reactive({ name: "", email: "", role: "member", saldo: 0 });
const announceForm = reactive({ text: "", type: "info", link: "", label: "" });

// Data
const stats = computed(() => userStore.adminStats || { totalUser: 0, totalRevenue: 0, totalSaldoActive: 0 });
const myself = computed(() => userStore.allUsers.find((u) => u.id === userStore.user?.uid));

const filteredUsers = computed(() => {
    let users = userStore.allUsers || [];
    users = users.filter((u) => u.id !== userStore.user?.uid);
    if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase();
        users = users.filter((u) => u.displayName?.toLowerCase().includes(query) || u.email?.toLowerCase().includes(query));
    }
    return users;
});

onMounted(async () => {
    await userStore.fetchAllUsers();
    await promoStore.fetchAllPromos();
    await announcementStore.fetchAll();
});

// Helpers
const showAlert = (title, message) => {
    alertState.title = title;
    alertState.message = message;
    alertState.isOpen = true;
    alertState.isDanger = false;
    alertState.onConfirm = null;
};

const showConfirm = (title, message, action, isDanger = false) => {
    alertState.title = title;
    alertState.message = message;
    alertState.isDanger = isDanger;
    alertState.isOpen = true;
    alertState.onConfirm = async () => {
        alertState.isOpen = false;
        await action();
    };
};

const openTopUpModal = (user) => { selectedUser.value = user; topUpAmount.value = ""; showTopUpModal.value = true; };
const processTopUp = () => {
    if (!topUpAmount.value || topUpAmount.value <= 0) return showAlert("Eits!", "Nominal invalid");
    showConfirm("Konfirmasi", `Isi ${formatRupiah(topUpAmount.value)}?`, async () => {
        if (await userStore.adminTopUpUser(selectedUser.value.id, parseInt(topUpAmount.value))) showTopUpModal.value = false;
    });
};
const handleDeleteUser = (user) => { showConfirm("Hapus?", `Hapus ${user.displayName}?`, async () => { await userStore.adminDeleteUser(user.id); }, true); };
const handleAddUser = async () => {
    if (!addUserForm.name || !addUserForm.email) return showAlert("Data Kurang", "Isi semua!");
    const res = await userStore.adminCreateMemberData(addUserForm.email, addUserForm.name, addUserForm.role, addUserForm.saldo);
    if (res.success) { showAddUserModal.value = false; showAlert("Sukses", `Login: ${res.email}\nPass: ${res.password}`); addUserForm.name = ""; addUserForm.email = ""; addUserForm.saldo = 0; } else showAlert("Gagal", res.error);
};
const handleCreatePromo = async () => {
    if (!promoForm.code || !promoForm.value) return showAlert("Data Kurang", "Lengkapi!");
    if (await promoStore.createPromo(promoForm.code, promoForm.value, promoForm.type, promoForm.minOrder)) { promoForm.code = ""; promoForm.value = ""; showAlert("Sukses", "Promo dibuat!"); }
};
const handleDeletePromo = (code) => { showConfirm("Hapus Promo?", code, async () => { await promoStore.deletePromo(code); }, true); };
const handleLogout = () => { showConfirm("Logout", "Keluar admin?", async () => { await userStore.logout(); router.push("/"); }); };
const handleCreateAnnouncement = async () => {
    if (!announceForm.text) return showAlert("Kosong", "Isi teks!");
    if (await announcementStore.create(announceForm.text, announceForm.type, announceForm.link, announceForm.label)) { announceForm.text = ""; showAlert("Terkirim", "Pengumuman berhasil!"); }
};
const toggleAnnouncement = async (item) => { await announcementStore.toggleStatus(item.id, item.isActive); };
const deleteAnnouncement = (id) => { showConfirm("Hapus?", "Hapus info ini?", async () => { await announcementStore.remove(id); }, true); };

// Navigation
const coreTabs = [
    { id: "dashboard", label: "Home", icon: LayoutGrid },
    { id: "orders", label: "Orders", icon: ShoppingCart },
    { id: "products", label: "Product", icon: Package },
    { id: "users", label: "Users", icon: Users },
];

const menuTabs = [
    { id: "deliveries", label: "Delivery Tracking", icon: ClipboardList, desc: "Pantau pengiriman manual" },
    { id: "promos", label: "Voucher Promosi", icon: Tag, desc: "Atur kode diskon toko" },
    { id: "announce", label: "Pengumuman", icon: Megaphone, desc: "Broadcast info ke user" },
];

const switchTab = (id) => { activeTab.value = id; showMenuSheet.value = false; };
const currentTitle = computed(() => {
    const all = [...coreTabs, ...menuTabs];
    const t = all.find(x => x.id === activeTab.value);
    return t ? t.label : "Dashboard";
});
</script>

<template>
    <div class="min-h-screen bg-[#f8fafc] dark:bg-[#0b1120] font-sans text-slate-600 dark:text-slate-300 transition-colors duration-300">
        
        <div class="flex h-screen overflow-hidden">
            <!-- DESKTOP SIDEBAR -->
            <aside class="hidden lg:flex w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-white/5 flex-col z-30">
                <div class="p-6 flex items-center gap-3">
                    <div class="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-500/30">A</div>
                    <div>
                        <h1 class="font-black text-slate-800 dark:text-white leading-none text-lg">Admin</h1>
                        <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Control Center</p>
                    </div>
                </div>

                <nav class="flex-1 px-4 py-2 space-y-1 overflow-y-auto custom-scroll">
                    <p class="px-3 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 mt-2">Main Menu</p>
                    <button v-for="tab in coreTabs" :key="tab.id" @click="activeTab = tab.id"
                        class="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl font-bold text-sm transition-all duration-200"
                        :class="activeTab === tab.id ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5'">
                        <component :is="tab.icon" :size="20" /> {{ tab.label }}
                    </button>

                    <p class="px-3 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 mt-6">Utilities</p>
                    <button v-for="tab in menuTabs" :key="tab.id" @click="activeTab = tab.id"
                        class="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl font-bold text-sm transition-all duration-200"
                        :class="activeTab === tab.id ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5'">
                        <component :is="tab.icon" :size="20" /> {{ tab.label }}
                    </button>
                </nav>

                <div class="p-4 border-t border-slate-100 dark:border-white/5">
                    <button @click="router.push('/')" class="w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-indigo-600 font-bold text-sm rounded-xl transition hover:bg-slate-50">
                        <Store :size="18" /> Back to Store
                    </button>
                    <button @click="handleLogout" class="w-full flex items-center gap-3 px-4 py-3 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/10 font-bold text-sm rounded-xl transition mt-1">
                        <LogOut :size="18" /> Logout
                    </button>
                </div>
            </aside>

            <!-- CONTENT AREA -->
            <main class="flex-1 w-full relative overflow-y-auto no-scrollbar scroll-smooth">
                <header class="lg:hidden sticky top-0 z-40 bg-white/80 dark:bg-[#0b1120]/80 backdrop-blur-md border-b border-slate-200/50 dark:border-white/5 px-4 h-14 flex items-center justify-between">
                    <div class="flex items-center gap-2">
                         <div class="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-black text-sm shadow-md shadow-indigo-500/20">A</div>
                         <span class="font-black text-slate-800 dark:text-white text-base tracking-tight">{{ currentTitle }}</span>
                    </div>
                </header>

                <div class="max-w-7xl mx-auto p-4 lg:p-10 pb-32 lg:pb-10">
                    
                    <div v-if="activeTab === 'dashboard'" class="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-8">
                        <div class="hidden lg:block">
                            <h2 class="text-3xl font-black text-slate-800 dark:text-white tracking-tight">Overview</h2>
                            <p class="text-slate-500 font-medium">Here's what's happening today.</p>
                        </div>
                        <div class="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
                            <div class="bg-white dark:bg-slate-900 p-4 md:p-6 rounded-2xl md:rounded-3xl border border-slate-100 dark:border-white/5 shadow-sm flex flex-col justify-between h-32 md:h-40 relative overflow-hidden group">
                                <div class="absolute right-0 top-0 p-3 opacity-10 group-hover:scale-110 transition duration-500"><Users :size="64" /></div>
                                <div class="w-10 h-10 rounded-full bg-indigo-50 dark:bg-white/5 flex items-center justify-center text-indigo-500 mb-2"><Users :size="20" /></div>
                                <div><p class="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">{{ stats.totalUser }}</p><p class="text-xs font-bold text-slate-400 uppercase tracking-wider">Members</p></div>
                            </div>
                            <div class="bg-white dark:bg-slate-900 p-4 md:p-6 rounded-2xl md:rounded-3xl border border-slate-100 dark:border-white/5 shadow-sm flex flex-col justify-between h-32 md:h-40 relative overflow-hidden group">
                                <div class="absolute right-0 top-0 p-3 opacity-10 group-hover:scale-110 transition duration-500"><Wallet :size="64" /></div>
                                <div class="w-10 h-10 rounded-full bg-emerald-50 dark:bg-white/5 flex items-center justify-center text-emerald-500 mb-2"><Wallet :size="20" /></div>
                                <div><p class="text-xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight truncate">{{ formatRupiah(stats.totalSaldoActive) }}</p><p class="text-xs font-bold text-slate-400 uppercase tracking-wider">Liabilitas</p></div>
                            </div>
                            <div class="col-span-2 bg-gradient-to-br from-indigo-600 to-violet-600 p-4 md:p-6 rounded-2xl md:rounded-3xl shadow-lg shadow-indigo-500/20 text-white flex flex-col justify-between h-32 md:h-40 relative overflow-hidden">
                                <div class="absolute -right-4 -bottom-4 opacity-20"><TrendingUp :size="100" /></div>
                                <div class="flex justify-between items-start">
                                    <div class="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm"><TrendingUp :size="20" /></div>
                                    <span class="px-2 py-1 rounded-lg bg-white/20 text-xs font-black backdrop-blur-sm">ALL TIME</span>
                                </div>
                                <div><p class="text-3xl md:text-4xl font-black tracking-tight">{{ formatRupiah(stats.totalRevenue) }}</p><p class="text-xs font-bold text-indigo-200 uppercase tracking-wider">Total Revenue</p></div>
                            </div>
                        </div>

                        <div>
                            <h3 class="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider mb-4 px-1">Shortcuts</h3>
                            <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                                <button @click="switchTab('deliveries')" class="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 hover:border-indigo-500/30 transition text-left group">
                                    <div class="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-900/20 text-sky-500 flex items-center justify-center mb-3 group-hover:scale-110 transition"><ClipboardList :size="20" /></div>
                                    <p class="font-bold text-slate-700 dark:text-slate-200 text-sm">Tracking</p><p class="text-[10px] text-slate-400">Pantau order</p>
                                </button>
                                <button @click="switchTab('promos')" class="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 hover:border-indigo-500/30 transition text-left group">
                                    <div class="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-900/20 text-rose-500 flex items-center justify-center mb-3 group-hover:scale-110 transition"><Tag :size="20" /></div>
                                    <p class="font-bold text-slate-700 dark:text-slate-200 text-sm">Vouchers</p><p class="text-[10px] text-slate-400">Buat promo</p>
                                </button>
                                <button @click="switchTab('announce')" class="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 hover:border-indigo-500/30 transition text-left group">
                                    <div class="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/20 text-amber-500 flex items-center justify-center mb-3 group-hover:scale-110 transition"><Megaphone :size="20" /></div>
                                    <p class="font-bold text-slate-700 dark:text-slate-200 text-sm">Info</p><p class="text-[10px] text-slate-400">Broadcast</p>
                                </button>
                                 <button @click="showAddUserModal = true" class="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 hover:border-indigo-500/30 transition text-left group">
                                    <div class="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-500 flex items-center justify-center mb-3 group-hover:scale-110 transition"><UserPlus :size="20" /></div>
                                    <p class="font-bold text-slate-700 dark:text-slate-200 text-sm">Invite</p><p class="text-[10px] text-slate-400">Tambah user</p>
                                </button>
                            </div>
                        </div>
                    </div>

                    <ProductsPanel v-else-if="activeTab === 'products'" />
                    <OrdersPanel v-else-if="activeTab === 'orders'" />
                    <DeliveriesPanel v-else-if="activeTab === 'deliveries'" />

                    <div v-else-if="activeTab === 'users'" class="space-y-4 animate-in fade-in">
                        <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/50 dark:border-white/5 p-2 sticky top-0 z-20 shadow-sm">
                            <input v-model="searchQuery" class="w-full bg-slate-50 dark:bg-black/20 border-none rounded-xl px-4 py-3 text-sm font-bold placeholder-slate-400 focus:ring-2 focus:ring-indigo-500" placeholder="Search users...">
                        </div>
                        <div v-for="user in filteredUsers" :key="user.id" class="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-white/5 flex items-center justify-between gap-3">
                            <div class="flex items-center gap-3 min-w-0">
                                <div class="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-bold">{{ user.displayName?.[0] }}</div>
                                <div class="min-w-0"><p class="font-bold text-slate-800 dark:text-white truncate text-sm">{{ user.displayName }}</p><p class="text-xs text-slate-400 truncate">{{ formatRupiah(user.saldo) }}</p></div>
                            </div>
                            <button @click="openTopUpModal(user)" class="px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-bold">Topup</button>
                        </div>
                        <button @click="showAddUserModal = true" class="fixed bottom-24 right-4 w-12 h-12 bg-indigo-600 text-white rounded-full shadow-xl shadow-indigo-600/30 flex items-center justify-center z-30 lg:hidden"><UserPlus :size="24" /></button>
                    </div>

                    <div v-else-if="activeTab === 'promos'" class="animate-in fade-in space-y-4">
                         <div class="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-white/5">
                            <h3 class="font-black text-sm mb-3">Add Promo</h3>
                             <div class="space-y-3">
                                 <input v-model="promoForm.code" placeholder="CODE (e.g. SALE10)" class="w-full bg-slate-50 dark:bg-black/20 rounded-xl px-4 py-3 text-sm font-bold uppercase border-none focus:ring-indigo-500">
                                 <div class="flex gap-2">
                                     <input v-model="promoForm.value" type="number" placeholder="Value" class="flex-1 bg-slate-50 dark:bg-black/20 rounded-xl px-4 py-3 text-sm font-bold border-none">
                                     <select v-model="promoForm.type" class="bg-slate-50 dark:bg-black/20 rounded-xl px-3 text-xs font-bold border-none"><option value="percent">%</option><option value="fixed">Rp</option></select>
                                 </div>
                                 <button @click="handleCreatePromo" class="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold text-sm shadow-lg shadow-indigo-600/20">Save</button>
                             </div>
                         </div>
                         <div class="space-y-2">
                             <div v-for="p in promoStore.allPromos" :key="p.code" class="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-white/5 flex justify-between items-center">
                                 <div class="flex items-center gap-3">
                                     <div class="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center font-black text-xs">{{ p.type=='percent'?'%':'Rp' }}</div>
                                     <div><p class="font-black text-slate-800 dark:text-white">{{ p.code }}</p><p class="text-xs text-slate-400">{{ promoStore.formatDiscount(p) }} off</p></div>
                                 </div>
                                 <button @click="handleDeletePromo(p.code)" class="text-rose-500 p-2"><X :size="16"/></button>
                             </div>
                         </div>
                    </div>

                     <div v-else-if="activeTab === 'announce'" class="animate-in fade-in space-y-4">
                        <div class="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-white/5">
                            <textarea v-model="announceForm.text" class="w-full bg-slate-50 dark:bg-black/20 rounded-xl px-4 py-3 text-sm font-medium border-none focus:ring-indigo-500 resize-none" rows="3" placeholder="Message..."></textarea>
                            <div class="flex justify-between items-center mt-3">
                                <select v-model="announceForm.type" class="bg-slate-50 dark:bg-black/20 rounded-lg px-2 py-1 text-xs font-bold border-none"><option value="info">Info</option><option value="warning">Warning</option><option value="promo">Promo</option></select>
                                <button @click="handleCreateAnnouncement" class="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold">Send</button>
                            </div>
                        </div>
                        <div class="space-y-2">
                            <!-- FIXED: allAnnouncements -->
                             <div v-for="item in announcementStore.allAnnouncements" :key="item.id" class="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-white/5">
                                 <p class="text-sm font-medium text-slate-700 dark:text-slate-200">{{ item.text }}</p>
                                 <div class="flex justify-between items-center mt-3">
                                     <span class="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800">{{ item.type }}</span>
                                     <div class="flex gap-2">
                                        <button @click="toggleAnnouncement(item)" class="text-[10px] font-bold text-indigo-500">{{ item.isActive ? 'Active' : 'Draft' }}</button>
                                        <button @click="deleteAnnouncement(item.id)" class="text-slate-400 hover:text-rose-500"><X :size="14"/></button>
                                     </div>
                                 </div>
                             </div>
                        </div>
                     </div>
                </div>
            </main>
        </div>

        <!-- DOCK -->
        <nav class="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-[#0b1120]/95 backdrop-blur-xl border-t border-slate-200/50 dark:border-white/5 pb-safe">
            <div class="flex justify-around items-center px-2 py-3">
                <button v-for="tab in coreTabs" :key="tab.id" @click="activeTab = tab.id" 
                    class="flex flex-col items-center gap-1 w-14 transition active:scale-95">
                    <div class="p-1.5 rounded-xl transition-all duration-300" 
                        :class="activeTab === tab.id ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30 -translate-y-1' : 'text-slate-400'">
                        <component :is="tab.icon" :size="20" stroke-width="2.5" />
                    </div>
                    <span class="text-[10px] font-bold" :class="activeTab === tab.id ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'">{{ tab.label }}</span>
                </button>
                <button @click="showMenuSheet = true" class="flex flex-col items-center gap-1 w-14 transition active:scale-95">
                    <div class="p-1.5 rounded-xl text-slate-400 bg-slate-100 dark:bg-slate-800"><Menu :size="20" stroke-width="2.5" /></div>
                    <span class="text-[10px] font-bold text-slate-400">Menu</span>
                </button>
            </div>
        </nav>

        <!-- DRAWER & MODALS from previous step (Preserved) -->
        <Teleport to="body">
            <template v-if="showMenuSheet">
                <div class="fixed inset-0 z-[60] bg-slate-900/40 backdrop-blur-sm lg:hidden transition-opacity" @click="showMenuSheet = false"></div>
                <div class="fixed bottom-0 left-0 right-0 z-[70] bg-[#f8fafc] dark:bg-[#0b1120] rounded-t-[2rem] p-6 lg:hidden shadow-2xl transform transition-transform duration-300 slide-in-from-bottom border-t border-indigo-500/10 h-[70vh] flex flex-col">
                    <div class="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mb-6 shrink-0"></div>
                    <div class="flex items-center gap-4 mb-8 shrink-0">
                         <div class="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-lg shadow-indigo-500/30">A</div>
                         <div><h3 class="font-black text-slate-800 dark:text-white text-lg">Admin Menu</h3><p class="text-xs text-slate-400">Pilih menu lainnya</p></div>
                    </div>
                    <div class="flex-1 overflow-y-auto space-y-3 no-scrollbar pb-10">
                         <button v-for="tab in menuTabs" :key="tab.id" @click="switchTab(tab.id)" class="w-full flex items-center gap-4 p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 rounded-2xl active:scale-[0.98] transition">
                            <div class="w-10 h-10 rounded-xl flex items-center justify-center" :class="activeTab === tab.id ? 'bg-indigo-500 text-white' : 'bg-slate-50 dark:bg-white/5 text-slate-500'"><component :is="tab.icon" :size="20" /></div>
                            <div class="text-left"><p class="font-black text-slate-800 dark:text-white text-sm">{{ tab.label }}</p><p class="text-[10px] text-slate-400">{{ tab.desc }}</p></div>
                            <ChevronRight :size="16" class="ml-auto text-slate-300" />
                         </button>
                         <hr class="border-slate-200/50 dark:border-white/5 my-4" />
                         <button @click="router.push('/')" class="w-full flex items-center gap-4 p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 rounded-2xl active:scale-[0.98] transition group">
                            <div class="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center"><Store :size="20" /></div><p class="font-bold text-slate-700 dark:text-slate-200 text-sm">Kembali ke Toko</p>
                         </button>
                         <button @click="handleLogout" class="w-full flex items-center gap-4 p-4 bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/20 rounded-2xl active:scale-[0.98] transition">
                            <div class="w-10 h-10 rounded-xl bg-white/50 flex items-center justify-center text-rose-500"><LogOut :size="20" /></div><p class="font-bold text-rose-500 text-sm">Logout Admin</p>
                         </button>
                    </div>
                </div>
            </template>
        </Teleport>
        <Teleport to="body">
             <div v-if="showAddUserModal || showTopUpModal || alertState.isOpen" class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[80]" @click="()=>{ showTopUpModal=false; showAddUserModal=false; if(alertState.isOpen && !alertState.isDanger) alertState.isOpen=false; }"></div>
              <transition name="pop">
                 <div v-if="alertState.isOpen" class="fixed inset-0 z-[90] flex items-center justify-center p-8 pointer-events-none">
                     <div class="bg-white dark:bg-slate-900 w-full max-w-xs rounded-3xl p-6 text-center shadow-2xl pointer-events-auto">
                         <h3 class="font-black text-lg mb-2 text-slate-900 dark:text-white">{{ alertState.title }}</h3>
                         <p class="text-sm text-slate-500 mb-6">{{ alertState.message }}</p>
                         <div class="flex gap-2">
                             <button v-if="alertState.onConfirm" @click="alertState.isOpen=false" class="flex-1 py-3 text-slate-400 font-bold hover:bg-slate-50 rounded-xl">Batal</button>
                             <button @click="() => { if(alertState.onConfirm) alertState.onConfirm(); else alertState.isOpen = false; }" class="flex-1 py-3 text-white font-bold rounded-xl shadow-lg" :class="alertState.isDanger ? 'bg-rose-500' : 'bg-indigo-600'">Oke</button>
                         </div>
                     </div>
                 </div>
              </transition>
                <transition name="pop">
                 <div v-if="showTopUpModal" class="fixed inset-0 z-[90] flex items-center justify-center p-8 pointer-events-none">
                    <div class="bg-white dark:bg-slate-900 w-full max-w-xs rounded-3xl p-6 pointer-events-auto shadow-2xl">
                        <h3 class="font-black text-slate-800 dark:text-white text-center mb-4">Top Up Saldo</h3>
                        <input v-model="topUpAmount" type="number" class="w-full text-center text-2xl font-black bg-slate-50 dark:bg-black/20 rounded-xl py-4 mb-4 border-none focus:ring-emerald-500" placeholder="0" autofocus>
                        <button @click="processTopUp" class="w-full py-3 bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/30">Konfirmasi</button>
                    </div>
                 </div>
              </transition>
               <transition name="pop">
                 <div v-if="showAddUserModal" class="fixed inset-0 z-[90] flex items-center justify-center p-8 pointer-events-none">
                    <div class="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[2rem] p-6 pointer-events-auto shadow-2xl">
                         <h3 class="font-black text-center mb-4 dark:text-white">New User</h3>
                         <div class="space-y-3 mb-6">
                             <input v-model="addUserForm.name" class="w-full bg-slate-50 dark:bg-black/20 rounded-xl px-4 py-3 text-sm font-bold border-none" placeholder="Name">
                             <input v-model="addUserForm.email" class="w-full bg-slate-50 dark:bg-black/20 rounded-xl px-4 py-3 text-sm font-bold border-none" placeholder="Email">
                             <select v-model="addUserForm.role" class="w-full bg-slate-50 dark:bg-black/20 rounded-xl px-4 py-3 text-sm font-bold border-none"><option value="member">Member</option><option value="admin">Admin</option></select>
                         </div>
                         <button @click="handleAddUser" class="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg">Create</button>
                    </div>
                 </div>
              </transition>
         </Teleport>
    </div>
</template>

<style scoped>
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
.custom-scroll::-webkit-scrollbar { display: none; }
.pop-enter-active, .pop-leave-active { transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
.pop-enter-from, .pop-leave-to { opacity: 0; transform: scale(0.9); }
</style>
