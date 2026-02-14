import { createRouter, createWebHistory, RouterView } from "vue-router";
import HomeView from "../views/HomeView.vue";
// HAPUS import AdminDashboard statis di sini agar ringan

import { useUserStore } from "../stores/user";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: HomeView,
    },
    {
      path: "/join",
      name: "join",
      component: () => import("../views/JoinMemberView.vue"),
    },
    {
      path: "/top-up",
      name: "top-up",
      component: () => import("../views/TopUpView.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/me",
      name: "member-settings",
      component: () => import("../views/member/MemberSettings.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/admin",
      name: "admin",
      // OPTIMASI: Lazy Load (Code Splitting)
      // Kode admin hanya di-download saat user membuka halaman admin
      component: () => import("../views/admin/AdminDashboard.vue"),
      meta: { requiresAuth: true, requiresAdmin: true },
    },

    // --- TRACKING ROUTES (REFACTORED) ---
    // Menggunakan nested route agar rapi dan tidak duplikat
    {
      path: "/track",
      component: RouterView,
      children: [
        {
          path: "",
          name: "track",
          component: () => import("../views/TrackOrder.vue"),
          meta: { title: "Lacak Pesanan - AiyaShop" },
        },
        {
          path: "all",
          name: "track-all",
          component: () => import("../views/TrackAll.vue"),
          meta: { title: "Semua Pesanan - AiyaShop" },
        },
        {
          path: ":code",
          name: "track-code",
          component: () => import("../views/TrackOrder.vue"),
          meta: { title: "Detail Pesanan - AiyaShop" }, // Beda title dikit biar jelas
          props: true,
        },
      ],
    },

    // Catch-all 404
    {
      path: "/:pathMatch(.*)*",
      name: "not-found",
      component: () => import("../views/NotFoundView.vue"),
    },
  ],
  scrollBehavior(to, from, savedPosition) {
    return { top: 0, behavior: "smooth" };
  },
});

// Navigation Guard
router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore();

  // Tunggu auth init jika belum
  if (userStore.loading) {
    await new Promise((resolve) => {
      const unwatch = userStore.$subscribe((mutation, state) => {
        if (!state.loading) {
          unwatch();
          resolve();
        }
      });
      // Fallback safety biar ga stuck
      if (!userStore.loading) resolve();
    });
  }

  const isAuthenticated = !!userStore.user;
  const isAdmin = userStore.isAdmin;

  if (to.meta.requiresAuth && !isAuthenticated) {
    next({ name: "join" });
  } else if (to.meta.requiresAdmin && !isAdmin) {
    next({ name: "home" });
  } else {
    next();
  }
});

export default router;
