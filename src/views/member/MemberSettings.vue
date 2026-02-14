<script setup>
import { ref, reactive, onMounted } from "vue";
import { useUserStore } from "../../stores/user";
import { useRouter } from "vue-router";
import {
    ChevronLeft,
    User,
    Lock,
    LogOut,
    Save,
    ShieldAlert,
    KeyRound,
    CheckCircle2,
    ShieldCheck,
    RefreshCw,
} from "lucide-vue-next";

const userStore = useUserStore();
const router = useRouter();

// State Forms
const nameForm = ref(
    userStore.memberData?.displayName || userStore.user?.displayName || "",
);
const passForm = reactive({ old: "", new: "", confirm: "", captchaInput: "" });
const isSaving = ref(false);

// Captcha State
const captcha = reactive({ num1: 0, num2: 0, answer: 0 });

// Alert State (iOS Style)
const alertState = reactive({
    isOpen: false,
    title: "",
    message: "",
    type: "alert",
    onConfirm: null,
});

// Generate Captcha Baru
const generateCaptcha = () => {
    captcha.num1 = Math.floor(Math.random() * 10) + 1; // 1-10
    captcha.num2 = Math.floor(Math.random() * 10) + 1;
    captcha.answer = captcha.num1 + captcha.num2;
    passForm.captchaInput = ""; // Reset input
};

onMounted(() => {
    generateCaptcha();
});

// Helper Alert
const showAlert = (title, message) => {
    alertState.title = title;
    alertState.message = message;
    alertState.type = "alert";
    alertState.isOpen = true;
    alertState.onConfirm = () => {
        alertState.isOpen = false;
    };
};

const showConfirm = (title, message, action) => {
    alertState.title = title;
    alertState.message = message;
    alertState.type = "confirm";
    alertState.isOpen = true;
    alertState.onConfirm = async () => {
        alertState.isOpen = false;
        await action();
    };
};

// Actions
const handleUpdateProfile = async () => {
    if (!nameForm.value.trim())
        return showAlert("Error", "Nama tidak boleh kosong!");
    isSaving.value = true;
    const success = await userStore.updateUserName(nameForm.value);
    isSaving.value = false;
    if (success) showAlert("Sukses", "Nama berhasil diubah! ✨");
};

const handleChangePassword = async () => {
    // Validasi Input
    if (!passForm.old) return showAlert("Error", "Masukkan password lama.");
    if (!passForm.new || passForm.new.length < 6)
        return showAlert("Error", "Password baru minimal 6 karakter!");
    if (passForm.new !== passForm.confirm)
        return showAlert("Error", "Konfirmasi password tidak cocok!");

    // Validasi Captcha
    if (parseInt(passForm.captchaInput) !== captcha.answer) {
        generateCaptcha(); // Ganti soal biar aman
        return showAlert("Robot Check Gagal", "Hitungan salah! Coba lagi ya.");
    }

    showConfirm(
        "Ganti Password",
        "Anda harus login ulang setelah ini.",
        async () => {
            isSaving.value = true;
            // Panggil store dengan password lama & baru
            const res = await userStore.changePassword(
                passForm.old,
                passForm.new,
            );
            isSaving.value = false;

            if (res.success) {
                showAlert(
                    "Berhasil",
                    "Password diubah. Silakan login kembali.",
                );
                setTimeout(async () => {
                    await userStore.logout();
                    router.push("/");
                }, 2000);
            } else {
                generateCaptcha();
                showAlert("Gagal", res.message);
            }
        },
    );
};

const handleLogout = async () => {
    showConfirm("Keluar", "Yakin mau keluar?", async () => {
        await userStore.logout();
        router.push("/");
    });
};
</script>

