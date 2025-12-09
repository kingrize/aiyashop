<script setup>
import { onMounted, ref, computed, reactive } from "vue";
import { useUserStore } from "../../stores/user";
import { usePromoStore } from "../../stores/promo";
import { useRouter } from "vue-router";
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
    TicketPercent,
    CheckCircle2,
    UserPlus,
    Check,
    X,
} from "lucide-vue-next";

const userStore = useUserStore();
const promoStore = usePromoStore();
const router = useRouter();

// UI State
const activeTab = ref("dashboard");
const searchQuery = ref("");

// Modals
const showTopUpModal = ref(false);
const showAddUserModal = ref(false);
const selectedUser = ref(null);
const topUpAmount = ref("");

// Forms
const promoForm = reactive({ code: "", value: "", type: "percent" });
const addUserForm = reactive({ name: "", email: "", role: "member", saldo: 0 });

// Computed Data (Safe Access)
const stats = computed(
    () =>
        userStore.adminStats || {
            totalUser: 0,
            totalRevenue: 0,
            totalSaldoActive: 0,
        },
);

const filteredUsers = computed(() => {
    if (!searchQuery.value) return userStore.allUsers || [];
    const query = searchQuery.value.toLowerCase();
    return userStore.allUsers.filter(
        (u) =>
            u.displayName?.toLowerCase().includes(query) ||
            u.email?.toLowerCase().includes(query),
    );
});

const formatRupiah = (val) =>
    new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
    }).format(val || 0);

// Actions
onMounted(async () => {
    await userStore.fetchAllUsers();
    await promoStore.fetchAllPromos();
});

const openTopUpModal = (user) => {
    selectedUser.value = user;
    topUpAmount.value = "";
    showTopUpModal.value = true;
};

const processTopUp = async () => {
    if (!topUpAmount.value || topUpAmount.value <= 0)
        return alert("Nominal invalid!");
    const confirmMsg = `Isi saldo ${formatRupiah(topUpAmount.value)} ke ${selectedUser.value.displayName}?`;
    if (!confirm(confirmMsg)) return;

    const success = await userStore.adminTopUpUser(
        selectedUser.value.id,
        parseInt(topUpAmount.value),
    );
    if (success) {
        showTopUpModal.value = false;
        alert("Top Up Berhasil! 🚀");
    }
};

const handleDeleteUser = async (user) => {
    const confirmMsg = `⚠️ Yakin ingin menghapus member ${user.displayName}? \nData saldo & history akan hilang permanen!`;
    if (!confirm(confirmMsg)) return;
    await userStore.adminDeleteUser(user.id);
};

const handleChangeRole = async (user, newRole) => {
    if (user.role === newRole) return;
    if (!confirm(`Ubah role ${user.displayName} menjadi ${newRole}?`)) return;
    await userStore.adminUpdateUserRole(user.id, newRole);
};

const handleAddUser = async () => {
    if (!addUserForm.name || !addUserForm.email)
        return alert("Nama & Email wajib diisi!");

    // Panggil fungsi create yang mengembalikan password default
    const result = await userStore.adminCreateMemberData(
        addUserForm.email,
        addUserForm.name,
        addUserForm.role,
        addUserForm.saldo,
    );

    if (result.success) {
        showAddUserModal.value = false;

        // Tampilkan info password ke Admin agar bisa di-share
        alert(
            `✅ Member Berhasil Dibuat!\n\nLogin: ${result.email}\nPassword Default: ${result.password}\n\nSilakan berikan info ini ke member.`,
        );

        // Reset Form
        addUserForm.name = "";
        addUserForm.email = "";
        addUserForm.saldo = 0;
    } else {
        alert("Gagal membuat member: " + result.error);
    }
};

const handleCreatePromo = async () => {
    if (!promoForm.code || !promoForm.value) return alert("Lengkapi data!");
    const success = await promoStore.createPromo(
        promoForm.code,
        promoForm.value,
        promoForm.type,
    );
    if (success) {
        promoForm.code = "";
        promoForm.value = "";
    }
};

const handleDeletePromo = async (code) => {
    if (confirm(`Hapus promo ${code}?`)) await promoStore.deletePromo(code);
};

const handleLogout = async () => {
    await userStore.logout();
    router.push("/");
};
</script>

