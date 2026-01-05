// src/stores/delivery.js
// Unified store (admin + public) + auto-sync to `delivery_public`
//
// ✅ Fix untuk kasus kamu:
// - /admin DeliveriesPanel tidak punya input tracking code → tracking code di-generate otomatis
// - Skema field disamakan dengan DeliveriesPanel (customerName, account, product, total, perDay, startDate, notes, status, logs)
// - Progress publik (/track/all & /track/:code) ngikutin log admin (logs[].delivered)
// - customerName tampil apa adanya, username yang di-alias

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

const PRIVATE_COL = "delivery_orders";
const PUBLIC_COL = "delivery_public";

function toUpperCode(v) {
    return String(v || "")
        .trim()
        .toUpperCase()
        .replace(/\s+/g, "");
}

function safeNumber(v) {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
}

function normalizeStatus(v) {
    const s = String(v || "").trim().toLowerCase();
    if (["done", "finish", "finished", "completed"].includes(s)) return "done";
    if (["paused", "pause", "hold"].includes(s)) return "paused";
    // DeliveriesPanel pakai 'ongoing' sebagai default
    return "ongoing";
}

// public page menggunakan status: process/paused/done
function toPublicStatus(v) {
    const s = normalizeStatus(v);
    if (s === "ongoing") return "process";
    return s;
}

function maskUsername(username) {
    const u = String(username || "").trim();
    if (!u) return "";
    if (u.length <= 4) return `${u[0]}***`;
    const head = u.slice(0, 2);
    const tail = u.slice(-2);
    return `${head}***${tail}`;
}

function sumLogs(logs) {
    if (!Array.isArray(logs)) return 0;
    return logs.reduce(
        (acc, it) => acc + safeNumber(it?.delivered ?? it?.amount ?? 0),
        0,
    );
}

function buildPublicDocFromPrivate(order) {
    const trackingCode = toUpperCode(order?.trackingCode);

    const customerName = String(order?.customerName || "").trim();
    const usernameAlias = String(order?.usernameAlias || "").trim();

    const productName = String(
        order?.product || order?.productName || order?.title || "Pesanan",
    ).trim();

    const totalTarget = safeNumber(
        order?.total ?? order?.totalTarget ?? order?.totalAmount,
    );
    const perDay = safeNumber(order?.perDay);

    const logs = Array.isArray(order?.logs) ? order.logs : [];
    const deliveredTotal = safeNumber(
        order?.deliveredTotal ?? order?.delivered ?? order?.sent ?? sumLogs(logs),
    );

    // logsPublic dipakai TrackOrder (cozy) sebagai laporan harian
    const logsPublic = [...logs]
        .filter(Boolean)
        .sort((a, b) => String(b?.date || "").localeCompare(String(a?.date || "")))
        .slice(0, 12)
        .map((x) => ({
            date: x?.date ?? x?.createdAt ?? null,
            amount: safeNumber(x?.delivered ?? x?.amount ?? 0),
        }));

    const startedAt = order?.startDate ?? order?.startedAt ?? null;

    return {
        trackingCode,

        // display
        title: productName,
        productName,

        // Nama customer tampil normal
        customerName: customerName || "Customer",
        // kompat lama
        customerAlias: customerName || "Customer",
        customerMasked: customerName || "Customer",

        // Username (alias)
        usernameAlias: usernameAlias || "-",

        // progress
        totalTarget,
        total: totalTarget,
        deliveredTotal,
        delivered: deliveredTotal,
        perDay,
        status: toPublicStatus(order?.status),

        // logs
        logsPublic,

        // timestamps / info
        startedAt,
        createdAt: order?.createdAt ?? null,
        updatedAt: order?.updatedAt ?? null,
    };
}

function randomCode() {
    // hindari karakter mirip (0/O, 1/I)
    const chars = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
    const pick = () => chars[Math.floor(Math.random() * chars.length)];
    const part = () => Array.from({ length: 4 }, pick).join("");
    return `${part()}-${part()}`;
}

async function generateUniqueTrackingCode() {
    for (let i = 0; i < 12; i++) {
        const code = randomCode();
        const snap = await getDoc(doc(db, PUBLIC_COL, code));
        if (!snap.exists()) return code;
    }
    throw new Error("Gagal membuat tracking code unik. Coba lagi.");
}

function sortByUpdatedDesc(a, b) {
    const ta = a?.updatedAt?.toMillis?.() ?? a?.createdAt?.toMillis?.() ?? 0;
    const tb = b?.updatedAt?.toMillis?.() ?? b?.createdAt?.toMillis?.() ?? 0;
    return tb - ta;
}

