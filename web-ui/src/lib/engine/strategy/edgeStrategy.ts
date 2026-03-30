import { TrendType, Candle, StrategyType } from "../types";
import { detectPullback } from "./pullback";
import { detectBreakout } from "./breakout";
import { detectContinuation } from "./continuation";
import { checkConfirmation } from "./confirmation";
import { isTradeFilteredOut } from "./tradeFilter";

export interface EdgeStrategyInput {
  currentPrice: number;
  candles: Candle[];
  maShort: number;
  maLong: number;
  rsi: number;
  trend: TrendType;
  support: number;
  resistance: number;
  nearSupport: boolean;
  nearResistance: boolean;
  volumeContext: string;
  isExtremeVolatility: boolean;
  macdSignal: "bullish" | "bearish" | "neutral";
  aggressiveBreakout: boolean;
  market?: "idx" | "crypto";
}

export interface EdgeStrategyOutput {
  signal: "BUY" | "SELL" | "HOLD" | "NONE";
  strategyUsed: StrategyType;
  reasons: string[];
  passedFilter: boolean;
  confirmed: boolean;
  debug?: {
    strategyChecked: string[];
    rejectedReason: string[];
  };
}

export function evaluateEdgeStrategy(input: EdgeStrategyInput): EdgeStrategyOutput {
  const {
    currentPrice,
    candles,
    maShort,
    maLong,
    rsi,
    trend,
    support,
    resistance,
    nearSupport,
    nearResistance,
    volumeContext,
    isExtremeVolatility,
    macdSignal,
    aggressiveBreakout,
    market = "idx"
  } = input;

  const reasons: string[] = [];
  const debug = { strategyChecked: [] as string[], rejectedReason: [] as string[] };

  // 1. Trade Filter
  const filter = isTradeFilteredOut(volumeContext, isExtremeVolatility, trend, market);
  if (filter.filtered) {
    reasons.push(`tradeFiltered: ${filter.reason}`);
    debug.rejectedReason.push(`Filter: ${filter.reason}`);
    return { signal: "NONE", strategyUsed: null, reasons, passedFilter: false, confirmed: false, debug };
  }

  // 2. Trend Filter (Only BUY above MA50, Only SELL below MA50)
  if (trend === "uptrend" && currentPrice < maLong) {
    reasons.push("trendFilterBuy");
    debug.rejectedReason.push("Trend Filter: Price below MA50 in uptrend");
    return { signal: "NONE", strategyUsed: null, reasons, passedFilter: false, confirmed: false, debug };
  }

  if (trend === "downtrend" && currentPrice > maLong) {
    reasons.push("trendFilterSell");
    debug.rejectedReason.push("Trend Filter: Price above MA50 in downtrend");
    return { signal: "NONE", strategyUsed: null, reasons, passedFilter: false, confirmed: false, debug };
  }

  // 3. Strategy Selection Flow
  const isVolumeSpike = volumeContext === "spike" || volumeContext === "extreme_spike";

  // A. Try Pullback Strategy First
  debug.strategyChecked.push("pullback");
  const pullback = detectPullback(currentPrice, maShort, rsi, trend, nearSupport, nearResistance, market);
  if (pullback !== "NONE") {
    const targetDirection = pullback === "BUY_PULLBACK" ? "BUY" : "SELL";
    reasons.push(`validPullback|${targetDirection}`);
    
    const confirmation = checkConfirmation(candles, isVolumeSpike, macdSignal, targetDirection, market);
    if (!confirmation.confirmed) {
      reasons.push(`unconfirmedPullback|${market === "crypto" ? 1 : 2}`);
      debug.rejectedReason.push("Pullback not confirmed");
      return { signal: "NONE", strategyUsed: "pullback", reasons, passedFilter: true, confirmed: false, debug };
    }

    reasons.push(`confirmedPullback|${confirmation.reasons.join(",")}`);
    return { signal: targetDirection, strategyUsed: "pullback", reasons, passedFilter: true, confirmed: true, debug };
  } else {
    debug.rejectedReason.push("Pullback conditions not met");
  }

  // B. Try Breakout Strategy
  debug.strategyChecked.push("breakout");
  const breakout = detectBreakout(currentPrice, resistance, support, volumeContext, rsi);
  if (breakout !== "NONE") {
    const targetDirection = breakout === "BUY_BREAKOUT" ? "BUY" : "SELL";
    reasons.push(`validBreakout|${targetDirection}`);
    
    if (!aggressiveBreakout) {
      reasons.push("breakoutWaitConfirmation");
      return { signal: "HOLD", strategyUsed: "breakout", reasons, passedFilter: true, confirmed: true, debug };
    }

    const confirmation = checkConfirmation(candles, isVolumeSpike, macdSignal, targetDirection, market);
    if (!confirmation.confirmed) {
      reasons.push(`unconfirmedBreakout|${market === "crypto" ? 1 : 2}`);
      debug.rejectedReason.push("Breakout not confirmed");
      return { signal: "NONE", strategyUsed: "breakout", reasons, passedFilter: true, confirmed: false, debug };
    }

    reasons.push(`confirmedBreakout|${confirmation.reasons.join(",")}`);
    return { signal: targetDirection, strategyUsed: "breakout", reasons, passedFilter: true, confirmed: true, debug };
  } else {
    debug.rejectedReason.push("Breakout conditions not met");
  }

  // C. Try Trend Continuation Strategy
  debug.strategyChecked.push("continuation");
  const continuation = detectContinuation(currentPrice, maShort, maLong, rsi, trend, market);
  if (continuation !== "NONE") {
    const targetDirection = continuation === "BUY_CONTINUATION" ? "BUY" : "SELL";
    reasons.push(`validContinuation|${targetDirection}`);
    
    const confirmation = checkConfirmation(candles, isVolumeSpike, macdSignal, targetDirection, market);
    if (!confirmation.confirmed) {
      reasons.push(`unconfirmedContinuation|${market === "crypto" ? 1 : 2}`);
      debug.rejectedReason.push("Continuation not confirmed");
      return { signal: "NONE", strategyUsed: "continuation", reasons, passedFilter: true, confirmed: false, debug };
    }

    reasons.push(`confirmedContinuation|${confirmation.reasons.join(",")}`);
    return { signal: targetDirection, strategyUsed: "continuation", reasons, passedFilter: true, confirmed: true, debug };
  } else {
    debug.rejectedReason.push("Continuation conditions not met");
  }

  // D. Try Scalping Strategy (Crypto Only)
  if (market === "crypto") {
    debug.strategyChecked.push("scalping");
    // Scalping logic: Look for extreme oversold/overbought conditions even against the trend
    if (rsi < 30 && currentPrice < support * 1.01) { // Oversold and near support
      const targetDirection = "BUY";
      reasons.push(`validScalping|${targetDirection}`);
      
      const confirmation = checkConfirmation(candles, isVolumeSpike, macdSignal, targetDirection, market);
      if (!confirmation.confirmed) {
        reasons.push(`unconfirmedScalping`);
        debug.rejectedReason.push("Scalping not confirmed");
        return { signal: "NONE", strategyUsed: "scalping", reasons, passedFilter: true, confirmed: false, debug };
      }
      
      reasons.push(`confirmedScalping|${confirmation.reasons.join(",")}`);
      return { signal: targetDirection, strategyUsed: "scalping", reasons, passedFilter: true, confirmed: true, debug };
    } else if (rsi > 70 && currentPrice > resistance * 0.99) { // Overbought and near resistance
      const targetDirection = "SELL";
      reasons.push(`validScalping|${targetDirection}`);
      
      const confirmation = checkConfirmation(candles, isVolumeSpike, macdSignal, targetDirection, market);
      if (!confirmation.confirmed) {
        reasons.push(`unconfirmedScalping`);
        debug.rejectedReason.push("Scalping not confirmed");
        return { signal: "NONE", strategyUsed: "scalping", reasons, passedFilter: true, confirmed: false, debug };
      }
      
      reasons.push(`confirmedScalping|${confirmation.reasons.join(",")}`);
      return { signal: targetDirection, strategyUsed: "scalping", reasons, passedFilter: true, confirmed: true, debug };
    } else {
      debug.rejectedReason.push("Scalping conditions not met");
    }
  }

  // Fallback if no strategy matches
  reasons.push("noClearSetup");
  debug.rejectedReason.push("No strategy matched");
  return { signal: "NONE", strategyUsed: null, reasons, passedFilter: true, confirmed: false, debug };
}
