// LOKASI FILE: src/firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

// KONFIGURASI FIREBASE (Ganti dengan API Key kamu sendiri jika perlu)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "aiyashop.firebaseapp.com",
  projectId: "aiyashop",
  storageBucket: "aiyashop.firebasestorage.app",
  messagingSenderId: "984212946468",
  appId: "1:984212946468:web:2e90fee6155f793303e2b1",
  measurementId: "G-8M2CT0Q95N"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const db = getFirestore(app);
export const auth = getAuth(app);