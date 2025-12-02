import { defineStore } from 'pinia';
import { auth, db } from '../firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile 
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null,
    memberData: null,
    loading: true,
    authError: null,
  }),

  actions: {
    // 1. REGISTER
    async register(name, email, password) {
      this.authError = null;
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        await updateProfile(user, { displayName: name });

        // STRUKTUR DATA BARU: Ada totalTopUp
        const newMemberData = {
          email: email,
          displayName: name,
          saldo: 0,        // Uang yang bisa dibelanjakan
          totalTopUp: 0,   // Akumulasi untuk penentu Level
          role: 'member',
          joinedAt: new Date()
        };
        await setDoc(doc(db, 'users', user.uid), newMemberData);
        
        this.user = user;
        this.memberData = newMemberData;
        return true;
      } catch (error) {
        console.error("Register Error:", error);
        this.authError = this.mapErrorMessage(error.code);
        return false;
      }
    },

    // 2. LOGIN
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

    // 3. FETCH DATA (Auto-Fix User Lama)
    async fetchMemberData() {
      if (!this.user) return;

      const docRef = doc(db, 'users', this.user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        // Jika user lama belum punya totalTopUp, anggap sama dengan saldo saat ini
        if (data.totalTopUp === undefined) {
            data.totalTopUp = data.saldo || 0;
        }
        this.memberData = data;
      } else {
        // Auto-create user manual dari console
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
        this.memberData = newMemberData;
      }
    },

    async updateUserName(newName) {
      if (!this.user || !this.memberData) return;
      try {
        await updateProfile(this.user, { displayName: newName });
        const userRef = doc(db, 'users', this.user.uid);
        await updateDoc(userRef, { displayName: newName });
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
        case 'auth/user-not-found': return 'Akun tidak ditemukan.';
        case 'auth/wrong-password': return 'Password salah.';
        default: return 'Gagal masuk.';
      }
    }
  }
});