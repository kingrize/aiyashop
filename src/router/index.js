import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import JoinMemberView from '../views/JoinMemberView.vue'

// Kita butuh cara mengakses state loading dari luar komponen
// Cara termudah di setup sederhana ini adalah event bus atau store
// Tapi untuk sekarang, kita biarkan transisi halaman menghandle visual loadingnya
// Jika ingin progress bar di atas (seperti YouTube), kita butuh library nprogress.

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/join-member',
      name: 'join-member',
      component: JoinMemberView
    }
  ],
  scrollBehavior(to, from, savedPosition) {
    if (to.hash) {
      return { el: to.hash, behavior: 'smooth' }
    }
    return { top: 0 }
  }
})

export default router