// LOKASI FILE: src/stores/promo.js
import { defineStore } from "pinia";
import { db } from "../firebase";
import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  collection,
  getDocs,
} from "firebase/firestore";

export const usePromoStore = defineStore("promo", {
  state: () => ({
    activeCode: null,
    discountAmount: 0,
    discountType: null,
    minOrder: 0, // State baru
    isLoading: false,
    error: null,
    allPromos: [],
  }),
  actions: {
    // --- USER ACTIONS ---
    async applyPromo(code) {
      this.isLoading = true;
      this.error = null;
      try {
        const docRef = doc(db, "promos", code.toUpperCase());
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.isActive === false) throw new Error("Kode ini non-aktif ⏸️");

          this.activeCode = code.toUpperCase();
          this.discountAmount = data.value;
          this.discountType = data.type;
          this.minOrder = data.minOrder || 0; // Load minimal order

          return {
            success: true,
            message: `Kode dipakai! Hemat ${this.formatDiscount(data)}`,
          };
        } else {
          throw new Error("Kode tidak ditemukan 🔍");
        }
      } catch (err) {
        this.error = err.message;
        this.resetPromo();
        return { success: false, message: err.message };
      } finally {
        this.isLoading = false;
      }
    },

    resetPromo() {
      this.activeCode = null;
      this.discountAmount = 0;
      this.discountType = null;
      this.minOrder = 0;
    },

    // --- ADMIN ACTIONS ---
    async fetchAllPromos() {
      try {
        const querySnapshot = await getDocs(collection(db, "promos"));
        this.allPromos = querySnapshot.docs.map((doc) => ({
          code: doc.id,
          ...doc.data(),
        }));
      } catch (error) {
        console.error("Gagal load promo:", error);
      }
    },

    // UPDATE: Terima parameter minOrder
    async createPromo(code, value, type, minOrder = 0) {
      if (!code || !value) return false;
      try {
        await setDoc(doc(db, "promos", code.toUpperCase()), {
          value: Number(value),
          type: type,
          minOrder: Number(minOrder), // Simpan ke DB
          isActive: true,
          createdAt: new Date(),
        });
        await this.fetchAllPromos();
        return true;
      } catch (error) {
        console.error("Gagal buat promo:", error);
        return false;
      }
    },

    async deletePromo(code) {
      try {
        await deleteDoc(doc(db, "promos", code));
        await this.fetchAllPromos();
        return true;
      } catch (error) {
        console.error("Gagal hapus:", error);
        return false;
      }
    },

    formatDiscount(promo) {
      if (promo.type === "percent") return `${promo.value}%`;
      return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
      }).format(promo.value);
    },
  },
  getters: {
    calculateTotal: (state) => (subtotal) => {
      if (!state.activeCode) return subtotal;
      // Validasi Min Order
      if (subtotal < state.minOrder) return subtotal;

      let discount = 0;
      if (state.discountType === "fixed") discount = state.discountAmount;
      else if (state.discountType === "percent")
        discount = (subtotal * state.discountAmount) / 100;
      return Math.max(0, subtotal - discount);
    },
    savings: (state) => (subtotal) => {
      if (!state.activeCode) return 0;
      // Validasi Min Order
      if (subtotal < state.minOrder) return 0;

      if (state.discountType === "fixed") return state.discountAmount;
      return (subtotal * state.discountAmount) / 100;
    },
  },
});
