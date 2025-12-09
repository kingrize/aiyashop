// LOKASI FILE: src/router/index.js
import { createRouter, createWebHistory } from "vue-router";
import { useUserStore } from "../stores/user"; // Pastikan ini ada

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: () => import("../views/HomeView.vue"),
      meta: {
        title: "AiyaShop - Jasa Joki Sky: Children of the Light",
      },
    },
    {
      path: "/join-member",
      name: "join-member",
      component: () => import("../views/JoinMemberView.vue"),
      meta: {
        title: "Join Member Premium",
      },
    },
    {
      path: "/top-up",
      name: "top-up",
      component: () => import("../views/TopUpView.vue"),
      meta: {
        title: "Isi Saldo Member",
      },
    },

    // --- ADMIN ROUTE ---
    {
      path: "/admin",
      name: "admin-dashboard",
      component: () => import("../views/admin/AdminDashboard.vue"),
      meta: {
        title: "Admin Dashboard",
        requiresAdmin: true,
      },
    },

    // 404 (Wajib Paling Bawah)
    {
      path: "/:pathMatch(.*)*",
      name: "not-found",
      component: () => import("../views/NotFoundView.vue"),
      meta: {
        title: "404 OOB - Tersesat?",
      },
    },
  ],
  scrollBehavior(to, from, savedPosition) {
    if (to.hash) {
      return { el: to.hash, behavior: "smooth" };
    }
    return { top: 0 };
  },
});

// --- NAVIGATION GUARD ---
router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore();

  document.title = to.meta.title || "AiyaShop";

  // Tunggu Firebase Loading
  if (userStore.loading) {
    await new Promise((resolve) => {
      const unsubscribe = userStore.$subscribe((mutation, state) => {
        if (!state.loading) {
          unsubscribe();
          resolve();
        }
      });
      if (!userStore.loading) resolve();
    });
  }

  // Cek Admin
  if (to.meta.requiresAdmin) {
    if (!userStore.user || !userStore.isAdmin) {
      alert("Akses Ditolak: Khusus Admin 🚫");
      next("/");
      return;
    }
  }

  next();
});

// !!! BAGIAN INI SANGAT PENTING JANGAN SAMPAI HILANG !!!
export default router;