export const useDeliveryStore = defineStore("delivery", {
    state: () => ({
        // admin
        items: [],
        isLoading: false,
        error: "",

        // public
        publicOrder: null,
        publicList: [],
    }),

    getters: {
        sorted(state) {
            return [...(state.items || [])].sort(sortByUpdatedDesc);
        },
    },

    actions: {
        // ------------------------
        // PUBLIC
        // ------------------------
        clearPublic() {
            this.publicOrder = null;
        },

        async fetchPublicByCode(code) {
            const c = toUpperCode(code);
            if (!c) throw new Error("Missing code");

            const ref = doc(db, PUBLIC_COL, c);
            const snap = await getDoc(ref);

            if (!snap.exists()) {
                this.publicOrder = null;
                throw new Error("Not found");
            }

            this.publicOrder = { id: snap.id, ...snap.data() };
            return this.publicOrder;
        },

        async fetchPublicList({ max = 200 } = {}) {
            const qy = query(
                collection(db, PUBLIC_COL),
                orderBy("updatedAt", "desc"),
                limit(max),
            );
            const snaps = await getDocs(qy);
            this.publicList = snaps.docs.map((d) => ({ id: d.id, ...d.data() }));
            return this.publicList;
        },

        // ------------------------
        // ADMIN
        // ------------------------
        async fetchAll({ max = 500 } = {}) {
            this.isLoading = true;
            this.error = "";
            try {
                const qy = query(
                    collection(db, PRIVATE_COL),
                    orderBy("updatedAt", "desc"),
                    limit(max),
                );
                const snaps = await getDocs(qy);
                // Normalisasi agar kompat sama data lama (totalTarget/productName/dll)
                this.items = snaps.docs.map((d) => {
                    const data = d.data() || {};
                    const account = String(data.account || data.username || "").trim();
                    return {
                        id: d.id,
                        ...data,
                        // field yang dipakai DeliveriesPanel
                        customerName: String(data.customerName || "").trim() || "Customer",
                        account,
                        usernameAlias:
                            String(data.usernameAlias || "").trim() || maskUsername(account),
                        product: String(data.product || data.productName || "Heart").trim(),
                        total: safeNumber(data.total ?? data.totalTarget),
                        perDay: safeNumber(data.perDay || 10) || 10,
                        startDate: data.startDate || data.startedAt || null,
                        notes: data.notes || "",
                        status: normalizeStatus(data.status),
                        logs: Array.isArray(data.logs) ? data.logs : [],
                    };
                });
                return this.items;
            } catch (e) {
                console.error(e);
                this.error = e?.message || "Gagal memuat delivery orders";
                throw e;
            } finally {
                this.isLoading = false;
            }
        },

        // alias biar kompat dengan versi sebelumnya
        async fetchPrivateOrders(opts) {
            return this.fetchAll(opts);
        },

        async resyncAllToPublic({ max = 500 } = {}) {
            const items = await this.fetchAll({ max });
            for (const it of items) {
                try {
                    await this._syncToPublic(it, { merge: true });
                } catch (e) {
                    console.warn("Resync gagal untuk", it?.trackingCode, e);
                }
            }
            return true;
        },

        // ✅ Dipakai DeliveriesPanel
        async createDelivery(payload) {
            const customerName = String(payload?.customerName || "").trim();
            if (!customerName) throw new Error("Nama customer wajib");

            const account = String(payload?.account || payload?.username || "").trim();
            // account boleh kosong, tapi alias akan jadi '-' di public
            const usernameAlias = maskUsername(account);

            const product = String(payload?.product || payload?.productName || "Heart").trim();

            const total = safeNumber(payload?.total ?? payload?.totalTarget);
            if (total <= 0) throw new Error("Total harus > 0");

            const perDay = Math.max(1, safeNumber(payload?.perDay));

            const startDate = String(payload?.startDate || "").trim();
            const notes = String(payload?.notes || "").trim();
            const status = normalizeStatus(payload?.status);

            // tracking code otomatis kalau tidak disediakan
            const trackingCode = toUpperCode(payload?.trackingCode) || (await generateUniqueTrackingCode());

            const docData = {
                trackingCode,
                customerName,
                account,
                usernameAlias: usernameAlias || "-",

                product,
                total,
                perDay,
                startDate,
                notes,
                status,

                // kompat field lama
                productName: product,
                totalTarget: total,

                logs: [],
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            };

            const ref = await addDoc(collection(db, PRIVATE_COL), docData);

            await this._syncToPublic({ id: ref.id, ...docData, deliveredTotal: 0 }, { merge: false });

            // update local list (biar UI langsung muncul tanpa refresh)
            this.items.unshift({ id: ref.id, ...docData });
            return ref.id;
        },

        // Backward-compatible (kalau ada code lain yang masih panggil createOrder)
        async createOrder(payload) {
            return this.createDelivery(payload);
        },

        async updateDelivery(id, patch) {
            if (!id) throw new Error("Missing id");

            const ref = doc(db, PRIVATE_COL, id);
            const snap = await getDoc(ref);
            if (!snap.exists()) throw new Error("Order tidak ditemukan");

            const current = { id, ...snap.data() };

            const normalized = {
                ...(patch?.customerName !== undefined
                    ? { customerName: String(patch.customerName || "").trim() }
                    : {}),
                ...(patch?.account !== undefined
                    ? {
                          account: String(patch.account || "").trim(),
                          usernameAlias: maskUsername(String(patch.account || "").trim()) || "-",
                      }
                    : {}),
                ...(patch?.product !== undefined
                    ? {
                          product: String(patch.product || "Heart").trim(),
                          productName: String(patch.product || "Heart").trim(),
                      }
                    : {}),
                ...(patch?.total !== undefined
                    ? {
                          total: safeNumber(patch.total),
                          totalTarget: safeNumber(patch.total),
                      }
                    : {}),
                ...(patch?.perDay !== undefined ? { perDay: Math.max(1, safeNumber(patch.perDay)) } : {}),
                ...(patch?.startDate !== undefined ? { startDate: String(patch.startDate || "").trim() } : {}),
                ...(patch?.notes !== undefined ? { notes: String(patch.notes || "").trim() } : {}),
                ...(patch?.status !== undefined ? { status: normalizeStatus(patch.status) } : {}),
                updatedAt: serverTimestamp(),
            };

            await updateDoc(ref, normalized);

            // sync public (pakai data terbaru)
            const afterSnap = await getDoc(ref);
            const after = { id, ...afterSnap.data() };
            await this._syncToPublic(after, { merge: true });

            // update local
            const idx = this.items.findIndex((x) => x.id === id);
            if (idx >= 0) this.items[idx] = { ...this.items[idx], ...normalized };
            else this.items.unshift(after);

            return true;
        },

        // Dipakai DeliveriesPanel: setStatus(id, 'ongoing' | 'paused' | 'done')
        async setStatus(id, status) {
            return this.updateDelivery(id, { status });
        },

        // Dipakai DeliveriesPanel: upsertLog(id, { date, delivered, note })
        async upsertLog(id, log) {
            if (!id) throw new Error("Missing id");
            const delivered = safeNumber(log?.delivered ?? log?.amount);
            if (delivered <= 0) throw new Error("Jumlah dikirim harus > 0");

            const date = String(log?.date || "").trim();
            if (!date) throw new Error("Tanggal wajib");

            const note = String(log?.note || "").trim();

            const ref = doc(db, PRIVATE_COL, id);
            const snap = await getDoc(ref);
            if (!snap.exists()) throw new Error("Order tidak ditemukan");
            const current = { id, ...snap.data() };

            const logs = Array.isArray(current.logs) ? [...current.logs] : [];
            logs.unshift({ date, delivered, note });

            const deliveredTotal = sumLogs(logs);

            await updateDoc(ref, {
                logs,
                deliveredTotal,
                updatedAt: serverTimestamp(),
            });

            await this._syncToPublic({ ...current, logs, deliveredTotal }, { merge: true });

            // update local
            const idx = this.items.findIndex((x) => x.id === id);
            if (idx >= 0) {
                this.items[idx] = {
                    ...this.items[idx],
                    logs,
                    deliveredTotal,
                };
            }

            return true;
        },

        // Backward-compatible alias
        async addProgress(payload) {
            // payload: { id, date, amount, note }
            return this.upsertLog(payload?.id, {
                date: payload?.date,
                delivered: payload?.amount,
                note: payload?.note,
            });
        },

        async removeDelivery(id) {
            if (!id) throw new Error("Missing id");
            const ref = doc(db, PRIVATE_COL, id);
            const snap = await getDoc(ref);
            if (!snap.exists()) return true;

            const data = snap.data();
            const code = toUpperCode(data?.trackingCode);

            await deleteDoc(ref);
            if (code) {
                await deleteDoc(doc(db, PUBLIC_COL, code));
            }

            this.items = (this.items || []).filter((x) => x.id !== id);
            return true;
        },

        // Backward-compatible alias
        async removeOrder(id) {
            return this.removeDelivery(id);
        },

        // ------------------------
        // INTERNAL
        // ------------------------
        async _syncToPublic(order, { merge = true } = {}) {
            const trackingCode = toUpperCode(order?.trackingCode);
            if (!trackingCode) return;

            const publicRef = doc(db, PUBLIC_COL, trackingCode);
            const publicData = buildPublicDocFromPrivate(order);

            // Pastikan updatedAt ada biar query orderBy('updatedAt') aman.
            const data = {
                ...publicData,
                updatedAt: serverTimestamp(),
            };
            if (!merge) data.createdAt = serverTimestamp();

            await setDoc(publicRef, data, { merge: true });
        },
    },
});
