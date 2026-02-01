<script setup>
import { ref, reactive, computed, onMounted, watch, toRaw } from "vue";
import { useProductsStore } from "../../stores/products";
import { products as localProducts } from "../../data/products";
import { formatRupiah } from "../../utils/format";
import {
    Search,
    Plus,
    Pencil,
    Trash2,
    X,
    Package,
    Sparkles,
    Heart,
    Flame,
    Check,
    Calculator,
    MinusCircle,
    Layers,
    MoreHorizontal,
} from "lucide-vue-next";

/*
  Performance-focused refactor notes (no visual/UX changes):
  - Debounced search input to reduce computed recalculations during typing.
  - Replaced repeated "if" logic for type -> icon/desc/tag with frozen maps for faster lookups.
  - Avoided recreating arrays/objects where possible.
  - Removed unused imports (keeps bundle smaller).
  - Kept store fallbacks intact from previous fix but minimized operations inside hot paths.
*/

const productsStore = useProductsStore();

// UI state
const searchInput = ref(""); // bound to input directly (debounced)
const productSearch = ref(""); // debounced value used by computed filter
const showModal = ref(false);
const editingProduct = ref(null);
const showAdvanced = ref(false);

// Form model
const form = reactive({
    type: "special",
    name: "",
    price: 0,
    isActive: true,
    order: 0,
    id: "",
    desc: "",
    tag: "",
    iconType: "",
    isCalculator: false,
    variants: [],
});

// Debounce settings
const DEBOUNCE_MS = 220;
let debounceTimer = null;
watch(
    searchInput,
    (v) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            productSearch.value = String(v || "")
                .trim()
                .toLowerCase();
        }, DEBOUNCE_MS);
    },
    { immediate: true },
);

// Use frozen maps for type lookups (fast and stable)
const ICON_BY_TYPE = Object.freeze({
    heart: "heart",
    candlerun: "flame",
    calculator: "calculator",
    special: "sparkles",
});
const DEFAULT_DESC_BY_TYPE = Object.freeze({
    heart: "Cozy heart service ✨",
    candlerun: "Warm & cozy candle run 🕯️",
    calculator: "Custom Heart Calculation 🧮",
    special: "Soft vibe service ☁️",
});
const DEFAULT_TAG_BY_TYPE = Object.freeze({
    heart: "Cute pick ✨",
    candlerun: "Warm & cozy 🕯️",
    calculator: "Calculator 🧮",
    special: "Soft vibe ☁️",
});

// Map type -> lucide component
const TYPE_ICON_COMPONENT = Object.freeze({
    heart: Heart,
    candlerun: Flame,
    calculator: Calculator,
    special: Sparkles,
});

// Utility slugify (unchanged semantics)
const slugify = (str) =>
    String(str || "")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .slice(0, 48);

// Initial fetch
onMounted(async () => {
    if (productsStore.fetchAll) {
        // pass fallback to allow offline/local mode
        await productsStore.fetchAll({ fallback: localProducts });
    }
});

// items computed - read store only once per render
const items = computed(() => productsStore.items || productsStore.all || []);

// filteredProducts: uses debounced productSearch (reduces churn while typing)
const filteredProducts = computed(() => {
    const q = productSearch.value;
    let list = items.value || [];

    // If query present, filter; otherwise use original list reference to avoid allocations
    if (q) {
        // small optimization: lowercasing fields once per product
        list = list.filter((p) => {
            // reading fields as strings once
            const name = String(p.name || "").toLowerCase();
            if (name.includes(q)) return true;
            const id = String(p.id || "").toLowerCase();
            if (id.includes(q)) return true;
            const category = String(p.category || "").toLowerCase();
            if (category.includes(q)) return true;
            return false;
        });
    }

    // Sort - stable and cheap relative to render cost; keep behavior identical
    return [...list].sort((a, b) => {
        const ao = Number(a.order ?? 9999);
        const bo = Number(b.order ?? 9999);
        if (ao !== bo) return ao - bo;
        return String(a.name || "").localeCompare(String(b.name || ""));
    });
});

