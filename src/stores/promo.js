import { defineStore } from 'pinia';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

export const usePromoStore = defineStore('promo', {
  state: () => ({
    activeCode: null,
    discountAmount: 0,
    discountType: null, // 'fixed' | 'percent'
    isLoading: false,
    error: null,
  }),
  
  actions: {
    async applyPromo(code) {
      this.isLoading = true;
      this.error = null;
      
      try {
        // Cek dokumen di koleksi 'promos' dengan ID = KODE_PROMO
        const docRef = doc(db, "promos", code.toUpperCase());
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          
          if (data.isActive === false) {
            throw new Error("Yah, kode ini udah ga aktif kak 🥺");
          }

          this.activeCode = code.toUpperCase();
          this.discountAmount = data.value;
          this.discountType = data.type;
          
          return { success: true, message: `Hore! Kode ${code} berhasil dipakai! 🎉` };
        } else {
          throw new Error("Kode promo ga ketemu nih.. coba cek lagi ya? 🤔");
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
    }
  },

  getters: {
    calculateTotal: (state) => (subtotal) => {
      if (!state.activeCode) return subtotal;
      let discount = 0;
      if (state.discountType === 'fixed') discount = state.discountAmount;
      else if (state.discountType === 'percent') discount = (subtotal * state.discountAmount) / 100;
      return Math.max(0, subtotal - discount);
    },
    
    savings: (state) => (subtotal) => {
       if (!state.activeCode) return 0;
       if (state.discountType === 'fixed') return state.discountAmount;
       return (subtotal * state.discountAmount) / 100;
    }
  }
});