import { NextResponse } from 'next/server';
import { analyze } from '@/lib/engine/index'; 
import { defaultConfig } from '@/lib/engine/config';
import { Candle } from '@/lib/engine/types';

type DataSectorsChartResponse = {
  data?: {
    data?: {
      data?: {
        chartbit?: unknown;
      };
    };
  };
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get('symbol') || 'BBCA';
  const market = searchParams.get('market') || 'idx';

  try {
    let rawData: unknown[] = [];
    const API_KEY = process.env.DATASECTORS_API_KEY || '';
    
    try {
      let response;
      if (market === 'crypto') {
        const formattedSymbol = symbol.includes(':') ? symbol : `BINANCE:${symbol}`;
        response = await fetch(`https://api.datasectors.com/api/chart/historical?symbol=${formattedSymbol}&timeframe=D&range=200`, {
          headers: { 'X-API-Key': API_KEY }
        });
      } else {
        const toDate = new Date().toISOString().split('T')[0];
        const fromDate = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        response = await fetch(`https://api.datasectors.com/api/chart-saham/${symbol}/daily?from=${fromDate}&to=${toDate}`, {
          headers: { 'X-API-Key': API_KEY }
        });
      }
      
      if (response.ok) {
        if (market === 'crypto') {
          const json = await response.json();
          if (!json?.success || !Array.isArray(json.data)) {
            return NextResponse.json({ error: 'Invalid API response format for crypto' }, { status: 500 });
          }
          rawData = json.data;
        } else {
          const json = (await response.json()) as DataSectorsChartResponse;
          if (!json?.data?.data?.data?.chartbit || !Array.isArray(json.data.data.data.chartbit)) {
            return NextResponse.json({ error: 'Invalid API response format' }, { status: 500 });
          }
          rawData = json.data.data.data.chartbit;
        }
      } else if (response.status === 429) {
        return NextResponse.json(
          { error: "Limit API DataSectors harian Anda telah habis. Silakan coba kembali besok hari." }, 
          { status: 429 }
        );
      } else {
        throw new Error("API responded with " + response.status);
      }
    } catch (fetchError: unknown) {
      console.warn("Failed to fetch historical chart from DataSectors:", fetchError);
      
      // If it's already a 429 response we crafted, don't catch and override it
      if (
        typeof fetchError === "object" &&
        fetchError !== null &&
        "status" in fetchError &&
        (fetchError as { status?: unknown }).status === 429
      ) {
        throw fetchError;
      }
      
      return NextResponse.json({ error: "Gagal mengambil data dari DataSectors API" }, { status: 500 });
    }

    // Map DataSectors structure to our Engine's Candle structure
    const toNumber = (v: unknown) => (typeof v === "number" ? v : typeof v === "string" ? Number(v) : Number.NaN);

    const candles: Candle[] = rawData
      .map((item): Candle | null => {
        if (typeof item !== "object" || item === null) return null;
        const record = item as Record<string, unknown>;

        // Stock uses unixdate, crypto uses time
        const rawTime = record.time ?? record.unixdate;
        if (typeof rawTime !== "number") return null;

        const open = toNumber(record.open);
        const high = toNumber(record.high);
        const low = toNumber(record.low);
        const close = toNumber(record.close);
        const volume = toNumber(record.volume);

        if ([open, high, low, close, volume].some((n) => Number.isNaN(n))) return null;

        return {
          timestamp: rawTime * 1000,
          open,
          high,
          low,
          close,
          volume,
        };
      })
      .filter((c): c is Candle => c !== null)
      .sort((a, b) => a.timestamp - b.timestamp);

    if (candles.length < 50) {
      return NextResponse.json({ error: `Data historis tidak cukup (Ditemukan ${candles.length}, Minimal 50 hari)` }, { status: 400 });
    }

    // Run Trading Engine using historical candles. The engine will calculate indicators manually.
    // We are no longer using the adapter because DataSectors API provides OHLC but not direct indicator endpoints for free/easily.
    const finalSymbol = market === 'crypto' ? (symbol.includes(':') ? symbol : `BINANCE:${symbol}`) : symbol;
    const result = analyze(finalSymbol.toUpperCase(), candles, defaultConfig, undefined, market as "idx" | "crypto");

    return NextResponse.json({
      ...result,
      chartData: candles // Send raw candles back to UI for the chart
    });

  } catch (error) {
    console.error("Analyze Error:", error);
    return NextResponse.json({ error: "Gagal memproses analisa market" }, { status: 500 });
  }
}
