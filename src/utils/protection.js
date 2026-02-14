
/**
 * Advanced Client-Side Protection
 * 
 * Fitur:
 * 1. Disable Klik Kanan (Context Menu)
 * 2. Disable Shortcut DevTools (F12, Ctrl+Shift+I/J/C, Ctrl+U)
 * 3. Anti-Debugger Loop (Membuat inspeksi kode sulit)
 * 
 * CATATAN PENTING:
 * - Ini hanya "Security through Obscurity".
 * - Tidak bisa mencegah hacker yang jago/niat.
 * - Efektif untuk mencegah user awam (90% user).
 */

export function enableProtection() {
    // Hanya aktifkan log di console biasa, bersihkan console biar bersih
    if (import.meta.env.PROD) {
        console.log = () => { };
        console.debug = () => { };
        console.info = () => { };
    }

    // 1. Disable Klik Kanan
    document.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        return false;
    });

    // 2. Disable Keyboard Shortcuts
    document.addEventListener('keydown', (e) => {
        // F12
        if (e.key === 'F12' || e.keyCode === 123) {
            e.preventDefault();
            return false;
        }

        // Ctrl+Shift+I (Inspect), Ctrl+Shift+J (Console), Ctrl+Shift+C (Element)
        if (e.ctrlKey && e.shiftKey && ['I', 'J', 'C'].includes(e.key?.toUpperCase())) {
            e.preventDefault();
            return false;
        }

        // Ctrl+U (View Source)
        if (e.ctrlKey && (e.key === 'u' || e.key === 'U')) {
            e.preventDefault();
            return false;
        }
    });

    // 3. Anti-Debugger Loop
    // PERINGATAN: Ini akan sangat mengganggu saat development.
    // Kita aktifkan HANYA jika bukan localhost, atau jika dipaksa.

    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

    // Jika di production (bukan localhost), aktifkan debugger trap
    if (!isLocal) {
        // Teknik 1: Function constructor debugger
        setInterval(() => {
            (function () {
                return false;
            })
            ['constructor']('debugger')
                .call();
        }, 1000);

        // Teknik 2: Timing attack (opsional, bisa false positive di HP kentang)
        /*
        setInterval(() => {
          const start = performance.now();
          debugger;
          const end = performance.now();
          if (end - start > 100) {
             // DevTools terbuka (breakpoint hit)
             document.body.innerHTML = '';
             window.location.reload();
          }
        }, 500);
        */
    } else {
        console.log('🛡️ Protection modules loaded but Anti-Debugger disabled on localhost.');
    }
}
