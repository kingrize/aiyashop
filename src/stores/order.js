// LOKASI FILE: src/stores/order.js
// Centralized orders store - the single source of truth for all purchases
import { defineStore } from "pinia";
import { db } from "../firebase";
import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  updateDoc,
  doc,
  query,
  where,
  orderBy,
  serverTimestamp,
  limit,
} from "firebase/firestore";

// Valid enum values
const PAYMENT_METHODS = ["balance", "manual", "qris"];
const PAYMENT_STATUSES = ["pending", "paid", "failed"];
const FULFILLMENT_STATUSES = ["queued", "in_progress", "completed", "cancelled"];
const ORDER_SOURCES = ["member_checkout", "admin_manual"];

// Helper to generate short order ID for display
function generateShortOrderId() {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `ORD-${timestamp}-${random}`;
}

// Normalize order data from Firestore
function normalizeOrder(docSnap) {
  const data = docSnap.data() || {};
  return {
    id: docSnap.id,
    shortId: data.shortId || docSnap.id.slice(0, 8).toUpperCase(),
    createdAt: data.createdAt?.toDate?.() || new Date(),
    createdBy: {
      userId: data.createdBy?.userId || null,
      buyerName: data.createdBy?.buyerName || "Customer",
    },
    contact: {
      contactPlatform: data.contact?.contactPlatform || "in_game",
      contactIdentifier: data.contact?.contactIdentifier || "",
    },
    items: Array.isArray(data.items) ? data.items : [],
    pricing: {
      subtotal: Number(data.pricing?.subtotal || 0),
      discount: Number(data.pricing?.discount || 0),
      promoCode: data.pricing?.promoCode || null,
      total: Number(data.pricing?.total || 0),
    },
    payment: {
      method: PAYMENT_METHODS.includes(data.payment?.method)
        ? data.payment.method
        : "manual",
      status: PAYMENT_STATUSES.includes(data.payment?.status)
        ? data.payment.status
        : "pending",
    },
    fulfillment: {
      status: FULFILLMENT_STATUSES.includes(data.fulfillment?.status)
        ? data.fulfillment.status
        : "queued",
      deliveryId: data.fulfillment?.deliveryId || null,
      notes: data.fulfillment?.notes || "",
    },
    metadata: {
      source: ORDER_SOURCES.includes(data.metadata?.source)
        ? data.metadata.source
        : "member_checkout",
      whatsappMessageSent: Boolean(data.metadata?.whatsappMessageSent),
    },
    // Raw timestamp for sorting
    _ts: data.createdAt?.toMillis?.() || Date.now(),
  };
}

