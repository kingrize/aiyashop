<script setup>
import { ref, reactive } from "vue";
import { useUserStore } from "../../stores/user";
import { useRouter } from "vue-router";
import {
    ChevronLeft,
    User,
    Lock,
    LogOut,
    Check,
    Save,
    ShieldAlert,
} from "lucide-vue-next";

const userStore = useUserStore();
const router = useRouter();

// State Forms
const nameForm = ref(
    userStore.memberData?.displayName || userStore.user?.displayName || "",
);
const passForm = reactive({ new: "", confirm: "" });
const isSaving = ref(false);

const handleUpdateProfile = async () => {
    if (!nameForm.value.trim()) return alert("Nama tidak boleh kosong!");
    isSaving.value = true;
    const success = await userStore.updateUserName(nameForm.value);
    isSaving.value = false;
    if (success) alert("Nama berhasil diubah! ✨");
};

const handleChangePassword = async () => {
    if (!passForm.new || passForm.new.length < 6)
        return alert("Password minimal 6 karakter!");
    if (passForm.new !== passForm.confirm)
        return alert("Konfirmasi password tidak cocok!");

    isSaving.value = true;
    const res = await userStore.changePassword(passForm.new);
    isSaving.value = false;

    if (res.success) {
        alert("Password berhasil diubah! Silakan login ulang.");
        await userStore.logout();
        router.push("/");
    } else {
        alert("Gagal: " + res.message);
    }
};

const handleLogout = async () => {
    if (!confirm("Yakin mau keluar?")) return;
    await userStore.logout();
    router.push("/");
};
</script>

<template>
    <div
        class="min-h-screen bg-slate-50 dark:bg-charcoal pt-24 pb-20 px-4 md:px-6 transition-colors duration-300"
    >
        <div class="max-w-md mx-auto">
            <button
                @click="router.back()"
                class="flex items-center gap-2 text-slate-400 hover:text-sky-500 mb-6 font-bold text-sm transition"
            >
                <ChevronLeft :size="18" /> Kembali
            </button>
            <h1
                class="text-3xl font-black text-slate-800 dark:text-slate-100 mb-8"
            >
                Pengaturan Akun
            </h1>

            <div
                class="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 mb-6"
            >
                <div class="flex items-center gap-2 mb-4 text-indigo-500">
                    <User :size="20" />
                    <h2 class="font-bold text-sm uppercase tracking-wider">
                        Profil Kamu
                    </h2>
                </div>

                <div class="space-y-4">
                    <div>
                        <label
                            class="block text-xs font-bold text-slate-400 mb-1"
                            >Email (Tidak bisa diubah)</label
                        >
                        <input
                            type="text"
                            :value="userStore.user?.email"
                            disabled
                            class="w-full px-4 py-3 bg-slate-100 dark:bg-slate-900/50 rounded-xl text-slate-500 text-sm font-medium border-none cursor-not-allowed"
                        />
                    </div>
                    <div>
                        <label
                            class="block text-xs font-bold text-slate-400 mb-1"
                            >Nama Panggilan</label
                        >
                        <input
                            v-model="nameForm"
                            type="text"
                            class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                        />
                    </div>
                    <button
                        @click="handleUpdateProfile"
                        :disabled="isSaving"
                        class="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 dark:shadow-none transition flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        <Save :size="18" /> Simpan Profil
                    </button>
                </div>
            </div>

            <div
                class="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 mb-6 relative overflow-hidden"
            >
                <div
                    class="absolute -right-6 -top-6 w-24 h-24 bg-rose-50 dark:bg-rose-900/20 rounded-full blur-2xl"
                ></div>

                <div
                    class="flex items-center gap-2 mb-4 text-rose-500 relative z-10"
                >
                    <Lock :size="20" />
                    <h2 class="font-bold text-sm uppercase tracking-wider">
                        Keamanan
                    </h2>
                </div>

                <div
                    class="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-100 dark:border-amber-800 mb-4 flex gap-3 items-start"
                >
                    <ShieldAlert
                        :size="18"
                        class="text-amber-500 shrink-0 mt-0.5"
                    />
                    <p
                        class="text-xs text-amber-700 dark:text-amber-400 leading-relaxed"
                    >
                        Jika kamu login menggunakan password default dari admin,
                        <b>WAJIB</b> ganti password sekarang demi keamanan
                        akunmu.
                    </p>
                </div>

                <div class="space-y-3 relative z-10">
                    <input
                        v-model="passForm.new"
                        type="password"
                        placeholder="Password Baru (Min. 6)"
                        class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-rose-500 transition"
                    />
                    <input
                        v-model="passForm.confirm"
                        type="password"
                        placeholder="Ulangi Password Baru"
                        class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-rose-500 transition"
                    />

                    <button
                        @click="handleChangePassword"
                        :disabled="isSaving"
                        class="w-full py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-bold shadow-lg shadow-rose-200 dark:shadow-none transition flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        <Check :size="18" /> Ganti Password
                    </button>
                </div>
            </div>

            <button
                @click="handleLogout"
                class="w-full py-4 text-rose-500 font-bold hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-2xl transition flex items-center justify-center gap-2"
            >
                <LogOut :size="20" /> Keluar dari Aplikasi
            </button>
        </div>
    </div>
</template>
