// LOKASI FILE: src/router/index.js
import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      // Lazy loading (Recommended)
      component: () => import("../views/HomeView.vue"),
      meta: {
        title:
          "AiyaShop - Jasa Joki Sky: Children of the Light Termurah & Aman",
        metaTags: [
          {
            name: "description",
            content:
              "Jasa joki Sky CoTL Indonesia terpercaya, amanah, dan cepat. Melayani Candle Run, Heart, Eden Run, dan Trial. 100% Manual tanpa cheat.",
          },
          {
            name: "keywords",
            content:
              "joki sky cotl, jasa candle run sky, beli heart sky, joki eden sky, aiyashop, sky children of the light indonesia",
          },
          {
            property: "og:title",
            content: "AiyaShop - Jasa Joki Sky: Children of the Light",
          },
          {
            property: "og:description",
            content:
              "Mau Candle Run atau Heart tapi mager? Serahin ke AiyaShop aja! Proses cepat, akun aman.",
          },
          {
            property: "og:type",
            content: "website",
          },
        ],
      },
    },
    {
      path: "/join-member",
      name: "join-member",
      component: () => import("../views/JoinMemberView.vue"),
      meta: {
        title: "Join Member Premium - AiyaShop",
        metaTags: [
          {
            name: "description",
            content:
              "Gabung jadi Member Premium AiyaShop. Nikmati diskon khusus, prioritas antrian joki, dan fitur topup saldo tanpa potongan.",
          },
          {
            property: "og:title",
            content: "Join Member Premium - AiyaShop",
          },
          {
            property: "og:description",
            content:
              "Daftar member sekarang, cuma 25K seumur hidup! Diskon joki selamanya.",
          },
        ],
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

// --- LOGIC SEO & META TAGS ---
router.beforeEach((to, from, next) => {
  // 1. Update Judul Halaman (Tab Browser)
  document.title = to.meta.title || "AiyaShop - Sky Service";

  // 2. Hapus Meta Tags lama (yang dibuat oleh router sebelumnya)
  // Kita cari elemen meta yang punya atribut 'data-vue-router-controlled'
  const elements = document.querySelectorAll(
    "meta[data-vue-router-controlled]",
  );
  elements.forEach((el) => el.parentNode.removeChild(el));

  // 3. Tambahkan Meta Tags baru dari route saat ini
  if (to.meta.metaTags) {
    to.meta.metaTags.forEach((tagDef) => {
      const tag = document.createElement("meta");

      Object.keys(tagDef).forEach((key) => {
        tag.setAttribute(key, tagDef[key]);
      });

      // Tandai tag ini agar bisa dihapus nanti saat pindah halaman
      tag.setAttribute("data-vue-router-controlled", "");

      document.head.appendChild(tag);
    });
  }

  next();
});

export default router;
