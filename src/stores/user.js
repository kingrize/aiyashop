// LOKASI FILE: src/stores/user.js
import { defineStore } from 'pinia';
import { auth, db } from '../firebase';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged, updateProfile } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null,
    memberData: null,
    loading: true,
    authError: null,
  }),
  actions: {
    async login(email, password) {
      this.authError = null;
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        this.user = userCredential.user;
        await this.fetchMemberData();
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
    },
    async fetchMemberData() {
      if (!this.user) return;
      const docRef = doc(db, 'users', this.user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.totalTopUp === undefined) data.totalTopUp = data.saldo || 0;
        this.memberData = data;
      } else {
        // Auto-fix user manual
        const tempName = this.user.email.split('@')[0];
        const formattedName = tempName.charAt(0).toUpperCase() + tempName.slice(1);
        const newMemberData = {
          email: this.user.email,
          displayName: formattedName,
          saldo: 0,
          totalTopUp: 0,
          role: 'member',
          joinedAt: new Date(),
          isManualEntry: true
        };
        await setDoc(docRef, newMemberData);
        try { await updateProfile(this.user, { displayName: formattedName }); } catch (e) {}
        this.memberData = newMemberData;
      }
    },
    async updateUserName(newName) {
      if (!this.user || !this.memberData) return;
      try {
        await updateProfile(this.user, { displayName: newName });
        const userRef = doc(db, 'users', this.user.uid);
        await updateDoc(userRef, { displayName: newName });
        this.user = { ...this.user, displayName: newName };
        this.memberData.displayName = newName;
        return true;
      } catch (error) { return false; }
    },
    initAuth() {
      onAuthStateChanged(auth, async (user) => {
        this.user = user;
        if (user) await this.fetchMemberData();
        this.loading = false;
      });
    },
    mapErrorMessage(code) {
      switch (code) {
        case 'auth/user-not-found': return 'Akun tidak ditemukan. Hubungi admin.';
        case 'auth/wrong-password': return 'Password salah.';
        case 'auth/invalid-credential': return 'Email atau password salah.';
        case 'auth/too-many-requests': return 'Terlalu banyak mencoba, tunggu sebentar.';
        default: return 'Gagal masuk.';
      }
    }
  }
});