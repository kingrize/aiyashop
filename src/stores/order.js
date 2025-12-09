// LOKASI FILE: src/stores/order.js
import { defineStore } from "pinia";
import { db } from "../firebase";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  doc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";

export const useOrderStore = defineStore("order", {
  state: () => ({
    userOrders: [], // Pesanan user yang login
    allOrders: [], // Semua pesanan (Admin)
    loading: false,
  }),

  actions: {
    // 1. BUAT PESANAN BARU
    async createOrder(
      userId,
      userName,
      items,
      total,
      method,
      status = "Pending",
    ) {
      try {
        await addDoc(collection(db, "orders"), {
          userId,
          userName,
          items, // Array of objects
          total,
          method, // 'Saldo Member' or 'QRIS/WA'
          status, // 'Pending', 'Processing', 'Done', 'Cancelled'
          createdAt: serverTimestamp(),
        });
        return true;
      } catch (e) {
        console.error("Gagal buat order:", e);
        return false;
      }
    },

    // 2. FETCH PESANAN USER (Untuk HomeView Member)
    async fetchUserOrders(userId) {
      this.loading = true;
      try {
        // Query tanpa index komposit (Client side sort)
        const q = query(
          collection(db, "orders"),
          where("userId", "==", userId),
        );
        const snapshot = await getDocs(q);

        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          ts: doc.data().createdAt?.toMillis() || Date.now(),
        }));

        // Sortir manual dari yang terbaru
        this.userOrders = data.sort((a, b) => b.ts - a.ts);
      } catch (e) {
        console.error(e);
      } finally {
        this.loading = false;
      }
    },

    // 3. FETCH SEMUA PESANAN (Untuk Admin)
    async fetchAllOrders() {
      this.loading = true;
      try {
        const snapshot = await getDocs(collection(db, "orders"));
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          ts: doc.data().createdAt?.toMillis() || Date.now(),
        }));
        this.allOrders = data.sort((a, b) => b.ts - a.ts);
      } catch (e) {
        console.error(e);
      } finally {
        this.loading = false;
      }
    },

    // 4. UPDATE STATUS PESANAN (Admin)
    async updateStatus(orderId, newStatus) {
      try {
        await updateDoc(doc(db, "orders", orderId), { status: newStatus });
        await this.fetchAllOrders(); // Refresh admin list
        return true;
      } catch (e) {
        return false;
      }
    },
  },
});