// Variants helper
const addVariant = () => form.variants.push({ name: "", price: 0 });
const removeVariant = (index) => form.variants.splice(index, 1);

// Modal actions (kept semantics identical)
const openAdd = () => {
    editingProduct.value = null;
    showAdvanced.value = false;
    Object.assign(form, {
        type: "special",
        name: "",
        price: 0,
        isActive: true,
        order: filteredProducts.value.length + 1,
        id: "",
        desc: "",
        tag: "",
        iconType: "",
        isCalculator: false,
        variants: [],
    });
    showModal.value = true;
};

const openEdit = (p) => {
    editingProduct.value = p;
    showAdvanced.value = false;
    const existingVariants = Array.isArray(p.variants)
        ? p.variants.map((v) => ({ ...v }))
        : [];
    Object.assign(form, {
        type: p.category || "special",
        name: p.name || "",
        price: Number(p.price || 0),
        isActive: p.isActive !== false,
        order: Number(p.order || 0),
        id: p.id || "",
        desc: p.desc || "",
        tag: p.tag || "",
        iconType: p.iconType || "",
        isCalculator: p.isCalculator === true,
        variants: existingVariants,
    });
    showModal.value = true;
};

const closeModal = () => (showModal.value = false);

// refresh helper uses fetchAll if available
const refresh = async () => {
    if (productsStore.fetchAll)
        await productsStore.fetchAll({ fallback: localProducts });
};

/*
  Save logic:
  - keep original validation and payload building
  - use store.upsert when available
  - otherwise fallback to modifying local arrays (minimal operations)
*/
const save = async () => {
    const name = String(form.name || "").trim();
    const price = Number(String(form.price ?? "").replace(/[^0-9]/g, "")) || 0;
    const type = form.type;

    if (!name) return alert("Nama produk wajib diisi.");
    if (
        (!price || price <= 0) &&
        !form.isCalculator &&
        form.variants.length === 0
    )
        return alert("Harga atau Varian harus diisi.");

    const id =
        editingProduct.value?.id ||
        (showAdvanced.value && form.id?.trim()
            ? form.id.trim()
            : slugify(name));
    if (!id) return alert("ID gagal dibuat.");

    const base = editingProduct.value ? { ...editingProduct.value } : {};
    const cleanVariants = form.variants
        .map((v) => ({ name: v.name.trim(), price: Number(v.price || 0) }))
        .filter((v) => v.name !== "");
    const isCalc = type === "calculator" || form.isCalculator;

    const payload = {
        ...base,
        id,
        name,
        price,
        category: type,
        isActive: !!form.isActive,
        order: Number(form.order || 0),
        isCalculator: isCalc,
        variants: cleanVariants,
        iconType:
            showAdvanced.value && form.iconType?.trim()
                ? form.iconType.trim()
                : base.iconType || ICON_BY_TYPE[type] || ICON_BY_TYPE.special,
        desc:
            showAdvanced.value && form.desc?.trim()
                ? form.desc.trim()
                : base.desc ||
                  DEFAULT_DESC_BY_TYPE[type] ||
                  DEFAULT_DESC_BY_TYPE.special,
        tag:
            showAdvanced.value && form.tag?.trim()
                ? form.tag.trim()
                : base.tag ||
                  DEFAULT_TAG_BY_TYPE[type] ||
                  DEFAULT_TAG_BY_TYPE.special,
        discountPrice: base.discountPrice ?? 0,
        eta: base.eta ?? "",
        singleSelection: base.singleSelection ?? false,
        config:
            base.config && typeof base.config === "object" ? base.config : {},
    };

    // call upsert or fallback; keep minimal mutations to reduce reactivity churn
    let ok = true;
    if (productsStore.upsert) {
        ok = await productsStore.upsert(payload);
    } else {
        // fallback: try to upsert into items or all
        try {
            const listRef = productsStore.items || productsStore.all;
            if (Array.isArray(listRef)) {
                const idx = listRef.findIndex((x) => x.id === payload.id);
                if (idx >= 0) {
                    listRef.splice(idx, 1, payload);
                } else {
                    listRef.push(payload);
                }
            } else {
                // assign a new array to trigger reactivity safely
                productsStore.items = [...(productsStore.items || []), payload];
            }
            ok = true;
        } catch (e) {
            // keep behavior consistent with previous implementation
            // eslint-disable-next-line no-console
            console.error("Fallback upsert failed", e);
            ok = false;
        }
    }

    if (!ok) {
        alert(
            productsStore.error ||
                "Gagal menyimpan produk. Cek permission / koneksi.",
        );
        return;
    }

    await refresh();
    closeModal();
};

