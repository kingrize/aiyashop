<script setup>
import { ref, computed, watch, reactive } from "vue";
import { useCartStore } from "../stores/cart";
import { usePromoStore } from "../stores/promo";
import { useUserStore } from "../stores/user";
import {
    ShoppingBag,
    X,
    Trash2,
    Wind,
    MessageCircle,
    Star,
    Heart,
    Flame,
    Cloud,
    Sparkles,
    Tag,
    Loader2,
    XCircle,
    Moon,
    Info,
    QrCode,
    UserCheck,
    Wallet,
    CheckCircle2,
    AlertCircle,
    Check,
} from "lucide-vue-next";
import { doc, updateDoc, increment } from "firebase/firestore";
import { db } from "../firebase";

const store = useCartStore();
const promoStore = usePromoStore();
const userStore = useUserStore();

const promoInput = ref("");
const promoMessage = ref("");
const selectedPayment = ref("qris");

// State Modal & Loading
const showConfirmModal = ref(false);
const showSuccessModal = ref(false);
const isProcessingPayment = ref(false);
const countdown = ref(3);

// State Form Auth Mini
const isRegisterMode = ref(false);
const authForm = reactive({ name: "", username: "", password: "" });
const isAuthLoading = ref(false);

watch(
    () => userStore.user,
    (newUser) => {
        if (newUser && userStore.memberData?.saldo >= store.totalPrice) {
            selectedPayment.value = "member";
        }
    },
);

const getIcon = (type) => {
    const icons = { Wind, Star, Heart, Flame, Cloud, Sparkles, Moon };
    return icons[type] || Sparkles;
};

const formatRupiah = (num) =>
    new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
    }).format(num);

const MIN_ORDER_FOR_PROMO = 10000;
const amountNeededForPromo = computed(() =>
    Math.max(0, MIN_ORDER_FOR_PROMO - store.totalPrice),
);
const isPromoEligible = computed(() => store.totalPrice >= MIN_ORDER_FOR_PROMO);

const handleApplyPromo = async () => {
    if (!promoInput.value) return;
    const result = await promoStore.applyPromo(promoInput.value);
    promoMessage.value = result.message;
    setTimeout(() => (promoMessage.value = ""), 3000);
};

const handleAuthSubmit = async () => {
    isAuthLoading.value = true;
    if (isRegisterMode.value) {
        if (!authForm.name || !authForm.username || !authForm.password) {
            alert("Isi semua data dulu ya!");
            isAuthLoading.value = false;
            return;
        }
        await userStore.register(
            authForm.name,
            authForm.username + "@aiyashop.com",
            authForm.password,
        );
    } else {
        if (!authForm.username || !authForm.password) {
            alert("Username & Password wajib diisi!");
            isAuthLoading.value = false;
            return;
        }
        await userStore.login(authForm.username, authForm.password);
    }
    isAuthLoading.value = false;
};

const handleCheckoutClick = () => {
    if (store.items.length === 0) return;

    if (selectedPayment.value === "member") {
        if (!userStore.user) {
            alert("Silakan login dulu ya kak! 😊");
            return;
        }

        const finalTotal =
            promoStore.activeCode && isPromoEligible.value
                ? promoStore.calculateTotal(store.totalPrice)
                : store.totalPrice;

        if (userStore.memberData?.saldo < finalTotal) {
            alert("Yah, saldo member kakak kurang nih 🥺 Topup dulu yuk!");
            return;
        }

        showConfirmModal.value = true;
    } else {
        processCheckout("Menunggu Pembayaran (QRIS)");
    }
};

const confirmMemberPayment = async () => {
    isProcessingPayment.value = true;
    const finalTotal =
        promoStore.activeCode && isPromoEligible.value
            ? promoStore.calculateTotal(store.totalPrice)
            : store.totalPrice;

    try {
        const userRef = doc(db, "users", userStore.user.uid);
        await updateDoc(userRef, {
            saldo: increment(-finalTotal),
            totalTopUp: increment(0),
        });
        await userStore.fetchMemberData();

        showConfirmModal.value = false;
        showSuccessModal.value = true;
        countdown.value = 3;

        const timer = setInterval(() => {
            countdown.value--;
            if (countdown.value <= 0) {
                clearInterval(timer);
                processCheckout("LUNAS (Saldo Member)");
                setTimeout(() => {
                    showSuccessModal.value = false;
                    store.items = [];
                    promoStore.resetPromo();
                    store.toggleCart();
                }, 1000);
            }
        }, 1000);
    } catch (error) {
        console.error("Error potong saldo:", error);
        alert("Gagal memproses pembayaran. Coba lagi ya!");
    } finally {
        isProcessingPayment.value = false;
    }
};

