<script setup>
import { defineAsyncComponent, ref, computed, watch, reactive, nextTick } from "vue";
import { useCartStore } from "../stores/cart";
import { usePromoStore } from "../stores/promo";
import { useUserStore } from "../stores/user";
import { useBuyerNameStore } from "../stores/buyerName";
import { useOrderStore } from "../stores/order";
import { useToastStore } from "../stores/toast";
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
    Zap,
    ArrowRight,
    ShieldCheck,
    User,
    UserPlus,
    UserCircle,
} from "lucide-vue-next";
import {
    doc,
    updateDoc,
    increment,
    collection,
    addDoc,
    serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";
import { formatRupiah } from "../utils/format";
const ManualPaymentModal = defineAsyncComponent(
    () => import("./ManualPaymentModal.vue"),
);

const store = useCartStore();
const promoStore = usePromoStore();
const userStore = useUserStore();
const buyerNameStore = useBuyerNameStore();
const orderStore = useOrderStore();
const toastStore = useToastStore();

// Track current order for checkout flow
const currentOrderId = ref(null);
const currentOrderShortId = ref(null);

const buyerNameInputRef = ref(null);

const promoInput = ref("");
const promoMessage = ref("");
const selectedPayment = ref("qris");

const showConfirmModal = ref(false);
const showSuccessModal = ref(false);
const isProcessingPayment = ref(false);
const countdown = ref(3);

// --- STATE MANUAL PAYMENT ---
const showManualPayment = ref(false);
const manualPaymentData = ref({ total: 0, id: "" });

const authForm = reactive({ username: "", password: "" });
const isAuthLoading = ref(false);

watch(
    () => userStore.user,
    (newUser) => {
        if (newUser && userStore.memberData?.saldo >= store.totalPrice) {
            selectedPayment.value = "member";
        }
    },
);

// Load buyer name from localStorage when drawer opens
watch(
    () => store.isOpen,
    (isOpen) => {
        if (isOpen) {
            buyerNameStore.loadBuyerNameFromStorage();
        }
    },
    { immediate: true },
);

const finalTotalComputed = computed(() =>
    promoStore.activeCode && isPromoEligible.value
        ? promoStore.calculateTotal(store.totalPrice)
        : store.totalPrice,
);

const memberBalanceAfter = computed(() => {
    return (userStore.memberData?.saldo || 0) - finalTotalComputed.value;
});

const getIcon = (type) => {
    const map = {
        wind: Wind,
        star: Star,
        heart: Heart,
        flame: Flame,
        cloud: Cloud,
        sparkles: Sparkles,
        moon: Moon,
        zap: Zap,
    };
    return map[type?.toLowerCase()] || Sparkles;
};

const getItemTheme = (item) => {
    if (item.category === "heart")
        return "bg-rose-100 text-rose-500 dark:bg-rose-900/30 dark:text-rose-400";
    if (item.category === "candlerun")
        return "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400";
    if (item.category === "special")
        return "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400";
    return "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400";
};
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
    try {
        if (!authForm.username || !authForm.password)
            throw new Error("Username & Password wajib!");
        await userStore.login(authForm.username, authForm.password);
    } catch (e) {
        toastStore.trigger(e.message || "Gagal login", "error");
    } finally {
        isAuthLoading.value = false;
    }
};

// Helper for generating ID client-side (to link transaction & order)
const generateShortId = () => {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    return `ORD-${timestamp}-${random}`;
};

