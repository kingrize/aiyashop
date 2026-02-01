// LOKASI FILE: src/stores/buyerName.js
import { defineStore } from "pinia";

const STORAGE_KEY = "aiyashop_buyer_name";
const MAX_NAME_LENGTH = 50;

export const useBuyerNameStore = defineStore("buyerName", {
  state: () => ({
    buyerName: "",
    buyerNameError: "",
    _saveTimer: null,
  }),

  getters: {
    isValid: (state) => {
      const trimmed = state.buyerName.trim();
      return trimmed.length > 0 && trimmed.length <= MAX_NAME_LENGTH;
    },
    validationResult: (state) => {
      const trimmed = state.buyerName.trim();
      if (!trimmed) {
        return { ok: false, message: "Please enter your name to continue." };
      }
      if (trimmed.length > MAX_NAME_LENGTH) {
        return {
          ok: false,
          message: `Name must be ${MAX_NAME_LENGTH} characters or less.`,
        };
      }
      return { ok: true };
    },
    trimmedName: (state) => state.buyerName.trim(),
  },

  actions: {
    setBuyerName(name) {
      this.buyerName = name;
      this.buyerNameError = "";
      this.saveBuyerNameToStorage();
    },

    clearError() {
      this.buyerNameError = "";
    },

    validate() {
      const result = this.validationResult;
      if (!result.ok) {
        this.buyerNameError = result.message;
      } else {
        this.buyerNameError = "";
      }
      return result;
    },

    loadBuyerNameFromStorage() {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          this.buyerName = stored;
        }
      } catch (e) {
        // localStorage unavailable (private mode, etc.)
        console.warn("Could not load buyer name from storage:", e);
      }
    },

    saveBuyerNameToStorage() {
      // Debounce write to avoid frequent localStorage updates
      if (this._saveTimer) clearTimeout(this._saveTimer);
      this._saveTimer = setTimeout(() => {
        try {
          const trimmed = this.buyerName.trim();
          if (trimmed) {
            localStorage.setItem(STORAGE_KEY, trimmed);
          } else {
            localStorage.removeItem(STORAGE_KEY);
          }
        } catch (e) {
          // ignore quota / private mode
          console.warn("Could not save buyer name to storage:", e);
        }
      }, 150);
    },
  },
});
