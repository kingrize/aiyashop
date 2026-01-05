// src/stores/delivery.js
import { defineStore } from "pinia";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  limit,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";

/**
 * Private admin collection:
 * - delivery_orders/{id}
 *
 * Public tracking collection:
 * - delivery_public/{TRACKING_CODE}
 */

const PRIVATE_COL = "delivery_orders";
const PUBLIC_COL = "delivery_public";

function toMillis(v) {
  try {
    if (!v) return 0;
    if (typeof v === "number") return v;
    if (v?.toMillis) return v.toMillis();
    return 0;
  } catch {
    return 0;
  }
}

function safeStr(s) {
  return String(s || "").trim();
}

function sumDelivered(logs = []) {
  return (logs || []).reduce((acc, x) => acc + Number(x?.delivered || 0), 0);
}

function calcProgress(item) {
  const total = Number(item?.total || 0);
  const sent = sumDelivered(item?.logs);
  const percent =
    total > 0 ? Math.min(100, Math.round((sent / total) * 100)) : 0;
  const remaining = Math.max(0, total - sent);
  const perDay = Math.max(1, Number(item?.perDay || 1));
  const daysLeft = remaining === 0 ? 0 : Math.ceil(remaining / perDay);
  return { total, sent, percent, remaining, perDay, daysLeft };
}

// tracking code: 8 chars, gampang dibaca (tanpa O/0/I/1)
function generateTrackingCode(len = 8) {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < len; i++)
    out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

// username asli jadi alias (lebih aman buat publik)
function makeUsernameAlias(username) {
  const u = safeStr(username);
  if (!u) return "";
  if (u.length <= 3) return u[0] + "⋯";
  return u.slice(0, 2) + "⋯" + u.slice(-1);
}

