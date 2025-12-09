// LOKASI FILE: src/stores/announcement.js
import { defineStore } from "pinia";
import { db } from "../firebase";
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";

export const useAnnouncementStore = defineStore("announcement", {
  state: () => ({
    activeAnnouncement: null,
    allAnnouncements: [],
  }),

  actions: {
    async fetchActive() {
      try {
        // NO INDEX REQUIRED QUERY
        const q = query(
          collection(db, "announcements"),
          where("isActive", "==", true),
        );
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
          // Client-side sorting untuk ambil yang terbaru
          const data = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            createdAtTime: doc.data().createdAt?.toMillis() || 0,
          }));
          data.sort((a, b) => b.createdAtTime - a.createdAtTime);
          this.activeAnnouncement = data[0];
        } else {
          this.activeAnnouncement = null;
        }
      } catch (e) {
        console.error("Banner Error:", e);
      }
    },

    async fetchAll() {
      try {
        const q = query(
          collection(db, "announcements"),
          orderBy("createdAt", "desc"),
        );
        const snapshot = await getDocs(q);
        this.allAnnouncements = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
      } catch (e) {
        // Fallback
        const snapshot = await getDocs(collection(db, "announcements"));
        this.allAnnouncements = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
      }
    },

    // UPDATE: Terima parameter link & label
    async create(text, type = "info", actionLink = "", actionLabel = "") {
      try {
        await addDoc(collection(db, "announcements"), {
          text,
          type,
          actionLink, // URL tujuan (misal: '/top-up')
          actionLabel, // Teks tombol (misal: 'Cek Disini')
          isActive: true,
          createdAt: serverTimestamp(),
        });
        await this.fetchAll();
        await this.fetchActive();
        return true;
      } catch (e) {
        console.error(e);
        return false;
      }
    },

    async toggleStatus(id, currentStatus) {
      await updateDoc(doc(db, "announcements", id), {
        isActive: !currentStatus,
      });
      await this.fetchAll();
      await this.fetchActive();
    },

    async remove(id) {
      await deleteDoc(doc(db, "announcements", id));
      await this.fetchAll();
      await this.fetchActive();
    },
  },
});
