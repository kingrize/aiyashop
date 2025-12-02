// LOKASI FILE: src/data/products.js

export const products = [
  // --- TRIALS (Varian) ---
  {
    id: 'trial_custom',
    name: 'Joki Trials (Pilih Sendiri)',
    price: 3000,
    category: 'special',
    tag: 'Custom Trial',
    desc: 'Pilih trial yang bikin pusing aja, atau borong semua biar terima beres! Aman 100% manual.',
    note: 'Klik "Pilih Opsi" buat centang trial.',
    eta: '15-20 Menit/Trial',
    iconType: 'Cloud',
    color: 'bg-cyan-500 text-white',
    blobColor: 'bg-cyan-100',
    variants: [
      { id: 'v_water', name: 'Trial of Water 💧', price: 3000 },
      { id: 'v_earth', name: 'Trial of Earth 🪨', price: 3000 },
      { id: 'v_air', name: 'Trial of Air 🌪️', price: 4000 },
      { id: 'v_fire', name: 'Trial of Fire 🔥', price: 5000 },
      { id: 'v_all', name: 'Bundle: All 4 Trials ✨', price: 13000 }
    ]
  },

  // --- CANDLE RUN ---
  {
    id: 'cr_full',
    name: 'Full Candle Run (20-21 Candles)',
    price: 5000,
    category: 'candlerun',
    tag: 'Best Seller',
    desc: 'Lari keliling semua realm + bonus realm. Termasuk Daily Quest & Seasonal Candle.',
    note: 'Paling worth it buat daily.',
    eta: '1.5 - 2 Jam',
    iconType: 'Wind',
    color: 'bg-amber-400 text-white',
    blobColor: 'bg-amber-100'
  },
  {
    id: 'cr_grey',
    name: 'CR Sampai Abu (Grey Candle)',
    price: 7000,
    category: 'candlerun',
    tag: 'Hardcore',
    desc: 'Farming lilin sampai indikator lilin kamu jadi warna abu-abu (Limit Harian Mentok).',
    note: 'Cocok buat ngejar Traveling Spirit.',
    eta: '2 - 2.5 Jam',
    iconType: 'Flame',
    color: 'bg-slate-600 text-white',
    blobColor: 'bg-slate-200'
  },
  {
    id: 'cr_daily',
    name: 'Daily Quest + Seasonal Only',
    price: 2000,
    category: 'candlerun',
    tag: 'Harian',
    desc: 'Cuma ngerjain 4 misi harian + ambil lilin season.',
    note: 'Cepat & Praktis.',
    eta: '15-20 Menit',
    iconType: 'Sparkles',
    color: 'bg-sky-400 text-white',
    blobColor: 'bg-sky-100'
  },

  // --- HEART (DIGANTI JADI SATU KARTU SPESIAL) ---
  {
    id: 'heart_calculator',
    name: 'Custom Heart (Hitung Sendiri)',
    price: 3000, // Harga dasar display
    category: 'heart',
    tag: 'Calculator', // Tag ini nanti kita deteksi
    desc: 'Butuh 10, 50, atau 100 heart? Hitung budget dan bonus kamu di sini! Sesuaikan dengan slot bot.',
    note: 'Klik Order buat buka Kalkulator.',
    eta: 'Tergantung Qty',
    iconType: 'Heart',
    color: 'bg-rose-500 text-white',
    blobColor: 'bg-rose-100',
    isCalculator: true // FLAG PENTING: Ini pemicu modal
  },

  // --- SPECIAL ---
  {
    id: 'eden_run',
    name: 'Eden Run (Full Statues)',
    price: 10000,
    category: 'special',
    tag: 'Mingguan',
    desc: 'Mencairkan semua patung di Eye of Eden. Max Ascended Candle.',
    note: 'Reset tiap Minggu.',
    eta: '30-45 Menit',
    iconType: 'Star',
    color: 'bg-red-500 text-white',
    blobColor: 'bg-red-100'
  },
  {
    id: 'wing_run',
    name: 'Winged Light (WL) Run',
    price: 15000,
    category: 'special',
    tag: 'Re-collect',
    desc: 'Mengambil ulang semua WL yang ada di map (non-trial).',
    note: 'Berguna habis kena krill/Eden.',
    eta: '1 - 1.5 Jam',
    iconType: 'Sparkles',
    color: 'bg-emerald-400 text-white',
    blobColor: 'bg-emerald-100'
  }
];