const handleCheckoutClick = async () => {
    if (store.items.length === 0) return;

    // Validate buyer name before any payment action
    const nameValidation = buyerNameStore.validate();
    if (!nameValidation.ok) {
        await nextTick();
        buyerNameInputRef.value?.focus();
        return;
    }

    // --- FLOW A: MEMBER BALANCE (PREPARE) ---
    if (selectedPayment.value === "member") {
        // STEP A0: Preflight Checks
        if (!userStore.user) {
            toastStore.trigger("Silakan login dulu ya kak! 😊", "warning");
            return;
        }
        if (userStore.memberData?.saldo < finalTotalComputed.value) {
            toastStore.trigger("Yah, saldo member kakak kurang nih 🥺 Topup dulu yuk!", "warning");
            return;
        }
        
        // Final confirmation (UI Lock is handled by modal state)
        showConfirmModal.value = true;
        return;
    }

    // --- FLOW B: QRIS / MANUAL (ORDER FIRST) ---
    if (selectedPayment.value === "qris") {
        await processQrisCheckout();
    }
};

// --- FLOW A: EXECUTION (Commit) ---
const confirmMemberPayment = async () => {
    isProcessingPayment.value = true;
    const total = finalTotalComputed.value;
    const shortId = generateShortId(); // Generate ID upfront for linkage

    try {
        // STEP A1: Lock UI (handled by isProcessingPayment)

        // STEP A2: FINANCIAL COMMIT (Source of Truth)
        // Deduct balance FIRST. If this fails, flow stops.
        const deductResult = await userStore.deductBalance(
            total, 
            `Pembayaran Order ${shortId} (${store.totalItems} items)`,
            shortId
        );

        if (!deductResult.success) {
            throw new Error(deductResult.message || "Gagal memproses pembayaran");
        }

        // --- PAYMENT SUCCESSFUL POINT --- 
        // From here on, the user has PAID. We must not fail the UX.

        let finalOrderId = null;

        // STEP A3: CREATE ORDER (Non-Blocking)
        try {
            const orderResult = await orderStore.createOrder({
                shortId: shortId, // Use the same ID
                userId: userStore.user.uid,
                buyerName: buyerNameStore.trimmedName,
                contactPlatform: "in_game",
                contactIdentifier: userStore.user.displayName || "",
                items: store.items.map(item => ({
                    productId: item.id,
                    productName: item.name,
                    quantity: item.qty,
                    unitPrice: item.price,
                    subtotal: item.price * item.qty,
                })),
                subtotal: store.totalPrice,
                discount: promoStore.activeCode && isPromoEligible.value 
                    ? promoStore.savings(store.totalPrice) 
                    : 0,
                promoCode: promoStore.activeCode || null,
                total: total,
                paymentMethod: "balance",
                paymentStatus: "paid", // Auto-paid
                source: "member_checkout",
            });

            if (orderResult.success) {
                finalOrderId = orderResult.orderId;
            } else {
                console.error("Order creation failed (but payment success):", orderResult.error);
                // We still proceed to success because payment is done.
            }
        } catch (orderError) {
            console.error("Critical: Order creation exception (payment success):", orderError);
            // Swallow error to protect payment success state
        }

        // STEP A4: UX SUCCESS
        currentOrderShortId.value = shortId;
        currentOrderId.value = finalOrderId;
        
        showConfirmModal.value = false;
        showSuccessModal.value = true;

        store.clearCart();
        promoStore.resetPromo();

        // Auto-redirect logic
        countdown.value = 3;
        const timer = setInterval(() => {
            countdown.value--;
            if (countdown.value <= 0) {
                clearInterval(timer);
                processCheckout("LUNAS (Saldo Member)", shortId);
                setTimeout(() => {
                    showSuccessModal.value = false;
                    store.toggleCart();
                }, 1000);
            }
        }, 1000);

    } catch (error) {
        // This catch block is ONLY for Step A2 (Financial Commit) failure.
        // If money wasn't deducted, we can safely show error.
        console.error("Payment failed:", error);
        toastStore.trigger(`Gagal memproses pembayaran: ${error.message}`, "error");
    } finally {
        isProcessingPayment.value = false;
    }
};