const processCheckout = (statusBayar) => {
    let message = "Halo Admin Aiya! ✨ Saya mau order dong:%0A%0A";

    store.items.forEach((item, index) => {
        message += `${index + 1}. ${item.name} (${item.qty}x) - ${formatRupiah(item.price * item.qty)}%0A`;
        if (item.desc) message += `   _${item.desc}_\n`;
    });

    if (userStore.user) {
        message += `%0A👤 User: ${userStore.user.displayName}`;
        message += `%0A📧 Email: ${userStore.user.email}`;
    }

    if (promoStore.activeCode && isPromoEligible.value) {
        message += `%0A🎟️ Kode Promo: ${promoStore.activeCode}`;
        message += `%0ADiskon: -${formatRupiah(promoStore.savings(store.totalPrice))}`;
    }

    const finalTotal =
        promoStore.activeCode && isPromoEligible.value
            ? promoStore.calculateTotal(store.totalPrice)
            : store.totalPrice;
    message += `%0A%0ATotal: *${formatRupiah(finalTotal)}*`;
    message += `%0AMetode Bayar: ${selectedPayment.value === "member" ? "💎 Saldo Member" : "QRIS / E-Wallet"}`;
    message += `%0AStatus: *${statusBayar}*`;

    window.open(`https://wa.me/6285942963323?text=${message}`, "_blank");
};
</script>