<template>
    <div
        class="min-h-screen bg-cream dark:bg-charcoal flex font-sans text-slate-600 dark:text-slate-300 transition-colors duration-300 pb-20 lg:pb-0"
    >
        <aside class="hidden lg:flex w-64 fixed h-full z-30 p-4 flex-col">
            <div
                class="bg-white/80 dark:bg-slate-800/90 backdrop-blur-xl border border-slate-100 dark:border-white/10 shadow-xl rounded-3xl h-full flex flex-col"
            >
                <div class="p-6 flex items-center gap-3">
                    <div
                        class="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-lg"
                    >
                        A
                    </div>
                    <div class="leading-tight">
                        <span
                            class="text-lg font-bold tracking-tight text-slate-900 dark:text-white"
                            >Admin</span
                        >
                        <span
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
                </nav>
                <div
                    class="p-3 space-y-2 border-t border-slate-100 dark:border-white/5 pt-4"
                >
                    <button
                        @click="router.push('/')"
                        class="w-full flex items-center gap-3 px-3 py-3 text-slate-400 hover:text-sky-500 transition rounded-xl font-bold"
                    >
                        <ArrowLeft :size="20" /> Ke Toko
                    </button>
                    <button
                        @click="handleLogout"
                        class="w-full flex items-center gap-3 px-3 py-3 text-slate-400 hover:text-rose-500 transition rounded-xl font-bold"
                    >
                        <LogOut :size="20" /> Logout
                    </button>
                </div>
            </div>
        </aside>

        <main
            class="flex-1 w-full lg:ml-64 p-4 lg:p-8 transition-all duration-300"
        >
            <header
                class="lg:hidden flex justify-between items-center mb-6 pt-2"
            >
                <div class="flex items-center gap-3">
                    <div
                        class="w-9 h-9 bg-indigo-500 rounded-xl flex items-center justify-center text-white font-black text-sm"
                    >
                        A
                    </div>
                    <h2
                        class="text-xl font-black text-slate-900 dark:text-white"
                    >
                        Admin Panel
                    </h2>
                </div>
                <button
                    @click="handleLogout"
                    class="p-2 bg-white dark:bg-slate-800 rounded-full text-slate-400 hover:text-rose-500 shadow-sm"
                >
                    <LogOut :size="18" />
                </button>
            </header>

            <header class="hidden lg:flex mb-8 justify-between items-end">
                <div>
                    <h2
                        class="text-3xl font-black text-slate-900 dark:text-white mb-1"
                    >
                        {{
                            activeTab === "dashboard"
                                ? "Overview"
                                : activeTab === "users"
                                  ? "User Management"
                                  : "Promo Codes"
                        }}
                    </h2>
                    <p class="text-slate-400 font-medium text-sm">
                        Welcome back, Chief!
                    </p>
                </div>
                <div v-if="activeTab === 'users'">
                    <button
                        @click="showAddUserModal = true"
                        class="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg transition"
                    >
                        <UserPlus :size="18" /> Add Member
                    </button>
                </div>
            </header>

            <button
                v-if="activeTab === 'users'"
                @click="showAddUserModal = true"
                class="lg:hidden fixed bottom-24 right-4 z-40 w-12 h-12 bg-indigo-600 text-white rounded-full shadow-xl flex items-center justify-center btn-bouncy"
            >
                <UserPlus :size="20" />
            </button>

            <div
                v-if="activeTab === 'dashboard'"
                class="space-y-6 animate-in fade-in slide-in-from-bottom-4"
            >
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
                    <div
                        class="bg-white dark:bg-slate-800 p-5 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-700 relative overflow-hidden"
                    >
                        <div class="flex justify-between mb-4">
                            <div
                                class="p-2.5 bg-indigo-50 dark:bg-indigo-500/20 rounded-xl text-indigo-600 dark:text-indigo-400"
                            >
                                <Users :size="20" />
                            </div>
                            <span
                                class="text-[10px] font-bold bg-slate-100 dark:bg-white/5 px-2 py-1 rounded-lg text-slate-500"
                                >TOTAL</span
                            >
                        </div>
                        <p
                            class="text-3xl font-black text-slate-900 dark:text-white"
                        >
                            {{ stats?.totalUser || 0 }}
                        </p>
                        <p
                            class="text-xs font-bold text-slate-400 mt-1 uppercase"
                        >
                            Members
                        </p>
                    </div>
                    <div
                        class="bg-white dark:bg-slate-800 p-5 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-700 relative overflow-hidden"
                    >
                        <div class="flex justify-between mb-4">
                            <div
                                class="p-2.5 bg-emerald-50 dark:bg-emerald-500/20 rounded-xl text-emerald-600 dark:text-emerald-400"
                            >
                                <Wallet :size="20" />
                            </div>
                        </div>
                        <p
                            class="text-3xl font-black text-slate-900 dark:text-white truncate"
                        >
                            {{ formatRupiah(stats?.totalSaldoActive || 0) }}
                        </p>
                        <p
                            class="text-xs font-bold text-slate-400 mt-1 uppercase"
                        >
                            Saldo Aktif
                        </p>
                    </div>
                    <div
                        class="bg-white dark:bg-slate-800 p-5 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-700 relative overflow-hidden"
                    >
                        <div class="flex justify-between mb-4">
                            <div
                                class="p-2.5 bg-amber-50 dark:bg-amber-500/20 rounded-xl text-amber-600 dark:text-amber-400"
                            >
                                <TrendingUp :size="20" />
                            </div>
                        </div>
                        <p
                            class="text-3xl font-black text-slate-900 dark:text-white truncate"
                        >
                            {{ formatRupiah(stats?.totalRevenue || 0) }}
                        </p>
                        <p
                            class="text-xs font-bold text-slate-400 mt-1 uppercase"
                        >
                            Revenue
                        </p>
                    </div>
                </div>
            </div>

            <div
                v-else-if="activeTab === 'users'"
                class="animate-in fade-in slide-in-from-bottom-4"
            >
                <div
                    class="bg-white dark:bg-slate-800 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden"
                >
                    <div
                        class="p-4 border-b border-slate-100 dark:border-slate-700"
                    >
                        <div class="relative">
                            <Search
                                class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                                :size="18"
                            />
                            <input
                                v-model="searchQuery"
                                type="text"
                                placeholder="Cari member..."
                                class="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-black/20 border-none text-sm font-bold focus:ring-2 focus:ring-indigo-500 transition"
                            />
                        </div>
                    </div>

                    <div class="hidden md:block overflow-x-auto">
                        <table
                            class="w-full text-left text-sm whitespace-nowrap"
                        >
                            <thead
                                class="bg-slate-50/50 dark:bg-white/5 text-slate-400 font-bold uppercase text-[10px]"
                            >
                                <tr>
                                    <th class="px-6 py-4">User</th>
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
                                    class="hover:bg-slate-50 dark:hover:bg-white/5 transition"
                                >
                                    <td class="px-6 py-4">
                                        <p
                                            class="font-bold text-slate-900 dark:text-white"
                                        >
                                            {{ user.displayName }}
                                        </p>
                                        <p class="text-xs text-slate-400">
                                            {{ user.email }}
                                        </p>
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
                                            class="bg-transparent text-xs font-bold uppercase border border-slate-200 dark:border-slate-600 rounded-lg px-2 py-1"
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
                                            >
                                                <Wallet :size="16" />
                                            </button>
                                            <button
                                                @click="handleDeleteUser(user)"
                                                class="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition"
                                            >
                                                <Trash2 :size="16" />
                                            </button>
                                        </div>
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
                        class="bg-white dark:bg-slate-800 p-6 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-700 h-fit"
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
                            />
                            <button
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
                            class="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 flex items-center justify-between"
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
        </main>

        <transition name="fade">
            <div
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
            </div>
        </transition>

        <transition name="fade">
            <div
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
                        />
                        <input
                            v-model="addUserForm.name"
                            type="text"
                            class="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-black/20 border-none font-bold focus:ring-2 focus:ring-indigo-500 text-slate-700 dark:text-white"
                            placeholder="Nama Member"
                        />
                        <select
                            v-model="addUserForm.role"
                            class="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-black/20 border-none font-bold focus:ring-2 focus:ring-indigo-500 text-slate-700 dark:text-white"
                        >
                            <option value="member">Member</option>
                            <option value="admin">Admin</option>
                        </select>
                        <button
                            @click="handleAddUser"
                            class="w-full py-3.5 bg-indigo-600 text-white rounded-xl font-bold shadow-lg transition"
                        >
                            Simpan Data
                        </button>
                    </div>
                </div>
            </div>
        </transition>
    </div>
</template>
