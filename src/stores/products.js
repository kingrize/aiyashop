// LOKASI FILE: src/stores/products.js
import { defineStore } from "pinia";
import { db } from "../firebase";
import {
  collection,
  getDocs,
  setDoc,
  deleteDoc,
  doc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";

function normalizeProduct(p) {
  const out = { ...p };
  out.id = String(out.id || "").trim();
  out.name = out.name || "";
  out.category = out.category || "special";
  out.price = Number(out.price || 0);
  out.discountPrice = Number(out.discountPrice || 0);
  out.iconType = out.iconType || "sparkles";
  out.tag = out.tag || "";
  out.desc = out.desc || "";
  out.eta = out.eta || "";
  out.isActive = out.isActive !== false;
  out.isCalculator = out.isCalculator === true;
  out.singleSelection = out.singleSelection === true;
  out.variants = Array.isArray(out.variants) ? out.variants : [];
  out.config =
    out.config && typeof out.config === "object" && !Array.isArray(out.config)
      ? out.config
      : {};
  return out;
}

export const useProductsStore = defineStore("products", {
  state: () => ({
    all: [],
    isLoading: false,
    error: null,
    isUsingFallback: false,
    lastFetchedAt: 0,
  }),

  actions: {
    async fetchAll({ fallback = [] } = {}) {
      this.isLoading = true;
      this.error = null;
      try {
        const snap = await getDocs(collection(db, "products"));
        const list = snap.docs.map((d) =>
          normalizeProduct({ id: d.id, ...d.data() }),
        );

        // Kalau Firestore kosong → fallback
        if (list.length === 0 && Array.isArray(fallback) && fallback.length) {
          this.all = fallback.map((p) => normalizeProduct(p));
          this.isUsingFallback = true;
        } else {
          // Sort rapi: order → name
          list.sort((a, b) => {
            const ao = Number(a.order ?? 9999);
            const bo = Number(b.order ?? 9999);
            if (ao !== bo) return ao - bo;
            return String(a.name || "").localeCompare(String(b.name || ""));
          });
          this.all = list;
          this.isUsingFallback = false;
        }

        this.lastFetchedAt = Date.now();
        return true;
      } catch (e) {
        console.error("❌ fetch products:", e);
        this.error = e?.message || "Gagal load products";
        // fallback kalau error
        if (Array.isArray(fallback) && fallback.length) {
          this.all = fallback.map((p) => normalizeProduct(p));
          this.isUsingFallback = true;
        }
        return false;
      } finally {
        this.isLoading = false;
      }
    },

    async upsert(product) {
      try {
        const p = normalizeProduct(product);
        if (!p.id) throw new Error("Product id required");
        const ref = doc(db, "products", p.id);

        // preserve createdAt
        const existing = await getDoc(ref);
        const createdAt = existing.exists()
          ? existing.data().createdAt
          : serverTimestamp();

        await setDoc(
          ref,
          {
            ...p,
            createdAt,
            updatedAt: serverTimestamp(),
          },
          { merge: true },
        );

        await this.fetchAll();
        return true;
      } catch (e) {
        console.error("❌ upsert product:", e);
        this.error = e?.message || "Gagal simpan product";
        return false;
      }
    },

    async remove(id) {
      try {
        await deleteDoc(doc(db, "products", id));
        await this.fetchAll();
        return true;
      } catch (e) {
        console.error("❌ delete product:", e);
        this.error = e?.message || "Gagal hapus product";
        return false;
      }
    },

    async toggleActive(id, currentIsActive) {
      // currentIsActive = value sekarang, jadi kita toggle
      return this.upsert({ id, isActive: !(currentIsActive !== false) });
    },

    async seed(defaultProducts = []) {
      if (!Array.isArray(defaultProducts) || defaultProducts.length === 0)
        return false;
      try {
        // seed: overwrite per-id, biar consistent sama products.js
        await Promise.all(
          defaultProducts.map((p) =>
            setDoc(
              doc(db, "products", String(p.id)),
              {
                ...normalizeProduct(p),
                seededAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
              },
              { merge: true },
            ),
          ),
        );
        await this.fetchAll({ fallback: defaultProducts });
        this.isUsingFallback = false;
        return true;
      } catch (e) {
        console.error("❌ seed products:", e);
        this.error = e?.message || "Gagal seed products";
        return false;
      }
    },
  },

  getters: {
    activeProducts: (state) => state.all.filter((p) => p.isActive !== false),
  },
});