// --- FLOW B: EXECUTION ---
const processQrisCheckout = async () => {
    isProcessingPayment.value = true;
    const total = finalTotalComputed.value;

    // Generate shortId upfront so QRIS modal can always show it
    const localShortId = generateShortId();
    let firestoreOrderId = null;

    try {
        // STEP B1: CREATE ORDER (Best-Effort)
        // Attempt to save to Firestore, but don't block the payment modal
        const orderResult = await orderStore.createOrder({
            shortId: localShortId,
            userId: userStore.user?.uid || null,
            buyerName: buyerNameStore.trimmedName,
            contactPlatform: "whatsapp",
            contactIdentifier: "",
            items: store.items.map(item => ({
                productId: item.id,
                productName: item.name,
                quantity: item.qty,
                unitPrice: item.price,
                subtotal: item.price * item.qty,
            })),
            subtotal: store.totalPrice,
            discount: promoStore.activeCode && isPromoEligible.value 
                ? promoStore.savings(store.totalPrice) 
                : 0,
            promoCode: promoStore.activeCode || null,
            total: total,
            paymentMethod: "qris",
            paymentStatus: "pending",
            source: "member_checkout",
        });

        if (orderResult.success) {
            firestoreOrderId = orderResult.orderId;
        } else {
            console.warn("Order creation failed, proceeding with local ID:", orderResult.error);
        }
    } catch (error) {
        console.warn("QRIS order save error (proceeding anyway):", error);
    }

    // STEP B2: ALWAYS show payment modal — user must be able to pay
    currentOrderId.value = firestoreOrderId;
    currentOrderShortId.value = localShortId;

    manualPaymentData.value = {
        total: total,
        id: localShortId,
        orderId: firestoreOrderId || localShortId,
        buyerName: buyerNameStore.trimmedName,
    };
    showManualPayment.value = true;
    isProcessingPayment.value = false;
};

const processCheckout = (statusBayar, orderShortId = null) => {
    let message = "Halo Admin Aiya! ✨ Saya mau order dong:%0A%0A";

    // Include order reference
    const orderId = orderShortId || currentOrderShortId.value;
    if (orderId) {
        message += `📦 *Order ID: ${orderId}*%0A%0A`;
    }

    if (store.items.length === 0 && statusBayar.includes("LUNAS")) {
        message += "✅ *Pembayaran LUNAS via Saldo Member*%0A";
        message +=
            "Mohon segera diproses ya min! Detail pesanan sudah masuk di sistem.";
    }

    // Include buyer name if available
    const buyerName = buyerNameStore.trimmedName;
    if (buyerName) {
        message += `%0A📝 Nama Pembeli: *${encodeURIComponent(buyerName)}*`;
    }

    /*
    // Optional: User Details (Only if relevant/logged in)
    if (userStore.user) {
        message += `%0A👤 User: ${userStore.user.displayName}`;
    }
    */

    message += `%0AMetode Bayar: ${selectedPayment.value === "member" ? "💎 Saldo Member" : "QRIS / E-Wallet"}`;
    message += `%0AStatus: *${statusBayar}*`;

    // Mark WhatsApp as sent if we have orderId
    if (currentOrderId.value) {
        orderStore.markWhatsAppSent(currentOrderId.value);
    }

    window.open(`https://wa.me/6285942963323?text=${message}`, "_blank");
};
</script>

