// LOKASI FILE: src/data/products.js
export const products = [
  // --- HEART PRODUCTS ---
  {
    id: "daily-heart",
    name: "Daily Heart (Via Bot)",
    category: "heart",
    price: 150, // HARGA NAIK JADI 150
    discountPrice: 0,
    iconType: "heart",
    tag: "Best Seller",
    desc: "Dikirim bertahap 1 heart/hari via Bot. Wajib add akun bot. Bonus +5 heart tiap beli 50.",
    isCalculator: true,
    config: {
      pricePerHeart: 150, // Update Config
      minHearts: 10,
      maxHearts: 1000,
      defaultHearts: 50,
      minSlots: 1,
      maxSlots: 20,
      hasBonus: true,
      isInstant: false,
    },
  },
  {
    id: "instant-heart",
    name: "Instant Heart (Kilat)",
    category: "heart",
    price: 500,
    discountPrice: 0,
    iconType: "zap",
    tag: "Premium",
    desc: "Dikirim LANGSUNG hari ini juga via Trade. Tanpa antri, tanpa slot bot.",
    isCalculator: true,
    config: {
      pricePerHeart: 500,
      minHearts: 10,
      maxHearts: 150,
      defaultHearts: 10,
      hasBonus: false,
      isInstant: true,
    },
  },

  // --- NEW PRODUCTS ---

  // 1. JOKI TRIALS (Update Harga)
  {
    id: "trial-elements",
    name: "Joki Trial of Elements",
    category: "special",
    price: 0,
    discountPrice: 0,
    iconType: "cloud",
    tag: "Challenge",
    desc: "Joki melewati rintangan Trial. Pilih elemen yang kamu butuhkan atau ambil paket lengkap.",
    eta: "30-60 Menit",
    variants: [
      { id: "t-water", name: "Trial Water 💧", price: 1500 }, // Update 1500
      { id: "t-earth", name: "Trial Earth 🌿", price: 2000 }, // Update 2000
      { id: "t-air", name: "Trial Air 💨", price: 3000 }, // Update 3000
      { id: "t-fire", name: "Trial Fire 🔥", price: 3500 }, // Update 3500
      {
        id: "t-bundle",
        name: "Bundle All Trials (Lengkap) ✨",
        price: 8000,
        isBundle: true,
      }, // Total 10k -> Bundle 8k (Opsional, sesuaikan jika mau diskon bundle)
    ],
  },

  // 2. JOKI CANDLE RUN (Update Opsi)
  {
    id: "cr-daily-quest",
    name: "Daily CR + Quest",
    category: "candlerun",
    price: 0,
    discountPrice: 0,
    iconType: "flame",
    tag: "Harian",
    desc: "Joki farming candle harian + pengerjaan Daily Quest. Aman 100% manual.",
    eta: "1-2 Jam",
    singleSelection: true,
    variants: [
      { id: "dq-only", name: "Daily Quest Only 📜", price: 3000 }, // Opsi Baru
      { id: "cr-15", name: "15 Candle + Daily Quest", price: 5000 },
      { id: "cr-20", name: "20 Candle + Daily Quest", price: 7000 },
    ],
  },

  // 3. RE-RUN (Produk Baru)
  {
    id: "re-run-eden",
    name: "Re-Run (Eden & WL)",
    category: "special",
    price: 0,
    discountPrice: 0,
    iconType: "star", // Icon Bintang
    tag: "Re-Run",
    desc: "Joki ambil Winged Light (WL) yang hilang atau reset Eden mingguan.",
    eta: "1-2 Jam",
    singleSelection: true, // User pilih salah satu paket
    variants: [
      { id: "eden-16", name: "Eden Run (16 Candle/All Statue)", price: 7000 },
      { id: "wl-run", name: "Winged Light Run (All Map)", price: 15000 },
      {
        id: "bundle-rerun",
        name: "Bundling: Eden + WL Run",
        price: 20000,
        isBundle: true,
      },
    ],
  },

  // 4. MOTH STARTER (Produk Baru)
  {
    id: "moth-starter",
    name: "Moth Starter Pack",
    category: "special",
    price: 0,
    discountPrice: 0,
    iconType: "sparkles",
    tag: "New",
    desc: "Bantu Moth atau akun baru untuk membuka map dan spirit.",
    eta: "1-3 Jam",
    variants: [
      { id: "relive-spirit", name: "Relive Spirit (Per Spirit)", price: 2000 }, // Nanti qty diatur di cart
      { id: "all-shrines", name: "All Map Shrines (Buka Map)", price: 15000 },
    ],
  },
];
