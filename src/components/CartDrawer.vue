aiyashop/src/components/CartDrawer.vue#L1-9999
<!-- LOKASI FILE: src/components/CartDrawer.vue -->
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
    Tag,
    Loader2,
    XCircle,
    Info,
    QrCode,
    UserCheck,
    AlertCircle,
    CheckCircle2,
} from "lucide-vue-next";
import { doc, updateDoc, increment } from "firebase/firestore";
import { db } from "../firebase";

const store = useCartStore();
const promoStore = usePromoStore();
const userStore = useUserStore();

/* UI state */
const promoInput = ref("");
const promoMessage = ref("");
const selectedPayment = ref("qris");
const showConfirmModal = ref(false);
const isProcessingPayment = ref(false);
const isRegisterMode = ref(false);
const authForm = reactive({ name: "", email: "", password: "" });
const isAuthLoading = ref(false);

/* watch user to auto-select member payment if enough saldo */
watch(
    () => userStore.user,
    (newUser) => {
        if (newUser && userStore.memberData?.saldo >= store.totalPrice) {
            selectedPayment.value = "member";
        }
    },
);

/* payment choices */
const paymentMethods = [
    { id: "qris", label: "QRIS / E-Wallet", icon: QrCode },
    { id: "member", label: "Saldo Member", icon: UserCheck },
];

const MIN_ORDER_FOR_PROMO = 10000;
const amountNeededForPromo = computed(() =>
    Math.max(0, MIN_ORDER_FOR_PROMO - store.totalPrice),
);
const isPromoEligible = computed(() => store.totalPrice >= MIN_ORDER_FOR_PROMO);

const getIcon = (type) => {
    const icons = { Wind, Tag: Tag };
    return icons[type] || Wind;
};

const formatRupiah = (num) =>
    new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
    }).format(num);

/* promo */
const handleApplyPromo = async () => {
    if (!promoInput.value) return;
    const result = await promoStore.applyPromo(promoInput.value);
    promoMessage.value = result.message;
    setTimeout(() => (promoMessage.value = ""), 3000);
};

/* auth/login */
const handleAuthSubmit = async () => {
    isAuthLoading.value = true;
    try {
        if (isRegisterMode.value) {
            if (!authForm.name || !authForm.email || !authForm.password) {
                alert("Isi semua data dulu ya!");
                isAuthLoading.value = false;
                return;
            }
            await userStore.register(
                authForm.name,
                authForm.email,
                authForm.password,
            );
        } else {
            if (!authForm.email || !authForm.password) {
                alert("Email & Password wajib diisi!");
                isAuthLoading.value = false;
                return;
            }
            await userStore.login(authForm.email, authForm.password);
        }
    } finally {
        isAuthLoading.value = false;
    }
};

/* Checkout flow */
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
        processCheckout("LUNAS (Saldo Member)");
        showConfirmModal.value = false;
        store.items = [];
        promoStore.resetPromo();
    } catch (error) {
        console.error(error);
        alert("Gagal memproses pembayaran. Coba lagi ya!");
    } finally {
        isProcessingPayment.value = false;
    }
};