// Toggle active with store fallback
const toggleActive = async (p) => {
    if (productsStore.upsert) {
        await productsStore.upsert({ ...p, isActive: !(p.isActive !== false) });
    } else {
        try {
            const listRef = productsStore.items || productsStore.all;
            if (Array.isArray(listRef)) {
                const idx = listRef.findIndex((x) => x.id === p.id);
                if (idx >= 0) {
                    const copy = {
                        ...listRef[idx],
                        isActive: !(p.isActive !== false),
                    };
                    listRef.splice(idx, 1, copy);
                }
            } else {
                productsStore.items = (productsStore.items || []).map((x) =>
                    x.id === p.id
                        ? { ...x, isActive: !(p.isActive !== false) }
                        : x,
                );
            }
        } catch (e) {
            // eslint-disable-next-line no-console
            console.error("Fallback toggleActive failed", e);
        }
    }
    await refresh();
};

// Remove with fallback
const remove = async (p) => {
    if (!confirm(`Hapus "${p.name}"?`)) return;
    if (productsStore.remove) {
        await productsStore.remove(p.id);
    } else {
        try {
            const listRef = productsStore.items || productsStore.all;
            if (Array.isArray(listRef)) {
                const idx = listRef.findIndex((x) => x.id === p.id);
                if (idx >= 0) listRef.splice(idx, 1);
            } else {
                productsStore.items = (productsStore.items || []).filter(
                    (x) => x.id !== p.id,
                );
            }
        } catch (e) {
            // eslint-disable-next-line no-console
            console.error("Fallback remove failed", e);
        }
    }
    await refresh();
};

// Seed with fallback
const seed = async () => {
    if (!confirm("Reset database?")) return;
    if (productsStore.seed) {
        await productsStore.seed(localProducts);
    } else {
        try {
            if (Array.isArray(productsStore.items)) {
                productsStore.items.splice(
                    0,
                    productsStore.items.length,
                    ...localProducts,
                );
            } else if (Array.isArray(productsStore.all)) {
                productsStore.all.splice(
                    0,
                    productsStore.all.length,
                    ...localProducts,
                );
            } else {
                productsStore.items = [...localProducts];
            }
        } catch (e) {
            // eslint-disable-next-line no-console
            console.error("Fallback seed failed", e);
        }
    }
    await refresh();
};

// UI helpers (icons + colors - unchanged look)
const TypeIcon = (type) =>
    TYPE_ICON_COMPONENT[type] || TYPE_ICON_COMPONENT.special;

