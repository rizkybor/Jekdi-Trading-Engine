import { NextResponse } from 'next/server';
import { analyze } from '@/lib/engine/index'; 
import { defaultConfig } from '@/lib/engine/config';
import { Candle } from '@/lib/engine/types';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get('symbol') || 'BBCA';

  try {
    let rawData: any[] = [];
    const API_KEY = process.env.DATASECTORS_API_KEY || '';
    
    // Create date range for the last ~6 months to get enough data for MA50
    const toDate = new Date().toISOString().split('T')[0];
    const fromDate = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    try {
      const response = await fetch(`https://api.datasectors.com/api/chart-saham/${symbol}/daily?from=${fromDate}&to=${toDate}`, {
        headers: { 'X-API-Key': API_KEY }
      });
      
      if (response.ok) {
        const json = await response.json();
        // The data is deeply nested: json.data.data.data.chartbit
        if (json?.data?.data?.data?.chartbit) {
          rawData = json.data.data.data.chartbit;
        } else {
          throw new Error("Invalid API response structure");
        }
      } else if (response.status === 429) {
        return NextResponse.json(
          { error: "Limit API DataSectors harian Anda telah habis. Silakan coba kembali besok hari." }, 
          { status: 429 }
        );
      } else {
        throw new Error("API responded with " + response.status);
      }
    } catch (fetchError: any) {
      console.warn("Failed to fetch historical chart from DataSectors:", fetchError);
      
      // If it's already a 429 response we crafted, don't catch and override it
      if (fetchError?.status === 429) throw fetchError;
      
      return NextResponse.json({ error: "Gagal mengambil data dari DataSectors API" }, { status: 500 });
    }

    // Map DataSectors structure to our Engine's Candle structure
    const candles: Candle[] = rawData.map((item: any) => ({
      timestamp: item.unixdate * 1000, // convert seconds to ms
      open: Number(item.open),
      high: Number(item.high),
      low: Number(item.low),
      close: Number(item.close),
      volume: Number(item.volume)
    })).sort((a, b) => a.timestamp - b.timestamp); // Sort oldest to newest

    if (candles.length < 50) {
      return NextResponse.json({ error: `Data historis tidak cukup (Ditemukan ${candles.length}, Minimal 50 hari)` }, { status: 400 });
    }

    // Run Trading Engine using historical candles. The engine will calculate indicators manually.
    // We are no longer using the adapter because DataSectors API provides OHLC but not direct indicator endpoints for free/easily.
    const result = analyze(symbol.toUpperCase(), candles, defaultConfig);

    return NextResponse.json({
      ...result,
      chartData: candles // Send raw candles back to UI for the chart
    });

  } catch (error) {
    console.error("Analyze Error:", error);
    return NextResponse.json({ error: "Gagal memproses analisa market" }, { status: 500 });
  }
}