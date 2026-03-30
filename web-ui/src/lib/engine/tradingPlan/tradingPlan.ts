import { DecisionResult, TradingPlan } from "../types";
import { defaultTradingPlanConfig, TradingPlanConfig } from "../config/tradingPlanConfig";

export function generateTradingPlans(
  market: "idx" | "crypto",
  currentPrice: number,
  support: number,
  resistance: number,
  maShort: number, // MA20
  maLong: number, // MA50
  decision: DecisionResult,
  config: TradingPlanConfig = defaultTradingPlanConfig
): TradingPlan[] {
  const plans: TradingPlan[] = [];

  // Skip generating actionable numerical plans if it's NO TRADE, 
  // but we can still return a narrative warning.
  const isNoTrade = decision.signal === "NO TRADE";

  if (market === "idx") {
    // 1. SWING PLAN (Precise)
    const swingConfig = config.stock.swing;
    
    // Entry logic: if buying, entry is near current price or pullback to MA20/Support
    let swingEntry = currentPrice;
    let swingStopLoss = 0;
    let swingTakeProfit = 0;
    
    if (decision.signal === "BUY") {
       // Prefer entry near MA20 if current price is higher, otherwise current price
       swingEntry = currentPrice > maShort * 1.01 ? maShort : currentPrice;
       swingStopLoss = Math.min(support, maShort) * (1 - swingConfig.stopLossTolerance);
       const risk = swingEntry - swingStopLoss;
       swingTakeProfit = swingEntry + (risk * swingConfig.riskRewardRatio);
    } else if (decision.signal === "SELL") {
       swingEntry = currentPrice < maShort * 0.99 ? maShort : currentPrice;
       swingStopLoss = Math.max(resistance, maShort) * (1 + swingConfig.stopLossTolerance);
       const risk = swingStopLoss - swingEntry;
       swingTakeProfit = swingEntry - (risk * swingConfig.riskRewardRatio);
    }

    plans.push({
      type: "swing",
      horizon: "2-10 Hari",
      mode: "precise",
      entry: isNoTrade ? 0 : Number(swingEntry.toFixed(0)),
      stopLoss: isNoTrade ? 0 : Number(swingStopLoss.toFixed(0)),
      takeProfit: isNoTrade ? 0 : Number(swingTakeProfit.toFixed(0)),
      riskReward: swingConfig.riskRewardRatio,
      description: isNoTrade 
        ? "Low probability setup. Kondisi market kurang ideal untuk swing trading saat ini."
        : "Swing plan berdasarkan momentum jangka pendek dan pantulan teknikal."
    });

    // 2. POSITION PLAN (Narrative)
    const positionConfig = config.stock.position;
    plans.push({
      type: "position",
      horizon: "Minggu-Bulan",
      mode: "narrative",
      entryZone: positionConfig.narrativeEntry,
      stopLoss: positionConfig.narrativeStopLoss,
      takeProfit: positionConfig.narrativeTakeProfit,
      description: "Position plan untuk trend follower yang mengincar pergerakan harga skala besar."
    });

  } else if (market === "crypto") {
    // 1. SHORT TERM (Precise / Intraday-Scalping)
    const shortConfig = config.crypto.short;
    let shortEntry = currentPrice;
    let shortStopLoss = 0;
    let shortTakeProfit = 0;

    if (decision.signal === "BUY") {
      shortEntry = currentPrice;
      // Tighter stop loss for short term
      shortStopLoss = currentPrice * (1 - shortConfig.stopLossTolerance);
      const risk = shortEntry - shortStopLoss;
      shortTakeProfit = shortEntry + (risk * shortConfig.riskRewardRatio);
    } else if (decision.signal === "SELL") {
      shortEntry = currentPrice;
      shortStopLoss = currentPrice * (1 + shortConfig.stopLossTolerance);
      const risk = shortStopLoss - shortEntry;
      shortTakeProfit = shortEntry - (risk * shortConfig.riskRewardRatio);
    }

    plans.push({
      type: "short",
      horizon: "Intraday / Scalping",
      mode: "precise",
      entry: isNoTrade ? 0 : Number(shortEntry.toFixed(4)),
      stopLoss: isNoTrade ? 0 : Number(shortStopLoss.toFixed(4)),
      takeProfit: isNoTrade ? 0 : Number(shortTakeProfit.toFixed(4)),
      riskReward: shortConfig.riskRewardRatio,
      description: isNoTrade
        ? "Volatilitas ekstrem atau market sideways. Tidak disarankan untuk scalping."
        : "Trading cepat memanfaatkan momentum indikator ekstrem (RSI/MACD)."
    });

    // 2. MID TERM (Range / Swing)
    const midConfig = config.crypto.mid;
    let midStopLoss = 0;
    let midTakeProfit = 0;
    let midEntryZone: [number, number] = [0, 0];

    if (decision.signal === "BUY") {
      const baseEntry = Math.max(support, maShort);
      midEntryZone = [
        Number((baseEntry * (1 - midConfig.entryZoneTolerance)).toFixed(4)),
        Number((baseEntry * (1 + midConfig.entryZoneTolerance)).toFixed(4))
      ];
      midStopLoss = midEntryZone[0] * (1 - midConfig.stopLossTolerance);
      const risk = midEntryZone[1] - midStopLoss; // Calculate risk from the top of the entry zone
      midTakeProfit = midEntryZone[1] + (risk * midConfig.riskRewardRatio);
    } else if (decision.signal === "SELL") {
      const baseEntry = Math.min(resistance, maShort);
      midEntryZone = [
        Number((baseEntry * (1 - midConfig.entryZoneTolerance)).toFixed(4)),
        Number((baseEntry * (1 + midConfig.entryZoneTolerance)).toFixed(4))
      ];
      midStopLoss = midEntryZone[1] * (1 + midConfig.stopLossTolerance);
      const risk = midStopLoss - midEntryZone[0];
      midTakeProfit = midEntryZone[0] - (risk * midConfig.riskRewardRatio);
    }

    plans.push({
      type: "mid",
      horizon: "Swing (1-7 Hari)",
      mode: "range",
      entryZone: isNoTrade ? [0, 0] : midEntryZone,
      stopLoss: isNoTrade ? 0 : Number(midStopLoss.toFixed(4)),
      takeProfit: isNoTrade ? 0 : Number(midTakeProfit.toFixed(4)),
      riskReward: midConfig.riskRewardRatio,
      description: isNoTrade
        ? "Low probability setup."
        : "Mencari area entry ideal dengan toleransi pergerakan swing kripto yang wajar."
    });

    // 3. LONG TERM (Narrative)
    const longConfig = config.crypto.long;
    plans.push({
      type: "long",
      horizon: "Trend Besar (Minggu-Bulan)",
      mode: "narrative",
      entryZone: longConfig.narrativeEntry,
      stopLoss: longConfig.narrativeStopLoss,
      takeProfit: longConfig.narrativeTakeProfit,
      description: "Plan investasi atau riding the trend untuk pergerakan harga struktural."
    });
  }

  return plans;
}
