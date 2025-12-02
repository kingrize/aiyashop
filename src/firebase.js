import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

// KONFIGURASI FIREBASE KAMU
const firebaseConfig = {
  apiKey: "AIzaSyCKBNalW1dx35fK7c3Jjl-Rb7gZ6prnLw0",
  authDomain: "aiyashop.firebaseapp.com",
  projectId: "aiyashop",
  storageBucket: "aiyashop.firebasestorage.app",
  messagingSenderId: "984212946468",
  appId: "1:984212946468:web:2e90fee6155f793303e2b1",
  measurementId: "G-8M2CT0Q95N"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Export service yang dipakai
export const db = getFirestore(app);
export const auth = getAuth(app);