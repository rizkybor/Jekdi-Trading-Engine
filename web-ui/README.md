# Jekdi Trading Platform - Frontend UI

Ini adalah User Interface (UI) untuk **Jekdi Multi-Strategy Adaptive Trading Engine**. Saat ini UI menggunakan *dummy data* agar Anda bisa melihat bagaimana bentuk visualisasinya. 

Dokumen ini akan memandu Anda tentang **cara menyambungkan UI ini dengan data saham asli (Real-Time / EOD)** agar dapat digunakan untuk trading sungguhan.

---

## 🛠️ Arsitektur Integrasi

Untuk membuat platform ini berjalan dengan data asli, Anda membutuhkan 3 komponen:
1. **Frontend (UI ini)**: Menampilkan hasil analisa.
2. **Trading Engine (Folder `engine/`)**: Otak yang menghitung RSI, MACD, dan strategi.
3. **Market Data Provider (API)**: Sumber data harga saham IDX (contoh: Yahoo Finance API, GoAPI IDX, atau API Sekuritas Anda).

Alur kerjanya:
`Frontend meminta data Saham (misal BBCA)` ➡️ `Fetch API Data Historis (50+ candle)` ➡️ `Masukkan data ke Trading Engine` ➡️ `Engine menghasilkan DecisionResult` ➡️ `Frontend me-render DecisionResult`.

---

## 🚀 Langkah-langkah Integrasi (Dari Dummy ke Real Data)

Berikut adalah panduan teknis untuk mengubah UI ini agar menggunakan data asli.

### 1. Buat API Route di Next.js (Backend-for-Frontend)

Karena CORS dan masalah *Security*, sangat disarankan untuk melakukan *fetch* data market dan menjalankan kalkulasi Engine di sisi Server, bukan di sisi Client (Browser).

Buat file baru di: `src/app/api/analyze/route.ts`

```typescript
// src/app/api/analyze/route.ts
import { NextResponse } from 'next/server';
// Import engine yang sudah kita buat sebelumnya di luar folder web-ui
// (Pastikan Anda sudah meng-copy folder /engine ke dalam project Next.js Anda, misal di src/lib/engine)
import { analyze } from '@/lib/engine/index'; 
import { defaultConfig } from '@/lib/engine/config';
import { Candle } from '@/lib/engine/types';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get('symbol') || 'BBCA';

  try {
    // 1. FETCH DATA DARI API PIHAK KETIGA (CONTOH MENGGUNAKAN YAHOO FINANCE)
    // Ganti URL ini dengan API Provider langganan Anda (misal GoAPI untuk IDX)
    const response = await fetch(`https://api.provider.com/v1/history?symbol=${symbol}&range=100d`);
    const rawData = await response.json();

    // 2. FORMAT DATA MENJADI ARRAY CANDLE
    const candles: Candle[] = rawData.map((item: any) => ({
      timestamp: new Date(item.date).getTime(),
      open: item.open,
      high: item.high,
      low: item.low,
      close: item.close,
      volume: item.volume
    }));

    // PASTIKAN DATA MINIMAL 50 HARI
    if (candles.length < 50) {
      return NextResponse.json({ error: "Data historis tidak cukup (Minimal 50 hari)" }, { status: 400 });
    }

    // 3. JALANKAN TRADING ENGINE
    const result = analyze(symbol, candles, defaultConfig);

    // 4. KEMBALIKAN HASIL KE FRONTEND
    return NextResponse.json(result);

  } catch (error) {
    return NextResponse.json({ error: "Gagal memproses analisa market" }, { status: 500 });
  }
}
```

### 2. Update Halaman Dashboard (Frontend)

Ubah file `src/app/page.tsx` yang saat ini menggunakan `dummyData` menjadi mengambil data dari API yang baru saja kita buat.

```tsx
"use client";

import { useState, useEffect } from "react";
import { DecisionResult } from "@/types";
import { SignalCard } from "@/components/dashboard/SignalCard";
import { TradeSetupCard } from "@/components/dashboard/TradeSetupCard";
import { ReasoningPanel } from "@/components/dashboard/ReasoningPanel";
import { IndicatorGrid } from "@/components/dashboard/IndicatorGrid";
import { StrategyExplanation } from "@/components/dashboard/StrategyExplanation";

