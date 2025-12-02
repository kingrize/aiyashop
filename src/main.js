import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './assets/main.css'
import App from './App.vue'
import { useUserStore } from './stores/user';

const app = createApp(App)
const pinia = createPinia();

app.use(pinia);

// Inisialisasi Listener Auth (Cek apakah user sedang login)
const userStore = useUserStore();
userStore.initAuth();

app.mount('#app')