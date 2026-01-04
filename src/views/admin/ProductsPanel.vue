<script setup>
import { ref, reactive, computed, onMounted } from "vue";
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
    List,
    MinusCircle,
    Layers,
    MoreHorizontal,
} from "lucide-vue-next";

const productsStore = useProductsStore();

const productSearch = ref("");
const showModal = ref(false);
const editingProduct = ref(null);
const showAdvanced = ref(false);

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
const iconByType = (type) => {
    if (type === "heart") return "heart";
    if (type === "candlerun") return "flame";
    if (type === "calculator") return "calculator";
    return "sparkles";
};

const defaultDescByType = (type) => {
    if (type === "heart") return "Cozy heart service ✨";
    if (type === "candlerun") return "Warm & cozy candle run 🕯️";
    if (type === "calculator") return "Custom Heart Calculation 🧮";
    return "Soft vibe service ☁️";
};

const defaultTagByType = (type) => {
    if (type === "heart") return "Cute pick ✨";
    if (type === "candlerun") return "Warm & cozy 🕯️";
    if (type === "calculator") return "Calculator 🧮";
    return "Soft vibe ☁️";
};

const slugify = (str) =>
    String(str || "")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .slice(0, 48);

onMounted(async () => {
    if (productsStore.fetchAll)
        await productsStore.fetchAll({ fallback: localProducts });
});

const items = computed(() => productsStore.items || productsStore.all || []);
const filteredProducts = computed(() => {
    const q = productSearch.value.trim().toLowerCase();
    let list = items.value || [];
    if (q) {
        list = list.filter(
            (p) =>
                String(p.name || "")
                    .toLowerCase()
                    .includes(q) ||
                String(p.id || "")
                    .toLowerCase()
                    .includes(q) ||
                String(p.category || "")
                    .toLowerCase()
                    .includes(q),
        );
    }
    return [...list].sort((a, b) => {
        const ao = Number(a.order ?? 9999);
        const bo = Number(b.order ?? 9999);
        if (ao !== bo) return ao - bo;
        return String(a.name || "").localeCompare(String(b.name || ""));
    });
});

const addVariant = () => form.variants.push({ name: "", price: 0 });
const removeVariant = (index) => form.variants.splice(index, 1);

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
const refresh = async () => {
    if (productsStore.fetchAll)
        await productsStore.fetchAll({ fallback: localProducts });
};

const save = async () => {
    const name = String(form.name || "").trim();
    const price = Number(form.price || 0);
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
                : base.iconType || iconByType(type),
        desc:
            showAdvanced.value && form.desc?.trim()
                ? form.desc.trim()
                : base.desc || defaultDescByType(type),
        tag:
            showAdvanced.value && form.tag?.trim()
                ? form.tag.trim()
                : base.tag || defaultTagByType(type),
        discountPrice: base.discountPrice ?? 0,
        eta: base.eta ?? "",
        singleSelection: base.singleSelection ?? false,
        config:
            base.config && typeof base.config === "object" ? base.config : {},
    };

    if (productsStore.upsert) await productsStore.upsert(payload);
    await refresh();
    closeModal();
};

const toggleActive = async (p) => {
    if (productsStore.upsert)
        await productsStore.upsert({ ...p, isActive: !(p.isActive !== false) });
    await refresh();
};

const remove = async (p) => {
    if (!confirm(`Hapus "${p.name}"?`)) return;
    if (productsStore.remove) await productsStore.remove(p.id);
    await refresh();
};

const seed = async () => {
    if (!confirm("Reset database?")) return;
    if (productsStore.seed) await productsStore.seed(localProducts);
    await refresh();
};

const TypeIcon = (type) => {
    if (type === "heart") return Heart;
    if (type === "candlerun") return Flame;
    if (type === "calculator") return Calculator;
    return Sparkles;
};

