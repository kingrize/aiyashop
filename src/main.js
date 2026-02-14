// LOKASI FILE: src/main.js
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { enableProtection } from './utils/protection' // Import Security
import './assets/main.css'
import App from './App.vue'
import router from './router'
import { useUserStore } from './stores/user';
import { useThemeStore } from './stores/theme'; // Import Theme Store

const app = createApp(App)
const pinia = createPinia();

app.use(pinia);
app.use(router);

// Inisialisasi Listener Auth
const userStore = useUserStore();
userStore.initAuth();

// Inisialisasi Tema
const themeStore = useThemeStore();
themeStore.initTheme();

// Aktifkan Proteksi (Anti-Debug & Anti-Copy)
enableProtection();

app.mount('#app')