# Jekdi Multi-Strategy Adaptive Trading Engine

Trading Decision Engine untuk saham (fokus awal pada IDX) yang didesain secara modular, berbasis TypeScript, dan siap diintegrasikan ke platform SaaS. Engine ini **tidak hanya menggunakan indikator statis**, tetapi juga memahami **Market Context** dan menggunakan sistem pembobotan (*Scoring System*) untuk menghasilkan keputusan (*Trading Signal*) yang lebih cerdas seperti *quant trader* profesional.

## 🌟 Fitur Utama

Engine ini memiliki 3 Strategi Utama (*Edge Strategy*) yang beradaptasi dengan kondisi pasar:

1. **Pullback Strategy**: Mencari peluang masuk (*Buy/Sell*) saat harga kembali menyentuh area MA20 atau level Support/Resistance setelah bergerak dalam tren.
2. **Breakout Strategy**: Mencari peluang masuk saat harga menembus level Support/Resistance dengan *volume spike* (dilengkapi *Aggressive Mode* opsional).
3. **Trend Continuation Strategy**: Mendeteksi tren yang sangat kuat di mana harga terus melaju tanpa mengalami pullback, sehingga menghindari kehilangan momentum.

### 🛡️ Risk Management Bawaan
- Menghitung **Stop Loss** otomatis berdasarkan level *support* / *resistance* terdekat.
- Menghitung **Take Profit** otomatis dengan rasio Risk to Reward default 1:2.
- **Trade Filter**: Menolak transaksi (*NO TRADE*) pada kondisi pasar yang sangat *sideways*, volume terlalu sepi, atau terjadi pergerakan ekstrem (*extreme volatility*).

---

## 🚀 Cara Menggunakan

Engine ini berupa kumpulan fungsi murni (*pure functions*) yang bisa Anda panggil langsung di dalam aplikasi Node.js/TypeScript Anda.

### 1. Struktur Data (Input)

Engine ini membutuhkan data harga historis (masa lalu) untuk dapat menghitung indikator teknikal seperti *Moving Average* (MA20 & MA50), RSI, dan MACD secara akurat. 

**Aturan Penting:**
- **Minimal Data**: Anda wajib menyediakan minimal **50 baris data *candle*** yang berurutan secara kronologis (dari data terlama hingga data terbaru/hari ini). Jika kurang dari 50, indikator MA50 tidak akan bisa dihitung dan engine akan menghasilkan *error*. Disarankan memberikan **100 data terakhir** untuk hasil MACD dan RSI yang lebih stabil.
- **Urutan Data**: Data pertama pada array (index `0`) adalah data paling lama, dan data terakhir (index terakhir) adalah data harga saat ini (*current price* / hari ini).
- **Timeframe**: Engine ini bersifat *timeframe-agnostic*. Artinya, Anda bisa memasukkan data dengan rentang harian (1D), 1 jam (1H), atau 15 menit (15m). Engine akan membaca setiap object sebagai 1 "periode".

Format data *Candle* yang dibutuhkan (berupa Array of Objects):

```typescript
export interface Candle {
  timestamp: number; // Unix timestamp (waktu candle tersebut)
  open: number;      // Harga pembukaan
  high: number;      // Harga tertinggi
  low: number;       // Harga terendah
  close: number;     // Harga penutupan (harga saat ini jika candle belum ditutup)
  volume: number;    // Total volume transaksi
}
```

**Contoh Array Input:**
```json
[
  { "timestamp": 1709251200000, "open": 9800, "high": 9950, "low": 9750, "close": 9900, "volume": 12500000 },
  { "timestamp": 1709337600000, "open": 9900, "high": 10100, "low": 9850, "close": 10050, "volume": 15300000 },
  // ... (minimal 48 data lagi) ...
  { "timestamp": 1709424000000, "open": 10050, "high": 10250, "low": 10000, "close": 10150, "volume": 21000000 }
]
```

### 2. Konfigurasi (Opsional)

Engine ini dilengkapi dengan `defaultConfig`. Jika Anda ingin mengubah parameter indikator atau menyalakan mode *Aggressive Breakout*, Anda bisa melakukan *override*.

```typescript
import { defaultConfig } from "./engine/config";

// Contoh mengubah konfigurasi
const myConfig = { 
    ...defaultConfig, 
    strategies: { 
        aggressiveBreakout: true // Ubah menjadi true agar engine langsung BUY saat Breakout
    } 
};
```

### 3. Memanggil Analisa Utama

Gunakan fungsi `analyze` untuk memproses data:

```typescript
import { analyze } from "./engine/index";
import { defaultConfig } from "./engine/config";
import { Candle } from "./engine/types";

// 1. Siapkan data dari API Broker / Market Data Anda
const myCandles: Candle[] = [
  // ... pastikan array ini berisi minimal 50 object Candle terbaru
];

// 2. Jalankan analisa
try {
  const result = analyze("BBCA", myCandles, defaultConfig);
  
  // 3. Lihat hasilnya
  console.log(result.signal); // "BUY" | "SELL" | "HOLD" | "NO TRADE"
  console.log(result.score); // 0 - 100
  console.log(result.reasons); // Penjelasan bahasa manusia mengapa signal tersebut muncul
  
} catch (error) {
  console.error("Gagal melakukan analisa:", error);
}
```

---

## 🧾 Format Output

Jika analisa berhasil, Anda akan menerima kembalian data berupa object `DecisionResult` seperti di bawah ini:

```json
{
  "symbol": "BBCA",
  "signal": "BUY",
  "strategyUsed": "pullback",
  "score": 100,
  "confidence": "high",
  "entry": 10164,
  "stopLoss": 9919.8,
  "takeProfit": 10652.4,
  "reasons": [
    "Valid BUY pullback detected",
    "Pullback confirmed: Bullish candle close (Close > Prev Close), Volume spike detected"
  ],
  "context": {
    "trend": "uptrend",
    "volume": "extreme_spike"
  },
  "indicators": {
    "rsi": 48.89,
    "macd": 52.00,
    "ma20": 10294.5,
    "ma50": 10034.8
  }
}
```

### Penjelasan Output:
- **signal**: Sinyal final. Jika kondisi pasar tidak mendukung, akan mengembalikan `NO TRADE`.
- **strategyUsed**: Strategi apa yang memicu sinyal ini (`pullback`, `breakout`, `continuation`, atau `null`).
- **score**: Nilai kecocokan algoritma (0-100). Semakin tinggi semakin valid.
- **confidence**: Tingkat keyakinan berdasarkan sinkronisasi antar indikator (`low`, `medium`, `high`).
- **entry, stopLoss, takeProfit**: Rekomendasi harga eksekusi berdasarkan manajemen risiko.
- **reasons**: Daftar string yang sangat berguna untuk ditampilkan ke User UI sebagai *Reasoning* (Kenapa AI merekomendasikan Buy/Sell).

---

## 🧱 Arsitektur Internal

Jika Anda ingin memodifikasi *Engine* ini lebih jauh, perhatikan struktur direktori berikut:

- `/engine/indicators/` -> Berisi fungsi matematika murni penghitung RSI, MACD, MA, dan Volume.
- `/engine/context/` -> Berisi fungsi deteksi lingkungan pasar (Support/Resistance, Trend, Volatility).
- `/engine/strategy/` -> Berisi logika spesifik dari masing-masing strategi.
- `/engine/scoring/` -> Berisi kalkulator skor akhir (pembobotan + penalti).
- `/engine/decision/` -> `decisionEngine.ts` adalah aggregator (*entry point*) yang menggabungkan semua layer di atas.
