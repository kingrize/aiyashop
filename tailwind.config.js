// LOKASI FILE: tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['Quicksand', 'sans-serif'],
      },
      colors: {
        // DEFINISI WARNA EXACT MATCH DENGAN shopaiya.html
        sky: {
          light: '#E0F7FA',  // Biru muda banget (untuk blob/bg)
          DEFAULT: '#4FC3F7', // Biru Utama (untuk tombol/icon)
          soft: '#81D4FA',
          pastel: '#B3E5FC',
          dark: '#0288D1'
        },
        cream: '#FDFBF7',
        gold: {
          DEFAULT: '#FFD54F', // Kuning/Emas Lilin
          pastel: '#FFF59D'
        },
        heart: {
          DEFAULT: '#FF8A80', // Merah muda Heart
          light: '#FFEBEE'
        },
        // Tambahan warna semantic biar gampang
        primary: '#4FC3F7', 
        secondary: '#FFD54F',
      },
      borderRadius: {
        'blob': '40% 60% 70% 30% / 40% 50% 60% 50%',
      },
      // PERBAIKAN ANIMASI
      animation: {
        'float-slow': 'float 6s ease-in-out infinite',
        'float-fast': 'float 3s ease-in-out infinite',
        'spin-slow': 'spin 8s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '50%': { transform: 'translateY(-15px) rotate(2deg)' },
        }
      }
    },
  },
  plugins: [],
}