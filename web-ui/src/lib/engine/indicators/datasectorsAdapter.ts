// engine/indicators/datasectorsAdapter.ts
import { fetchRSI, fetchMACD, fetchMA, fetchOHLC } from '../../services/datasectors.service';

export interface PreCalculatedIndicators {
  rsi: number;
  macd: number;
  ma20: number;
  ma50: number;
  volume: number;
}

interface CacheItem {
  data: PreCalculatedIndicators;
  timestamp: number;
}

// In-memory cache
const cache = new Map<string, CacheItem>();
const CACHE_TTL_MS = 60 * 1000; // 60 seconds

export async function getIndicators(symbol: string): Promise<PreCalculatedIndicators> {
  const cached = cache.get(symbol);
  if (cached && (Date.now() - cached.timestamp < CACHE_TTL_MS)) {
    console.log(`[Cache Hit] Using cached indicators for ${symbol}`);
    return cached.data;
  }

  try {
    // Run requests in parallel
    const [rsiRes, macdRes, ma20Res, ma50Res, ohlcRes] = await Promise.all([
      fetchRSI(symbol).catch((e: unknown) => { console.warn(`Failed to fetch RSI for ${symbol}`, e); return null; }),
      fetchMACD(symbol).catch((e: unknown) => { console.warn(`Failed to fetch MACD for ${symbol}`, e); return null; }),
      fetchMA(symbol, 20).catch((e: unknown) => { console.warn(`Failed to fetch MA20 for ${symbol}`, e); return null; }),
      fetchMA(symbol, 50).catch((e: unknown) => { console.warn(`Failed to fetch MA50 for ${symbol}`, e); return null; }),
      fetchOHLC(symbol).catch((e: unknown) => { console.warn(`Failed to fetch OHLC for ${symbol}`, e); return null; })
    ]);

    // Mapping logic based on assumed DataSectors response structure.
    // If the API returns { data: { value: 123 } }, we extract it here.
    // We use fallback value 0 if the API fails or returns unexpected format.
    
    const indicators: PreCalculatedIndicators = {
      rsi: rsiRes?.data?.value ?? 0,
      macd: macdRes?.data?.macdLine ?? 0, // Using MACD line specifically
      ma20: ma20Res?.data?.value ?? 0,
      ma50: ma50Res?.data?.value ?? 0,
      volume: ohlcRes?.data?.volume ?? 0,
    };

    // Save to cache
    cache.set(symbol, {
      data: indicators,
      timestamp: Date.now()
    });

    return indicators;

  } catch (error: unknown) {
    console.error(`[Adapter Error] Failed to get indicators for ${symbol}`, error);
    // Return safe fallback values so engine doesn't crash
    return {
      rsi: 0,
      macd: 0,
      ma20: 0,
      ma50: 0,
      volume: 0
    };
  }
}
