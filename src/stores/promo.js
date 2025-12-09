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
    isLoading: false,
    error: null,

    // STATE ADMIN
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
          if (data.isActive === false)
            throw new Error("Kode ini sedang non-aktif ⏸️");

          this.activeCode = code.toUpperCase();
          this.discountAmount = data.value;
          this.discountType = data.type; // 'fixed' atau 'percent'

          return {
            success: true,
            message: `Kode ${code} dipakai! Hemat ${this.formatDiscount(data)}`,
          };
        } else {
          throw new Error("Kode promo tidak ditemukan 🔍");
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

    async createPromo(code, value, type) {
      if (!code || !value) return false;
      try {
        await setDoc(doc(db, "promos", code.toUpperCase()), {
          value: Number(value),
          type: type, // 'fixed' | 'percent'
          isActive: true,
          createdAt: new Date(),
        });
        await this.fetchAllPromos(); // Refresh list
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
        console.error("Gagal hapus promo:", error);
        return false;
      }
    },

    // Helper Format
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
      let discount = 0;
      if (state.discountType === "fixed") discount = state.discountAmount;
      else if (state.discountType === "percent")
        discount = (subtotal * state.discountAmount) / 100;
      return Math.max(0, subtotal - discount);
    },
    savings: (state) => (subtotal) => {
      if (!state.activeCode) return 0;
      if (state.discountType === "fixed") return state.discountAmount;
      return (subtotal * state.discountAmount) / 100;
    },
  },
});
