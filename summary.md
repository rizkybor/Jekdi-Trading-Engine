# Jekdi Trading Engine - Executive Summary

## 1. Ikhtisar Proyek
**Jekdi Trading Engine** adalah platform as a Service (SaaS) berbasis web yang menyediakan analisis kuantitatif dan rekomendasi trading adaptif untuk dua pasar utama: **Saham (IDX)** dan **Cryptocurrency**. Sistem dirancang untuk membantu trader mengambil keputusan dengan objektivitas tinggi, meminimalkan risiko, dan mengoptimalkan peluang keuntungan melalui pendekatan *Explainable AI* (transparansi logika keputusan).

## 2. Tech Stack & Arsitektur Web
- **Frontend Framework:** Next.js (App Router)
- **Bahasa Pemrograman:** TypeScript (Type-safe logic)
- **Styling:** Tailwind CSS (Mobile-first, Responsive Grid)
- **State Management:** React Context API (Untuk Language/Translation Toggle ID/EN)
- **Komponen UI:** Shadcn UI / Custom Tailwind Components (Card, Badge, Grid)

## 3. Alur Kerja Sistem (Workflow)
Sistem Jekdi Trading Engine bekerja dengan memproses data melalui pipeline berikut:
1. **Data Input:** Menerima data pergerakan harga, *Support/Resistance*, dan indikator teknikal utama (MA20, MA50, RSI, MACD, Volume).
2. **Scoring System:** Menghitung kelayakan trading menggunakan sistem *Semi-Global Scoring* (Base Score dari spesifik strategi + Global Context dari keselarasan trend & momentum).
3. **Decision Engine:** Menentukan sinyal utama (**BUY**, **SELL**, **HOLD**, atau **NO TRADE**) berdasarkan akumulasi skor dan filter risiko.
4. **Adaptive Trading Plan:** Layer pintar yang menerjemahkan sinyal beli menjadi rencana trading konkrit yang disesuaikan dengan jenis pasar dan horizon waktu (*Timeframe*).
5. **UI Rendering:** Menampilkan hasil di dasbor pengguna secara interaktif, responsif, dan mudah dibaca (Professional & Dense UI).

## 4. Strategi Deteksi Pasar
Sistem dibekali kecerdasan untuk mendeteksi rezim pasar dan memilih strategi yang paling optimal:
- **Smart Pullback:** Mencari peluang *entry* rendah risiko saat harga terkoreksi dalam tren naik yang sehat.
- **Breakout Detection:** Menangkap momentum saat harga menembus level resistensi kunci dengan konfirmasi lonjakan volume.
- **Trend Continuation:** Membonceng tren super-kuat tanpa harus menunggu koreksi dalam.
- **Extreme Scalping (Khusus Crypto):** Memanfaatkan momen kepanikan pasar dengan menangkap *reversal* cepat saat indikator sangat *oversold* di level support krusial.

## 5. Adaptive Trading Plan (Manajemen Risiko Terintegrasi)
Tidak ada satu rencana yang cocok untuk semua instrumen. Jekdi membedakan rekomendasi trading berdasarkan tipe pasar:

### A. Pasar Saham (IDX)
- 🟢 **Swing Plan (Primary):** Horizon 2–10 hari berdasarkan pergerakan trend dan momentum *pullback*.
- 🔵 **Position Plan (Optional):** Horizon berminggu-minggu hingga hitungan bulan untuk menangkap trend besar.

### B. Pasar Cryptocurrency
- ⚡ **Short Term (Intraday / Scalping):** Eksekusi cepat dan agresif dalam hitungan jam.
- 🚀 **Mid Term (Swing):** Horizon 1–7 hari untuk menangkap fluktuasi menengah.
- 🌙 **Long Term (Positioning):** Trend besar untuk strategi akumulasi atau *Dollar Cost Averaging* (DCA).

Setiap *Trading Plan* dilengkapi dengan:
- **Titik Entry** (Harga Beli)
- **Stop Loss** (Batas toleransi risiko yang ketat dan disiplin)
- **Take Profit** (Target rasio *Risk-to-Reward* yang rasional dan menguntungkan)

## 6. Fitur Utama & Keunggulan UI
- **Explainable AI (Reasoning Panel):** Jekdi bukanlah "Blackbox". Setiap sinyal yang dikeluarkan selalu disertai dengan panel **Logika Keputusan** yang menjelaskan alasan teknikal poin-demi-poin mengapa sistem merekomendasikan sinyal tersebut.
- **Bilingual Support:** Sistem sepenuhnya mendukung dua bahasa (Bahasa Indonesia dan English) yang dapat di-toggle secara *real-time* tanpa memuat ulang halaman.
- **Mobile Responsive & Dense UI:** Desain terinspirasi dari terminal trading profesional. Tampilan dipadatkan agar kaya informasi tanpa animasi berlebihan. Layout secara otomatis menyesuaikan (*grid* 2 kolom untuk HP, 4 kolom untuk Desktop) agar nyaman dibaca di segala perangkat.
- **Smart Recommendation:** Memberikan tips dan peringatan langsung (misal: "Jangan *All-In*", "Kencangkan *Trailing Stop*") layaknya mentor trading pribadi.
- **Configurable Risk Parameters:** Parameter toleransi *Stop Loss* dan rasio *Risk to Reward* bersifat dinamis dan dapat dikonfigurasi melalui sistem tanpa perlu mengubah inti logika deteksi.
