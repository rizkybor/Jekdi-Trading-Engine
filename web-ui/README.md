# Jekdi Trading Platform - Frontend UI

Ini adalah antarmuka utama (Web UI) untuk **Jekdi Multi-Strategy Adaptive Trading Engine**, sebuah aplikasi analitik *trading* siap pakai (SaaS-ready) yang sudah terintegrasi secara langsung dengan sumber data sungguhan melalui **API DataSectors**.

Aplikasi ini dibangun menggunakan Next.js 14+ (App Router), React, Tailwind CSS, dan Lightweight Charts (TradingView) untuk visualisasi yang profesional.

---

## 🛠️ Arsitektur Sistem

Aplikasi ini telah sepenuhnya dikonfigurasi untuk langsung dapat digunakan. Berikut adalah arsitekturnya:

1. **Frontend (`src/app`, `src/components`)**: Menampilkan hasil analisa, merender chart interaktif, mendukung mode multi-bahasa (ID/EN), dan menangani pencarian *ticker* aset (Saham/Crypto).
2. **Trading Engine (`src/lib/engine`)**: Inti (otak) kuantitatif yang menghitung indikator teknikal (RSI, MACD, MA), mengidentifikasi pola harga, menguji 4 jenis strategi, dan mengeluarkan kesimpulan sinyal final.
3. **API Data Integration (`src/app/api/analyze/route.ts`)**: Bertindak sebagai *Backend-for-Frontend*. Route ini menghubungi API DataSectors untuk mengambil data historis (saham IDX atau Cryptocurrency dari Binance), memformatnya menjadi *Candle array*, lalu menjalankannya ke dalam Trading Engine sebelum mengembalikannya ke layar Anda.

Alur kerjanya:
`User mengetik Ticker di Frontend (BBCA / BTCUSDT)` ➡️ `Next.js API Route memanggil DataSectors API` ➡️ `Data mentah dikonversi menjadi Array Candle` ➡️ `Kalkulasi indikator dan pencarian pola oleh Trading Engine` ➡️ `Frontend menampilkan Visual Chart, Rekomendasi, Trade Setup, dan Logika Keputusan`.

---

## 🚀 Cara Menjalankan Aplikasi (Development)

Proyek ini sudah dilengkapi dengan seluruh dependensinya. Anda hanya perlu menjalankannya.

### 1. Prasyarat Lingkungan (Environment)
Anda wajib memiliki API Key dari DataSectors untuk menarik data pasar.
Buat file `.env.local` di dalam folder `web-ui` ini:

```env
DATASECTORS_API_KEY=ds_live_kode_api_key_anda_disini
```

### 2. Instalasi & Running

Buka terminal di dalam folder `web-ui`, lalu jalankan:

```bash
# 1. Install semua dependencies
npm install

# 2. Jalankan server development
npm run dev
```

Aplikasi akan berjalan di `http://localhost:3000`.

---

## 📦 Struktur Folder Utama

*   `/src/app/page.tsx` - Halaman Dashboard utama.
*   `/src/app/api/analyze/route.ts` - *Controller* yang menyambungkan API Market Data dengan Algoritma Jekdi.
*   `/src/components/dashboard` - Komponen UI modular (Chart, Signal Card, Recommendation Card, Reasoning Panel).
*   `/src/lib/engine` - Source code asli dari algoritma Jekdi Trading Engine.
*   `/src/contexts/LanguageContext.tsx` - Pengatur *state* multi-bahasa (Inggris/Indonesia).
*   `/src/lib/translations.ts` - Kamus bahasa (*dictionary*) untuk seluruh teks aplikasi.

---

## ✨ Kustomisasi UI

UI ini menggunakan **Tailwind CSS**. Jika Anda ingin mengubah warna tema (yang saat ini bernuansa *Bloomberg Terminal* gelap), Anda bisa mengubah kode hex warnanya di dalam class komponen (misal: `bg-[#141414]`).

Chart menggunakan **Lightweight Charts**. Untuk menyesuaikan warna lilin (*candle*), edit file `src/components/dashboard/PriceChart.tsx`.

---

## 🔧 Trading Plan Configuration

Aplikasi ini menggunakan sistem "Adaptive Trading Plan" yang bisa dikonfigurasi melalui `src/lib/engine/config/tradingPlanConfig.ts`. Anda bisa mengubah:
- Toleransi Stop Loss (dalam persentase)
- Rasio Risk to Reward minimum
- Teks narasi untuk plan jangka panjang

---

Selamat melakukan *trading* otomatis dengan Jekdi Engine! 🚀