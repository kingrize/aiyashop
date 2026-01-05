<script setup>
import { onMounted, ref, computed, reactive } from "vue";
import { useUserStore } from "../../stores/user";
import { usePromoStore } from "../../stores/promo";
import { useAnnouncementStore } from "../../stores/announcement";
import { useRouter } from "vue-router";
import ProductsPanel from "./ProductsPanel.vue";
import DeliveriesPanel from "./DeliveriesPanel.vue";
import { formatRupiah } from "../../utils/format";
import {
    LayoutGrid,
    Users,
    Tag,
    LogOut,
    ArrowLeft,
    Search,
    Plus,
    Wallet,
    TrendingUp,
    Trash2,
    UserPlus,
    Check,
    X,
    Megaphone,
    Package,
    Pencil,
    Save,
    RefreshCw,
    ClipboardList,
} from "lucide-vue-next";

const userStore = useUserStore();
const promoStore = usePromoStore();
const announcementStore = useAnnouncementStore();
const router = useRouter();

// UI State
const activeTab = ref("dashboard");
const searchQuery = ref("");

// Modals State
const showTopUpModal = ref(false);
const showAddUserModal = ref(false);
const selectedUser = ref(null);
const topUpAmount = ref("");

// IOS Alert State
const alertState = reactive({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
});

// Forms
const promoForm = reactive({
    code: "",
    value: "",
    type: "percent",
    minOrder: 0,
});
const addUserForm = reactive({ name: "", email: "", role: "member", saldo: 0 });
const announceForm = reactive({ text: "", type: "info", link: "", label: "" });

// Computed Data
const stats = computed(
    () =>
        userStore.adminStats || {
            totalUser: 0,
            totalRevenue: 0,
            totalSaldoActive: 0,
        },
);

// --- LOGIC BARU: PISAHKAN ADMIN SENDIRI DARI LIST ---
const myself = computed(() =>
    userStore.allUsers.find((u) => u.id === userStore.user?.uid),
);