export default function Dashboard() {
  const [data, setData] = useState<DecisionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [symbol, setSymbol] = useState("BBCA"); // Default saham

  // Fungsi untuk fetch data asli
  const fetchAnalysis = async (ticker: string) => {
    setLoading(true);
    try {
      // Memanggil API Route yang menjalankan Trading Engine
      const res = await fetch(`/api/analyze?symbol=${ticker}`);
      if (!res.ok) throw new Error("Gagal mengambil data");
      
      const result: DecisionResult = await res.json();
      setData(result);
    } catch (err) {
      console.error(err);
      alert("Gagal melakukan analisa untuk saham " + ticker);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data saat pertama kali halaman dimuat
  useEffect(() => {
    fetchAnalysis(symbol);
  }, []);

  return (
    <main className="min-h-screen p-4 md:p-8 lg:p-12 max-w-6xl mx-auto space-y-6">
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Jekdi AI Engine</h1>
          <p className="text-slate-400 text-sm">Real-time Market Analysis</p>
        </div>
        
        {/* INPUT UNTUK GANTI SAHAM */}
        <div className="flex gap-2">
          <input 
            type="text" 
            value={symbol}
            onChange={(e) => setSymbol(e.target.value.toUpperCase())}
            placeholder="KODE SAHAM (ex: BBRI)" 
            className="bg-slate-900 border border-slate-700 text-white px-4 py-2 rounded-lg outline-none"
          />
          <button 
            onClick={() => fetchAnalysis(symbol)}
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium"
          >
            {loading ? "Analyzing..." : "Analyze"}
          </button>
        </div>
      </header>

      {/* TAMPILKAN LOADING ATAU HASIL */}
      {loading ? (
        <div className="text-center py-20 text-slate-400">Sedang mengambil data dan menghitung indikator...</div>
      ) : data ? (
        <>
          <SignalCard data={data} />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <TradeSetupCard data={data} />
              <IndicatorGrid data={data} />
            </div>
            <div className="space-y-6">
              <ReasoningPanel reasons={data.reasons} signal={data.signal} />
              {data.strategyUsed && <StrategyExplanation strategy={data.strategyUsed} />}
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-20 text-slate-500">Silakan masukkan kode saham untuk memulai analisa.</div>
      )}
    </main>
  );
}
```

---

## 🔌 Rekomendasi Penyedia Data (API IDX)

Karena Trading Engine Anda sangat bergantung pada data yang akurat (Open, High, Low, Close, Volume), Anda perlu berlangganan/menggunakan penyedia API data saham Indonesia. Berikut beberapa opsi:

1. **GoAPI (goapi.id)**: Sangat direkomendasikan untuk pasar Indonesia (IDX). Mudah digunakan, harga terjangkau, dan format JSON-nya sangat bersih.
2. **Yahoo Finance API (Unofficial)**: Menggunakan package npm seperti `yahoo-finance2`. Gratis, namun kodenya harus ditambahkan suffix `.JK` (Contoh: `BBCA.JK`).
3. **TradingView Advanced Charts / Webhooks**: Jika Anda ingin integrasi yang lebih rumit menggunakan notifikasi webhook.

**Tips Penting:**
Pastikan saat melakukan fetch data harian (End of Day / EOD), Anda mengambil minimal `limit=100` data ke belakang agar kalkulasi Moving Average 50 (MA50) dan RSI(14) memiliki *buffer* historis yang cukup sehingga perhitungannya akurat.

---

## 📁 Memindahkan Folder Engine

Agar API route di Next.js bisa membaca file `engine/` yang kita buat di root folder sebelumnya, sebaiknya Anda memindahkan folder `engine/` tersebut ke dalam folder `web-ui/src/lib/`. 

```bash
# Jalankan perintah ini di terminal (root project)
cp -r engine web-ui/src/lib/
```

Selamat melakukan *trading* otomatis dengan Jekdi Engine! 🚀