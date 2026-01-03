<script setup>
import { ref, reactive, computed, onMounted } from "vue";
import { useProductsStore } from "../../stores/products";
import { products as localProducts } from "../../data/products";
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

    // advanced optional
    id: "",
    desc: "",
    tag: "",
    iconType: "",
});

const formatRupiah = (val) =>
    new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
    }).format(val || 0);

const iconByType = (type) => {
    if (type === "heart") return "heart";
    if (type === "candlerun") return "flame";
    return "sparkles";
};

const defaultDescByType = (type) => {
    if (type === "heart") return "Cozy heart service ✨";
    if (type === "candlerun") return "Warm & cozy candle run 🕯️";
    return "Soft vibe service ☁️";
};

const defaultTagByType = (type) => {
    if (type === "heart") return "Cute pick ✨";
    if (type === "candlerun") return "Warm & cozy 🕯️";
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
    // kompatibel dengan store versi mana pun
    if (productsStore.fetchAll)
        await productsStore.fetchAll({ fallback: localProducts });
    else if (productsStore.fetchAllProducts)
        await productsStore.fetchAllProducts();
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
    });
    showModal.value = true;
};

const openEdit = (p) => {
    editingProduct.value = p;
    showAdvanced.value = false;
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
    });
    showModal.value = true;
};

const closeModal = () => (showModal.value = false);

const refresh = async () => {
    if (productsStore.fetchAll)
        await productsStore.fetchAll({ fallback: localProducts });
    else if (productsStore.fetchAllProducts)
        await productsStore.fetchAllProducts();
};

const save = async () => {
    const name = String(form.name || "").trim();
    const price = Number(form.price || 0);
    const type = form.type;

    if (!name) return alert("Nama produk wajib diisi.");
    if (!price || price <= 0) return alert("Harga harus > 0.");

    const id =
        editingProduct.value?.id ||
        (showAdvanced && form.id?.trim() ? form.id.trim() : slugify(name));

    if (!id) return alert("ID gagal dibuat. Coba ubah nama.");

    const base = editingProduct.value ? { ...editingProduct.value } : {};

    const payload = {
        ...base,
        id,
        name,
        price,
        category: type,
        isActive: !!form.isActive,
        order: Number(form.order || 0),

        // auto defaults (simple mode)
        iconType:
            showAdvanced && form.iconType?.trim()
                ? form.iconType.trim()
                : base.iconType || iconByType(type),
        desc:
            showAdvanced && form.desc?.trim()
                ? form.desc.trim()
                : base.desc || defaultDescByType(type),
        tag:
            showAdvanced && form.tag?.trim()
                ? form.tag.trim()
                : base.tag || defaultTagByType(type),

        // keep advanced fields if already exist
        discountPrice: base.discountPrice ?? 0,
        eta: base.eta ?? "",
        isCalculator: base.isCalculator ?? false,
        singleSelection: base.singleSelection ?? false,
        variants: Array.isArray(base.variants) ? base.variants : [],
        config:
            base.config &&
            typeof base.config === "object" &&
            !Array.isArray(base.config)
                ? base.config
                : {},
    };

    if (productsStore.upsert) {
        const ok = await productsStore.upsert(payload);
        if (ok === false) return alert(productsStore.error || "Gagal simpan.");
    } else if (productsStore.saveProduct) {
        await productsStore.saveProduct(payload);
    } else {
        return alert("Products store belum punya method upsert/saveProduct.");
    }

    await refresh();
    closeModal();
};

const toggleActive = async (p) => {
    if (productsStore.patch) {
        await productsStore.patch(p.id, { isActive: !(p.isActive !== false) });
    } else if (productsStore.toggleActive) {
        await productsStore.toggleActive(p.id, p.isActive);
    } else if (productsStore.upsert) {
        await productsStore.upsert({ ...p, isActive: !(p.isActive !== false) });
    }
    await refresh();
};

const remove = async (p) => {
    if (!confirm(`Hapus "${p.name}"?`)) return;
    if (productsStore.remove) await productsStore.remove(p.id);
    else if (productsStore.deleteProduct)
        await productsStore.deleteProduct(p.id);
    await refresh();
};

const seed = async () => {
    if (!confirm("Import semua produk dari products.js ke Firestore?")) return;
    if (productsStore.seed) {
        await productsStore.seed(localProducts);
    } else if (productsStore.upsert) {
        for (let i = 0; i < localProducts.length; i++) {
            const lp = localProducts[i];
            await productsStore.upsert({
                ...lp,
                isActive: lp.isActive ?? true,
                order: lp.order ?? i + 1,
            });
        }
    }
    await refresh();
};

