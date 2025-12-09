// LOKASI FILE: src/stores/user.js
import { defineStore } from "pinia";
import { auth, db, firebaseConfig } from "../firebase";
import { initializeApp, deleteApp } from "firebase/app";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  getAuth,
  updatePassword,
  reauthenticateWithCredential, // IMPORT BARU
  EmailAuthProvider, // IMPORT BARU
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

    // --- CHANGE PASSWORD DENGAN RE-AUTH (LEBIH AMAN) ---
    async changePassword(currentPassword, newPassword) {
      if (!this.user) return { success: false, message: "Belum login" };

      try {
        // 1. Re-autentikasi user dengan password lama untuk verifikasi
        const credential = EmailAuthProvider.credential(
          this.user.email,
          currentPassword,
        );
        await reauthenticateWithCredential(this.user, credential);

        // 2. Jika sukses, baru update password
        await updatePassword(this.user, newPassword);
        return { success: true };
      } catch (error) {
        console.error("Gagal ganti password:", error);
        if (error.code === "auth/wrong-password") {
          return { success: false, message: "Password lama salah!" };
        }
        if (error.code === "auth/too-many-requests") {
          return {
            success: false,
            message: "Terlalu banyak mencoba. Tunggu sebentar.",
          };
        }
        return { success: false, message: error.message };
      }
    },

    // ... (SISA CODE DI BAWAH INI SAMA PERSIS SEPERTI SEBELUMNYA) ...
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
    async adminCreateMemberData(
      email,
      name,
      role = "member",
      initialSaldo = 0,
    ) {
      if (!this.isAdmin) return;
      const defaultPassword = "aiyashop123";
      let secondaryApp = null;
      let emailFix = email.trim();
      if (!emailFix.includes("@")) emailFix = `${emailFix}@aiyashop.com`;
      try {
        secondaryApp = initializeApp(firebaseConfig, "SecondaryApp");
        const secondaryAuth = getAuth(secondaryApp);
        const userCredential = await createUserWithEmailAndPassword(
          secondaryAuth,
          emailFix,
          defaultPassword,
        );
        const newUserUid = userCredential.user.uid;
        const newUserData = {
          email: emailFix,
          displayName: name,
          role,
          saldo: initialSaldo,
          totalTopUp: initialSaldo,
          joinedAt: new Date(),
          isManualEntry: true,
          defaultPassword: defaultPassword,
        };
        await setDoc(doc(db, "users", newUserUid), newUserData);
        await signOut(secondaryAuth);
        deleteApp(secondaryApp);
        await this.fetchAllUsers();
        return { success: true, password: defaultPassword, email: emailFix };
      } catch (error) {
        if (secondaryApp) deleteApp(secondaryApp);
        return { success: false, error: error.message };
      }
    },
    async adminUpdateUserRole(targetUid, newRole) {
      if (!this.isAdmin) return;
      try {
        await updateDoc(doc(db, "users", targetUid), { role: newRole });
        await this.fetchAllUsers();
        return true;
      } catch (error) {
        return false;
      }
    },
    async adminDeleteUser(targetUid) {
      if (!this.isAdmin) return;
      try {
        await deleteDoc(doc(db, "users", targetUid));
        await this.fetchAllUsers();
        return true;
      } catch (error) {
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
        return false;
      }
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
        this.authError = this.mapErrorMessage(error.code);
        return false;
      }
    },
    async register(name, email, password) {
      /* ... */
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
        case "auth/requires-recent-login":
          return "Silakan login ulang untuk keamanan.";
        default:
          return "Gagal masuk/daftar.";
      }
    },
  },
});