const processCheckout = (statusBayar) => {
    let message = "Halo Admin Aiya! ✨ Saya mau order dong:%0A%0A";
    store.items.forEach((item, idx) => {
        message += `${idx + 1}. ${item.name} (${item.qty}x) - ${formatRupiah(item.price * item.qty)}%0A`;
        if (item.desc) message += `   _${item.desc}_%0A`;
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
    <div>
        <!-- Overlay -->
        <transition name="fade">
            <div
                v-if="store.isOpen"
                class="fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-[60] transition-opacity"
                @click="store.toggleCart()"
            ></div>
        </transition>

        <!-- Drawer -->
        <div
            class="fixed top-0 right-0 h-full w-full md:w-[420px] z-[70] transform transition-transform duration-500 cubic-bezier(0.32,0.72,0,1)"
            :class="[
                store.isOpen ? 'translate-x-0' : 'translate-x-full',
                'bg-white dark:bg-charcoal',
            ]"
        >
            <div class="h-full flex flex-col relative overflow-hidden">
                <!-- decorative blob -->
                <div
                    class="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl -z-10 opacity-60 pointer-events-none bg-sky-100 dark:bg-sky-900/20"
                ></div>

                <!-- header -->
                <div
                    class="p-6 flex items-center justify-between bg-white/60 dark:bg-graphite/60 backdrop-blur-md border-b border-sky-100/40 dark:border-metal/40"
                >
                    <h2
                        class="text-xl font-bold text-slate-700 dark:text-slate-100 flex items-center gap-3"
                    >
                        <ShoppingBag class="text-sky-500 dark:text-sky-400" />
                        Keranjang
                    </h2>
                    <button
                        @click="store.toggleCart()"
                        class="p-2 rounded-full transition hover:bg-rose-50 dark:hover:bg-rose-900/20 text-slate-500 dark:text-slate-300"
                        aria-label="Tutup keranjang"
                    >
                        <X :size="22" />
                    </button>
                </div>

                <!-- items -->
                <div
                    class="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar"
                >
                    <div
                        v-if="store.items.length === 0"
                        class="text-center py-20 flex flex-col items-center"
                    >
                        <div
                            class="bg-sky-50 dark:bg-sky-900/20 p-6 rounded-full mb-4 animate-float-slow"
                        >
                            <Wind
                                class="text-sky-300 dark:text-sky-400"
                                :size="48"
                            />
                        </div>
                        <p
                            class="text-slate-600 dark:text-slate-400 font-bold mb-2"
                        >
                            Keranjang masih kosong...
                        </p>
                        <p
                            class="text-xs text-slate-400 dark:text-slate-400 mb-4"
                        >
                            Yuk isi dengan heart atau joki CR!
                        </p>
                        <button
                            @click="store.toggleCart()"
                            class="text-sky-500 dark:text-sky-300 font-bold hover:underline"
                        >
                            Lihat Menu
                        </button>
                    </div>

                    <div v-else>
                        <div
                            v-for="item in store.items"
                            :key="item.id"
                            class="bg-white dark:bg-graphite p-4 rounded-3xl border border-sky-50 dark:border-metal shadow-sm dark:shadow-none flex gap-4 items-start group hover:shadow-md transition relative"
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
                                    class="font-bold text-slate-700 dark:text-slate-100 text-sm truncate"
                                >
                                    {{ item.name }}
                                </h4>
                                <p
                                    class="text-[10px] text-slate-400 dark:text-slate-400 mb-2 line-clamp-2 leading-relaxed"
                                >
                                    {{ item.desc }}
                                </p>

                                <div class="flex items-center justify-between">
                                    <p
                                        class="text-sky-500 dark:text-sky-400 font-bold text-sm"
                                    >
                                        {{
                                            formatRupiah(item.price * item.qty)
                                        }}
                                    </p>

                                    <div
                                        class="flex items-center gap-2 bg-slate-50 dark:bg-metal/10 rounded-lg p-1 border border-slate-100 dark:border-metal"
                                    >
                                        <button
                                            @click="
                                                store.updateQty(item.id, -1)
                                            "
                                            class="w-6 h-6 flex items-center justify-center text-slate-500 dark:text-slate-300 hover:bg-white dark:hover:bg-graphite hover:text-rose-500 rounded transition"
                                            aria-label="Kurangi qty"
                                        >
                                            -
                                        </button>
                                        <span
                                            class="text-xs font-bold w-4 text-center text-slate-600 dark:text-slate-300"
                                            >{{ item.qty }}</span
                                        >
                                        <button
                                            @click="store.updateQty(item.id, 1)"
                                            class="w-6 h-6 flex items-center justify-center text-slate-500 dark:text-slate-300 hover:bg-white dark:hover:bg-graphite hover:text-emerald-500 rounded transition"
                                            aria-label="Tambah qty"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <button
                                @click="store.removeItem(item.id)"
                                class="absolute top-3 right-3 p-1.5 rounded-lg transition text-slate-300 dark:text-slate-500 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20"
                                title="Hapus Item"
                            >
                                <Trash2 :size="16" />
                            </button>
                        </div>
                    </div>
                </div>

                <!-- footer -->
                <div
                    class="bg-white dark:bg-charcoal border-t border-dashed border-sky-100 dark:border-metal relative z-10 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] dark:shadow-none"
                >
                    <!-- promo -->
                    <div class="px-6 pt-4 pb-2">
                        <div class="flex gap-2">
                            <div class="relative flex-1 group">
                                <div
                                    class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
                                >
                                    <Tag
                                        :size="16"
                                        class="text-slate-400 dark:text-slate-400 group-focus-within:text-sky-500 transition"
                                    />
                                </div>

                                <input
                                    v-model="promoInput"
                                    type="text"
                                    placeholder="Kode Promo"
                                    @keyup.enter="handleApplyPromo"
                                    :disabled="!!promoStore.activeCode"
                                    class="pl-9 pr-8 w-full bg-slate-50 dark:bg-metal/10 border border-slate-200 dark:border-metal rounded-xl py-2.5 text-sm focus:outline-none focus:border-sky-300 focus:ring-4 focus:ring-sky-50 dark:focus:ring-sky-900 transition uppercase font-bold text-slate-700 dark:text-slate-200 placeholder:font-normal placeholder:text-slate-400 dark:placeholder:text-slate-500"
                                />

                                <button
                                    v-if="promoStore.activeCode"
                                    @click="
                                        (promoStore.resetPromo(),
                                        (promoInput = ''))
                                    "
                                    class="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 dark:text-slate-300 hover:text-rose-500 dark:hover:text-rose-400 cursor-pointer transition"
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
                                class="px-4 py-2 rounded-xl text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow flex items-center justify-center min-w-[70px] dark:shadow-none"
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
                                    ? 'text-rose-500 dark:text-rose-400'
                                    : 'text-emerald-500 dark:text-emerald-400'
                            "
                        >
                            <span v-if="!promoStore.error"
                                ><Tag :size="12"
                            /></span>
                            {{ promoMessage }}
                        </p>

                        <div
                            v-if="promoStore.activeCode && !isPromoEligible"
                            class="mt-2 flex items-start gap-2 bg-amber-50 dark:bg-amber-900/20 p-2 rounded-lg border border-amber-100 dark:border-metal text-[10px] text-amber-700 dark:text-amber-300"
                        >
                            <Info :size="14" class="mt-0.5 shrink-0" />
                            <span
                                >Kupon aktif, tapi minimal belanja
                                <b>{{ formatRupiah(MIN_ORDER_FOR_PROMO) }}</b
                                >.<br />Tambah
                                <b>{{ formatRupiah(amountNeededForPromo) }}</b>
                                lagi ya!</span
                            >
                        </div>
                    </div>

                    <!-- payment -->
                    <div class="px-6 py-2">
                        <p
                            class="text-xs font-bold text-slate-600 dark:text-slate-400 mb-2"
                        >
                            Pilih Pembayaran
                        </p>
                        <div
                            class="flex gap-2 overflow-x-auto pb-2 custom-scrollbar"
                        >
                            <button
                                v-for="method in paymentMethods"
                                :key="method.id"
                                @click="selectedPayment = method.id"
                                class="flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium transition whitespace-nowrap"
                                :class="
                                    selectedPayment === method.id
                                        ? 'bg-sky-50 border-sky-300 text-sky-600 shadow-sm dark:bg-sky-900/20 dark:text-sky-300 dark:border-metal'
                                        : 'bg-white dark:bg-graphite border-slate-200 dark:border-metal text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-metal/50'
                                "
                            >
                                <component :is="method.icon" :size="14" />
                                {{ method.label }}
                            </button>
                        </div>

                        <transition name="fade">
                            <div
                                v-if="selectedPayment === 'member'"
                                class="mt-3 bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-xl border border-indigo-100 dark:border-indigo-800 relative overflow-hidden"
                            >
                                <div v-if="userStore.user">
                                    <div
                                        class="flex justify-between items-center mb-1"
                                    >
                                        <span
                                            class="text-xs font-bold text-indigo-700 dark:text-indigo-300"
                                            >Saldo Kamu:</span
                                        >
                                        <span
                                            class="text-sm font-extrabold text-indigo-600 dark:text-indigo-300"
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
                                            (promoStore.calculateTotal
                                                ? promoStore.calculateTotal(
                                                      store.totalPrice,
                                                  )
                                                : store.totalPrice)
                                        "
                                        class="text-[10px] text-rose-500 dark:text-rose-400 font-bold flex items-center gap-1 mt-1"
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
                                            placeholder="Nama Panggilan"
                                            class="w-full px-3 py-1.5 text-xs rounded-lg border border-indigo-200 dark:border-indigo-700 dark:bg-metal/10 dark:text-slate-200 focus:outline-none"
                                        />
                                        <input
                                            v-model="authForm.email"
                                            type="email"
                                            placeholder="Email"
                                            class="w-full px-3 py-1.5 text-xs rounded-lg border border-indigo-200 dark:border-indigo-700 dark:bg-metal/10 dark:text-slate-200 focus:outline-none"
                                        />
                                        <input
                                            v-model="authForm.password"
                                            type="password"
                                            placeholder="Password (Min. 6)"
                                            class="w-full px-3 py-1.5 text-xs rounded-lg border border-indigo-200 dark:border-indigo-700 dark:bg-metal/10 dark:text-slate-200 focus:outline-none"
                                        />
                                    </div>

                                    <p
                                        v-if="userStore.authError"
                                        class="text-[9px] text-rose-500 dark:text-rose-400 mt-2 font-bold flex items-center gap-1"
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
                                                ((isRegisterMode =
                                                    !isRegisterMode),
                                                (userStore.authError = null))
                                            "
                                            class="px-3 py-1.5 bg-white dark:bg-graphite text-indigo-500 border border-indigo-200 dark:border-indigo-700 rounded-lg text-xs font-bold hover:bg-indigo-50 dark:hover:bg-indigo-800/20"
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

                    <!-- totals & checkout -->
                    <div class="p-6 pt-2 space-y-3">
                        <div
                            class="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400"
                        >
                            <span>Subtotal</span>
                            <span>{{ formatRupiah(store.totalPrice) }}</span>
                        </div>

                        <div
                            v-if="promoStore.activeCode && isPromoEligible"
                            class="flex justify-between items-center text-xs font-bold text-emerald-600 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/20 p-2 rounded-lg border border-emerald-100 dark:border-metal"
                        >
                            <span class="flex items-center gap-1"
                                ><Tag :size="12" /> Hemat ({{
                                    promoStore.activeCode
                                }})</span
                            >
                            <span
                                >-{{
                                    formatRupiah(
                                        promoStore.savings
                                            ? promoStore.savings(
                                                  store.totalPrice,
                                              )
                                            : 0,
                                    )
                                }}</span
                            >
                        </div>

                        <div
                            class="flex justify-between items-end pt-2 border-t border-slate-100 dark:border-metal"
                        >
                            <span
                                class="text-sm font-bold text-slate-700 dark:text-slate-200"
                                >Total Bayar</span
                            >
                            <span
                                class="text-2xl font-extrabold text-sky-500 dark:text-sky-400"
                            >
                                {{
                                    formatRupiah(
                                        promoStore.activeCode && isPromoEligible
                                            ? promoStore.calculateTotal(
                                                  store.totalPrice,
                                              )
                                            : store.totalPrice,
                                    )
                                }}
                            </span>
                        </div>

                        <button
                            @click="handleCheckoutClick"
                            :disabled="
                                store.items.length === 0 || isProcessingPayment
                            "
                            class="w-full btn-bouncy text-white font-bold py-4 rounded-2xl flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-4 hover:brightness-105"
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
                                ><UserCheck :size="20" /> Gunakan Saldo</span
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

        <!-- confirm modal for member payment -->
        <transition name="fade">
            <div
                v-if="showConfirmModal"
                class="fixed inset-0 z-[80] flex items-center justify-center p-4"
            >
                <div
                    class="absolute inset-0 bg-slate-900/30 backdrop-blur-sm"
                    @click="showConfirmModal = false"
                ></div>

                <div
                    class="bg-white dark:bg-graphite w-full max-w-xs rounded-[1.5rem] shadow-2xl relative z-10 p-6 border-4 border-indigo-50 dark:border-indigo-900/30 text-center"
                >
                    <div
                        class="w-16 h-16 bg-indigo-100 dark:bg-indigo-800 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl"
                    >
                        🫣
                    </div>
                    <h3
                        class="text-lg font-bold text-slate-700 dark:text-slate-100 mb-2"
                    >
                        Yakin mau jajan?
                    </h3>
                    <p
                        class="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed"
                    >
                        Saldo kakak bakal kepotong otomatis lho. <br /><span
                            class="text-rose-500 dark:text-rose-400 font-bold text-xs"
                            >Gabisa refund yaa~</span
                        >
                    </p>

                    <div class="flex gap-3">
                        <button
                            @click="showConfirmModal = false"
                            class="flex-1 py-2.5 rounded-xl border-2 border-slate-100 dark:border-metal font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-metal/50 transition"
                        >
                            Ntar Dulu
                        </button>
                        <button
                            @click="confirmMemberPayment"
                            class="flex-1 py-2.5 rounded-xl bg-indigo-500 text-white font-bold shadow-lg hover:bg-indigo-600 transition btn-bouncy"
                            :disabled="isProcessingPayment"
                        >
                            {{
                                isProcessingPayment
                                    ? "Memproses..."
                                    : "Gass Bayar! 🚀"
                            }}
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

/* Custom scrollbar tuned for light/dark */
.custom-scrollbar::-webkit-scrollbar {
    width: 6px;
    height: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
    background-color: rgba(100, 116, 139, 0.25);
    border-radius: 999px;
}
:global(.dark) .custom-scrollbar::-webkit-scrollbar-thumb {
    background-color: rgba(255, 255, 255, 0.08);
}

/* Small utility to slightly reduce contrast on dark shadows */
:global(.dark) .shadow-2xl {
    box-shadow: none;
}
</style>