const TypeIcon = (type) => {
    if (type === "heart") return Heart;
    if (type === "candlerun") return Flame;
    return Sparkles;
};
</script>

<template>
    <div class="animate-in fade-in slide-in-from-bottom-4">
        <div class="flex flex-col md:flex-row md:items-center gap-3 mb-5">
            <div class="flex-1 relative">
                <Search
                    :size="16"
                    class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                    v-model="productSearch"
                    placeholder="Cari produk (id / nama / tipe)..."
                    class="w-full pl-11 pr-4 py-3 rounded-2xl card-soft border border-white/60 dark:border-white/5 shadow-sm text-sm font-semibold"
                />
            </div>

            <div class="flex gap-2">
                <button
                    @click="seed"
                    class="px-4 py-3 rounded-2xl card-soft border border-white/60 dark:border-white/5 text-xs font-black text-slate-600 dark:text-slate-200 hover:opacity-90 flex items-center gap-2"
                >
                    <Package :size="16" /> Seed
                </button>

                <button
                    @click="openAdd"
                    class="px-4 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black shadow-lg btn-bouncy flex items-center gap-2"
                >
                    <Plus :size="16" /> Add
                </button>
            </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            <div
                v-for="p in filteredProducts"
                :key="p.id"
                class="card-soft p-5 rounded-[2rem] border border-white/60 dark:border-white/5 shadow-sm"
            >
                <div class="flex items-start justify-between gap-3">
                    <div class="min-w-0">
                        <p
                            class="text-[10px] font-black uppercase tracking-widest text-slate-400"
                        >
                            {{ p.category || "special" }} • #{{ p.order || 0 }}
                        </p>
                        <h4
                            class="text-base font-black text-slate-900 dark:text-white truncate"
                        >
                            {{ p.name }}
                        </h4>
                        <p
                            class="text-[11px] text-slate-500 dark:text-slate-400 truncate"
                        >
                            id: <span class="font-mono">{{ p.id }}</span>
                        </p>
                    </div>

                    <button
                        @click="toggleActive(p)"
                        class="px-3 py-1.5 rounded-xl text-[10px] font-black border"
                        :class="
                            p.isActive !== false
                                ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                                : 'bg-slate-100 text-slate-500 border-slate-200'
                        "
                    >
                        {{ p.isActive !== false ? "ACTIVE" : "OFF" }}
                    </button>
                </div>

                <div class="mt-4 flex items-center justify-between">
                    <div>
                        <p
                            class="text-[10px] font-black uppercase tracking-widest text-slate-400"
                        >
                            Harga
                        </p>
                        <p
                            class="text-lg font-black text-slate-900 dark:text-white tabular-nums"
                        >
                            {{ formatRupiah(p.price || 0) }}
                        </p>
                    </div>

                    <div class="flex items-center gap-2">
                        <button
                            @click="openEdit(p)"
                            class="p-2 rounded-xl bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-200 hover:opacity-90"
                            aria-label="Edit"
                        >
                            <Pencil :size="16" />
                        </button>

                        <button
                            @click="remove(p)"
                            class="p-2 rounded-xl bg-rose-100/80 dark:bg-rose-500/15 text-rose-600 hover:opacity-90"
                            aria-label="Delete"
                        >
                            <Trash2 :size="16" />
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Modal -->
        <transition name="fade">
            <div
                v-if="showModal"
                class="fixed inset-0 z-[80] flex items-center justify-center p-4"
            >
                <div
                    class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                    @click="closeModal"
                ></div>

                <div
                    class="relative z-10 w-full max-w-md rounded-[2rem] card-soft border border-white/60 dark:border-white/5 shadow-2xl p-5"
                >
                    <div class="flex items-start justify-between gap-3 mb-4">
                        <div>
                            <h3
                                class="text-lg font-black text-slate-900 dark:text-white"
                            >
                                {{
                                    editingProduct
                                        ? "Edit Product"
                                        : "Add Product"
                                }}
                            </h3>
                            <p class="text-xs text-slate-400 mt-0.5">
                                Simple: pilih tipe, nama, harga.
                            </p>
                        </div>

                        <button
                            @click="closeModal"
                            class="p-2 rounded-xl bg-slate-100 dark:bg-white/10 text-slate-500"
                            aria-label="Close"
                        >
                            <X :size="18" />
                        </button>
                    </div>

                    <div class="grid grid-cols-1 gap-3">
                        <label
                            class="text-[11px] font-black text-slate-500 dark:text-slate-300"
                        >
                            Type Card
                            <div class="mt-1 relative">
                                <select
                                    v-model="form.type"
                                    class="w-full px-4 py-3 rounded-2xl card-soft border border-white/60 dark:border-white/5 text-sm font-bold"
                                >
                                    <option value="special">
                                        special (soft)
                                    </option>
                                    <option value="heart">heart</option>
                                    <option value="candlerun">candlerun</option>
                                </select>

                                <div
                                    class="absolute right-3 top-1/2 -translate-y-1/2 opacity-70"
                                >
                                    <component
                                        :is="TypeIcon(form.type)"
                                        :size="18"
                                    />
                                </div>
                            </div>
                        </label>

                        <label
                            class="text-[11px] font-black text-slate-500 dark:text-slate-300"
                        >
                            Nama Product
                            <input
                                v-model="form.name"
                                placeholder="Contoh: Daily Heart (Via Bot)"
                                class="mt-1 w-full px-4 py-3 rounded-2xl card-soft border border-white/60 dark:border-white/5 text-sm font-bold"
                            />
                        </label>

                        <label
                            class="text-[11px] font-black text-slate-500 dark:text-slate-300"
                        >
                            Harga (IDR)
                            <input
                                v-model.number="form.price"
                                type="number"
                                min="1"
                                placeholder="10000"
                                class="mt-1 w-full px-4 py-3 rounded-2xl card-soft border border-white/60 dark:border-white/5 text-sm font-bold tabular-nums"
                            />
                        </label>

                        <div class="flex items-center justify-between pt-1">
                            <label
                                class="flex items-center gap-2 text-xs font-black text-slate-500 dark:text-slate-300"
                            >
                                <input
                                    type="checkbox"
                                    v-model="form.isActive"
                                />
                                Active
                            </label>

                            <button
                                @click="showAdvanced = !showAdvanced"
                                class="text-xs font-black text-indigo-600 dark:text-indigo-300 hover:underline"
                                type="button"
                            >
                                {{
                                    showAdvanced ? "Hide Advanced" : "Advanced"
                                }}
                            </button>
                        </div>
                    </div>

                    <div v-if="showAdvanced" class="mt-3 space-y-3">
                        <label
                            class="text-[11px] font-black text-slate-500 dark:text-slate-300"
                        >
                            ID (optional)
                            <input
                                v-model="form.id"
                                placeholder="auto dari nama kalau kosong"
                                class="mt-1 w-full px-4 py-3 rounded-2xl card-soft border border-white/60 dark:border-white/5 text-sm font-bold font-mono"
                            />
                        </label>

                        <label
                            class="text-[11px] font-black text-slate-500 dark:text-slate-300"
                        >
                            Tag (optional)
                            <input
                                v-model="form.tag"
                                placeholder="auto dari type kalau kosong"
                                class="mt-1 w-full px-4 py-3 rounded-2xl card-soft border border-white/60 dark:border-white/5 text-sm font-bold"
                            />
                        </label>

                        <label
                            class="text-[11px] font-black text-slate-500 dark:text-slate-300"
                        >
                            Desc (optional)
                            <textarea
                                v-model="form.desc"
                                rows="3"
                                placeholder="auto dari type kalau kosong"
                                class="mt-1 w-full px-4 py-3 rounded-2xl card-soft border border-white/60 dark:border-white/5 text-sm font-semibold resize-none"
                            />
                        </label>

                        <label
                            class="text-[11px] font-black text-slate-500 dark:text-slate-300"
                        >
                            IconType (optional)
                            <input
                                v-model="form.iconType"
                                placeholder="auto heart/flame/sparkles"
                                class="mt-1 w-full px-4 py-3 rounded-2xl card-soft border border-white/60 dark:border-white/5 text-sm font-bold"
                            />
                        </label>

                        <label
                            class="text-[11px] font-black text-slate-500 dark:text-slate-300"
                        >
                            Order (optional)
                            <input
                                v-model.number="form.order"
                                type="number"
                                min="0"
                                class="mt-1 w-full px-4 py-3 rounded-2xl card-soft border border-white/60 dark:border-white/5 text-sm font-bold"
                            />
                        </label>
                    </div>

                    <div class="flex gap-2 mt-5">
                        <button
                            @click="closeModal"
                            class="flex-1 py-3 rounded-2xl bg-slate-100 dark:bg-white/10 font-black text-slate-600 dark:text-slate-200"
                            type="button"
                        >
                            Batal
                        </button>

                        <button
                            @click="save"
                            class="flex-1 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black shadow-lg btn-bouncy flex items-center justify-center gap-2"
                            type="button"
                        >
                            <Check :size="18" /> Simpan
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
    transition: opacity 0.18s ease;
}
.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>
