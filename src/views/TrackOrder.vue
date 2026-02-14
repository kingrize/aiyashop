<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  Search,
  Copy,
  Check,
  Heart,
  Sparkles,
  Package,
  CalendarDays,
  Clock3,
  ChevronRight,
  AlertCircle,
} from "lucide-vue-next";

import { useDeliveryStore } from "../stores/delivery";
// NOTE: formatRupiah tidak dipakai di halaman tracking (biar ringan)

const route = useRoute();
const router = useRouter();
const delivery = useDeliveryStore();

const codeInput = ref("");
const copied = ref(false);
const loading = ref(false);
const errorMsg = ref("");

// --- Cute product mapping ---
const kindOf = (o) => {
  const name = `${o?.productName || ""} ${o?.title || ""}`.toLowerCase();
  if (/(heart|❤|♡|💗|💖|💞)/i.test(name)) return "heart";
  if (/(bot|add bot|via bot)/i.test(name)) return "bot";
  if (/(member|vip|premium)/i.test(name)) return "member";
  return "default";
};

const kindIcon = (k) => {
  if (k === "heart") return Heart;
  if (k === "bot") return Sparkles;
  return Package;
};

const kindBadge = (k) => {
  if (k === "heart") return "bg-rose-500/15 border-rose-300/30 text-rose-700 dark:text-rose-200";
  if (k === "bot") return "bg-indigo-500/15 border-indigo-300/30 text-indigo-700 dark:text-indigo-200";
  if (k === "member") return "bg-amber-500/15 border-amber-300/30 text-amber-800 dark:text-amber-200";
  return "bg-slate-500/10 border-slate-200/60 text-slate-700 dark:text-slate-200";
};

const kindGradient = (k) => {
  if (k === "heart") return "from-rose-500 via-pink-500 to-red-500";
  if (k === "bot") return "from-indigo-500 via-violet-500 to-fuchsia-500";
  if (k === "member") return "from-amber-500 via-orange-500 to-rose-500";
  return "from-sky-500 via-indigo-500 to-violet-500";
};

const codeParam = computed(() => String(route.params.code || "").trim());

const statusBadge = (status) => {
  const s = String(status || "process").toLowerCase();
  // Pastikan kebaca di light & dark (sebelumnya terlalu nyaru di light)
  if (s === "done")
    return "bg-emerald-100 text-emerald-900 border-emerald-300/70 shadow-sm shadow-emerald-200/40 dark:bg-emerald-500/15 dark:text-emerald-200 dark:border-emerald-400/20 dark:shadow-none";
  if (s === "paused")
    return "bg-amber-100 text-amber-900 border-amber-300/70 shadow-sm shadow-amber-200/40 dark:bg-amber-500/15 dark:text-amber-200 dark:border-amber-400/20 dark:shadow-none";
  return "bg-sky-100 text-sky-900 border-sky-300/70 shadow-sm shadow-sky-200/40 dark:bg-sky-500/15 dark:text-sky-200 dark:border-sky-400/20 dark:shadow-none";
};

const statusLabel = (status) => {
  const s = String(status || "process").toLowerCase();
  if (s === "done") return "Selesai";
  if (s === "paused") return "Pause";
  return "Proses";
};

const progress = computed(() => {
  const o = delivery.publicOrder;
  if (!o) return 0;
  const total = Number(o.totalTarget || o.total || 0);
  const delivered = Number(o.deliveredTotal || o.delivered || 0);
  if (total <= 0) return 0;
  return Math.max(0, Math.min(100, (delivered / total) * 100));
});

const remainingDays = computed(() => {
  const o = delivery.publicOrder;
  if (!o) return null;
  const total = Number(o.totalTarget || o.total || 0);
  const delivered = Number(o.deliveredTotal || o.delivered || 0);
  const perDay = Number(o.perDay || 0);
  const rem = Math.max(0, total - delivered);
  if (!perDay) return null;
  return Math.ceil(rem / perDay);
});

const prettyDate = (ts) => {
  if (!ts) return "-";
  const d = ts?.toDate ? ts.toDate() : new Date(ts);
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" }).format(d);
};

