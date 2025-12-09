// LOKASI FILE: src/stores/toast.js
import { defineStore } from "pinia";

export const useToastStore = defineStore("toast", {
  state: () => ({
    items: [], // Array tetap digunakan agar kompatibel dengan v-for, tapi isinya max 1
  }),
  actions: {
    // Gunakan nama 'trigger' agar sinkron dengan cart.js
    trigger(message, type = "success", duration = 3000) {
      const id = Date.now();

      // RESET array -> Hapus toast lama, ganti dengan yang baru (Single Instance)
      this.items = [{ id, message, type, duration }];

      // Hapus otomatis
      setTimeout(() => {
        this.remove(id);
      }, duration);
    },

    remove(id) {
      // Hanya hapus jika ID-nya cocok (menghindari menghapus toast baru yang mungkin muncul cepat)
      this.items = this.items.filter((item) => item.id !== id);
    },
  },
});