const getCardGradient = (type) => {
    if (type === "heart")
        return "from-pink-500/10 to-rose-500/5 border-pink-200/50 dark:border-pink-500/20";
    if (type === "candlerun")
        return "from-orange-500/10 to-amber-500/5 border-orange-200/50 dark:border-orange-500/20";
    if (type === "calculator")
        return "from-indigo-500/10 to-violet-500/5 border-indigo-200/50 dark:border-indigo-500/20";
    return "from-sky-500/10 to-blue-500/5 border-sky-200/50 dark:border-sky-500/20";
};
const getIconColor = (type) => {
    if (type === "heart") return "text-pink-500";
    if (type === "candlerun") return "text-orange-500";
    if (type === "calculator") return "text-indigo-500";
    return "text-sky-500";
};
// ====== UI helpers (Admin cards) ======
const getGlowClass = (type) => {
    if (type === "heart") return "bg-rose-300/50 dark:bg-rose-500/25";
    if (type === "pass") return "bg-amber-200/60 dark:bg-amber-500/20";
    if (type === "special") return "bg-violet-200/60 dark:bg-violet-500/20";
    if (type === "calculator") return "bg-indigo-200/60 dark:bg-indigo-500/20";
    return "bg-sky-200/60 dark:bg-sky-500/20";
};

const getBadgeClass = (type) => {
    if (type === "heart")
        return "bg-rose-500/10 text-rose-700 dark:text-rose-200 border-rose-300/40 dark:border-rose-500/30";
    if (type === "pass")
        return "bg-amber-500/10 text-amber-700 dark:text-amber-200 border-amber-300/40 dark:border-amber-500/30";
    if (type === "special")
        return "bg-violet-500/10 text-violet-700 dark:text-violet-200 border-violet-300/40 dark:border-violet-500/30";
    if (type === "calculator")
        return "bg-indigo-500/10 text-indigo-700 dark:text-indigo-200 border-indigo-300/40 dark:border-indigo-500/30";
    return "bg-sky-500/10 text-sky-700 dark:text-sky-200 border-sky-300/40 dark:border-sky-500/30";
};

// Price helpers - left mostly the same, optimized small allocations
const effectivePriceNumber = (p) => {
    if (!p || p.isCalculator) return 0;

    const discount = Number(p.discountPrice || 0);
    if (discount > 0) return discount;

    const base = Number(p.price || 0);
    const variants = Array.isArray(p.variants) ? p.variants : [];
    if (variants.length) {
        // compute min once
        const mapped = variants.map((v) => Number(v?.price || 0));
        const finites = mapped.filter((n) => Number.isFinite(n) && n > 0);
        if (finites.length) {
            const minVar = Math.min(...finites);
            if (Number.isFinite(minVar) && minVar > 0) return minVar;
        }
    }

    return Number.isFinite(base) ? base : 0;
};

const priceText = (p) => {
    if (!p) return formatRupiah(0);
    if (p.isCalculator) return "Auto Calc";
    return formatRupiah(effectivePriceNumber(p));
};
</script>

