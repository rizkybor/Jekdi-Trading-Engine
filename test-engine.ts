import * as dotenv from 'dotenv';
dotenv.config({ path: './web-ui/.env.local' });

import { getIndicators } from './web-ui/src/lib/engine/indicators/datasectorsAdapter';
import { analyze } from './web-ui/src/lib/engine/decision/decisionEngine';
import { defaultConfig } from './web-ui/src/lib/engine/config';
import { Candle } from './web-ui/src/lib/engine/types';

async function runTest() {
  const symbols = ["BBCA", "BBRI", "TLKM"];

  console.log("🚀 Testing Engine Integration with DataSectors API Adapter...\n");

  for (const symbol of symbols) {
    console.log(`Fetching indicators for ${symbol}...`);
    
    // 1. Fetch indicators via Adapter
    const indicators = await getIndicators(symbol);
    
    console.log(`\n📊 DataSectors Indicators for ${symbol}:`);
    console.log(JSON.stringify(indicators, null, 2));

    // For full analysis, we technically still need some OHLC history for Context Layer (support/resistance, volatility)
    // Since we only fetched indicators in this test, we'll provide a dummy minimal candle array to prevent crash
    // In a real scenario, you'd fetch OHLC history and pass it here, AND pass the preCalculated indicators
    
    // Creating minimal dummy history just so Context Layer doesn't crash on S&R calculation
    const dummyHistory: Candle[] = [];
    let price = symbol === "BBCA" ? 9000 : 5000;
    for (let i = 0; i < 50; i++) {
        dummyHistory.push({
            timestamp: Date.now() - (50 - i) * 86400000,
            open: price * 0.99,
            high: price * 1.02,
            low: price * 0.98,
            close: price,
            volume: indicators.volume || 100000
        });
        price += (Math.random() * 20 - 10);
    }
    // Set current close to match what might be expected, though indicators are driving the logic now
    dummyHistory[dummyHistory.length - 1].close = indicators.ma20 || price; 

    try {
        // 2. Run Engine with preCalculated indicators
        const result = analyze(symbol, dummyHistory, defaultConfig, indicators);
        
        console.log(`\n🤖 Engine Decision for ${symbol}:`);
        console.log(`Signal: ${result.signal}`);
        console.log(`Strategy Used: ${result.strategyUsed}`);
        console.log(`Score: ${result.score}`);
        console.log(`Confidence: ${result.confidence}`);
        console.log(`Reasons: \n - ${result.reasons.join('\n - ')}`);
        
    } catch (e: any) {
        console.error(`Error analyzing ${symbol}:`, e.message);
    }
    
    console.log("\n======================================================\n");
  }
}

runTest();
