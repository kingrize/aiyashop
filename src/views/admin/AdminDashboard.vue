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

// ... (Bagian script lainnya sama seperti sebelumnya) ...
const userStore = useUserStore();
const promoStore = usePromoStore();
const router = useRouter();

// ... State & Computed ...
const activeTab = ref("dashboard");
const searchQuery = ref("");
const showTopUpModal = ref(false);
const showAddUserModal = ref(false);
const selectedUser = ref(null);
const topUpAmount = ref("");
const promoForm = reactive({ code: "", value: "", type: "percent" });
const addUserForm = reactive({ name: "", email: "", role: "member", saldo: 0 });

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
    if (success) showTopUpModal.value = false;
};

// FITUR HAPUS USER
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
    const success = await userStore.adminCreateMemberData(
        addUserForm.email,
        addUserForm.name,
        addUserForm.role,
        addUserForm.saldo,
    );
    if (success) {
        showAddUserModal.value = false;
        addUserForm.name = "";
        addUserForm.email = "";
        addUserForm.saldo = 0;
        alert("Member berhasil dibuat!");
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
        class="min-h-screen bg-cream dark:bg-charcoal flex font-sans text-slate-600 dark:text-slate-300 transition-colors duration-300"
    >
        <aside class="w-20 lg:w-64 fixed h-full z-30 p-4">
            <div
                class="bg-white/80 dark:bg-graphite/80 backdrop-blur-xl border border-white/50 dark:border-white/5 shadow-xl rounded-3xl h-full flex flex-col"
            >
                <div
                    class="p-6 flex items-center justify-center lg:justify-start gap-3"
                >
                    <div
                        class="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-lg"
                    >
                        A
                    </div>
                    <div class="hidden lg:block leading-tight">
                        <span
                            class="text-lg font-bold tracking-tight text-slate-800 dark:text-slate-100"
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
                        class="w-full flex items-center gap-3 px-3 py-3.5 rounded-xl font-bold transition-all duration-300 group relative overflow-hidden"
                        :class="
                            activeTab === 'dashboard'
                                ? 'bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300'
                                : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-600'
                        "
                    >
                        <LayoutGrid :size="22" />
                        <span class="hidden lg:block">Overview</span>
                    </button>
                    <button
                        @click="activeTab = 'users'"
                        class="w-full flex items-center gap-3 px-3 py-3.5 rounded-xl font-bold transition-all duration-300 group"
                        :class="
                            activeTab === 'users'
                                ? 'bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300'
                                : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-600'
                        "
                    >
                        <Users :size="22" />
                        <span class="hidden lg:block">Members</span>
                    </button>
                    <button
                        @click="activeTab = 'promos'"
                        class="w-full flex items-center gap-3 px-3 py-3.5 rounded-xl font-bold transition-all duration-300 group"
                        :class="
                            activeTab === 'promos'
                                ? 'bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300'
                                : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-600'
                        "
                    >
                        <Tag :size="22" />
                        <span class="hidden lg:block">Promos</span>
                    </button>
                </nav>
                <div
                    class="p-3 space-y-2 border-t border-slate-100 dark:border-white/5 pt-4"
                >
                    <button
                        @click="router.push('/')"
                        class="w-full flex items-center gap-3 px-3 py-3 text-slate-400 hover:text-sky-500 transition rounded-xl font-bold"
                    >
                        <ArrowLeft :size="20" />
                        <span class="hidden lg:block text-sm">Ke Toko</span>
                    </button>
                    <button
                        @click="handleLogout"
                        class="w-full flex items-center gap-3 px-3 py-3 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition rounded-xl font-bold"
                    >
                        <LogOut :size="20" />
                        <span class="hidden lg:block text-sm">Logout</span>
                    </button>
                </div>
            </div>
        </aside>

        <main
            class="flex-1 ml-20 lg:ml-64 p-6 lg:p-8 transition-all duration-300"
        >
            <header class="mb-8 flex justify-between items-end">
                <div>
                    <h2
                        class="text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tight mb-1"
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
                        Welcome back, Chief! ☕
                    </p>
                </div>
                <div v-if="activeTab === 'users'">
                    <button
                        @click="showAddUserModal = true"
                        class="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 dark:shadow-none transition btn-bouncy"
                    >
                        <UserPlus :size="18" /> Add Member
                    </button>
                </div>
            </header>

            <div
                v-if="activeTab === 'dashboard'"
                class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500"
            >
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div
                        class="card-soft p-6 bg-white/60 dark:bg-graphite/60 border border-white/50 dark:border-white/5 group hover:scale-[1.02] transition-transform"
                    >
                        <div class="flex justify-between items-start mb-4">
                            <div
                                class="p-3 bg-indigo-100 dark:bg-indigo-500/20 rounded-2xl text-indigo-600 dark:text-indigo-400"
                            >
                                <Users :size="24" />
                            </div>
                            <span
                                class="text-[10px] font-bold bg-slate-100 dark:bg-white/10 px-2 py-1 rounded-lg text-slate-500 uppercase tracking-wider"
                                >Total</span
                            >
                        </div>
                        <p
                            class="text-4xl font-black text-slate-800 dark:text-slate-100 tracking-tight"
                        >
                            {{ stats?.totalUser || 0 }}
                        </p>
                        <p
                            class="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest"
                        >
                            Members
                        </p>
                    </div>
                    <div
                        class="card-soft p-6 bg-white/60 dark:bg-graphite/60 border border-white/50 dark:border-white/5 group hover:scale-[1.02] transition-transform"
                    >
                        <div class="flex justify-between items-start mb-4">
                            <div
                                class="p-3 bg-emerald-100 dark:bg-emerald-500/20 rounded-2xl text-emerald-600 dark:text-emerald-400"
                            >
                                <Wallet :size="24" />
                            </div>
                        </div>
                        <p
                            class="text-3xl lg:text-4xl font-black text-slate-800 dark:text-slate-100 tracking-tight truncate"
                        >
                            {{ formatRupiah(stats?.totalSaldoActive || 0) }}
                        </p>
                        <p
                            class="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest"
                        >
                            Saldo Mengendap
                        </p>
                    </div>
                    <div
                        class="card-soft p-6 bg-white/60 dark:bg-graphite/60 border border-white/50 dark:border-white/5 group hover:scale-[1.02] transition-transform"
                    >
                        <div class="flex justify-between items-start mb-4">
                            <div
                                class="p-3 bg-amber-100 dark:bg-amber-500/20 rounded-2xl text-amber-600 dark:text-amber-400"
                            >
                                <TrendingUp :size="24" />
                            </div>
                        </div>
                        <p
                            class="text-3xl lg:text-4xl font-black text-slate-800 dark:text-slate-100 tracking-tight truncate"
                        >
                            {{ formatRupiah(stats?.totalRevenue || 0) }}
                        </p>
                        <p
                            class="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest"
                        >
                            Total Revenue
                        </p>
                    </div>
                </div>
            </div>

            <div
                v-else-if="activeTab === 'users'"
                class="animate-in fade-in slide-in-from-bottom-4 duration-500"
            >
                <div
                    class="bg-white/80 dark:bg-graphite/80 backdrop-blur-md rounded-[2rem] shadow-sm border border-white/50 dark:border-white/5 overflow-hidden"
                >
                    <div
                        class="p-4 border-b border-slate-100 dark:border-white/5"
                    >
                        <div class="relative max-w-md">
                            <Search
                                class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                                :size="18"
                            />
                            <input
                                v-model="searchQuery"
                                type="text"
                                placeholder="Cari member..."
                                class="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-black/20 border-none text-sm font-bold focus:ring-2 focus:ring-indigo-500 transition placeholder-slate-400"
                            />
                        </div>
                    </div>
                    <div class="overflow-x-auto">
                        <table class="w-full text-left text-sm">
                            <thead
                                class="bg-slate-50/50 dark:bg-white/5 text-slate-400 font-bold uppercase text-[10px] tracking-wider"
                            >
                                <tr>
                                    <th class="px-6 py-4">User Identity</th>
                                    <th class="px-6 py-4">Role</th>
                                    <th class="px-6 py-4">Saldo</th>
                                    <th class="px-6 py-4">Total TopUp</th>
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
                                    class="hover:bg-indigo-50/30 dark:hover:bg-white/5 transition group"
                                >
                                    <td class="px-6 py-4">
                                        <div class="flex items-center gap-3">
                                            <div
                                                class="w-10 h-10 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 flex items-center justify-center font-bold text-slate-500 dark:text-slate-300 uppercase"
                                            >
                                                {{
                                                    user.displayName?.[0] || "?"
                                                }}
                                            </div>
                                            <div>
                                                <p
                                                    class="font-bold text-slate-800 dark:text-slate-200"
                                                >
                                                    {{
                                                        user.displayName ||
                                                        "Unnamed"
                                                    }}
                                                </p>
                                                <p
                                                    class="text-xs text-slate-400 font-medium"
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
                                            class="bg-transparent text-xs font-bold uppercase border border-slate-200 dark:border-slate-600 rounded-lg px-2 py-1 cursor-pointer hover:border-indigo-500 transition focus:outline-none"
                                            :class="
                                                user.role === 'admin'
                                                    ? 'text-rose-500'
                                                    : 'text-slate-500'
                                            "
                                        >
                                            <option value="member">
                                                Member
                                            </option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    </td>
                                    <td
                                        class="px-6 py-4 font-bold text-emerald-600"
                                    >
                                        {{ formatRupiah(user.saldo) }}
                                    </td>
                                    <td
                                        class="px-6 py-4 text-slate-400 font-medium"
                                    >
                                        {{ formatRupiah(user.totalTopUp) }}
                                    </td>
                                    <td class="px-6 py-4 text-right">
                                        <div
                                            class="flex items-center justify-end gap-2"
                                        >
                                            <button
                                                @click="openTopUpModal(user)"
                                                class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 font-bold text-xs hover:bg-indigo-100 hover:text-indigo-600 dark:hover:bg-white/20 transition"
                                            >
                                                <Wallet :size="14" /> Top Up
                                            </button>
                                            <button
                                                @click="handleDeleteUser(user)"
                                                class="p-1.5 rounded-lg text-slate-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition"
                                            >
                                                <Trash2 :size="16" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <div
                v-else-if="activeTab === 'promos'"
                class="animate-in fade-in slide-in-from-bottom-4 duration-500"
            >
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div
                        class="card-soft p-6 bg-white/80 dark:bg-graphite/80 h-fit"
                    >
                        <h3
                            class="text-lg font-bold text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2"
                        >
                            <Plus :size="20" class="text-indigo-500" /> Buat
                            Promo
                        </h3>
                        <div class="space-y-4">
                            <div>
                                <label
                                    class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block"
                                    >Kode Promo</label
                                ><input
                                    v-model="promoForm.code"
                                    type="text"
                                    placeholder="CTH: MOTH25"
                                    class="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-black/30 border-none font-bold uppercase tracking-wider focus:ring-2 focus:ring-indigo-500 transition text-slate-700 dark:text-slate-200"
                                />
                            </div>
                            <div>
                                <label
                                    class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block"
                                    >Tipe Diskon</label
                                >
                                <div
                                    class="flex p-1 bg-slate-50 dark:bg-black/30 rounded-xl"
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
                                        Persen (%)</button
                                    ><button
                                        @click="promoForm.type = 'fixed'"
                                        class="flex-1 py-2 rounded-lg text-xs font-bold transition-all"
                                        :class="
                                            promoForm.type === 'fixed'
                                                ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-white'
                                                : 'text-slate-400'
                                        "
                                    >
                                        Nominal (Rp)
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label
                                    class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block"
                                    >Nilai</label
                                ><input
                                    v-model="promoForm.value"
                                    type="number"
                                    placeholder="0"
                                    class="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-black/30 border-none font-bold text-lg focus:ring-2 focus:ring-indigo-500 transition text-slate-700 dark:text-slate-200"
                                />
                            </div>
                            <button
                                @click="handleCreatePromo"
                                class="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 dark:shadow-none transition btn-bouncy"
                            >
                                Simpan Promo
                            </button>
                        </div>
                    </div>
                    <div class="lg:col-span-2 space-y-3">
                        <div
                            v-for="promo in promoStore.allPromos"
                            :key="promo.code"
                            class="bg-white/80 dark:bg-graphite/80 p-4 rounded-2xl border border-white/50 dark:border-white/5 flex items-center justify-between group hover:border-indigo-200 dark:hover:border-indigo-500/30 transition"
                        >
                            <div class="flex items-center gap-4">
                                <div
                                    class="w-12 h-12 rounded-xl flex items-center justify-center font-black text-white shadow-sm"
                                    :class="
                                        promo.type === 'percent'
                                            ? 'bg-amber-400'
                                            : 'bg-emerald-500'
                                    "
                                >
                                    <TicketPercent
                                        v-if="promo.type === 'percent'"
                                        :size="20"
                                    /><span v-else class="text-xs">Rp</span>
                                </div>
                                <div>
                                    <h4
                                        class="text-lg font-black text-slate-800 dark:text-slate-100 tracking-wide"
                                    >
                                        {{ promo.code }}
                                    </h4>
                                    <p class="text-xs font-bold text-slate-400">
                                        Diskon
                                        {{ promoStore.formatDiscount(promo) }}
                                        <span
                                            class="ml-2 px-2 py-0.5 rounded bg-green-100 text-green-700 text-[10px]"
                                            v-if="promo.isActive"
                                            >ACTIVE</span
                                        >
                                    </p>
                                </div>
                            </div>
                            <button
                                @click="handleDeletePromo(promo.code)"
                                class="p-3 text-slate-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition"
                            >
                                <Trash2 :size="20" />
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
                    class="bg-white dark:bg-charcoal w-full max-w-sm rounded-[2rem] shadow-2xl relative z-10 p-6 animate-in zoom-in-95 border border-white/50 dark:border-white/10"
                >
                    <h3
                        class="text-xl font-black text-center mb-6 text-slate-800 dark:text-white"
                    >
                        Top Up Manual
                    </h3>
                    <div
                        class="bg-slate-50 dark:bg-white/5 p-4 rounded-2xl mb-6 text-center border border-slate-100 dark:border-white/5"
                    >
                        <p
                            class="text-xl font-bold text-indigo-600 dark:text-indigo-400 mb-1"
                        >
                            {{ selectedUser?.displayName }}
                        </p>
                        <p class="text-xs text-slate-400 font-medium">
                            {{ selectedUser?.email }}
                        </p>
                    </div>
                    <label
                        class="block text-[10px] font-bold mb-2 text-slate-400 uppercase tracking-wider"
                        >Nominal (Rupiah)</label
                    >
                    <input
                        v-model="topUpAmount"
                        type="number"
                        class="w-full px-4 py-4 rounded-2xl bg-slate-50 dark:bg-black/20 border-none font-black text-2xl text-center focus:ring-2 focus:ring-indigo-500 transition text-slate-800 dark:text-white mb-6"
                        placeholder="0"
                    />
                    <div class="flex gap-2">
                        <button
                            @click="showTopUpModal = false"
                            class="flex-1 py-3 text-sm font-bold text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl transition"
                        >
                            Batal</button
                        ><button
                            @click="processTopUp"
                            class="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 dark:shadow-none btn-bouncy"
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
                    class="bg-white dark:bg-charcoal w-full max-w-sm rounded-[2rem] shadow-2xl relative z-10 p-6 animate-in zoom-in-95 border border-white/50 dark:border-white/10"
                >
                    <h3
                        class="text-xl font-black mb-6 text-slate-800 dark:text-white flex items-center gap-2"
                    >
                        <UserPlus :size="24" class="text-indigo-500" /> Tambah
                        Member
                    </h3>
                    <div class="space-y-4">
                        <div>
                            <label
                                class="text-[10px] font-bold text-slate-400 uppercase mb-1 block"
                                >Email (Wajib)</label
                            ><input
                                v-model="addUserForm.email"
                                type="email"
                                class="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-black/20 border-none font-bold focus:ring-2 focus:ring-indigo-500 transition text-slate-700 dark:text-white"
                                placeholder="user@mail.com"
                            />
                        </div>
                        <div>
                            <label
                                class="text-[10px] font-bold text-slate-400 uppercase mb-1 block"
                                >Nama</label
                            ><input
                                v-model="addUserForm.name"
                                type="text"
                                class="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-black/20 border-none font-bold focus:ring-2 focus:ring-indigo-500 transition text-slate-700 dark:text-white"
                                placeholder="Nama Member"
                            />
                        </div>
                        <div>
                            <label
                                class="text-[10px] font-bold text-slate-400 uppercase mb-1 block"
                                >Role</label
                            ><select
                                v-model="addUserForm.role"
                                class="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-black/20 border-none font-bold focus:ring-2 focus:ring-indigo-500 transition text-slate-700 dark:text-white"
                            >
                                <option value="member">Member</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>
                        <button
                            @click="handleAddUser"
                            class="w-full py-3.5 bg-indigo-600 text-white rounded-xl font-bold shadow-lg hover:bg-indigo-700 transition btn-bouncy mt-4"
                        >
                            Simpan Data
                        </button>
                    </div>
                </div>
            </div>
        </transition>
    </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>
