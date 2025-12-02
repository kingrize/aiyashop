// LOKASI FILE: src/stores/toast.js
import { defineStore } from 'pinia';

export const useToastStore = defineStore('toast', {
  state: () => ({
    message: '',
    show: false,
    type: 'success'
  }),
  actions: {
    showToast(msg, type = 'success') {
      this.message = msg;
      this.type = type;
      this.show = true;
      setTimeout(() => { this.show = false; }, 3000);
    }
  }
});