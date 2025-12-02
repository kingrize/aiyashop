import { defineStore } from "pinia";

export const useThemeStore = defineStore("theme", {
  state: () => ({
    // Prefer explicit user choice (localStorage). If none, use system preference.
    isDark:
      localStorage.getItem("theme") === "dark" ||
      (!localStorage.getItem("theme") &&
        window.matchMedia("(prefers-color-scheme: dark)").matches),
  }),
  actions: {
    toggleTheme() {
      this.isDark = !this.isDark;
      this.applyTheme();
    },
    applyTheme() {
      // Ensure dark mode fully overrides light mode by applying changes in multiple places:
      // 1) Add/remove 'dark' class on <html> so Tailwind's `dark:` utilities apply.
      // 2) Also add/remove 'dark' class on <body> to increase specificity for selectors like '.dark body'.
      // 3) Set a `data-theme` attribute which can be used by any CSS that checks attributes.
      // 4) Set `color-scheme` so the browser uses the correct default UI (forms, scrollbars).
      if (this.isDark) {
        document.documentElement.classList.add("dark");
        document.body.classList.add("dark");
        document.documentElement.setAttribute("data-theme", "dark");
        document.documentElement.style.colorScheme = "dark";
        localStorage.setItem("theme", "dark");
      } else {
        document.documentElement.classList.remove("dark");
        document.body.classList.remove("dark");
        document.documentElement.removeAttribute("data-theme");
        document.documentElement.style.colorScheme = "light";
        localStorage.setItem("theme", "light");
      }

      // Force style recalculation to reduce any flash where light styles might "peek through".
      // Accessing offsetHeight triggers a reflow.
      // eslint-disable-next-line no-unused-expressions
      void document.documentElement.offsetHeight;
    },
    initTheme() {
      // Apply immediately on app start
      this.applyTheme();

      // If the user hasn't chosen a theme explicitly, follow system changes.
      // This keeps the UI consistent with OS preference in real-time.
      if (!localStorage.getItem("theme") && window.matchMedia) {
        const mq = window.matchMedia("(prefers-color-scheme: dark)");
        const handler = (e) => {
          this.isDark = e.matches;
          this.applyTheme();
        };
        if (typeof mq.addEventListener === "function") {
          mq.addEventListener("change", handler);
        } else if (typeof mq.addListener === "function") {
          mq.addListener(handler);
        }
      }
    },
  },
});