<template>
    <div class="cart-drawer">
        <transition name="fade">
            <div
                v-if="store.isOpen"
                class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] transition-opacity"
                @click="store.toggleCart()"
            ></div>
        </transition>

        <div
            class="fixed top-0 right-0 h-full w-full md:w-[420px] bg-[#FDFBF7] dark:bg-charcoal z-[70] shadow-2xl transform transition-transform duration-500 cubic-bezier(0.32, 0.72, 0, 1)"
            :class="store.isOpen ? 'translate-x-0' : 'translate-x-full'"
        >
            <div class="h-full flex flex-col relative overflow-hidden">
                <div
                    class="absolute top-0 right-0 w-64 h-64 bg-sky-100 dark:bg-slate-800/50 rounded-full blur-3xl -z-10 opacity-60 pointer-events-none"
                ></div>

                <div
                    class="p-6 flex justify-between items-center bg-white/50 dark:bg-charcoal/80 backdrop-blur-md border-b border-sky-100/50 dark:border-slate-800"
                >
                    <h2
                        class="text-xl font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2"
                    >
                        <ShoppingBag class="text-sky-500" /> Keranjang
                    </h2>
                    <button
                        @click="store.toggleCart()"
                        class="p-2 hover:bg-rose-50 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500 hover:text-rose-500 dark:hover:text-rose-400 rounded-full transition"
                    >
                        <X :size="24" />
                    </button>
                </div>

                <div
                    class="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar"
                >
                    <div
                        v-if="store.items.length === 0"
                        class="text-center py-20 flex flex-col items-center"
                    >
                        <div
                            class="bg-sky-50 dark:bg-slate-800 p-6 rounded-full mb-4 animate-float-slow"
                        >
                            <Wind
                                class="text-sky-300 dark:text-sky-500"
                                :size="48"
                            />
                        </div>
                        <p
                            class="text-slate-500 dark:text-slate-400 font-bold mb-2"
                        >
                            Keranjang masih kosong...
                        </p>
                        <button
                            @click="store.toggleCart()"
                            class="text-sky-500 dark:text-sky-400 font-bold hover:underline"
                        >
                            Lihat Menu
                        </button>
                    </div>

                    <div
                        v-else
                        v-for="item in store.items"
                        :key="item.id"
                        class="bg-white dark:bg-graphite p-4 rounded-3xl border border-sky-50 dark:border-slate-700 shadow-sm flex gap-4 items-start group hover:shadow-md transition relative"
                    >
                        <div
                            :class="`w-12 h-12 rounded-2xl ${item.color || 'bg-slate-100'} flex items-center justify-center text-white shrink-0 mt-1 shadow-sm`"
                        >
                            <component
                                :is="getIcon(item.iconType)"
                                :size="20"
                            />
                        </div>
                        <div class="flex-1 min-w-0 pr-8">
                            <h4
                                class="font-bold text-slate-700 dark:text-slate-200 text-sm truncate"
                            >
                                {{ item.name }}
                            </h4>
                            <p
                                class="text-[10px] text-slate-400 dark:text-slate-500 mb-2 line-clamp-2 leading-relaxed"
                            >
                                {{ item.desc }}
                            </p>
                            <div class="flex items-center justify-between">
                                <p
                                    class="text-sky-500 dark:text-sky-400 font-bold text-sm"
                                >
                                    {{ formatRupiah(item.price * item.qty) }}
                                </p>
                                <div
                                    class="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 rounded-lg p-1 border border-slate-100 dark:border-slate-700"
                                >
                                    <button
                                        @click="store.updateQty(item.id, -1)"
                                        class="w-5 h-5 flex items-center justify-center text-slate-400 hover:bg-white dark:hover:bg-slate-600 hover:text-rose-500 rounded transition"
                                    >
                                        -
                                    </button>
                                    <span
                                        class="text-xs font-bold w-4 text-center text-slate-600 dark:text-slate-300"
                                        >{{ item.qty }}</span
                                    >
                                    <button
                                        @click="store.updateQty(item.id, 1)"
                                        class="w-5 h-5 flex items-center justify-center text-slate-400 hover:bg-white dark:hover:bg-slate-600 hover:text-emerald-500 rounded transition"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>
                        </div>
                        <button
                            @click="store.removeItem(item.id)"
                            class="absolute top-3 right-3 p-1.5 text-slate-300 dark:text-slate-600 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-slate-700 dark:hover:text-rose-400 rounded-lg transition"
                            title="Hapus Item"
                        >
                            <Trash2 :size="16" />
                        </button>
                    </div>
                </div>

                <div
                    class="bg-white dark:bg-graphite border-t border-dashed border-sky-100 dark:border-slate-700 relative z-10 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]"
                >
                    <div class="px-6 pt-4 pb-2">
                        <div class="flex gap-2">
                            <div class="relative flex-1 group">
                                <div
                                    class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
                                >
                                    <Tag
                                        :size="16"
                                        class="text-slate-400 group-focus-within:text-sky-500 transition"
                                    />
                                </div>
                                <input
                                    v-model="promoInput"
                                    type="text"
                                    placeholder="Kode Promo"
                                    class="pl-9 pr-8 w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl py-2.5 text-sm focus:outline-none focus:border-sky-300 focus:ring-4 focus:ring-sky-50 dark:focus:ring-slate-700 transition uppercase font-bold text-slate-600 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500"
                                    @keyup.enter="handleApplyPromo"
                                    :disabled="!!promoStore.activeCode"
                                />
                                <button
                                    v-if="promoStore.activeCode"
                                    @click="
                                        promoStore.resetPromo();
                                        promoInput = '';
                                    "
                                    class="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-rose-500 cursor-pointer transition"
                                >
                                    <XCircle :size="16" />
                                </button>
                            </div>
                            <button
                                @click="handleApplyPromo"
                                :disabled="
                                    promoStore.isLoading ||
                                    !promoInput ||
                                    !!promoStore.activeCode
                                "
                                class="bg-slate-800 dark:bg-slate-700 text-white px-5 py-2 rounded-xl text-xs font-bold hover:bg-slate-700 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg shadow-slate-200 dark:shadow-none flex items-center justify-center min-w-[70px]"
                            >
                                <Loader2
                                    v-if="promoStore.isLoading"
                                    :size="16"
                                    class="animate-spin"
                                />
                                <span v-else>{{
                                    promoStore.activeCode ? "Aktif" : "Pakai"
                                }}</span>
                            </button>
                        </div>
                        <p
                            v-if="promoMessage"
                            class="text-[10px] mt-2 font-bold ml-1 flex items-center gap-1"
                            :class="
                                promoStore.error
                                    ? 'text-rose-500'
                                    : 'text-emerald-500'
                            "
                        >
                            <Sparkles v-if="!promoStore.error" :size="12" />
                            {{ promoMessage }}
                        </p>
                        <div
                            v-if="promoStore.activeCode && !isPromoEligible"
                            class="mt-2 flex items-start gap-2 bg-amber-50 dark:bg-amber-900/20 p-2 rounded-lg border border-amber-100 dark:border-amber-800 text-[10px] text-amber-600 dark:text-amber-400"
                        >
                            <Info :size="14" class="mt-0.5 shrink-0" /><span
                                >Kupon aktif, tapi minimal belanja
                                <b>{{ formatRupiah(MIN_ORDER_FOR_PROMO) }}</b
                                >.<br />Tambah
                                <b>{{ formatRupiah(amountNeededForPromo) }}</b>
                                lagi ya!</span
                            >
                        </div>
                    </div>

                    <div class="px-6 py-2">
                        <p
                            class="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2"
                        >
                            Pilih Pembayaran
                        </p>
                        <div
                            class="flex gap-2 overflow-x-auto pb-2 custom-scrollbar"
                        >
                            <button
                                @click="selectedPayment = 'qris'"
                                class="flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-medium transition whitespace-nowrap"
                                :class="
                                    selectedPayment === 'qris'
                                        ? 'bg-sky-50 dark:bg-sky-900/30 border-sky-300 dark:border-sky-700 text-sky-600 dark:text-sky-300 shadow-sm'
                                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                                "
                            >
                                <QrCode :size="14" /> QRIS / E-Wallet
                            </button>
                            <button
                                @click="selectedPayment = 'member'"
                                class="flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-medium transition whitespace-nowrap"
                                :class="
                                    selectedPayment === 'member'
                                        ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-300 dark:border-indigo-700 text-indigo-600 dark:text-indigo-300 shadow-sm'
                                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                                "
                            >
                                <UserCheck :size="14" /> Member
                            </button>
                        </div>

                        <transition name="fade">
                            <div
                                v-if="selectedPayment === 'member'"
                                class="mt-3 bg-indigo-50 dark:bg-indigo-950/40 p-3 rounded-xl border border-indigo-100 dark:border-indigo-900 relative overflow-hidden"
                            >
                                <div v-if="userStore.user">
                                    <div
                                        class="flex justify-between items-center mb-1"
                                    >
                                        <span
                                            class="text-xs font-bold text-indigo-700 dark:text-indigo-300"
                                            >Saldo Kamu:</span
                                        ><span
                                            class="text-sm font-extrabold text-indigo-600 dark:text-indigo-400"
                                            >{{
                                                formatRupiah(
                                                    userStore.memberData?.saldo,
                                                )
                                            }}</span
                                        >
                                    </div>
                                    <div
                                        v-if="
                                            userStore.memberData?.saldo <
                                            promoStore.calculateTotal(
                                                store.totalPrice,
                                            )
                                        "
                                        class="text-[10px] text-rose-500 font-bold flex items-center gap-1 mt-1"
                                    >
                                        <XCircle :size="12" /> Saldo kurang,
                                        topup ke admin ya!
                                    </div>
                                    <div
                                        v-else
                                        class="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1 mt-1"
                                    >
                                        <CheckCircle2 :size="12" /> Saldo cukup,
                                        siap potong!
                                    </div>
                                </div>
                                <div v-else>
                                    <p
                                        class="text-[10px] text-indigo-500 dark:text-indigo-300 mb-2 font-bold text-center"
                                    >
                                        {{
                                            isRegisterMode
                                                ? "Daftar Member Baru ✨"
                                                : "Login Member Lama 🔐"
                                        }}
                                    </p>
                                    <div class="space-y-2">
                                        <input
                                            v-if="isRegisterMode"
                                            v-model="authForm.name"
                                            type="text"
                                            placeholder="Nama Panggilan Kamu"
                                            class="w-full px-3 py-1.5 text-xs rounded-lg border border-indigo-200 dark:border-indigo-800 bg-white dark:bg-slate-950 text-slate-700 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-indigo-400"
                                        />
                                        <input
                                            v-model="authForm.username"
                                            type="text"
                                            placeholder="Username"
                                            class="w-full px-3 py-1.5 text-xs rounded-lg border border-indigo-200 dark:border-indigo-800 bg-white dark:bg-slate-950 text-slate-700 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-indigo-400"
                                        />
                                        <input
                                            v-model="authForm.password"
                                            type="password"
                                            placeholder="Password (Min. 6)"
                                            class="w-full px-3 py-1.5 text-xs rounded-lg border border-indigo-200 dark:border-indigo-800 bg-white dark:bg-slate-950 text-slate-700 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-indigo-400"
                                        />
                                    </div>
                                    <p
                                        v-if="userStore.authError"
                                        class="text-[9px] text-rose-500 mt-2 font-bold flex items-center gap-1"
                                    >
                                        <AlertCircle :size="10" />
                                        {{ userStore.authError }}
                                    </p>
                                    <div class="flex gap-2 mt-3">
                                        <button
                                            @click="handleAuthSubmit"
                                            :disabled="isAuthLoading"
                                            class="flex-1 bg-indigo-600 text-white py-1.5 rounded-lg text-xs font-bold hover:bg-indigo-700 disabled:opacity-50 flex justify-center items-center gap-1"
                                        >
                                            <Loader2
                                                v-if="isAuthLoading"
                                                :size="12"
                                                class="animate-spin"
                                            />
                                            {{
                                                isRegisterMode
                                                    ? "Daftar"
                                                    : "Masuk"
                                            }}
                                        </button>
                                        <button
                                            @click="
                                                isRegisterMode =
                                                    !isRegisterMode;
                                                userStore.authError = null;
                                            "
                                            class="px-3 py-1.5 bg-white dark:bg-slate-800 text-indigo-500 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700 rounded-lg text-xs font-bold hover:bg-indigo-50 dark:hover:bg-slate-700"
                                        >
                                            {{
                                                isRegisterMode
                                                    ? "Punya Akun?"
                                                    : "Daftar?"
                                            }}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </transition>
                    </div>

                    <div class="p-6 pt-2 space-y-3">
                        <div
                            class="flex justify-between items-center text-xs text-slate-400 dark:text-slate-500"
                        >
                            <span>Subtotal</span
                            ><span>{{ formatRupiah(store.totalPrice) }}</span>
                        </div>
                        <div
                            v-if="promoStore.activeCode && isPromoEligible"
                            class="flex justify-between items-center text-xs font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 p-2 rounded-lg border border-emerald-100 dark:border-emerald-800 animate-in slide-in-from-left-2"
                        >
                            <span class="flex items-center gap-1"
                                ><Tag :size="12" /> Hemat ({{
                                    promoStore.activeCode
                                }})</span
                            ><span
                                >-
                                {{
                                    formatRupiah(
                                        promoStore.savings(store.totalPrice),
                                    )
                                }}</span
                            >
                        </div>
                        <div
                            class="flex justify-between items-end pt-2 border-t border-slate-100 dark:border-slate-700"
                        >
                            <span
                                class="text-sm font-bold text-slate-600 dark:text-slate-300"
                                >Total Bayar</span
                            ><span
                                class="text-2xl font-extrabold text-sky-500 dark:text-sky-400"
                                >{{
                                    formatRupiah(
                                        promoStore.activeCode && isPromoEligible
                                            ? promoStore.calculateTotal(
                                                  store.totalPrice,
                                              )
                                            : store.totalPrice,
                                    )
                                }}</span
                            >
                        </div>

                        <button
                            @click="handleCheckoutClick"
                            :disabled="
                                store.items.length === 0 || isProcessingPayment
                            "
                            class="w-full btn-bouncy text-white font-bold py-4 rounded-2xl shadow-lg flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-4 hover:brightness-105"
                            :class="
                                selectedPayment === 'member'
                                    ? 'bg-gradient-to-r from-indigo-500 to-purple-500 shadow-indigo-100 dark:shadow-none'
                                    : 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-emerald-100 dark:shadow-none'
                            "
                        >
                            <Loader2
                                v-if="isProcessingPayment"
                                :size="20"
                                class="animate-spin"
                            />
                            <span
                                v-else-if="selectedPayment === 'member'"
                                class="flex items-center gap-2"
                                ><Wallet :size="20" /> Gunakan Saldo</span
                            >
                            <span v-else class="flex items-center gap-2"
                                ><MessageCircle :size="20" /> Checkout via
                                WhatsApp</span
                            >
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <transition name="fade">
            <div
                v-if="showConfirmModal"
                class="fixed inset-0 z-[80] flex items-center justify-center p-4"
            >
                <div
                    class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
                    @click="showConfirmModal = false"
                ></div>
                <div
                    class="bg-white dark:bg-graphite w-full max-w-xs rounded-[2rem] shadow-2xl relative z-10 animate-in fade-in zoom-in-95 duration-200 p-6 border-4 border-indigo-50 dark:border-indigo-900 text-center"
                >
                    <div
                        class="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl"
                    >
                        🫣
                    </div>

                    <h3
                        class="text-lg font-bold text-slate-700 dark:text-slate-200 mb-2"
                    >
                        Yakin mau jajan?
                    </h3>
                    <p
                        class="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed"
                    >
                        Saldo kakak bakal kepotong otomatis lho. <br />
                        <span class="text-rose-500 font-bold text-xs"
                            >Gabisa refund yaa~</span
                        >
                    </p>

                    <div class="flex gap-3">
                        <button
                            @click="showConfirmModal = false"
                            class="flex-1 py-2.5 rounded-xl border-2 border-slate-100 dark:border-slate-700 font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
                        >
                            Ntar Dulu
                        </button>
                        <button
                            @click="confirmMemberPayment"
                            class="flex-1 py-2.5 rounded-xl bg-indigo-500 text-white font-bold shadow-lg shadow-indigo-200 dark:shadow-none hover:bg-indigo-600 transition btn-bouncy"
                        >
                            Gass Bayar! 🚀
                        </button>
                    </div>
                </div>
            </div>
        </transition>

        <transition name="fade">
            <div
                v-if="showSuccessModal"
                class="fixed inset-0 z-[90] flex items-center justify-center p-4"
            >
                <div
                    class="absolute inset-0 bg-emerald-900/30 backdrop-blur-sm transition-opacity"
                ></div>
                <div
                    class="bg-white dark:bg-graphite w-full max-w-sm rounded-[2.5rem] shadow-2xl relative z-10 animate-in fade-in zoom-in-95 duration-300 p-8 text-center border-4 border-emerald-50 dark:border-emerald-900"
                >
                    <div
                        class="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce"
                    >
                        <Check
                            :size="40"
                            class="text-emerald-500"
                            stroke-width="3"
                        />
                    </div>

                    <h3
                        class="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mb-2"
                    >
                        Pembayaran Sukses!
                    </h3>
                    <p class="text-slate-500 dark:text-slate-400 text-sm mb-6">
                        Yeay! Saldo berhasil dipotong. <br />
                        Mengalihkan ke WhatsApp dalam
                        <span
                            class="font-bold text-emerald-600 dark:text-emerald-400"
                            >{{ countdown }}</span
                        >...
                    </p>

                    <button
                        class="w-full py-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 font-bold hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition"
                        disabled
                    >
                        Mohon tunggu sebentar... ⏳
                    </button>
                </div>
            </div>
        </transition>
    </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
.custom-scrollbar::-webkit-scrollbar {
    width: 4px;
    height: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
    background-color: #e2e8f0;
    border-radius: 20px;
}

/* Dark mode scrollbar thumb */
:global(.dark) .custom-scrollbar::-webkit-scrollbar-thumb {
    background-color: rgba(255, 255, 255, 0.1);
}

/* Remove glow / button box-shadow in dark mode inside this drawer only. */
:global(.dark) .cart-drawer button,
:global(.dark) .cart-drawer .btn-bouncy,
:global(.dark) .cart-drawer .shadow-lg,
:global(.dark) .cart-drawer .shadow-sm,
:global(.dark) .cart-drawer .shadow-indigo-200,
:global(.dark) .cart-drawer .shadow-emerald-100 {
    box-shadow: none !important;
    filter: none !important;
}

:global(.dark) .cart-drawer button:focus {
    box-shadow: none !important;
    outline: 2px solid rgba(255, 255, 255, 0.06);
    outline-offset: 2px;
}
</style>