<template>
    <div class="animate-in fade-in slide-in-from-bottom-6 pb-24">
        <!-- HEADER -->
        <div
            class="sticky top-0 z-30 pt-2 pb-6 -mx-2 px-2 bg-gradient-to-b from-[#f8f9fd] via-[#f8f9fd]/95 to-transparent dark:from-[#0f172a] dark:via-[#0f172a]/95"
        >
            <div class="flex flex-col md:flex-row md:items-center gap-4">
                <div class="flex-1 relative group">
                    <div
                        class="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors"
                    >
                        <Search :size="18" stroke-width="2.5" />
                    </div>
                    <input
                        v-model="searchInput"
                        placeholder="Search Sky Products..."
                        class="w-full pl-12 pr-4 py-3.5 rounded-[1.5rem] bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border border-slate-200/60 dark:border-white/10 shadow-sm focus:ring-4 focus:ring-indigo-500/10 text-sm font-bold transition-all"
                    />
                </div>
                <div class="flex gap-3">
                    <button
                        @click="seed"
                        class="px-5 py-3.5 rounded-[1.5rem] bg-white/60 dark:bg-slate-800/60 backdrop-blur-md border border-slate-200 dark:border-white/10 text-slate-500 hover:bg-white transition-all active:scale-95"
                    >
                        <Package :size="18" />
                    </button>
                    <button
                        @click="openAdd"
                        class="pl-4 pr-6 py-3.5 rounded-[1.5rem] bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 text-xs font-bold tracking-wide flex items-center gap-2 transition-all hover:-translate-y-0.5 active:scale-95"
                    >
                        <div class="bg-white/20 p-1 rounded-full">
                            <Plus :size="14" stroke-width="3" />
                        </div>
                        ADD NEW
                    </button>
                </div>
            </div>
        </div>

        <!-- GRID -->
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            <div
                v-for="p in filteredProducts"
                :key="p.id"
                class="group relative rounded-[2rem] border overflow-hidden p-5 sm:p-6 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl"
                :class="[
                    'bg-gradient-to-br backdrop-blur-sm',
                    getCardGradient(p.category),
                    'bg-white/70 dark:bg-slate-900/60 border-slate-200/60 dark:border-white/10',
                ]"
            >
                <!-- soft glow -->
                <div
                    class="pointer-events-none absolute -inset-12 opacity-40 blur-2xl"
                    :class="getGlowClass(p.category)"
                ></div>

                <div
                    class="relative z-10 flex items-start justify-between gap-3"
                >
                    <div class="flex items-start gap-3 min-w-0">
                        <div class="relative shrink-0">
                            <div
                                class="w-12 h-12 rounded-2xl flex items-center justify-center border shadow-sm"
                                :class="[
                                    'bg-white/80 dark:bg-slate-900/40 border-slate-200/60 dark:border-white/10',
                                ]"
                            >
                                <component
                                    :is="TypeIcon(p.category)"
                                    :size="22"
                                    :class="getIconColor(p.category)"
                                    stroke-width="2.5"
                                />
                            </div>
                            <div
                                class="absolute -right-1 -bottom-1 w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-black border shadow-sm"
                                :class="[
                                    'bg-white/90 dark:bg-slate-900/70 border-slate-200/60 dark:border-white/10 text-slate-700 dark:text-slate-100',
                                ]"
                                title="Cute badge"
                            >
                                ✨
                            </div>
                        </div>

                        <div class="min-w-0">
                            <div class="flex flex-wrap items-center gap-2">
                                <span
                                    class="px-2 py-1 rounded-full text-[10px] font-black tracking-widest uppercase border"
                                    :class="getBadgeClass(p.category)"
                                >
                                    {{ p.category }}
                                </span>

                                <span
                                    v-if="p.isCalculator"
                                    class="px-2 py-1 rounded-full text-[10px] font-black tracking-widest uppercase border bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-300/40 dark:border-indigo-500/30"
                                >
                                    CALC
                                </span>

                                <span
                                    v-if="(p.variants || []).length"
                                    class="px-2 py-1 rounded-full text-[10px] font-black tracking-widest uppercase border bg-slate-900/5 dark:bg-white/10 text-slate-700 dark:text-slate-200 border-slate-200/60 dark:border-white/10"
                                >
                                    {{ (p.variants || []).length }} VAR
                                </span>

                                <span
                                    v-if="p.isActive === false"
                                    class="px-2 py-1 rounded-full text-[10px] font-black tracking-widest uppercase border bg-slate-400/10 text-slate-600 dark:text-slate-300 border-slate-300/50 dark:border-white/10"
                                >
                                    PAUSED
                                </span>
                            </div>

                            <h4
                                class="mt-2 text-[15px] sm:text-[16px] font-black leading-snug line-clamp-2 text-slate-900 dark:text-white"
                            >
                                {{ p.name }}
                            </h4>

                            <p
                                v-if="p.tag"
                                class="mt-1 text-[11px] text-slate-600/80 dark:text-slate-300/80 line-clamp-1"
                            >
                                {{ p.tag }}
                            </p>
                        </div>
                    </div>

                    <!-- switch -->
                    <button
                        @click="toggleActive(p)"
                        class="shrink-0 h-9 px-3 rounded-full font-black text-[11px] tracking-widest uppercase border transition-all active:scale-[0.98]"
                        :class="
                            p.isActive !== false
                                ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-300/40 dark:border-emerald-500/30 hover:bg-emerald-500/15'
                                : 'bg-slate-500/10 text-slate-600 dark:text-slate-300 border-slate-300/50 dark:border-white/10 hover:bg-slate-500/15'
                        "
                        title="Aktif / Pause"
                    >
                        {{ p.isActive !== false ? "Aktif" : "Pause" }}
                    </button>
                </div>

                <div
                    class="relative z-10 mt-5 flex items-end justify-between gap-3"
                >
                    <div class="min-w-0">
                        <p
                            class="text-[10px] font-black tracking-widest text-slate-400 uppercase"
                        >
                            Harga
                        </p>

                        <p
                            class="mt-1 text-[20px] sm:text-[22px] font-black tabular-nums tracking-tight leading-none"
                            :class="
                                p.isActive !== false
                                    ? 'text-slate-900 dark:text-white'
                                    : 'text-slate-400 line-through'
                            "
                        >
                            {{ priceText(p) }}
                        </p>

                        <p
                            v-if="
                                p.discountPrice && Number(p.discountPrice) > 0
                            "
                            class="mt-1 text-[11px] text-slate-400 line-through tabular-nums"
                        >
                            {{ formatRupiah(p.price || 0) }}
                        </p>

                        <p
                            v-if="
                                (p.variants || []).length &&
                                (!p.price || Number(p.price) <= 0) &&
                                !p.isCalculator
                            "
                            class="mt-1 text-[11px] text-slate-500 dark:text-slate-400"
                        >
                            Mulai dari var termurah ✨
                        </p>
                    </div>

                    <div class="flex gap-2">
                        <button
                            @click="openEdit(p)"
                            class="w-11 h-11 rounded-2xl border flex items-center justify-center transition-all hover:scale-[1.02] active:scale-[0.98]"
                            :class="[
                                'bg-white/80 dark:bg-slate-900/40 border-slate-200/60 dark:border-white/10 text-slate-700 dark:text-slate-200 hover:bg-white',
                            ]"
                            title="Edit"
                        >
                            <Pencil :size="18" stroke-width="2.5" />
                        </button>

                        <button
                            @click="remove(p)"
                            class="w-11 h-11 rounded-2xl border flex items-center justify-center transition-all hover:scale-[1.02] active:scale-[0.98]"
                            :class="[
                                'bg-rose-500/10 border-rose-300/40 dark:border-rose-500/30 text-rose-600 dark:text-rose-300 hover:bg-rose-500/15',
                            ]"
                            title="Hapus"
                        >
                            <Trash2 :size="18" stroke-width="2.5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- MODAL -->
        <Teleport to="body">
            <transition name="modal-bounce">
                <div
                    v-if="showModal"
                    class="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 sm:p-6"
                >
                    <div
                        class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
                        @click="closeModal"
                    ></div>

                    <div
                        class="relative w-full max-w-lg max-h-[85vh] overflow-y-auto custom-scrollbar bg-white/95 dark:bg-[#1e293b]/95 backdrop-blur-md rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl border border-white/20 ring-1 ring-black/5 p-5 sm:p-8 flex flex-col animate-in slide-in-from-bottom-4 sm:zoom-in-95"
                    >
                    <div
                        class="flex items-center justify-between mb-8 sticky top-0 bg-inherit z-10 pb-2 border-b border-dashed border-slate-200 dark:border-white/10"
                    >
                        <div>
                            <h2
                                class="text-2xl font-black text-slate-800 dark:text-white"
                            >
                                {{
                                    editingProduct
                                        ? "Edit Product"
                                        : "New Product"
                                }}
                            </h2>
                            <p class="text-xs font-semibold text-slate-400">
                                Manage your sky service item
                            </p>
                        </div>
                        <button
                            @click="closeModal"
                            class="p-2 rounded-full bg-slate-100 dark:bg-white/10 text-slate-500 hover:bg-slate-200 transition-colors"
                        >
                            <X :size="20" />
                        </button>
                    </div>

                    <div class="space-y-6">
                        <div class="space-y-2">
                            <label
                                class="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1"
                                >Category</label
                            >
                            <div
                                class="grid grid-cols-4 gap-2 bg-slate-100 dark:bg-black/20 p-1.5 rounded-2xl"
                            >
                                <button
                                    v-for="t in [
                                        'special',
                                        'heart',
                                        'candlerun',
                                        'calculator',
                                    ]"
                                    :key="t"
                                    @click="form.type = t"
                                    class="flex flex-col items-center justify-center py-2 rounded-xl transition-all duration-300"
                                    :class="
                                        form.type === t
                                            ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-300 scale-100 font-bold'
                                            : 'text-slate-400 scale-95 hover:bg-white/50'
                                    "
                                >
                                    <component
                                        :is="TypeIcon(t)"
                                        :size="18"
                                        class="mb-1"
                                    /><span class="text-[9px] uppercase">{{
                                        t === "calculator" ? "Calc" : t
                                    }}</span>
                                </button>
                            </div>
                        </div>

                        <div class="space-y-4">
                            <div class="group">
                                <label
                                    class="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1 mb-1 block"
                                    >Product Name</label
                                >
                                <input
                                    v-model="form.name"
                                    placeholder="e.g. Daily Heart"
                                    class="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border-2 border-transparent focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500/30 outline-none font-bold text-slate-700 dark:text-slate-200 transition-all"
                                />
                            </div>
                            <div class="group">
                                <label
                                    class="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1 mb-1 block"
                                >
                                    {{
                                        form.type === "calculator" ||
                                        form.isCalculator
                                            ? "Unit Price (Per 1 Item)"
                                            : "Price (IDR)"
                                    }}
                                </label>
                                <div class="relative">
                                    <span
                                        class="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm"
                                        >Rp</span
                                    >
                                    <input
                                        v-model.number="form.price"
                                        type="number"
                                        placeholder="0"
                                        class="w-full pl-12 pr-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border-2 border-transparent focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500/30 outline-none font-black text-lg text-slate-700 dark:text-slate-200 tabular-nums transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        <div
                            class="bg-slate-50 dark:bg-slate-900/30 rounded-[1.5rem] p-1 border border-slate-100 dark:border-white/5 overflow-hidden"
                        >
                            <div
                                class="flex items-center justify-between px-4 py-3 bg-white dark:bg-white/5 rounded-t-[1.3rem] shadow-sm"
                            >
                                <div
                                    class="flex items-center gap-2 text-slate-600 dark:text-slate-300"
                                >
                                    <Layers
                                        :size="16"
                                        class="text-indigo-500"
                                    /><span
                                        class="text-xs font-bold uppercase tracking-wide"
                                        >Variants</span
                                    >
                                </div>
                                <button
                                    @click="addVariant"
                                    class="text-[10px] font-bold bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors"
                                >
                                    + ADD OPTION
                                </button>
                            </div>
                            <div class="p-2 space-y-1">
                                <div
                                    v-if="!form.variants.length"
                                    class="text-center py-6 text-slate-400 text-xs italic"
                                >
                                    No variants added.
                                </div>
                                <div
                                    v-for="(v, idx) in form.variants"
                                    :key="idx"
                                    class="flex items-center gap-2 p-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-white/5 shadow-sm"
                                >
                                    <div
                                        class="w-6 h-6 flex items-center justify-center text-slate-300 font-mono text-[10px]"
                                    >
                                        {{ idx + 1 }}
                                    </div>
                                    <input
                                        v-model="v.name"
                                        placeholder="Option Name"
                                        class="flex-1 bg-transparent text-xs font-bold outline-none text-slate-700 dark:text-slate-200"
                                    />
                                    <div
                                        class="flex items-center bg-slate-100 dark:bg-black/20 rounded-lg px-2 py-1"
                                    >
                                        <span
                                            class="text-[10px] text-slate-400 mr-1"
                                            >Rp</span
                                        ><input
                                            v-model.number="v.price"
                                            type="number"
                                            class="w-16 bg-transparent text-xs font-bold outline-none tabular-nums text-right"
                                            placeholder="0"
                                        />
                                    </div>
                                    <button
                                        @click="removeVariant(idx)"
                                        class="p-1.5 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                                    >
                                        <MinusCircle :size="16" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div class="pt-2">
                            <button
                                @click="showAdvanced = !showAdvanced"
                                class="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-indigo-500 transition-colors mx-auto"
                            >
                                <MoreHorizontal :size="16" />{{
                                    showAdvanced
                                        ? "Hide Advanced Settings"
                                        : "Show Advanced Settings"
                                }}
                            </button>
                        </div>

                        <div
                            v-if="showAdvanced"
                            class="grid grid-cols-2 gap-4 animate-in fade-in zoom-in-95"
                        >
                            <div class="col-span-2 group">
                                <label
                                    class="text-[10px] font-bold text-slate-400 ml-2 mb-1 block"
                                    >CUSTOM ID</label
                                >
                                <input
                                    v-model="form.id"
                                    placeholder="Auto-generated"
                                    class="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 text-xs font-mono text-slate-600 dark:text-slate-300 border-none"
                                />
                            </div>
                            <div class="group">
                                <label
                                    class="text-[10px] font-bold text-slate-400 ml-2 mb-1 block"
                                    >TAG LABEL</label
                                >
                                <input
                                    v-model="form.tag"
                                    placeholder="Label"
                                    class="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 text-xs font-bold border-none"
                                />
                            </div>
                            <div class="group">
                                <label
                                    class="text-[10px] font-bold text-slate-400 ml-2 mb-1 block"
                                    >ORDER</label
                                >
                                <input
                                    v-model.number="form.order"
                                    type="number"
                                    class="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 text-xs font-bold border-none"
                                />
                            </div>
                            <div class="col-span-2 group">
                                <label
                                    class="text-[10px] font-bold text-slate-400 ml-2 mb-1 block"
                                    >DESCRIPTION</label
                                >
                                <textarea
                                    v-model="form.desc"
                                    rows="2"
                                    class="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 text-xs font-medium border-none resize-none"
                                    placeholder="Short description..."
                                ></textarea>
                            </div>
                        </div>
                    </div>

                    <div
                        class="mt-8 pt-4 border-t border-slate-100 dark:border-white/10 flex gap-3"
                    >
                        <button
                            @click="closeModal"
                            class="flex-1 py-4 min-h-[48px] rounded-2xl font-bold text-sm text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors active:scale-[0.98]"
                        >
                            Cancel
                        </button>
                        <button
                            @click="save"
                            class="flex-[2] py-4 min-h-[48px] rounded-2xl bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-sm shadow-xl shadow-indigo-500/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                        >
                            <Check :size="18" stroke-width="3" /> Save Product
                        </button>
                    </div>
                </div>
            </div>
        </transition>
        </Teleport>
    </div>
</template>

<style scoped>
.modal-bounce-enter-active {
    transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.modal-bounce-leave-active {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.modal-bounce-enter-from,
.modal-bounce-leave-to {
    opacity: 0;
    transform: scale(0.9) translateY(20px);
}
.custom-scrollbar::-webkit-scrollbar {
    width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
    background-color: #cbd5e1;
    border-radius: 20px;
}
.dark .custom-scrollbar::-webkit-scrollbar-thumb {
    background-color: #334155;
}
input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
}
</style>
