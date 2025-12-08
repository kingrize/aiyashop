// LOKASI FILE: src/stores/user.js
import { defineStore } from "pinia";
import { auth, db } from "../firebase";
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  orderBy,
  limit,
  getDocs,
} from "firebase/firestore";

export const useUserStore = defineStore("user", {
  state: () => ({
    user: null,
    memberData: null,
    transactions: [],
    loading: true,
    authError: null,
    showAuthModal: false, // 1. STATE GLOBAL UNTUK MODAL LOGIN
  }),

  actions: {
    // Helper untuk buka/tutup modal
    toggleAuthModal(value) {
      this.showAuthModal = value;
    },

    async login(username, password) {
      this.authError = null;
      try {
        const email = username.includes("@")
          ? username
          : `${username}@aiyashop.com`;
        const userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password,
        );
        this.user = userCredential.user;
        await this.fetchMemberData();
        return true;
      } catch (error) {
        console.error("Login Error:", error);
        this.authError = this.mapErrorMessage(error.code);
        return false;
      }
    },

    // ... (SISA KODE SAMA SEPERTI SEBELUMNYA: logout, fetchMemberData, fetchTransactions, dll) ...

    async logout() {
      await signOut(auth);
      this.user = null;
      this.memberData = null;
      this.transactions = [];
    },

    async fetchMemberData() {
      if (!this.user) return;
      const docRef = doc(db, "users", this.user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.totalTopUp === undefined) data.totalTopUp = data.saldo || 0;
        this.memberData = data;
      } else {
        const tempName = this.user.email.split("@")[0];
        const formattedName =
          tempName.charAt(0).toUpperCase() + tempName.slice(1);
        const newMemberData = {
          email: this.user.email,
          displayName: formattedName,
          saldo: 0,
          totalTopUp: 0,
          role: "member",
          joinedAt: new Date(),
          isManualEntry: true,
        };
        await setDoc(docRef, newMemberData);
        try {
          await updateProfile(this.user, { displayName: formattedName });
        } catch (e) {}
        this.memberData = newMemberData;
      }
    },

    async fetchTransactions() {
      if (!this.user) return;
      try {
        const q = query(
          collection(db, "users", this.user.uid, "transactions"),
          orderBy("createdAt", "desc"),
          limit(20),
        );
        const querySnapshot = await getDocs(q);
        this.transactions = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
        }));
      } catch (error) {
        console.error("Gagal ambil transaksi:", error);
      }
    },

    async updateUserName(newName) {
      if (!this.user || !this.memberData) return;
      try {
        await updateProfile(this.user, { displayName: newName });
        const userRef = doc(db, "users", this.user.uid);
        await updateDoc(userRef, { displayName: newName });
        this.user = { ...this.user, displayName: newName };
        this.memberData.displayName = newName;
        return true;
      } catch (error) {
        return false;
      }
    },

    initAuth() {
      onAuthStateChanged(auth, async (user) => {
        this.user = user;
        if (user) {
          await this.fetchMemberData();
          this.fetchTransactions();
        }
        this.loading = false;
      });
    },

    mapErrorMessage(code) {
      switch (code) {
        case "auth/user-not-found":
          return "Username tidak ditemukan.";
        case "auth/wrong-password":
          return "Password salah.";
        case "auth/invalid-credential":
          return "Username/Password salah.";
        case "auth/too-many-requests":
          return "Tunggu sebentar ya.";
        default:
          return "Gagal masuk.";
      }
    },
  },
});
