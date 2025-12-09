// LOKASI FILE: src/stores/cart.js
import { defineStore } from "pinia";
import { useToastStore } from "./toast";

export const useCartStore = defineStore("cart", {
  state: () => ({
    // 1. Load dari LocalStorage saat awal buka
    items: JSON.parse(localStorage.getItem("aiyashop_cart")) || [],
    isOpen: false,
    lastAddedTime: null,
  }),
  getters: {
    totalItems: (state) => state.items.reduce((acc, item) => acc + item.qty, 0),
    totalPrice: (state) =>
      state.items.reduce((acc, item) => acc + item.price * item.qty, 0),
  },
  actions: {
    // Helper untuk simpan ke LocalStorage
    saveToLocal() {
      localStorage.setItem("aiyashop_cart", JSON.stringify(this.items));
    },

    addToCart(product) {
      const toast = useToastStore();

      const existing = this.items.find((i) => i.id === product.id);
      if (existing) {
        existing.qty++;
      } else {
        this.items.push({ ...product, qty: 1 });
      }
      this.lastAddedTime = Date.now();

      // Simpan perubahan
      this.saveToLocal();

      // Panggil trigger toast
      toast.trigger(`${product.name} masuk keranjang! 🛒`, "success");
    },

    removeItem(id) {
      this.items = this.items.filter((i) => i.id !== id);
      this.saveToLocal(); // Simpan perubahan
    },

    updateQty(id, delta) {
      const item = this.items.find((i) => i.id === id);
      if (item) {
        const newQty = item.qty + delta;
        if (newQty > 0) {
          item.qty = newQty;
        } else {
          // Opsional: Hapus jika qty 0 (atau biarkan minimal 1)
          // this.removeItem(id);
        }
        this.saveToLocal(); // Simpan perubahan
      }
    },

    // Action baru untuk reset cart setelah checkout
    clearCart() {
      this.items = [];
      this.saveToLocal();
    },

    toggleCart() {
      this.isOpen = !this.isOpen;
    },
  },
});
