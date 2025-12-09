// LOKASI FILE: src/stores/user.js
import { defineStore } from "pinia";
import { auth, db } from "../firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  increment,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

export const useUserStore = defineStore("user", {
  state: () => ({
    user: null,
    memberData: null,
    transactions: [],
    loading: true,
    authError: null,
    showAuthModal: false,

    // ADMIN STATE
    allUsers: [],
  }),

  getters: {
    isAdmin: (state) => state.memberData?.role === "admin",

    adminStats: (state) => {
      const users = state.allUsers || [];
      const totalUser = users.length;
      const totalRevenue = users.reduce(
        (sum, u) => sum + (u.totalTopUp || 0),
        0,
      );
      const totalSaldoActive = users.reduce(
        (sum, u) => sum + (u.saldo || 0),
        0,
      );
      return { totalUser, totalRevenue, totalSaldoActive };
    },
  },

  actions: {
    toggleAuthModal(value) {
      this.showAuthModal = value;
    },

    // --- ADMIN ACTIONS ---

    async fetchAllUsers() {
      if (!this.isAdmin) return;
      try {
        const q = query(collection(db, "users"), orderBy("joinedAt", "desc"));
        const querySnapshot = await getDocs(q);
        this.allUsers = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
      } catch (error) {
        console.error("Admin Fetch Error:", error);
      }
    },

    async adminUpdateUserRole(targetUid, newRole) {
      if (!this.isAdmin) return;
      try {
        await updateDoc(doc(db, "users", targetUid), { role: newRole });
        await this.fetchAllUsers();
        return true;
      } catch (error) {
        console.error("Gagal update role:", error);
        return false;
      }
    },

    // FITUR BARU: HAPUS USER
    async adminDeleteUser(targetUid) {
      if (!this.isAdmin) return;
      try {
        // Hapus dokumen data user dari Firestore
        await deleteDoc(doc(db, "users", targetUid));

        // Catatan: Ini tidak menghapus user dari Authentication (Login),
        // karena itu butuh Admin SDK (Backend).
        // Tapi dengan menghapus data di Firestore, user tersebut akan error/kosong saat login.

        await this.fetchAllUsers(); // Refresh list
        return true;
      } catch (error) {
        console.error("Gagal hapus user:", error);
        return false;
      }
    },

    async adminCreateMemberData(
      email,
      name,
      role = "member",
      initialSaldo = 0,
    ) {
      if (!this.isAdmin) return;
      try {
        await addDoc(collection(db, "users"), {
          email,
          displayName: name,
          role,
          saldo: initialSaldo,
          totalTopUp: initialSaldo,
          joinedAt: new Date(),
          isManualEntry: true,
          note: "Dibuat oleh admin",
        });
        await this.fetchAllUsers();
        return true;
      } catch (error) {
        console.error("Gagal buat member:", error);
        return false;
      }
    },

    async adminTopUpUser(targetUid, amount) {
      if (!this.isAdmin) return;
      try {
        const userRef = doc(db, "users", targetUid);
        await updateDoc(userRef, {
          saldo: increment(amount),
          totalTopUp: increment(amount),
        });
        await addDoc(collection(db, "users", targetUid, "transactions"), {
          type: "income",
          title: "Top Up Admin",
          desc: "Manual Top Up via Admin Dashboard",
          amount: amount,
          createdAt: serverTimestamp(),
          status: "success",
        });
        await this.fetchAllUsers();
        return true;
      } catch (error) {
        console.error("Admin TopUp Gagal:", error);
        return false;
      }
    },

    // --- AUTH ACTIONS ---
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

    // Fungsi Register tetap ada di store (untuk jaga-jaga), tapi tidak dipanggil di UI Cart
    async register(name, email, password) {
      this.authError = null;
      try {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password,
        );
        this.user = userCredential.user;
        await updateProfile(this.user, { displayName: name });
        const newMemberData = {
          email: email,
          displayName: name,
          saldo: 0,
          totalTopUp: 0,
          role: "member",
          joinedAt: new Date(),
        };
        await setDoc(doc(db, "users", this.user.uid), newMemberData);
        this.memberData = newMemberData;
        return true;
      } catch (error) {
        this.authError = this.mapErrorMessage(error.code);
        return false;
      }
    },

    async logout() {
      await signOut(auth);
      this.user = null;
      this.memberData = null;
      this.transactions = [];
      this.allUsers = [];
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
        console.error(error);
      }
    },

    async updateUserName(newName) {
      if (!this.user || !this.memberData) return;
      try {
        await updateProfile(this.user, { displayName: newName });
        await updateDoc(doc(db, "users", this.user.uid), {
          displayName: newName,
        });
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
          if (this.memberData?.role === "admin") {
            this.fetchAllUsers();
          }
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
        case "auth/email-already-in-use":
          return "Username sudah dipakai.";
        default:
          return "Gagal masuk/daftar.";
      }
    },
  },
});
