import { defineStore } from "pinia";

export const useThemeStore = defineStore("theme", {
  state: () => ({
    // UBAH BAGIAN INI:
    // Logika baru: Hanya true jika user PERNAH menyimpan 'dark'.
    // Jika pengguna baru (null) atau 'light', maka hasilnya false (Light Mode).
    isDark: localStorage.getItem("theme") === "dark",
  }),
  actions: {
    toggleTheme() {
      this.isDark = !this.isDark;
      this.applyTheme();
    },
    applyTheme() {
      if (this.isDark) {
        document.documentElement.classList.add("dark");
        localStorage.setItem("theme", "dark");
      } else {
        document.documentElement.classList.remove("dark");
        localStorage.setItem("theme", "light");
      }
    },
    initTheme() {
      this.applyTheme();
    },
  },
});
