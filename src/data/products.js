// LOKASI FILE: src/data/products.js
export const products = [
  // --- HEART PRODUCTS (KEEP) ---
  {
    id: "daily-heart",
    name: "Daily Heart (Via Bot)",
    category: "heart",
    price: 100,
    discountPrice: 0,
    iconType: "heart",
    tag: "Best Seller",
    desc: "Dikirim bertahap 1 heart/hari via Bot. Wajib add akun bot. Bonus +5 heart tiap beli 50.",
    isCalculator: true,
    config: {
      pricePerHeart: 100,
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

  // 1. JOKI TRIALS
  {
    id: "trial-elements",
    name: "Joki Trial of Elements",
    category: "special",
    price: 0, // Base 0, harga dari varian
    discountPrice: 0,
    iconType: "cloud", // Icon Awan/Elemen
    tag: "Challenge",
    desc: "Joki melewati rintangan Trial. Pilih elemen yang kamu butuhkan atau ambil paket lengkap.",
    eta: "30-60 Menit",
    variants: [
      { id: "t-water", name: "Trial Water 💧", price: 1000 },
      { id: "t-earth", name: "Trial Earth 🌿", price: 1000 },
      { id: "t-air", name: "Trial Air 💨", price: 1000 },
      { id: "t-fire", name: "Trial Fire 🔥", price: 1000 },
      // isBundle: true menandakan jika ini dipilih, yang lain otomatis uncheck
      {
        id: "t-bundle",
        name: "Bundle All Trials (Lengkap) ✨",
        price: 4000,
        isBundle: true,
      },
    ],
  },

  // 2. JOKI CANDLE RUN (CR)
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
    singleSelection: true, // Logic baru: Hanya bisa pilih 1 opsi (Radio Button)
    variants: [
      { id: "cr-15", name: "15 Candle + Daily Quest", price: 5000 },
      { id: "cr-20", name: "20 Candle + Daily Quest", price: 7000 },
    ],
  },

  // 3. JOKI WINGED LIGHT
  {
    id: "wl-all-map",
    name: "Winged Light (All Map)",
    category: "special",
    price: 5000, // Harga Pas
    discountPrice: 0,
    iconType: "star",
    tag: "Re-run",
    desc: "Joki ambil ulang semua Winged Light (WL) yang hilang dari Isle sampai Vault.",
    eta: "2 Jam",
  },
];