const filteredUsers = computed(() => {
    let users = userStore.allUsers || [];

    // 1. Filter: Hapus diri sendiri dari list pencarian
    users = users.filter((u) => u.id !== userStore.user?.uid);

    // 2. Filter: Search Query
    if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase();
        users = users.filter(
            (u) =>
                u.displayName?.toLowerCase().includes(query) ||
                u.email?.toLowerCase().includes(query),
        );
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
    alertState.onConfirm = () => {
        alertState.isOpen = false;
    };
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

// Actions
const openTopUpModal = (user) => {
    selectedUser.value = user;
    topUpAmount.value = "";
    showTopUpModal.value = true;
};
const processTopUp = () => {
    if (!topUpAmount.value || topUpAmount.value <= 0)
        return showAlert("Eits!", "Nominal invalid");
    showConfirm(
        "Konfirmasi",
        `Isi ${formatRupiah(topUpAmount.value)}?`,
        async () => {
            if (
                await userStore.adminTopUpUser(
                    selectedUser.value.id,
                    parseInt(topUpAmount.value),
                )
            )
                showTopUpModal.value = false;
        },
    );
};
const handleDeleteUser = (user) => {
    showConfirm(
        "Hapus?",
        `Hapus ${user.displayName}?`,
        async () => {
            await userStore.adminDeleteUser(user.id);
        },
        true,
    );
};
const handleChangeRole = (user, newRole) => {
    if (user.role !== newRole)
        showConfirm("Ubah Role", `Jadikan ${newRole}?`, async () => {
            await userStore.adminUpdateUserRole(user.id, newRole);
        });
};
const handleAddUser = async () => {
    if (!addUserForm.name || !addUserForm.email)
        return showAlert("Data Kurang", "Isi semua!");
    const res = await userStore.adminCreateMemberData(
        addUserForm.email,
        addUserForm.name,
        addUserForm.role,
        addUserForm.saldo,
    );
    if (res.success) {
        showAddUserModal.value = false;
        showAlert("Sukses", `Login: ${res.email}\nPass: ${res.password}`);
        addUserForm.name = "";
        addUserForm.email = "";
        addUserForm.saldo = 0;
    } else showAlert("Gagal", res.error);
};
const handleCreatePromo = async () => {
    if (!promoForm.code || !promoForm.value)
        return showAlert("Data Kurang", "Lengkapi!");
    if (
        await promoStore.createPromo(
            promoForm.code,
            promoForm.value,
            promoForm.type,
            promoForm.minOrder,
        )
    ) {
        promoForm.code = "";
        promoForm.value = "";
        promoForm.minOrder = 0;
        showAlert("Sukses", "Promo dibuat!");
    }
};
const handleDeletePromo = (code) => {
    showConfirm(
        "Hapus Promo?",
        code,
        async () => {
            await promoStore.deletePromo(code);
        },
        true,
    );
};
const handleLogout = () => {
    showConfirm("Logout", "Keluar admin?", async () => {
        await userStore.logout();
        router.push("/");
    });
};
const handleCreateAnnouncement = async () => {
    if (!announceForm.text) return showAlert("Kosong", "Isi teks!");
    if (
        await announcementStore.create(
            announceForm.text,
            announceForm.type,
            announceForm.link,
            announceForm.label,
        )
    ) {
        announceForm.text = "";
        announceForm.link = "";
        announceForm.label = "";
        showAlert("Terkirim", "Pengumuman berhasil!");
    }
};
const toggleAnnouncement = async (item) => {
    await announcementStore.toggleStatus(item.id, item.isActive);
};
const deleteAnnouncement = (id) => {
    showConfirm(
        "Hapus?",
        "Hapus info ini?",
        async () => {
            await announcementStore.remove(id);
        },
        true,
    );
};
</script>

<template>
    <div
        class="min-h-screen bg-[#F2F2F7] dark:bg-[#000000] flex font-sans text-slate-600 dark:text-slate-300 transition-colors duration-300 pb-24 lg:pb-0"
    >
        <aside class="hidden lg:flex w-64 fixed h-full z-30 p-4 flex-col">
            <div
                class="bg-white/80 dark:bg-[#1C1C1E]/90 backdrop-blur-xl border border-slate-200/60 dark:border-white/10 shadow-sm rounded-3xl h-full flex flex-col"
            >
                <div class="p-6 flex items-center gap-3">
                    <div
                        class="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-lg shadow-indigo-500/30"
                    >
                        A
                    </div>
                    <div>
                        <span
                            class="text-lg font-bold text-slate-900 dark:text-white"
                            >Admin</span
                        ><span
                            class="text-[10px] block font-medium text-slate-400 uppercase tracking-widest"
                            >Dashboard</span
                        >
                    </div>
                </div>
                <nav class="flex-1 px-3 space-y-2 mt-6">
                    <button
                        @click="activeTab = 'dashboard'"
                        class="w-full flex items-center gap-3 px-3 py-3 rounded-xl font-bold transition-all duration-300"
                        :class="
                            activeTab === 'dashboard'
                                ? 'bg-indigo-50 dark:bg-white/10 text-indigo-600 dark:text-white'
                                : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5'
                        "
                    >
                        <LayoutGrid :size="20" /> Overview
                    </button>
                    <button
                        @click="activeTab = 'users'"
                        class="w-full flex items-center gap-3 px-3 py-3 rounded-xl font-bold transition-all duration-300"
                        :class="
                            activeTab === 'users'
                                ? 'bg-indigo-50 dark:bg-white/10 text-indigo-600 dark:text-white'
                                : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5'
                        "
                    >
                        <Users :size="20" /> Users
                    </button>
                    <button
                        @click="activeTab = 'promos'"
                        class="w-full flex items-center gap-3 px-3 py-3 rounded-xl font-bold transition-all duration-300"
                        :class="
                            activeTab === 'promos'
                                ? 'bg-indigo-50 dark:bg-white/10 text-indigo-600 dark:text-white'
                                : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5'
                        "
                    >
                        <Tag :size="20" /> Promos
                    </button>
                    <button
                        @click="activeTab = 'products'"
                        class="w-full flex items-center gap-3 px-3 py-3 rounded-xl font-bold transition-all duration-300"
                        :class="
                            activeTab === 'products'
                                ? 'bg-indigo-50 dark:bg-white/10 text-indigo-600 dark:text-white'
                                : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5'
                        "
                    >
                        <Package :size="20" /> Products
                    </button>
                    <button
                        @click="activeTab = 'deliveries'"
                        class="w-full flex items-center gap-3 px-3 py-3 rounded-xl font-bold transition-all duration-300"
                        :class="
                            activeTab === 'deliveries'
                                ? 'bg-indigo-50 dark:bg-white/10 text-indigo-600 dark:text-white'
                                : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5'
                        "
                    >
                        <ClipboardList :size="20" /> Deliveries
                    </button>
                    <button
                        @click="activeTab = 'announce'"
                        class="w-full flex items-center gap-3 px-3 py-3 rounded-xl font-bold transition-all duration-300"
                        :class="
                            activeTab === 'announce'
                                ? 'bg-indigo-50 dark:bg-white/10 text-indigo-600 dark:text-white'
                                : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5'
                        "
                    >
                        <Megaphone :size="20" /> Info
                    </button>
                </nav>
                <div
                    class="p-3 border-t border-slate-100 dark:border-white/5 pt-4 space-y-2"
                >
                    <button
                        @click="router.push('/')"
                        class="w-full flex items-center gap-3 px-3 py-3 text-slate-400 hover:text-sky-500 font-bold rounded-xl transition"
                    >
                        <ArrowLeft :size="20" /> Ke Toko
                    </button>
                    <button
                        @click="handleLogout"
                        class="w-full flex items-center gap-3 px-3 py-3 text-slate-400 hover:text-rose-500 font-bold rounded-xl transition"
                    >
                        <LogOut :size="20" /> Logout
                    </button>
                </div>
            </div>
        </aside>

        <main
            class="flex-1 w-full lg:ml-64 p-4 lg:p-8 transition-all duration-300"
        >
            <header class="flex justify-between items-end mb-8">
                <div class="lg:hidden flex items-center gap-3">
                    <div
                        class="w-9 h-9 bg-indigo-500 rounded-xl flex items-center justify-center text-white font-black text-sm"
                    >
                        A
                    </div>
                    <h2
                        class="text-xl font-black text-slate-900 dark:text-white"
                    >
                        Admin
                    </h2>
                </div>
                <div class="hidden lg:block">
                    <h2
                        class="text-3xl font-black text-slate-900 dark:text-white mb-1"
                    >
                        {{
                            activeTab === "dashboard"
                                ? "Overview"
                                : activeTab === "users"
                                  ? "User Management"
                                  : activeTab === "promos"
                                    ? "Promo Codes"
                                    : activeTab === "products"
                                      ? "Products"
                                      : "Global Announcements"
                        }}
                    </h2>
                    <p class="text-slate-400 font-medium text-sm">
                        Welcome back, Chief! ☕
                    </p>
                </div>
                <div v-if="activeTab === 'users'">
                    <button
                        @click="showAddUserModal = true"
                        class="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg transition btn-bouncy"
                    >
                        <UserPlus :size="18" />
                        <span class="hidden md:inline">Add Member</span>
                    </button>
                </div>
                <button
                    @click="handleLogout"
                    class="lg:hidden p-2 bg-white dark:bg-slate-800 rounded-full text-slate-400 hover:text-rose-500 shadow-sm"
                >
                    <LogOut :size="18" />
                </button>
            </header>

            <div
                v-if="activeTab === 'dashboard'"
                class="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500"
            >
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div
                        class="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-indigo-500 to-purple-700 p-8 text-white shadow-xl shadow-indigo-500/20 group hover:scale-[1.02] transition-transform duration-300"
                    >
                        <div
                            class="absolute -right-8 -bottom-8 text-white/10 group-hover:scale-110 transition-transform duration-500"
                        >
                            <Users :size="140" />
                        </div>
                        <div class="relative z-10">
                            <div
                                class="flex items-center gap-2 mb-2 opacity-80"
                            >
                                <Users :size="18" /><span
                                    class="text-xs font-bold uppercase tracking-widest"
                                    >Total Members</span
                                >
                            </div>
                            <p class="text-6xl font-black tracking-tighter">
                                {{ stats?.totalUser || 0 }}
                            </p>
                        </div>
                    </div>
                    <div
                        class="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-emerald-500 to-teal-700 p-8 text-white shadow-xl shadow-emerald-500/20 group hover:scale-[1.02] transition-transform duration-300"
                    >
                        <div
                            class="absolute -right-8 -bottom-8 text-white/10 group-hover:scale-110 transition-transform duration-500"
                        >
                            <Wallet :size="140" />
                        </div>
                        <div class="relative z-10">
                            <div
                                class="flex items-center gap-2 mb-2 opacity-80"
                            >
                                <Wallet :size="18" /><span
                                    class="text-xs font-bold uppercase tracking-widest"
                                    >Liability</span
                                >
                            </div>
                            <p
                                class="text-4xl font-black tracking-tighter truncate"
                            >
                                {{ formatRupiah(stats?.totalSaldoActive || 0) }}
                            </p>
                            <p class="text-xs font-medium opacity-70 mt-1">
                                Saldo Mengendap
                            </p>
                        </div>
                    </div>
                    <div
                        class="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-amber-400 to-orange-600 p-8 text-white shadow-xl shadow-amber-500/20 group hover:scale-[1.02] transition-transform duration-300"
                    >
                        <div
                            class="absolute -right-8 -bottom-8 text-white/10 group-hover:scale-110 transition-transform duration-500"
                        >
                            <TrendingUp :size="140" />
                        </div>
                        <div class="relative z-10">
                            <div
                                class="flex items-center gap-2 mb-2 opacity-80"
                            >
                                <TrendingUp :size="18" /><span
                                    class="text-xs font-bold uppercase tracking-widest"
                                    >Revenue</span
                                >
                            </div>
                            <p
                                class="text-4xl font-black tracking-tighter truncate"
                            >
                                {{ formatRupiah(stats?.totalRevenue || 0) }}
                            </p>
                            <p class="text-xs font-medium opacity-70 mt-1">
                                Total Pemasukan
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div
                v-else-if="activeTab === 'users'"
                class="animate-in fade-in slide-in-from-bottom-4 duration-500"
            >
                <div v-if="myself" class="mb-6 relative group">
                    <div
                        class="absolute inset-0 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 rounded-[24px] blur-xl group-hover:blur-2xl transition-all duration-500 opacity-60 dark:opacity-40"
                    ></div>

                    <div
                        class="relative bg-white/70 dark:bg-[#1C1C1E]/80 backdrop-blur-2xl border border-white/40 dark:border-white/10 rounded-[24px] p-4 md:p-5 flex items-center justify-between shadow-sm overflow-hidden"
                    >
                        <div
                            class="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-indigo-500/10 to-transparent rounded-full blur-2xl pointer-events-none"
                        ></div>

                        <div
                            class="flex items-center gap-3 md:gap-4 overflow-hidden"
                        >
                            <div class="relative shrink-0">
                                <div
                                    class="w-12 h-12 md:w-14 md:h-14 rounded-full p-[2px] bg-gradient-to-br from-indigo-400 to-pink-400 shadow-md"
                                >
                                    <div
                                        class="w-full h-full rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xl md:text-2xl shadow-inner overflow-hidden"
                                    >
                                        <span
                                            class="transform hover:scale-110 transition cursor-default"
                                            >👑</span
                                        >
                                    </div>
                                </div>
                                <div
                                    class="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white dark:border-[#1C1C1E] rounded-full shadow-sm"
                                ></div>
                            </div>

                            <div class="min-w-0">
                                <div class="flex items-center gap-2">
                                    <h3
                                        class="text-base md:text-lg font-bold text-slate-900 dark:text-white truncate"
                                    >
                                        {{ myself.displayName }}
                                    </h3>
                                    <span
                                        class="hidden md:inline-flex px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 text-[10px] font-bold uppercase tracking-wider"
                                    >
                                        Super Admin
                                    </span>
                                </div>
                                <p
                                    class="text-xs text-slate-500 dark:text-slate-400 truncate font-medium"
                                >
                                    {{ myself.email }}
                                </p>
                                <span
                                    class="md:hidden inline-block mt-1 text-[9px] font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-widest"
                                >
                                    Super Admin
                                </span>
                            </div>
                        </div>

                        <div class="text-right pl-2 shrink-0">
                            <p
                                class="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5"
                            >
                                My Wallet
                            </p>
                            <div class="flex items-center justify-end gap-1.5">
                                <p
                                    class="text-lg md:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400"
                                >
                                    {{ formatRupiah(myself.saldo) }}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div
                    class="bg-white dark:bg-[#1C1C1E] rounded-[2rem] shadow-sm border border-slate-100 dark:border-white/5 overflow-hidden"
                >
                    <div
                        class="p-4 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/5"
                    >
                        <div class="relative">
                            <Search
                                class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                                :size="18"
                            />
                            <input
                                v-model="searchQuery"
                                type="text"
                                placeholder="Cari user lain..."
                                class="w-full pl-11 pr-4 py-3 rounded-xl bg-white dark:bg-black/30 border-none text-sm font-bold focus:ring-2 focus:ring-indigo-500 transition shadow-sm placeholder-slate-400"
                            />
                        </div>
                    </div>

                    <div class="hidden md:block overflow-x-auto">
                        <table
                            class="w-full text-left text-sm whitespace-nowrap"
                        >
                            <thead
                                class="bg-slate-50/50 dark:bg-white/5 text-slate-400 font-bold uppercase text-[10px] tracking-wider"
                            >
                                <tr>
                                    <th class="px-6 py-4">User Identity</th>
                                    <th class="px-6 py-4">Role</th>
                                    <th class="px-6 py-4">Saldo</th>
                                    <th class="px-6 py-4 text-right">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody
                                class="divide-y divide-slate-100 dark:divide-white/5"
                            >
                                <tr
                                    v-for="user in filteredUsers"
                                    :key="user.id"
                                    class="hover:bg-indigo-50/30 dark:hover:bg-white/5 transition"
                                >
                                    <td class="px-6 py-4">
                                        <div class="flex items-center gap-3">
                                            <div
                                                class="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-500 dark:text-slate-300 text-xs"
                                            >
                                                {{
                                                    user.displayName?.[0] || "?"
                                                }}
                                            </div>
                                            <div>
                                                <p
                                                    class="font-bold text-slate-900 dark:text-white"
                                                >
                                                    {{ user.displayName }}
                                                </p>
                                                <p
                                                    class="text-[10px] text-slate-400"
                                                >
                                                    {{ user.email }}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td class="px-6 py-4">
                                        <select
                                            :value="user.role"
                                            @change="
                                                handleChangeRole(
                                                    user,
                                                    $event.target.value,
                                                )
                                            "
                                            class="bg-transparent text-xs font-bold uppercase border border-slate-200 dark:border-slate-600 rounded-lg px-2 py-1 cursor-pointer focus:border-indigo-500 focus:outline-none"
                                            :class="
                                                user.role === 'admin'
                                                    ? 'text-rose-500'
                                                    : 'text-slate-500'
                                            "
                                        >
                                            <option value="member">
                                                MEMBER
                                            </option>
                                            <option value="admin">ADMIN</option>
                                        </select>
                                    </td>
                                    <td
                                        class="px-6 py-4 font-bold text-emerald-600"
                                    >
                                        {{ formatRupiah(user.saldo) }}
                                    </td>
                                    <td class="px-6 py-4 text-right">
                                        <div class="flex justify-end gap-2">
                                            <button
                                                @click="openTopUpModal(user)"
                                                class="p-2 bg-indigo-50 dark:bg-white/10 text-indigo-600 dark:text-indigo-300 rounded-lg hover:bg-indigo-100 transition"
                                                title="Isi Saldo"
                                            >
                                                <Wallet :size="16" />
                                            </button>
                                            <button
                                                v-if="
                                                    user.id !==
                                                    userStore.user.uid
                                                "
                                                @click="handleDeleteUser(user)"
                                                class="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition"
                                                title="Hapus User"
                                            >
                                                <Trash2 :size="16" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                                <tr v-if="filteredUsers.length === 0">
                                    <td
                                        colspan="4"
                                        class="px-6 py-12 text-center text-slate-400 font-medium"
                                    >
                                        Tidak ada user ditemukan.
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div class="md:hidden p-4 space-y-4">
                        <div
                            v-for="user in filteredUsers"
                            :key="user.id"
                            class="bg-slate-50 dark:bg-white/5 p-4 rounded-2xl border border-slate-100 dark:border-white/5"
                        >
                            <div class="flex justify-between items-start mb-3">
                                <div>
                                    <h4
                                        class="font-bold text-slate-900 dark:text-white"
                                    >
                                        {{ user.displayName }}
                                    </h4>
                                    <p class="text-xs text-slate-400">
                                        {{ user.email }}
                                    </p>
                                </div>
                                <select
                                    :value="user.role"
                                    @change="
                                        handleChangeRole(
                                            user,
                                            $event.target.value,
                                        )
                                    "
                                    class="bg-white dark:bg-slate-800 text-[10px] font-bold uppercase border border-slate-200 dark:border-slate-600 rounded-lg px-2 py-1"
                                    :class="
                                        user.role === 'admin'
                                            ? 'text-rose-500'
                                            : 'text-slate-500'
                                    "
                                >
                                    <option value="member">MEMBER</option>
                                    <option value="admin">ADMIN</option>
                                </select>
                            </div>
                            <div
                                class="flex justify-between items-center bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-700 mb-4"
                            >
                                <span
                                    class="text-xs font-bold text-slate-400 uppercase"
                                    >Saldo</span
                                >
                                <span class="font-black text-emerald-500">{{
                                    formatRupiah(user.saldo)
                                }}</span>
                            </div>
                            <div class="flex gap-2">
                                <button
                                    @click="openTopUpModal(user)"
                                    class="flex-1 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold shadow-md flex items-center justify-center gap-1"
                                >
                                    <Wallet :size="14" /> Isi Saldo
                                </button>
                                <button
                                    v-if="user.id !== userStore.user.uid"
                                    @click="handleDeleteUser(user)"
                                    class="px-3 py-2 bg-white dark:bg-slate-800 text-rose-500 border border-rose-100 dark:border-rose-900 rounded-lg"
                                >
                                    <Trash2 :size="16" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div
                v-else-if="activeTab === 'promos'"
                class="animate-in fade-in slide-in-from-bottom-4"
            >
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div
                        class="bg-white dark:bg-[#1C1C1E] p-6 rounded-[2rem] shadow-sm border border-slate-100 dark:border-white/5 h-fit"
                    >
                        <h3
                            class="text-lg font-bold text-slate-900 dark:text-white mb-4"
                        >
                            Buat Promo
                        </h3>
                        <div class="space-y-4">
                            <input
                                v-model="promoForm.code"
                                type="text"
                                placeholder="KODE"
                                class="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-black/20 border-none font-bold uppercase focus:ring-2 focus:ring-indigo-500 transition text-slate-800 dark:text-white"
                            />
                            <div
                                class="flex p-1 bg-slate-50 dark:bg-black/20 rounded-xl"
                            >
                                <button
                                    @click="promoForm.type = 'percent'"
                                    class="flex-1 py-2 rounded-lg text-xs font-bold transition-all"
                                    :class="
                                        promoForm.type === 'percent'
                                            ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-white'
                                            : 'text-slate-400'
                                    "
                                >
                                    % Persen</button
                                ><button
                                    @click="promoForm.type = 'fixed'"
                                    class="flex-1 py-2 rounded-lg text-xs font-bold transition-all"
                                    :class="
                                        promoForm.type === 'fixed'
                                            ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-white'
                                            : 'text-slate-400'
                                    "
                                >
                                    Rp Nominal
                                </button>
                            </div>
                            <input
                                v-model="promoForm.value"
                                type="number"
                                placeholder="Nilai"
                                class="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-black/20 border-none font-bold text-lg focus:ring-2 focus:ring-indigo-500 transition text-slate-800 dark:text-white"
                            /><button
                                @click="handleCreatePromo"
                                class="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg transition btn-bouncy"
                            >
                                Simpan
                            </button>
                        </div>
                    </div>
                    <div class="lg:col-span-2 space-y-3">
                        <div
                            v-for="promo in promoStore.allPromos"
                            :key="promo.code"
                            class="bg-white dark:bg-[#1C1C1E] p-4 rounded-2xl border border-slate-100 dark:border-white/5 flex items-center justify-between"
                        >
                            <div class="flex items-center gap-4">
                                <div
                                    class="w-12 h-12 rounded-xl flex items-center justify-center font-black text-white text-xs"
                                    :class="
                                        promo.type === 'percent'
                                            ? 'bg-amber-400'
                                            : 'bg-emerald-500'
                                    "
                                >
                                    {{ promo.type === "percent" ? "%" : "Rp" }}
                                </div>
                                <div>
                                    <h4
                                        class="font-bold text-slate-900 dark:text-white"
                                    >
                                        {{ promo.code }}
                                    </h4>
                                    <p class="text-xs text-slate-400">
                                        Diskon
                                        {{ promoStore.formatDiscount(promo) }}
                                    </p>
                                </div>
                            </div>
                            <button
                                @click="handleDeletePromo(promo.code)"
                                class="p-2 text-slate-300 hover:text-rose-500 transition"
                            >
                                <Trash2 :size="18" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div
                v-else-if="activeTab === 'products'"
                class="animate-in fade-in slide-in-from-bottom-4"
            >
                <ProductsPanel />
            </div>

            <div
                v-else-if="activeTab === 'deliveries'"
                class="animate-in fade-in slide-in-from-bottom-4"
            >
                <DeliveriesPanel />
            </div>

            <div
                v-else-if="activeTab === 'announce'"
                class="animate-in fade-in slide-in-from-bottom-4"
            >
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div
                        class="bg-white dark:bg-[#1C1C1E] p-6 rounded-[2rem] shadow-sm border border-slate-100 dark:border-white/5 h-fit"
                    >
                        <h3
                            class="text-lg font-bold text-slate-900 dark:text-white mb-4"
                        >
                            Siarkan Info
                        </h3>
                        <div class="space-y-4">
                            <textarea
                                v-model="announceForm.text"
                                placeholder="Tulis pengumuman..."
                                rows="3"
                                class="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-black/20 border-none font-medium focus:ring-2 focus:ring-indigo-500 transition text-slate-800 dark:text-white resize-none"
                            ></textarea>
                            <div class="grid grid-cols-2 gap-2">
                                <input
                                    v-model="announceForm.link"
                                    type="text"
                                    placeholder="Link (Opsional)"
                                    class="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-black/20 border-none text-xs font-bold focus:ring-2 focus:ring-indigo-500 text-slate-700 dark:text-white"
                                /><input
                                    v-model="announceForm.label"
                                    type="text"
                                    placeholder="Label Tombol"
                                    class="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-black/20 border-none text-xs font-bold focus:ring-2 focus:ring-indigo-500 text-slate-700 dark:text-white"
                                />
                            </div>
                            <div class="grid grid-cols-4 gap-2">
                                <button
                                    @click="announceForm.type = 'info'"
                                    class="h-8 rounded-lg bg-slate-800 border-2"
                                    :class="
                                        announceForm.type === 'info'
                                            ? 'border-slate-400'
                                            : 'border-transparent opacity-40'
                                    "
                                ></button
                                ><button
                                    @click="announceForm.type = 'warning'"
                                    class="h-8 rounded-lg bg-amber-400 border-2"
                                    :class="
                                        announceForm.type === 'warning'
                                            ? 'border-amber-200'
                                            : 'border-transparent opacity-40'
                                    "
                                ></button
                                ><button
                                    @click="announceForm.type = 'danger'"
                                    class="h-8 rounded-lg bg-rose-500 border-2"
                                    :class="
                                        announceForm.type === 'danger'
                                            ? 'border-rose-300'
                                            : 'border-transparent opacity-40'
                                    "
                                ></button
                                ><button
                                    @click="announceForm.type = 'promo'"
                                    class="h-8 rounded-lg bg-gradient-to-r from-indigo-500 to-pink-500 border-2"
                                    :class="
                                        announceForm.type === 'promo'
                                            ? 'border-indigo-300'
                                            : 'border-transparent opacity-40'
                                    "
                                ></button>
                            </div>
                            <button
                                @click="handleCreateAnnouncement"
                                class="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg transition btn-bouncy"
                            >
                                Broadcast
                            </button>
                        </div>
                    </div>
                    <div class="lg:col-span-2 space-y-3">
                        <div
                            v-for="item in announcementStore.allAnnouncements"
                            :key="item.id"
                            class="bg-white dark:bg-[#1C1C1E] p-4 rounded-2xl border border-slate-100 dark:border-white/5 flex items-center justify-between group"
                        >
                            <div class="flex items-center gap-4">
                                <div
                                    class="w-1.5 h-12 rounded-full"
                                    :class="{
                                        'bg-slate-800': item.type === 'info',
                                        'bg-amber-400': item.type === 'warning',
                                        'bg-rose-500': item.type === 'danger',
                                        'bg-gradient-to-b from-indigo-500 to-pink-500':
                                            item.type === 'promo',
                                    }"
                                ></div>
                                <div>
                                    <p
                                        class="text-sm font-bold text-slate-800 dark:text-slate-100 line-clamp-2 max-w-md"
                                    >
                                        {{ item.text }}
                                    </p>
                                    <p
                                        v-if="item.actionLink"
                                        class="text-[10px] text-indigo-500 font-bold mt-0.5"
                                    >
                                        🔗 {{ item.actionLabel || "Link" }}
                                    </p>
                                </div>
                            </div>
                            <div class="flex items-center gap-2">
                                <button
                                    @click="toggleAnnouncement(item)"
                                    class="px-3 py-1.5 rounded-lg text-[10px] font-bold border transition"
                                    :class="
                                        item.isActive
                                            ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                                            : 'bg-slate-100 text-slate-500 border-slate-200'
                                    "
                                >
                                    {{
                                        item.isActive ? "AKTIF" : "MATI"
                                    }}</button
                                ><button
                                    @click="deleteAnnouncement(item.id)"
                                    class="p-2 text-slate-300 hover:text-rose-500 transition"
                                >
                                    <Trash2 :size="16" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>

        <div
            class="lg:hidden fixed bottom-0 w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg border-t border-slate-200 dark:border-white/10 pb-safe z-50"
        >
            <div class="flex justify-around items-center h-16">
                <button
                    @click="activeTab = 'dashboard'"
                    class="flex flex-col items-center gap-1 p-2 w-14"
                    :class="
                        activeTab === 'dashboard'
                            ? 'text-indigo-600 dark:text-white'
                            : 'text-slate-400'
                    "
                >
                    <LayoutGrid :size="20" /><span class="text-[9px] font-bold"
                        >Home</span
                    >
                </button>
                <button
                    @click="activeTab = 'users'"
                    class="flex flex-col items-center gap-1 p-2 w-14"
                    :class="
                        activeTab === 'users'
                            ? 'text-indigo-600 dark:text-white'
                            : 'text-slate-400'
                    "
                >
                    <Users :size="20" /><span class="text-[9px] font-bold"
                        >Users</span
                    >
                </button>
                <button
                    @click="activeTab = 'promos'"
                    class="flex flex-col items-center gap-1 p-2 w-14"
                    :class="
                        activeTab === 'promos'
                            ? 'text-indigo-600 dark:text-white'
                            : 'text-slate-400'
                    "
                >
                    <Tag :size="20" /><span class="text-[9px] font-bold"
                        >Promo</span
                    >
                </button>
                <button
                    @click="activeTab = 'products'"
                    class="flex flex-col items-center gap-1 p-2 w-14"
                    :class="
                        activeTab === 'products'
                            ? 'text-indigo-600 dark:text-white'
                            : 'text-slate-400'
                    "
                >
                    <Package :size="20" /><span class="text-[9px] font-bold"
                        >Produk</span
                    >
                </button>
                <button
                    @click="activeTab = 'announce'"
                    class="flex flex-col items-center gap-1 p-2 w-14"
                    :class="
                        activeTab === 'announce'
                            ? 'text-indigo-600 dark:text-white'
                            : 'text-slate-400'
                    "
                >
                    <Megaphone :size="20" /><span class="text-[9px] font-bold"
                        >Info</span
                    >
                </button>
                <button
                    @click="router.push('/')"
                    class="flex flex-col items-center gap-1 p-2 w-14 text-slate-400"
                >
                    <ArrowLeft :size="20" /><span class="text-[9px] font-bold"
                        >Exit</span
                    >
                </button>
            </div>
        </div>

        <transition name="fade"
            ><div
                v-if="showTopUpModal"
                class="fixed inset-0 z-[60] flex items-center justify-center p-4"
            >
                <div
                    class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                    @click="showTopUpModal = false"
                ></div>
                <div
                    class="bg-white dark:bg-slate-800 w-full max-w-sm rounded-[2rem] shadow-2xl relative z-10 p-6 animate-in zoom-in-95 border border-white/20"
                >
                    <h3
                        class="text-xl font-bold text-center mb-6 text-slate-900 dark:text-white"
                    >
                        Top Up Manual
                    </h3>
                    <div
                        class="bg-slate-50 dark:bg-white/5 p-4 rounded-2xl mb-6 text-center"
                    >
                        <p
                            class="text-xl font-bold text-indigo-600 dark:text-indigo-400"
                        >
                            {{ selectedUser?.displayName }}
                        </p>
                    </div>
                    <input
                        v-model="topUpAmount"
                        type="number"
                        class="w-full px-4 py-4 rounded-2xl bg-slate-100 dark:bg-black/20 border-none font-black text-2xl text-center focus:ring-2 focus:ring-indigo-500 transition text-slate-900 dark:text-white mb-6"
                        placeholder="0"
                    />
                    <div class="flex gap-2">
                        <button
                            @click="showTopUpModal = false"
                            class="flex-1 py-3 text-sm font-bold text-slate-500 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5"
                        >
                            Batal</button
                        ><button
                            @click="processTopUp"
                            class="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg"
                        >
                            Konfirmasi
                        </button>
                    </div>
                </div>
            </div></transition
        >
        <transition name="fade"
            ><div
                v-if="showAddUserModal"
                class="fixed inset-0 z-[60] flex items-center justify-center p-4"
            >
                <div
                    class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                    @click="showAddUserModal = false"
                ></div>
                <div
                    class="bg-white dark:bg-slate-800 w-full max-w-sm rounded-[2rem] shadow-2xl relative z-10 p-6 animate-in zoom-in-95 border border-white/20"
                >
                    <h3
                        class="text-xl font-black mb-6 text-slate-900 dark:text-white flex items-center gap-2"
                    >
                        <UserPlus :size="24" class="text-indigo-500" /> Tambah
                        Member
                    </h3>
                    <div class="space-y-4">
                        <input
                            v-model="addUserForm.email"
                            type="email"
                            class="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-black/20 border-none font-bold focus:ring-2 focus:ring-indigo-500 text-slate-700 dark:text-white"
                            placeholder="user@mail.com"
                        /><input
                            v-model="addUserForm.name"
                            type="text"
                            class="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-black/20 border-none font-bold focus:ring-2 focus:ring-indigo-500 text-slate-700 dark:text-white"
                            placeholder="Nama Member"
                        /><select
                            v-model="addUserForm.role"
                            class="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-black/20 border-none font-bold focus:ring-2 focus:ring-indigo-500 text-slate-700 dark:text-white"
                        >
                            <option value="member">Member</option>
                            <option value="admin">Admin</option></select
                        ><button
                            @click="handleAddUser"
                            class="w-full py-3.5 bg-indigo-600 text-white rounded-xl font-bold shadow-lg transition"
                        >
                            Simpan Data
                        </button>
                    </div>
                </div>
            </div></transition
        >
        <transition name="fade"
            ><div
                v-if="alertState.isOpen"
                class="fixed inset-0 z-[100] flex items-center justify-center p-4"
            >
                <div
                    class="absolute inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity"
                    @click="alertState.isOpen = false"
                ></div>
                <div
                    class="bg-white/95 dark:bg-[#1C1C1E]/95 backdrop-blur-2xl w-full max-w-[270px] rounded-[18px] shadow-2xl relative z-10 overflow-hidden text-center animate-in zoom-in-105 duration-200"
                >
                    <div class="p-5 pb-5">
                        <h3
                            class="text-[17px] font-bold text-slate-900 dark:text-white mb-1 leading-snug"
                        >
                            {{ alertState.title }}
                        </h3>
                        <p
                            class="text-[13px] text-slate-500 dark:text-slate-400 leading-relaxed whitespace-pre-wrap"
                        >
                            {{ alertState.message }}
                        </p>
                    </div>
                    <div
                        class="flex border-t border-slate-200/50 dark:border-white/10 divide-x divide-slate-200/50 dark:divide-white/10"
                    >
                        <button
                            @click="alertState.isOpen = false"
                            class="flex-1 py-3.5 text-[17px] font-normal text-blue-500 hover:bg-slate-50 dark:hover:bg-white/5 transition active:opacity-70"
                        >
                            Batal</button
                        ><button
                            @click="alertState.onConfirm"
                            class="flex-1 py-3.5 text-[17px] font-bold"
                            :class="
                                alertState.isDanger
                                    ? 'text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20'
                                    : 'text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                            "
                        >
                            {{ alertState.isDanger ? "Hapus" : "Ya" }}
                        </button>
                    </div>
                </div>
            </div></transition
        >
    </div>
</template>

<style scoped>
.pb-safe {
    padding-bottom: env(safe-area-inset-bottom);
}
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>