export const useDeliveryStore = defineStore("delivery", {
  state: () => ({
    // admin/private
    items: [],

    // public list
    publicList: [],

    isLoading: false,
    error: null,
  }),

  getters: {
    // sorted private items (admin)
    sorted(state) {
      const arr = Array.isArray(state.items) ? state.items : [];
      return [...arr].sort((a, b) => {
        const am = toMillis(a?.updatedAt) || toMillis(a?.createdAt);
        const bm = toMillis(b?.updatedAt) || toMillis(b?.createdAt);
        return bm - am;
      });
    },
  },

  actions: {
    // =================
    // CLEAR HELPERS ✅
    // =================
    clearError() {
      this.error = null;
    },

    clearPublic() {
      // ✅ ini yang dibutuhkan TrackOrder.vue (/track/all)
      this.publicList = [];
      this.error = null;
    },

    clearPrivate() {
      this.items = [];
      this.error = null;
    },

    // ==============
    // FETCH (ADMIN)
    // ==============
    async fetchAll() {
      return this.fetchPrivateOrders();
    },

    async fetchPrivateOrders() {
      this.isLoading = true;
      this.error = null;
      try {
        const qy = query(
          collection(db, PRIVATE_COL),
          orderBy("updatedAt", "desc"),
          limit(500),
        );
        const snaps = await getDocs(qy);
        this.items = snaps.docs.map((d) => ({ id: d.id, ...d.data() }));
      } catch (e) {
        console.error(e);
        this.error = e?.message || "Gagal memuat delivery orders.";
        this.items = [];
      } finally {
        this.isLoading = false;
      }
    },

    // ==================
    // CRUD (ADMIN)
    // ==================
    async createDelivery(form) {
      const customerName = safeStr(form?.customerName);
      const account = safeStr(form?.account);
      const product = safeStr(form?.product || "Heart");
      const total = Number(form?.total || 0);
      const perDay = Number(form?.perDay || 1);
      const startDate = safeStr(form?.startDate || "");
      const notes = safeStr(form?.notes || "");
      const status = safeStr(form?.status || "ongoing");

      if (!customerName) throw new Error("Nama pembeli wajib diisi.");
      if (!account) throw new Error("Akun/username wajib diisi.");
      if (!Number.isFinite(total) || total <= 0)
        throw new Error("Total harus > 0.");
      if (!Number.isFinite(perDay) || perDay <= 0)
        throw new Error("Per hari harus > 0.");

      // cari tracking code yang belum kepakai
      let trackingCode = generateTrackingCode(8);
      for (let i = 0; i < 6; i++) {
        const exists = await getDoc(doc(db, PUBLIC_COL, trackingCode));
        if (!exists.exists()) break;
        trackingCode = generateTrackingCode(8);
      }

      const payload = {
        customerName,
        account,
        product,
        total,
        perDay,
        startDate,
        notes,
        status,
        logs: [],
        trackingCode,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const ref = await addDoc(collection(db, PRIVATE_COL), payload);

      // sync public
      await setDoc(doc(db, PUBLIC_COL, trackingCode), {
        trackingCode,
        customerNamePublic: customerName, // nama customer yang kamu atur
        usernameAlias: makeUsernameAlias(account), // username asli jadi alias
        product,
        total,
        perDay,
        startDate,
        status,
        logs: [],
        progress: { total, sent: 0, percent: 0, remaining: total },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      this.items = [
        { id: ref.id, ...payload },
        ...(Array.isArray(this.items) ? this.items : []),
      ];
      return ref.id;
    },

    async updateDelivery(id, patch) {
      const ref = doc(db, PRIVATE_COL, id);
      const snap = await getDoc(ref);
      if (!snap.exists()) throw new Error("Order tidak ditemukan.");

      const current = { id: snap.id, ...snap.data() };
      const merged = { ...current, ...patch };

      const cleanPatch = {
        customerName: safeStr(merged.customerName),
        account: safeStr(merged.account),
        product: safeStr(merged.product || "Heart"),
        total: Number(merged.total || 0),
        perDay: Number(merged.perDay || 1),
        startDate: safeStr(merged.startDate || ""),
        notes: safeStr(merged.notes || ""),
        status: safeStr(merged.status || "ongoing"),
        updatedAt: serverTimestamp(),
      };

      await updateDoc(ref, cleanPatch);

      // sync public
      const trackingCode = merged.trackingCode;
      if (trackingCode) {
        const progress = calcProgress({
          ...merged,
          ...cleanPatch,
          logs: merged.logs || [],
        });
        await setDoc(
          doc(db, PUBLIC_COL, trackingCode),
          {
            customerNamePublic: cleanPatch.customerName,
            usernameAlias: makeUsernameAlias(cleanPatch.account),
            product: cleanPatch.product,
            total: cleanPatch.total,
            perDay: cleanPatch.perDay,
            startDate: cleanPatch.startDate,
            status: cleanPatch.status,
            progress: {
              total: progress.total,
              sent: progress.sent,
              percent: progress.percent,
              remaining: progress.remaining,
            },
            updatedAt: serverTimestamp(),
          },
          { merge: true },
        );
      }

      this.items = (Array.isArray(this.items) ? this.items : []).map((x) =>
        x.id === id ? { ...x, ...patch } : x,
      );
    },

    async upsertLog(id, log) {
      const ref = doc(db, PRIVATE_COL, id);
      const snap = await getDoc(ref);
      if (!snap.exists()) throw new Error("Order tidak ditemukan.");

      const data = snap.data();
      const trackingCode = data.trackingCode;

      const date = safeStr(log?.date);
      const delivered = Number(log?.delivered || 0);
      const note = safeStr(log?.note || "");

      if (!date) throw new Error("Tanggal log wajib.");
      if (!Number.isFinite(delivered) || delivered <= 0)
        throw new Error("Jumlah terkirim harus > 0.");

      const logs = Array.isArray(data.logs) ? [...data.logs] : [];
      const idx = logs.findIndex((x) => x?.date === date);

      const entry = { date, delivered, note };
      if (idx >= 0) logs[idx] = entry;
      else logs.push(entry);

      logs.sort((a, b) => String(a.date).localeCompare(String(b.date)));

      await updateDoc(ref, { logs, updatedAt: serverTimestamp() });

      if (trackingCode) {
        const merged = { ...data, logs };
        const progress = calcProgress(merged);
        await setDoc(
          doc(db, PUBLIC_COL, trackingCode),
          {
            logs,
            progress: {
              total: progress.total,
              sent: progress.sent,
              percent: progress.percent,
              remaining: progress.remaining,
            },
            status: safeStr(data.status || "ongoing"),
            updatedAt: serverTimestamp(),
          },
          { merge: true },
        );
      }

      this.items = (Array.isArray(this.items) ? this.items : []).map((x) =>
        x.id === id ? { ...x, logs } : x,
      );
    },

    async setStatus(id, status) {
      const ref = doc(db, PRIVATE_COL, id);
      const snap = await getDoc(ref);
      if (!snap.exists()) throw new Error("Order tidak ditemukan.");

      const data = snap.data();
      const trackingCode = data.trackingCode;

      await updateDoc(ref, { status, updatedAt: serverTimestamp() });

      if (trackingCode) {
        await setDoc(
          doc(db, PUBLIC_COL, trackingCode),
          { status, updatedAt: serverTimestamp() },
          { merge: true },
        );
      }

      this.items = (Array.isArray(this.items) ? this.items : []).map((x) =>
        x.id === id ? { ...x, status } : x,
      );
    },

    async removeDelivery(id) {
      const ref = doc(db, PRIVATE_COL, id);
      const snap = await getDoc(ref);
      if (!snap.exists()) return;

      const data = snap.data();
      const trackingCode = data.trackingCode;

      await deleteDoc(ref);
      if (trackingCode) await deleteDoc(doc(db, PUBLIC_COL, trackingCode));

      this.items = (Array.isArray(this.items) ? this.items : []).filter(
        (x) => x.id !== id,
      );
    },

    // ======================
    // PUBLIC TRACKING
    // ======================
    async fetchPublicByCode(code) {
      this.error = null;
      try {
        const c = safeStr(code).toUpperCase();
        if (!c) return null;

        const snap = await getDoc(doc(db, PUBLIC_COL, c));
        if (!snap.exists()) return null;

        return { id: snap.id, ...snap.data() };
      } catch (e) {
        console.error(e);
        this.error = e?.message || "Gagal memuat tracking.";
        return null;
      }
    },

    async fetchPublicList() {
      this.isLoading = true;
      this.error = null;
      try {
        const qy = query(
          collection(db, PUBLIC_COL),
          orderBy("updatedAt", "desc"),
          limit(200),
        );
        const snaps = await getDocs(qy);
        this.publicList = snaps.docs.map((d) => ({ id: d.id, ...d.data() }));
      } catch (e) {
        console.error(e);
        this.error = e?.message || "Gagal memuat list public.";
        this.publicList = [];
      } finally {
        this.isLoading = false;
      }
    },
  },
});
