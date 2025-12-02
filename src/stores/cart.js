// LOKASI FILE: src/stores/cart.js
import { defineStore } from 'pinia';

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: [],
    isOpen: false,
  }),
  getters: {
    totalItems: (state) => state.items.reduce((acc, item) => acc + item.qty, 0),
    totalPrice: (state) => state.items.reduce((acc, item) => acc + (item.price * item.qty), 0),
  },
  actions: {
    addToCart(product) {
      const existing = this.items.find(i => i.id === product.id);
      if (existing) {
        existing.qty++;
      } else {
        this.items.push({ ...product, qty: 1 });
      }
      this.isOpen = true; // Otomatis buka keranjang
    },
    removeItem(id) {
      this.items = this.items.filter(i => i.id !== id);
    },
    updateQty(id, delta) {
      const item = this.items.find(i => i.id === id);
      if (item) {
        const newQty = item.qty + delta;
        if (newQty > 0) item.qty = newQty;
      }
    },
    toggleCart() {
      this.isOpen = !this.isOpen;
    }
  }
});