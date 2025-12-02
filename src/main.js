// LOKASI FILE: src/main.js
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './assets/main.css'
import App from './App.vue'
import router from './router' // <-- TAMBAH INI (Import Router)
import { useUserStore } from './stores/user';

const app = createApp(App)
const pinia = createPinia();

app.use(pinia);
app.use(router); // <-- TAMBAH INI (Aktifkan Router di App)

// Inisialisasi Listener Auth (Cek apakah user sedang login)
// Note: Pastikan ini dipanggil SETELAH app.use(pinia)
const userStore = useUserStore();
userStore.initAuth();

app.mount('#app')