<template>
    <div
        class="min-h-screen bg-cream dark:bg-charcoal pt-24 pb-20 px-4 md:px-6 transition-colors duration-300"
    >
        <div class="max-w-md mx-auto space-y-6">
            <div class="flex items-center gap-4">
                <button
                    @click="router.back()"
                    class="p-2 bg-white dark:bg-[#1C1C1E] rounded-full shadow-sm text-slate-400 hover:text-indigo-500 transition"
                >
                    <ChevronLeft :size="20" />
                </button>
                <h1 class="text-2xl font-black text-slate-900 dark:text-white">
                    Pengaturan Akun
                </h1>
            </div>

            <div
                class="bg-white dark:bg-[#1C1C1E] rounded-[24px] p-6 shadow-sm border border-slate-100 dark:border-white/5"
            >
                <div class="flex items-center gap-3 mb-6">
                    <div
                        class="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400"
                    >
                        <User :size="20" />
                    </div>
                    <div>
                        <h2
                            class="font-bold text-slate-900 dark:text-white text-sm"
                        >
                            Profil Kamu
                        </h2>
                        <p class="text-xs text-slate-400">
                            Atur informasi publik
                        </p>
                    </div>
                </div>

                <div class="space-y-4">
                    <div>
                        <label
                            class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block"
                            >Email</label
                        >
                        <div
                            class="w-full px-4 py-3 bg-slate-50 dark:bg-black/30 rounded-xl text-slate-500 text-sm font-bold border border-transparent flex items-center gap-2"
                        >
                            <ShieldCheck :size="14" />
                            {{ userStore.user?.email }}
                        </div>
                    </div>
                    <div>
                        <label
                            class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block"
                            >Nama Panggilan</label
                        >
                        <input
                            v-model="nameForm"
                            type="text"
                            class="w-full px-4 py-3 bg-slate-50 dark:bg-black/30 border-none rounded-xl text-slate-800 dark:text-white font-bold focus:ring-2 focus:ring-indigo-500 transition"
                        />
                    </div>
                    <button
                        @click="handleUpdateProfile"
                        :disabled="isSaving"
                        class="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 dark:shadow-none transition flex items-center justify-center gap-2 disabled:opacity-50 btn-bouncy"
                    >
                        <Save :size="18" /> Simpan Profil
                    </button>
                </div>
            </div>

            <div
                class="bg-white dark:bg-[#1C1C1E] rounded-[24px] p-6 shadow-sm border border-slate-100 dark:border-white/5 relative overflow-hidden"
            >
                <div class="flex items-center gap-3 mb-6 relative z-10">
                    <div
                        class="w-10 h-10 rounded-full bg-rose-50 dark:bg-rose-500/20 flex items-center justify-center text-rose-500"
                    >
                        <Lock :size="20" />
                    </div>
                    <div>
                        <h2
                            class="font-bold text-slate-900 dark:text-white text-sm"
                        >
                            Keamanan
                        </h2>
                        <p class="text-xs text-slate-400">
                            Ganti password secara berkala
                        </p>
                    </div>
                </div>

                <div
                    class="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-100 dark:border-amber-800/50 mb-5 flex gap-3 items-start relative z-10"
                >
                    <ShieldAlert
                        :size="18"
                        class="text-amber-500 shrink-0 mt-0.5"
                    />
                    <p
                        class="text-[11px] text-amber-800 dark:text-amber-200/80 leading-relaxed font-medium"
                    >
                        Demi keamanan, Anda wajib memasukkan password lama dan
                        memverifikasi bahwa Anda bukan robot.
                    </p>
                </div>

                <div class="space-y-3 relative z-10">
                    <div>
                        <label
                            class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block"
                            >Password Lama</label
                        >
                        <div class="relative">
                            <KeyRound
                                :size="16"
                                class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                            />
                            <input
                                v-model="passForm.old"
                                type="password"
                                placeholder="Masukan password saat ini"
                                class="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-black/30 border-none rounded-xl text-slate-800 dark:text-white font-medium focus:ring-2 focus:ring-rose-500 transition placeholder-slate-400 text-sm"
                            />
                        </div>
                    </div>

                    <div>
                        <label
                            class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block"
                            >Password Baru</label
                        >
                        <div class="relative">
                            <Lock
                                :size="16"
                                class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                            />
                            <input
                                v-model="passForm.new"
                                type="password"
                                placeholder="Minimal 6 karakter"
                                class="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-black/30 border-none rounded-xl text-slate-800 dark:text-white font-medium focus:ring-2 focus:ring-rose-500 transition placeholder-slate-400 text-sm"
                            />
                        </div>
                    </div>

                    <div>
                        <div class="relative">
                            <CheckCircle2
                                :size="16"
                                class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                            />
                            <input
                                v-model="passForm.confirm"
                                type="password"
                                placeholder="Ulangi password baru"
                                class="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-black/30 border-none rounded-xl text-slate-800 dark:text-white font-medium focus:ring-2 focus:ring-rose-500 transition placeholder-slate-400 text-sm"
                            />
                        </div>
                    </div>

                    <div class="pt-2">
                        <label
                            class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block"
                            >Verifikasi Robot</label
                        >
                        <div class="flex gap-2">
                            <div
                                class="flex items-center justify-center px-4 bg-slate-200 dark:bg-slate-700 rounded-xl font-mono font-bold text-slate-600 dark:text-slate-300 select-none"
                            >
                                {{ captcha.num1 }} + {{ captcha.num2 }} = ?
                            </div>
                            <input
                                v-model="passForm.captchaInput"
                                type="number"
                                placeholder="Jawaban"
                                class="flex-1 px-4 py-3 bg-slate-50 dark:bg-black/30 border-none rounded-xl text-slate-800 dark:text-white font-bold focus:ring-2 focus:ring-indigo-500 transition text-center"
                            />
                            <button
                                @click="generateCaptcha"
                                class="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-400 hover:text-indigo-500 transition"
                                title="Ganti Soal"
                            >
                                <RefreshCw :size="18" />
                            </button>
                        </div>
                    </div>

                    <button
                        @click="handleChangePassword"
                        :disabled="isSaving"
                        class="w-full py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-bold shadow-lg shadow-rose-200 dark:shadow-none transition flex items-center justify-center gap-2 disabled:opacity-50 btn-bouncy mt-4"
                    >
                        Ganti Password
                    </button>
                </div>
            </div>

            <button
                @click="handleLogout"
                class="w-full py-4 text-slate-400 hover:text-rose-500 font-bold bg-white dark:bg-[#1C1C1E] rounded-2xl border border-slate-100 dark:border-white/5 transition flex items-center justify-center gap-2 btn-bouncy"
            >
                <LogOut :size="18" /> Keluar dari Aplikasi
            </button>
        </div>

        <Teleport to="body">
            <transition name="fade">
                <div
                    v-if="alertState.isOpen"
                    class="fixed inset-0 z-[9999] flex items-center justify-center p-4"
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
                                class="text-[13px] text-slate-500 dark:text-slate-400 leading-relaxed"
                            >
                                {{ alertState.message }}
                            </p>
                        </div>
                        <div
                            class="flex border-t border-slate-200/50 dark:border-white/10 divide-x divide-slate-200/50 dark:divide-white/10"
                        >
                            <button
                                v-if="alertState.type === 'confirm'"
                                @click="alertState.isOpen = false"
                                class="flex-1 py-3.5 text-[17px] font-normal text-blue-500 hover:bg-slate-50 dark:hover:bg-white/5 transition active:opacity-70"
                            >
                                Batal
                            </button>
                            <button
                                @click="alertState.onConfirm"
                                class="flex-1 py-3.5 text-[17px] font-bold text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition active:opacity-70"
                            >
                                OK
                            </button>
                        </div>
                    </div>
                </div>
            </transition>
        </Teleport>
    </div>
</template>

<style scoped>
.btn-bouncy:active {
    transform: scale(0.95);
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