export const useOrderStore = defineStore("order", {
  state: () => ({
    orders: [],         // All orders (for admin)
    userOrders: [],     // Current user's orders
    currentOrder: null, // Single order detail
    loading: false,
    error: null,
  }),

  getters: {
    // Get orders by fulfillment status
    ordersByStatus: (state) => (status) => {
      return state.orders.filter(o => o.fulfillment.status === status);
    },

    // Get pending payment orders
    pendingPayments: (state) => {
      return state.orders.filter(o => o.payment.status === "pending");
    },

    // Quick stats for dashboard
    orderStats: (state) => {
      const orders = state.orders;
      return {
        total: orders.length,
        queued: orders.filter(o => o.fulfillment.status === "queued").length,
        inProgress: orders.filter(o => o.fulfillment.status === "in_progress").length,
        completed: orders.filter(o => o.fulfillment.status === "completed").length,
        pendingPayment: orders.filter(o => o.payment.status === "pending").length,
      };
    },
  },

  actions: {
    /**
     * Create a new order - THE MAIN ENTRY POINT FOR CHECKOUT
     * @param {Object} payload - Order data
     * @returns {Object} { success: boolean, orderId?: string, shortId?: string, error?: string }
     */
    async createOrder(payload) {
      this.error = null;

      try {
        // Generate short ID for display/reference
        const shortId = payload.shortId || generateShortOrderId();

        // Build items array
        const items = (payload.items || []).map(item => ({
          productId: String(item.productId || item.id || ""),
          productName: String(item.productName || item.name || "Product"),
          quantity: Number(item.quantity || item.qty || 1),
          unitPrice: Number(item.unitPrice || item.price || 0),
          subtotal: Number(item.subtotal || (item.price * (item.qty || 1)) || 0),
        }));

        // Calculate pricing
        const subtotal = Number(payload.pricing?.subtotal || payload.subtotal || 0);
        const discount = Number(payload.pricing?.discount || payload.discount || 0);
        const total = Number(payload.pricing?.total || payload.total || subtotal - discount);

        const orderData = {
          shortId,
          createdAt: serverTimestamp(),

          createdBy: {
            userId: payload.userId || null,
            buyerName: String(payload.buyerName || "Customer").trim(),
          },

          contact: {
            contactPlatform: payload.contactPlatform || "in_game",
            contactIdentifier: String(payload.contactIdentifier || "").trim(),
          },

          items,

          pricing: {
            subtotal,
            discount,
            promoCode: payload.promoCode || null,
            total,
          },

          payment: {
            method: PAYMENT_METHODS.includes(payload.paymentMethod)
              ? payload.paymentMethod
              : "manual",
            status: PAYMENT_STATUSES.includes(payload.paymentStatus)
              ? payload.paymentStatus
              : "pending",
          },

          fulfillment: {
            status: "queued",
            deliveryId: null,
            notes: "",
          },

          metadata: {
            source: ORDER_SOURCES.includes(payload.source)
              ? payload.source
              : "member_checkout",
            whatsappMessageSent: false,
          },
        };

        const docRef = await addDoc(collection(db, "orders"), orderData);

        return {
          success: true,
          orderId: docRef.id,
          shortId,
        };
      } catch (error) {
        console.error("Failed to create order:", error);
        this.error = error.message;
        return { success: false, error: error.message };
      }
    },

    /**
     * Fetch all orders (Admin only)
     * @param {number} limitCount - Max orders to fetch
     */
    async fetchAllOrders(limitCount = 100) {
      this.loading = true;
      this.error = null;

      try {
        const q = query(
          collection(db, "orders"),
          orderBy("createdAt", "desc"),
          limit(limitCount)
        );
        const snapshot = await getDocs(q);

        this.orders = snapshot.docs.map(normalizeOrder);
      } catch (error) {
        console.error("Failed to fetch orders:", error);
        this.error = error.message;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Fetch orders for a specific user
     * @param {string} userId 
     */
    async fetchUserOrders(userId) {
      if (!userId) return;

      this.loading = true;
      this.error = null;

      try {
        const q = query(
          collection(db, "orders"),
          where("createdBy.userId", "==", userId),
          orderBy("createdAt", "desc"),
          limit(50)
        );
        const snapshot = await getDocs(q);

        this.userOrders = snapshot.docs.map(normalizeOrder);
      } catch (error) {
        console.error("Failed to fetch user orders:", error);
        this.error = error.message;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Get single order by ID
     * @param {string} orderId 
     */
    async fetchOrder(orderId) {
      if (!orderId) return null;

      try {
        const docSnap = await getDoc(doc(db, "orders", orderId));
        if (docSnap.exists()) {
          this.currentOrder = normalizeOrder(docSnap);
          return this.currentOrder;
        }
        return null;
      } catch (error) {
        console.error("Failed to fetch order:", error);
        return null;
      }
    },

    /**
     * Update payment status
     * @param {string} orderId 
     * @param {string} status - "pending" | "paid" | "failed"
     */
    async updatePaymentStatus(orderId, status) {
      if (!PAYMENT_STATUSES.includes(status)) return false;

      try {
        await updateDoc(doc(db, "orders", orderId), {
          "payment.status": status,
        });

        // Update local state
        const order = this.orders.find(o => o.id === orderId);
        if (order) order.payment.status = status;

        return true;
      } catch (error) {
        console.error("Failed to update payment status:", error);
        return false;
      }
    },

    /**
     * Update fulfillment status
     * @param {string} orderId 
     * @param {string} status - "queued" | "in_progress" | "completed" | "cancelled"
     */
    async updateFulfillmentStatus(orderId, status) {
      if (!FULFILLMENT_STATUSES.includes(status)) return false;

      try {
        await updateDoc(doc(db, "orders", orderId), {
          "fulfillment.status": status,
        });

        // Update local state
        const order = this.orders.find(o => o.id === orderId);
        if (order) order.fulfillment.status = status;

        return true;
      } catch (error) {
        console.error("Failed to update fulfillment status:", error);
        return false;
      }
    },

    /**
     * Add or update admin notes
     * @param {string} orderId 
     * @param {string} notes 
     */
    async updateOrderNotes(orderId, notes) {
      try {
        await updateDoc(doc(db, "orders", orderId), {
          "fulfillment.notes": String(notes || "").trim(),
        });

        // Update local state
        const order = this.orders.find(o => o.id === orderId);
        if (order) order.fulfillment.notes = notes;

        return true;
      } catch (error) {
        console.error("Failed to update order notes:", error);
        return false;
      }
    },

    /**
     * Link a delivery tracker to an order
     * @param {string} orderId 
     * @param {string} deliveryId 
     */
    async linkDelivery(orderId, deliveryId) {
      try {
        await updateDoc(doc(db, "orders", orderId), {
          "fulfillment.deliveryId": deliveryId || null,
        });

        // Update local state
        const order = this.orders.find(o => o.id === orderId);
        if (order) order.fulfillment.deliveryId = deliveryId;

        return true;
      } catch (error) {
        console.error("Failed to link delivery:", error);
        return false;
      }
    },

    /**
     * Mark WhatsApp message as sent
     * @param {string} orderId 
     */
    async markWhatsAppSent(orderId) {
      try {
        await updateDoc(doc(db, "orders", orderId), {
          "metadata.whatsappMessageSent": true,
        });

        // Update local state
        const order = this.orders.find(o => o.id === orderId);
        if (order) order.metadata.whatsappMessageSent = true;

        return true;
      } catch (error) {
        console.error("Failed to mark WhatsApp sent:", error);
        return false;
      }
    },
  },
});