// Colors Helper
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
                    <!-- OPTIMASI: backdrop-blur-md cukup (xl berat) -->
                    <input
                        v-model="productSearch"
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
                class="group relative p-6 rounded-[2rem] bg-gradient-to-br backdrop-blur-sm transition-all duration-500 hover:-translate-y-1 hover:shadow-xl"
                :class="[
                    getCardGradient(p.category),
                    'bg-white/80 dark:bg-slate-900/70 shadow-sm',
                ]"
            >
                <div
                    class="absolute -right-10 -top-10 w-32 h-32 bg-current opacity-[0.03] blur-3xl rounded-full pointer-events-none"
                    :class="getIconColor(p.category)"
                ></div>

                <div
                    class="flex justify-between items-start mb-4 relative z-10"
                >
                    <div class="flex items-center gap-3">
                        <div
                            class="p-3 rounded-2xl bg-white dark:bg-white/5 shadow-sm border border-slate-100 dark:border-white/5 text-slate-400"
                            :class="[getIconColor(p.category)]"
                        >
                            <component
                                :is="TypeIcon(p.category)"
                                :size="20"
                                stroke-width="2.5"
                            />
                        </div>
                        <div>
                            <p
                                class="text-[10px] font-black uppercase tracking-widest opacity-50 mb-0.5 flex items-center gap-1.5"
                            >
                                {{ p.category || "General" }}
                                <span
                                    v-if="p.variants?.length"
                                    class="bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 px-1.5 py-0.5 rounded text-[8px]"
                                    >{{ p.variants.length }} VARIANTS</span
                                >
                            </p>
                            <h4
                                class="text-base font-black text-slate-800 dark:text-slate-100 leading-tight line-clamp-1"
                            >
                                {{ p.name }}
                            </h4>
                        </div>
                    </div>
                    <button
                        @click="toggleActive(p)"
                        class="w-12 h-7 rounded-full p-1 transition-colors focus:outline-none flex items-center shadow-inner"
                        :class="
                            p.isActive !== false
                                ? 'bg-emerald-400/20 dark:bg-emerald-500/20'
                                : 'bg-slate-200 dark:bg-slate-700'
                        "
                    >
                        <div
                            class="w-5 h-5 rounded-full shadow-md transform transition-transform flex items-center justify-center"
                            :class="[
                                p.isActive !== false
                                    ? 'translate-x-5 bg-emerald-500 text-white'
                                    : 'translate-x-0 bg-white text-slate-400',
                            ]"
                        >
                            <Check
                                v-if="p.isActive !== false"
                                :size="10"
                                stroke-width="4"
                            /><X v-else :size="10" stroke-width="4" />
                        </div>
                    </button>
                </div>

                <div
                    class="flex items-end justify-between relative z-10 mt-6 pt-4 border-t border-slate-100/50 dark:border-white/5"
                >
                    <div>
                        <p class="text-[10px] font-bold text-slate-400 mb-0.5">
                            PRICE
                        </p>
                        <p
                            class="text-xl font-black tabular-nums tracking-tight"
                            :class="
                                p.isActive !== false
                                    ? 'text-slate-800 dark:text-white'
                                    : 'text-slate-400 line-through'
                            "
                        >
                            {{
                                p.isCalculator
                                    ? "Auto Calc"
                                    : formatRupiah(p.price || 0)
                            }}
                        </p>
                    </div>
                    <div
                        class="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0"
                    >
                        <button
                            @click="openEdit(p)"
                            class="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300 hover:bg-indigo-100 transition-colors"
                        >
                            <Pencil :size="16" stroke-width="2.5" />
                        </button>
                        <button
                            @click="remove(p)"
                            class="p-2.5 rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-300 hover:bg-rose-100 transition-colors"
                        >
                            <Trash2 :size="16" stroke-width="2.5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- MODAL -->
        <transition name="modal-bounce">
            <div
                v-if="showModal"
                class="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
            >
                <!-- OPTIMASI: Opacity lebih pekat, blur dikurangi -->
                <div
                    class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
                    @click="closeModal"
                ></div>

                <div
                    class="relative w-full max-w-lg max-h-[85vh] overflow-y-auto custom-scrollbar bg-white/95 dark:bg-[#1e293b]/95 backdrop-blur-md rounded-[2.5rem] shadow-2xl border border-white/20 ring-1 ring-black/5 p-6 sm:p-8 flex flex-col"
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
                                    >{{
                                        form.type === "calculator" ||
                                        form.isCalculator
                                            ? "Unit Price (Per 1 Item)"
                                            : "Price (IDR)"
                                    }}</label
                                >
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
                                ><input
                                    v-model="form.id"
                                    placeholder="Auto-generated"
                                    class="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 text-xs font-mono text-slate-600 dark:text-slate-300 border-none"
                                />
                            </div>
                            <div class="group">
                                <label
                                    class="text-[10px] font-bold text-slate-400 ml-2 mb-1 block"
                                    >TAG LABEL</label
                                ><input
                                    v-model="form.tag"
                                    placeholder="Label"
                                    class="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 text-xs font-bold border-none"
                                />
                            </div>
                            <div class="group">
                                <label
                                    class="text-[10px] font-bold text-slate-400 ml-2 mb-1 block"
                                    >ORDER</label
                                ><input
                                    v-model.number="form.order"
                                    type="number"
                                    class="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 text-xs font-bold border-none"
                                />
                            </div>
                            <div class="col-span-2 group">
                                <label
                                    class="text-[10px] font-bold text-slate-400 ml-2 mb-1 block"
                                    >DESCRIPTION</label
                                ><textarea
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
                            class="flex-1 py-4 rounded-2xl font-bold text-sm text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            @click="save"
                            class="flex-[2] py-4 rounded-2xl bg-slate-900 dark:bg-indigo-600 text-white font-bold text-sm shadow-xl shadow-indigo-500/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                        >
                            <Check :size="18" stroke-width="3" /> Save Product
                        </button>
                    </div>
                </div>
            </div>
        </transition>
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