const prettyTime = (ts) => {
  if (!ts) return "";
  const d = ts?.toDate ? ts.toDate() : new Date(ts);
  return new Intl.DateTimeFormat("id-ID", { timeStyle: "short" }).format(d);
};

async function loadByCode(code) {
  const c = String(code || "").trim().toUpperCase();
  if (!c) return;
  loading.value = true;
  errorMsg.value = "";
  try {
    await delivery.fetchPublicByCode(c);
  } catch (e) {
    console.error(e);
    errorMsg.value = "Kode tidak ditemukan atau belum dipublikasikan.";
  } finally {
    loading.value = false;
  }
}

function goSearch() {
  const c = String(codeInput.value || "").trim().toUpperCase();
  if (!c) return;
  router.push({ name: "track-code", params: { code: c } });
}

async function copyLink() {
  try {
    await navigator.clipboard.writeText(window.location.href);
    copied.value = true;
    setTimeout(() => (copied.value = false), 1600);
  } catch {}
}

watch(
  () => codeParam.value,
  (c) => {
    if (c) loadByCode(c);
  },
  { immediate: true },
);

onMounted(() => {
  if (!codeParam.value) {
    codeInput.value = "";
    delivery.clearPublic();
  }
});
</script>

<template>
  <div class="w-full max-w-3xl mx-auto px-4 py-6 md:py-10">
    <!-- Header -->
    <div class="mb-6 md:mb-8">
      <div
        class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border
               bg-white/60 dark:bg-slate-900/25
               border-white/60 dark:border-white/10
               text-slate-700 dark:text-slate-200 shadow-sm"
      >
        <Sparkles class="w-4 h-4 text-rose-400" />
        <span class="text-[11px] font-black tracking-widest uppercase">Tracking</span>
      </div>

      <h1 class="mt-3 text-2xl md:text-4xl font-black tracking-tight text-slate-800 dark:text-white">
        Lacak Progress Pesanan
      </h1>
      <p class="mt-1 text-sm md:text-base text-slate-500 dark:text-slate-400">
        Masukkan kode tracking yang kamu dapat dari admin, atau lihat daftar progress publik.
      </p>
    </div>

    <!-- Search box -->
    <div
      class="rounded-3xl p-4 md:p-5 border
             bg-white/70 dark:bg-slate-900/30
             border-white/60 dark:border-white/10
             shadow-xl shadow-slate-200/40 dark:shadow-none"
    >
      <div class="flex flex-col sm:flex-row gap-3">
        <div class="flex-1 min-w-0">
          <label class="text-[10px] font-black uppercase tracking-widest text-slate-400">
            Kode Tracking
          </label>
          <div class="mt-2 flex items-center gap-2">
            <div class="relative flex-1 min-w-0">
              <input
                v-model="codeInput"
                @keydown.enter="goSearch"
                placeholder="Contoh: AB12-CD34"
                class="w-full px-4 py-3 min-h-[44px] rounded-2xl border
                       bg-white/70 dark:bg-slate-950/20
                       border-slate-200/70 dark:border-white/10
                       text-slate-800 dark:text-white
                       placeholder:text-slate-400 dark:placeholder:text-slate-500
                       font-bold tracking-wide outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400"
              />
              <span class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                <Search class="w-4 h-4" />
              </span>
            </div>

            <!-- UX: 44px+ touch target -->
            <button
              @click="goSearch"
              class="px-5 py-3 min-h-[44px] rounded-2xl font-black text-sm
                     bg-rose-500 hover:bg-rose-600 text-white
                     shadow-lg shadow-rose-200/60 dark:shadow-none
                     transition active:scale-[0.98]"
            >
              Cari
            </button>
          </div>

          <div class="mt-2 flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
            <Clock3 class="w-4 h-4" />
            <span>Tips: kode biasanya format <b>AB12-CD34</b></span>
          </div>
        </div>

        <div class="sm:w-48">
          <label class="text-[10px] font-black uppercase tracking-widest text-slate-400">
            Lihat Semua
          </label>
          <!-- UX: 44px+ touch target -->
          <button
            @click="$router.push({ name: 'track-all' })"
            class="mt-2 w-full px-4 py-3 min-h-[44px] rounded-2xl font-black text-sm
                   bg-white/70 dark:bg-slate-950/20
                   border border-slate-200/70 dark:border-white/10
                   text-slate-700 dark:text-slate-200
                   hover:bg-white/90 dark:hover:bg-white/5
                   transition flex items-center justify-center gap-2"
          >
            <Package class="w-4 h-4 text-indigo-400" />
            Semua Progress
            <ChevronRight class="w-4 h-4 opacity-60" />
          </button>
        </div>
      </div>
    </div>

    <!-- Result -->
    <div v-if="loading" class="mt-6">
      <div
        class="rounded-3xl p-5 border animate-pulse
               bg-white/60 dark:bg-slate-900/25
               border-white/60 dark:border-white/10"
      >
        <div class="h-5 w-48 bg-slate-200/70 dark:bg-white/10 rounded-lg"></div>
        <div class="mt-4 h-3 w-full bg-slate-200/60 dark:bg-white/10 rounded-full"></div>
        <div class="mt-3 h-3 w-2/3 bg-slate-200/60 dark:bg-white/10 rounded-full"></div>
      </div>
    </div>

    <div v-else-if="errorMsg" class="mt-6">
      <div
        class="rounded-3xl p-5 border
               bg-rose-50/80 dark:bg-rose-900/10
               border-rose-200/60 dark:border-rose-700/30"
      >
        <div class="flex items-start gap-3">
          <AlertCircle class="w-5 h-5 text-rose-500 mt-0.5" />
          <div>
            <p class="font-black text-slate-800 dark:text-white">Tidak ketemu</p>
            <p class="text-sm text-slate-600 dark:text-slate-300">{{ errorMsg }}</p>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="delivery.publicOrder" class="mt-6">
      <div
        class="relative overflow-hidden rounded-3xl p-5 md:p-6 border
               bg-white/70 dark:bg-slate-900/30
               border-white/60 dark:border-white/10
               shadow-xl shadow-slate-200/40 dark:shadow-none"
      >
        <!-- cozy blobs -->
        <div class="absolute -top-10 -right-10 w-40 h-40 rounded-full blur-3xl opacity-[0.12] bg-rose-400 pointer-events-none"></div>
        <div class="absolute -bottom-12 -left-10 w-40 h-40 rounded-full blur-3xl opacity-[0.10] bg-indigo-400 pointer-events-none"></div>

        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <!-- UX: Prominent status badge - larger for mobile visibility -->
            <div class="flex items-center gap-2">
              <span
                class="px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wide border"
                :class="statusBadge(delivery.publicOrder.status)"
              >
                {{ statusLabel(delivery.publicOrder.status) }}
              </span>

              <span
                class="px-2.5 py-1 rounded-full text-[10px] font-black tracking-widest border
                       bg-white/60 dark:bg-white/5
                       border-slate-200/60 dark:border-white/10
                       text-slate-700 dark:text-slate-200"
              >
                {{ (delivery.publicOrder.trackingCode || codeParam).toUpperCase() }}
              </span>
            </div>

            <!-- Icon + judul (rapi): sejajar dengan baris pertama judul -->
            <div class="mt-3 flex items-start gap-3">
              <div
                class="w-11 h-11 rounded-3xl border shadow-sm flex items-center justify-center shrink-0 mt-0.5
                       bg-white/80 dark:bg-slate-950/25
                       border-slate-200/70 dark:border-white/10"
              >
                <Heart v-if="kindOf(delivery.publicOrder) === 'heart'" class="w-6 h-6 text-rose-500" />
                <Sparkles v-else-if="kindOf(delivery.publicOrder) === 'bot'" class="w-6 h-6 text-amber-500" />
                <Package v-else class="w-6 h-6 text-indigo-500" />
              </div>

              <h2 class="text-xl md:text-2xl font-black tracking-tight text-slate-800 dark:text-white leading-tight pt-0.5">
                {{ delivery.publicOrder.title || delivery.publicOrder.productName || "Pesanan" }}
              </h2>
            </div>

            <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Nama:
              <span class="font-black text-slate-700 dark:text-slate-200">
                {{ delivery.publicOrder.customerName || "Customer" }}
              </span>
              <span v-if="delivery.publicOrder.usernameAlias" class="text-slate-400 font-bold"> • </span>
              <span v-if="delivery.publicOrder.usernameAlias" class="font-black text-slate-600 dark:text-slate-300">
                {{ delivery.publicOrder.usernameAlias }}
              </span>
            </p>
          </div>

          <!-- UX: 44px+ touch target for copy button -->
          <button
            @click="copyLink"
            class="shrink-0 px-4 py-3 min-h-[44px] rounded-2xl border
                   bg-white/70 dark:bg-slate-950/15
                   border-slate-200/60 dark:border-white/10
                   text-slate-700 dark:text-slate-200
                   hover:bg-white/90 dark:hover:bg-white/5
                   transition flex items-center gap-2 active:scale-[0.98]"
          >
            <Check v-if="copied" class="w-4 h-4 text-emerald-500" />
            <Copy v-else class="w-4 h-4" />
            <span class="text-xs font-black">{{ copied ? "Tersalin" : "Copy" }}</span>
          </button>
        </div>

        <!-- Progress -->
        <div class="mt-5">
          <div class="flex items-center justify-between mb-2">
            <p class="text-[11px] font-black tracking-widest uppercase text-slate-400">Progress</p>
            <p class="text-xs font-black text-slate-700 dark:text-slate-200">
              {{ Number(delivery.publicOrder.deliveredTotal || delivery.publicOrder.delivered || 0) }}
              /
              {{ Number(delivery.publicOrder.totalTarget || delivery.publicOrder.total || 0) }}
            </p>
          </div>

          <div
            class="relative h-4 rounded-full overflow-hidden border
                   bg-slate-100/80 dark:bg-white/5
                   border-slate-200/60 dark:border-white/10"
          >
            <!-- dotted candy background -->
            <div class="absolute inset-0 opacity-[0.35] dark:opacity-[0.25] bg-[radial-gradient(circle_at_8px_8px,rgba(255,255,255,0.9)_1px,transparent_1px)] [background-size:14px_14px]"></div>

            <div
              class="h-full rounded-full bg-gradient-to-r
                     transition-all duration-700 ease-out relative overflow-hidden"
              :class="kindGradient(kindOf(delivery.publicOrder))"
              :style="{ width: `${progress}%` }"
            >
              <div class="absolute inset-0 bg-white/25 w-full -translate-x-full animate-shine"></div>
            </div>

            <!-- tiny moving charm -->
            <div
              class="absolute top-1/2 -translate-y-1/2"
              :style="{ left: `calc(${progress}% - 10px)` }"
            >
              <div class="w-6 h-6 rounded-2xl border bg-white/80 dark:bg-slate-950/30 border-slate-200/70 dark:border-white/10 shadow-sm flex items-center justify-center">
                <Heart v-if="kindOf(delivery.publicOrder) === 'heart'" class="w-4 h-4 text-rose-500" />
                <Sparkles v-else class="w-4 h-4 text-indigo-500" />
              </div>
            </div>
          </div>

          <!-- mini meter -->
          <div class="mt-2 flex items-center gap-1.5">
            <component
              v-for="n in 5"
              :key="n"
              :is="kindOf(delivery.publicOrder) === 'heart' ? Heart : Sparkles"
              class="w-4 h-4"
              :class="
                progress >= n * 20
                  ? (kindOf(delivery.publicOrder) === 'heart' ? 'text-rose-500' : 'text-indigo-500')
                  : 'text-slate-300/70 dark:text-white/10'
              "
            />
            <span class="ml-1 text-[11px] font-black text-slate-500 dark:text-slate-400">
              {{ Math.round(progress) }}%
            </span>
          </div>

          <div class="mt-1 flex items-center justify-between">
            <p class="text-[11px] font-black text-slate-500 dark:text-slate-400" v-if="remainingDays !== null">
              Estimasi: <span class="text-slate-700 dark:text-slate-200">{{ remainingDays }} hari lagi</span>
            </p>
            <p class="text-[11px] font-black text-slate-500 dark:text-slate-400" v-else>
              Estimasi: <span class="text-slate-700 dark:text-slate-200">-</span>
            </p>
          </div>
        </div>

        <!-- Meta chips -->
        <div class="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2">
          <div class="rounded-2xl p-3 border bg-white/60 dark:bg-white/5 border-slate-200/60 dark:border-white/10">
            <p class="text-[10px] font-black uppercase tracking-widest text-slate-400">Kirim / Hari</p>
            <p class="mt-0.5 text-sm font-black text-slate-800 dark:text-white">
              {{ delivery.publicOrder.perDay ? `${delivery.publicOrder.perDay}` : "-" }}
            </p>
          </div>

          <div class="rounded-2xl p-3 border bg-white/60 dark:bg-white/5 border-slate-200/60 dark:border-white/10">
            <p class="text-[10px] font-black uppercase tracking-widest text-slate-400">Mulai</p>
            <p class="mt-0.5 text-sm font-black text-slate-800 dark:text-white flex items-center gap-2">
              <CalendarDays class="w-4 h-4 text-sky-400" />
              {{ prettyDate(delivery.publicOrder.startedAt || delivery.publicOrder.createdAt) }}
            </p>
          </div>

          <div class="rounded-2xl p-3 border bg-white/60 dark:bg-white/5 border-slate-200/60 dark:border-white/10">
            <p class="text-[10px] font-black uppercase tracking-widest text-slate-400">Update</p>
            <p class="mt-0.5 text-sm font-black text-slate-800 dark:text-white">
              {{ prettyDate(delivery.publicOrder.updatedAt) }}
              <span class="text-slate-400 font-bold">•</span>
              {{ prettyTime(delivery.publicOrder.updatedAt) }}
            </p>
          </div>
        </div>

        <!-- Daily logs -->
        <div class="mt-5">
          <div class="flex items-center justify-between mb-2">
            <p class="text-[11px] font-black tracking-widest uppercase text-slate-400">Laporan Harian</p>
            <p class="text-[11px] font-black text-slate-500 dark:text-slate-400">
              (terakhir {{ (delivery.publicOrder.logsPublic || []).length }} catatan)
            </p>
          </div>

          <div v-if="(delivery.publicOrder.logsPublic || []).length === 0"
               class="rounded-2xl p-4 border bg-slate-50/70 dark:bg-white/5 border-slate-200/60 dark:border-white/10">
            <p class="text-sm font-bold text-slate-600 dark:text-slate-300">
              Belum ada laporan harian. Nanti akan muncul kalau admin update ✨
            </p>
          </div>

          <div v-else class="space-y-2">
            <div
              v-for="(log, idx) in (delivery.publicOrder.logsPublic || []).slice(0, 8)"
              :key="idx"
              class="rounded-2xl p-3 border bg-white/60 dark:bg-white/5 border-slate-200/60 dark:border-white/10
                     flex items-center justify-between gap-3"
            >
              <div class="min-w-0 flex items-center gap-2">
                <CalendarDays class="w-4 h-4 text-sky-400 shrink-0" />
                <p class="text-sm font-black text-slate-800 dark:text-white">
                  {{ prettyDate(log.date) }}
                </p>
              </div>
              <div
                class="shrink-0 px-3 py-1.5 rounded-full border flex items-center gap-1"
                :class="kindBadge(kindOf(delivery.publicOrder))"
              >
                <Heart v-if="kindOf(delivery.publicOrder) === 'heart'" class="w-3.5 h-3.5" />
                <Sparkles v-else class="w-3.5 h-3.5" />
                <span class="text-xs font-black">+{{ log.amount }}</span>
              </div>
            </div>
          </div>

          <p class="mt-3 text-[11px] text-slate-500 dark:text-slate-400">
            Catatan: halaman ini publik. Informasi sensitif (akun/UID) tidak ditampilkan.
          </p>
        </div>
      </div>
    </div>

    <div v-else class="mt-6">
      <div
        class="rounded-3xl p-5 border
               bg-white/60 dark:bg-slate-900/25
               border-white/60 dark:border-white/10"
      >
        <p class="text-sm font-bold text-slate-600 dark:text-slate-300">
          Masukkan kode tracking untuk melihat progress.
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes shine {
  100% { transform: translateX(100%); }
}
.animate-shine { animation: shine 2.2s infinite linear; }
</style>
