import { analyze } from "./engine/index";
import { defaultConfig } from "./engine/config";
import { Candle } from "./engine/types";

// Helper function untuk generate data dummy (100 candle terakhir)
function generateDummyData(startPrice: number, days: number): Candle[] {
  const candles: Candle[] = [];
  let currentPrice = startPrice;
  const now = Date.now();

  for (let i = days; i >= 0; i--) {
    // Random pergerakan harga harian (-2% sampai +2%)
    const changePercent = (Math.random() * 4 - 2) / 100;
    const changeAmount = currentPrice * changePercent;
    
    const open = currentPrice;
    const close = currentPrice + changeAmount;
    // Buat ekor (shadow) candle secara acak
    const high = Math.max(open, close) + (Math.random() * currentPrice * 0.01);
    const low = Math.min(open, close) - (Math.random() * currentPrice * 0.01);
    const volume = Math.floor(Math.random() * 500000) + 100000;

    candles.push({
      timestamp: now - (i * 24 * 60 * 60 * 1000), // Mundur 'i' hari
      open: Number(open.toFixed(0)),
      high: Number(high.toFixed(0)),
      low: Number(low.toFixed(0)),
      close: Number(close.toFixed(0)),
      volume: volume
    });

    currentPrice = close; // Update harga untuk hari berikutnya
  }

  return candles;
}

// Generate 100 data dummy dengan harga awal 10000
const sampleCandles = generateDummyData(10000, 100);

try {
  console.log("Jekdi Trading Engine - Test with Dummy Data\n");
  
  if (sampleCandles.length >= 50) {
    const result = analyze("DUMMY_STOCK", sampleCandles, defaultConfig);
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(`[INFO] Data tidak cukup. Diberikan: ${sampleCandles.length}, Dibutuhkan: 50.`);
  }

} catch (e) {
  console.error(e);
}