<template>
    <div class="cart-drawer">
        <transition name="fade">
            <div
                v-if="store.isOpen"
                class="fixed inset-0 bg-slate-900/40 backdrop-blur-none sm:backdrop-blur-sm z-[60] transition-opacity"
                @click="store.toggleCart()"
            ></div>
        </transition>

        <div
            class="drawer-panel transform-gpu fixed top-0 right-0 h-full w-full md:w-[420px] bg-[#FDFBF7] dark:bg-charcoal z-[70] shadow-2xl transform transition-transform duration-500 cubic-bezier(0.32, 0.72, 0, 1)"
            :class="store.isOpen ? 'translate-x-0' : 'translate-x-full'"
        >
            <div class="h-full flex flex-col relative overflow-hidden">
                <div
                    class="absolute top-0 right-0 w-64 h-64 bg-sky-100 dark:bg-slate-800/50 rounded-full blur-3xl -z-10 opacity-60 pointer-events-none"
                ></div>

                <div
                    class="p-6 flex justify-between items-center bg-white/50 dark:bg-charcoal/80 backdrop-blur-sm md:backdrop-blur-md border-b border-sky-100/50 dark:border-slate-800"
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
                        v-memo="[item.id, item.qty]"
                        :key="item.id"
                        class="bg-white dark:bg-graphite p-4 rounded-3xl border border-sky-50 dark:border-slate-700 shadow-sm flex gap-4 items-start group hover:shadow-md transition relative"
                    >
                        <div
                            :class="`w-12 h-12 rounded-2xl ${getItemTheme(item)} flex items-center justify-center shrink-0 mt-1 shadow-sm`"
                        >
                            <component
                                :is="getIcon(item.iconType)"
                                :size="20"
                                stroke-width="2.5"
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

                <!-- UX: 3-Step Checkout Flow for mobile clarity -->
                <div
                    class="bg-white dark:bg-graphite border-t border-slate-100 dark:border-slate-700 relative z-10 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]"
                >
                    <!-- STEP 1: Order Review (No input fields) -->
                    <div class="px-4 pt-4 pb-3 border-b border-dashed border-slate-100 dark:border-slate-700">
                        <p class="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 flex items-center gap-1.5">
                            <span class="w-4 h-4 rounded-full bg-sky-500 text-white text-[9px] flex items-center justify-center font-bold">1</span>
                            Order Review
                        </p>
                        <div class="space-y-2">
                            <div
                                class="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400"
                            >
                                <span>{{ store.totalItems }} item(s)</span>
                                <span>{{ formatRupiah(store.totalPrice) }}</span>
                            </div>
                            <div
                                v-if="promoStore.activeCode && isPromoEligible"
                                class="flex justify-between items-center text-xs font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 p-2 rounded-lg border border-emerald-100 dark:border-emerald-800"
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
                                class="flex justify-between items-end pt-1"
                            >
                                <span
                                    class="text-sm font-bold text-slate-600 dark:text-slate-300"
                                    >Total</span
                                ><span
                                    class="text-xl font-black text-sky-500 dark:text-sky-400"
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
                        </div>

                        <!-- Promo Code (compact) -->
                        <div class="mt-3 flex gap-2">
                            <div class="relative flex-1 group">
                                <div
                                    class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
                                >
                                    <Tag
                                        :size="14"
                                        class="text-slate-400 group-focus-within:text-sky-500 transition"
                                    />
                                </div>
                                <input
                                    v-model="promoInput"
                                    type="text"
                                    placeholder="Promo"
                                    class="pl-8 pr-6 w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl py-2 text-xs focus:outline-none focus:border-sky-300 transition uppercase font-bold text-slate-600 dark:text-slate-200 placeholder-slate-400"
                                    @keyup.enter="handleApplyPromo"
                                    :disabled="!!promoStore.activeCode"
                                />
                                <button
                                    v-if="promoStore.activeCode"
                                    @click="
                                        promoStore.resetPromo();
                                        promoInput = '';
                                    "
                                    class="absolute inset-y-0 right-0 pr-2 flex items-center text-slate-400 hover:text-rose-500 cursor-pointer transition"
                                >
                                    <XCircle :size="14" />
                                </button>
                            </div>
                            <button
                                @click="handleApplyPromo"
                                :disabled="
                                    promoStore.isLoading ||
                                    !promoInput ||
                                    !!promoStore.activeCode
                                "
                                class="bg-slate-800 dark:bg-slate-700 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center min-w-[60px]"
                            >
                                <Loader2
                                    v-if="promoStore.isLoading"
                                    :size="14"
                                    class="animate-spin"
                                />
                                <span v-else>{{
                                    promoStore.activeCode ? "✓" : "OK"
                                }}</span>
                            </button>
                        </div>
                        <p
                            v-if="promoMessage"
                            class="text-[10px] mt-1.5 font-bold ml-1 flex items-center gap-1"
                            :class="
                                promoStore.error
                                    ? 'text-rose-500'
                                    : 'text-emerald-500'
                            "
                        >
                            <Sparkles v-if="!promoStore.error" :size="10" />
                            {{ promoMessage }}
                        </p>
                    </div>

                    <!-- STEP 2: Payment Method -->
                    <div class="px-4 py-3 border-b border-dashed border-slate-100 dark:border-slate-700">
                        <p class="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 flex items-center gap-1.5">
                            <span class="w-4 h-4 rounded-full bg-sky-500 text-white text-[9px] flex items-center justify-center font-bold">2</span>
                            Payment
                        </p>
                        <div
                            class="flex gap-2"
                        >
                            <button
                                @click="selectedPayment = 'qris'"
                                class="flex-1 flex flex-col items-center gap-1 px-3 py-2.5 rounded-xl border text-xs font-medium transition"
                                :class="
                                    selectedPayment === 'qris'
                                        ? 'bg-sky-50 dark:bg-sky-900/30 border-sky-300 dark:border-sky-700 text-sky-600 dark:text-sky-300 shadow-sm'
                                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                                "
                            >
                                <QrCode :size="18" />
                                <span class="font-bold">QRIS</span>
                                <span class="text-[9px] opacity-70">Tunggu konfirmasi</span>
                            </button>
                            <button
                                @click="selectedPayment = 'member'"
                                class="flex-1 flex flex-col items-center gap-1 px-3 py-2.5 rounded-xl border text-xs font-medium transition"
                                :class="
                                    selectedPayment === 'member'
                                        ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-300 dark:border-indigo-700 text-indigo-600 dark:text-indigo-300 shadow-sm'
                                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                                "
                            >
                                <Wallet :size="18" />
                                <span class="font-bold">Saldo</span>
                                <span class="text-[9px] opacity-70">Instan</span>
                            </button>
                        </div>

                        <transition name="fade">
                            <div
                                v-if="selectedPayment === 'member'"
                                class="mt-2 bg-indigo-50 dark:bg-indigo-950/40 p-2.5 rounded-xl border border-indigo-100 dark:border-indigo-900 relative overflow-hidden"
                            >
                                <div v-if="userStore.user">
                                    <div
                                        class="flex justify-between items-center"
                                    >
                                        <span
                                            class="text-xs font-bold text-indigo-700 dark:text-indigo-300"
                                            >Saldo:</span
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
                                        <XCircle :size="12" /> Saldo kurang
                                    </div>
                                    <div
                                        v-else
                                        class="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1 mt-1"
                                    >
                                        <CheckCircle2 :size="12" /> Siap bayar!
                                    </div>
                                </div>
                                <div v-else>
                                    <p
                                        class="text-[10px] text-indigo-500 dark:text-indigo-300 mb-2 font-bold text-center"
                                    >
                                        Login Member Required 🔐
                                    </p>
                                    <div class="space-y-1.5">
                                        <div class="relative">
                                            <span
                                                class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                                ><User :size="12"
                                            /></span>
                                            <input
                                                v-model="authForm.username"
                                                type="text"
                                                placeholder="Username"
                                                class="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-indigo-200 dark:border-indigo-800 bg-white dark:bg-slate-950 text-slate-700 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-indigo-400"
                                            />
                                        </div>
                                        <input
                                            v-model="authForm.password"
                                            type="password"
                                            placeholder="Password"
                                            class="w-full px-3 py-1.5 text-xs rounded-lg border border-indigo-200 dark:border-indigo-800 bg-white dark:bg-slate-950 text-slate-700 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-indigo-400"
                                        />
                                    </div>
                                    <p
                                        v-if="userStore.authError"
                                        class="text-[9px] text-rose-500 mt-1 font-bold flex items-center gap-1"
                                    >
                                        <AlertCircle :size="10" />
                                        {{ userStore.authError }}
                                    </p>

                                    <div class="mt-2 space-y-1.5">
                                        <button
                                            @click="handleAuthSubmit"
                                            :disabled="isAuthLoading"
                                            class="w-full bg-indigo-600 text-white py-1.5 rounded-lg text-xs font-bold hover:bg-indigo-700 disabled:opacity-50 flex justify-center items-center gap-1"
                                        >
                                            <Loader2
                                                v-if="isAuthLoading"
                                                :size="12"
                                                class="animate-spin"
                                            />
                                            Login
                                        </button>
                                        <a
                                            href="https://wa.me/6285942963323?text=Halo%20Admin%20Aiya!%20Saya%20mau%20daftar%20member%20baru%20dong%20✨"
                                            target="_blank"
                                            class="block text-center text-[10px] text-indigo-500 dark:text-indigo-400 font-bold hover:underline flex items-center justify-center gap-1"
                                            >Daftar via WA
                                            <UserPlus :size="10"
                                        /></a>
                                    </div>
                                </div>
                            </div>
                        </transition>
                    </div>

                    <!-- STEP 3: Contact Info (Minimal, optional for balance) -->
                    <div class="px-4 py-3">
                        <p class="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 flex items-center gap-1.5">
                            <span class="w-4 h-4 rounded-full bg-sky-500 text-white text-[9px] flex items-center justify-center font-bold">3</span>
                            Your Info
                            <span v-if="selectedPayment === 'member'" class="text-slate-300 font-normal">(optional)</span>
                        </p>
                        <div class="relative group">
                            <input
                                id="buyerNameInput"
                                ref="buyerNameInputRef"
                                type="text"
                                :value="buyerNameStore.buyerName"
                                @input="buyerNameStore.setBuyerName($event.target.value)"
                                placeholder="Nama kamu"
                                maxlength="50"
                                class="w-full bg-slate-50 dark:bg-slate-800 border rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:ring-2 transition font-medium text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500"
                                :class="
                                    buyerNameStore.buyerNameError
                                        ? 'border-rose-300 dark:border-rose-600 focus:border-rose-400 focus:ring-rose-100'
                                        : 'border-slate-200 dark:border-slate-600 focus:border-sky-300 focus:ring-sky-100'
                                "
                            />
                        </div>
                        <p
                            v-if="buyerNameStore.buyerNameError"
                            class="text-[10px] mt-1 font-bold text-rose-500 flex items-center gap-1"
                        >
                            <AlertCircle :size="10" />
                            {{ buyerNameStore.buyerNameError }}
                        </p>

                        <!-- UX: Primary CTA - 44px+ height, full width -->
                        <button
                            @click="handleCheckoutClick"
                            :disabled="
                                store.items.length === 0 || isProcessingPayment
                            "
                            class="w-full min-h-[48px] text-white font-bold py-3.5 rounded-xl shadow-lg flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-4 hover:brightness-105 transition active:scale-[0.98]"
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
                                ><Wallet :size="20" /> Bayar Sekarang</span
                            >
                            <span v-else class="flex items-center gap-2"
                                ><MessageCircle :size="20" /> Checkout</span
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
                    class="absolute inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity"
                    @click="showConfirmModal = false"
                ></div>
                <div
                    class="bg-white dark:bg-charcoal w-full max-w-sm rounded-[2.5rem] shadow-2xl relative z-10 animate-in fade-in zoom-in-95 duration-200 overflow-hidden border border-white/20"
                >
                    <div
                        class="bg-white dark:bg-slate-900 p-6 pb-4 text-center border-b border-slate-100 dark:border-slate-800"
                    >
                        <div
                            class="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mx-auto mb-3"
                        >
                            <ShieldCheck
                                :size="32"
                                class="text-indigo-600 dark:text-indigo-400"
                            />
                        </div>
                        <h3
                            class="text-xl font-bold text-slate-800 dark:text-slate-100"
                        >
                            Konfirmasi Pembayaran
                        </h3>
                        <p
                            class="text-slate-500 dark:text-slate-400 text-xs mt-1"
                        >
                            Pastikan saldo kamu cukup ya!
                        </p>
                    </div>
                    <div class="p-6 bg-slate-50 dark:bg-slate-800/50">
                        <div class="space-y-4">
                            <div
                                class="flex justify-between items-center text-sm"
                            >
                                <span class="text-slate-500 dark:text-slate-400"
                                    >Saldo Awal</span
                                ><span
                                    class="font-bold text-slate-700 dark:text-slate-200"
                                    >{{
                                        formatRupiah(
                                            userStore.memberData?.saldo,
                                        )
                                    }}</span
                                >
                            </div>
                            <div
                                class="flex justify-between items-center text-sm"
                            >
                                <span class="text-slate-500 dark:text-slate-400"
                                    >Total Belanja</span
                                ><span class="font-bold text-rose-500"
                                    >-
                                    {{ formatRupiah(finalTotalComputed) }}</span
                                >
                            </div>
                            <div
                                class="h-px bg-slate-200 dark:bg-slate-700 border-dashed border-t"
                            ></div>
                            <div
                                class="flex justify-between items-center bg-white dark:bg-slate-800 p-3 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm"
                            >
                                <div class="flex items-center gap-2">
                                    <div
                                        class="p-1.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg text-emerald-600"
                                    >
                                        <Wallet :size="16" />
                                    </div>
                                    <span
                                        class="text-xs font-bold text-slate-600 dark:text-slate-300"
                                        >Sisa Saldo</span
                                    >
                                </div>
                                <span
                                    class="font-black text-emerald-600 dark:text-emerald-400"
                                    >{{
                                        formatRupiah(memberBalanceAfter)
                                    }}</span
                                >
                            </div>
                        </div>
                        <div class="flex gap-3 mt-6">
                            <button
                                @click="showConfirmModal = false"
                                class="flex-1 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-700 transition"
                            >
                                Batal
                            </button>
                            <button
                                @click="confirmMemberPayment"
                                class="flex-[2] py-3.5 rounded-xl bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-200 dark:shadow-none hover:bg-indigo-700 transition btn-bouncy flex items-center justify-center gap-2"
                            >
                                Bayar <ArrowRight :size="18" />
                            </button>
                        </div>
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
                    class="absolute inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity"
                ></div>
                <div
                    class="bg-white dark:bg-charcoal w-full max-w-sm rounded-[2.5rem] shadow-2xl relative z-10 animate-in fade-in zoom-in-95 duration-300 p-8 text-center border-4 border-emerald-50 dark:border-emerald-900"
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
                        Yeay! Saldo berhasil dipotong. <br />Mengalihkan ke
                        WhatsApp dalam
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

        <Teleport to="body">
            <ManualPaymentModal
                :is-open="showManualPayment"
                :total-price="manualPaymentData.total"
                :order-id="manualPaymentData.id"
                :buyer-name="manualPaymentData.buyerName"
                :cart-items="store.items"
                @close="showManualPayment = false"
            />
        </Teleport>
    </div>
</template>

<style scoped>
.drawer-panel {
    will-change: transform;
}

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
:global(.dark) .custom-scrollbar::-webkit-scrollbar-thumb {
    background-color: rgba(255, 255, 255, 0.1);
}
:global(.dark) .cart-drawer button:focus {
    box-shadow: none !important;
    outline: 2px solid rgba(255, 255, 255, 0.06);
    outline-offset: 2px;
}
</style>
