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
}

export interface EdgeStrategyOutput {
  signal: "BUY" | "SELL" | "HOLD" | "NONE";
  strategyUsed: StrategyType;
  reasons: string[];
  passedFilter: boolean;
  confirmed: boolean;
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
    aggressiveBreakout
  } = input;

  const reasons: string[] = [];

  // 1. Trade Filter
  const filter = isTradeFilteredOut(volumeContext, isExtremeVolatility, trend);
  if (filter.filtered) {
    reasons.push(`Trade filtered out: ${filter.reason}`);
    return { signal: "NONE", strategyUsed: null, reasons, passedFilter: false, confirmed: false };
  }

  // 2. Trend Filter (Only BUY above MA50, Only SELL below MA50)
  if (trend === "uptrend" && currentPrice < maLong) {
    reasons.push("Price is below MA50 during uptrend, invalidating BUY setup");
    return { signal: "NONE", strategyUsed: null, reasons, passedFilter: false, confirmed: false };
  }

  if (trend === "downtrend" && currentPrice > maLong) {
    reasons.push("Price is above MA50 during downtrend, invalidating SELL setup");
    return { signal: "NONE", strategyUsed: null, reasons, passedFilter: false, confirmed: false };
  }

  // 3. Strategy Selection Flow
  const isVolumeSpike = volumeContext === "spike" || volumeContext === "extreme_spike";

  // A. Try Pullback Strategy First
  const pullback = detectPullback(currentPrice, maShort, rsi, trend, nearSupport, nearResistance);
  if (pullback !== "NONE") {
    const targetDirection = pullback === "BUY_PULLBACK" ? "BUY" : "SELL";
    reasons.push(`Valid ${targetDirection} pullback detected`);
    
    const confirmation = checkConfirmation(candles, isVolumeSpike, macdSignal, targetDirection);
    if (!confirmation.confirmed) {
      reasons.push("Pullback signal not confirmed. Missing at least 2 confirmation factors.");
      return { signal: "NONE", strategyUsed: "pullback", reasons, passedFilter: true, confirmed: false };
    }

    reasons.push(`Pullback confirmed: ${confirmation.reasons.join(", ")}`);
    return { signal: targetDirection, strategyUsed: "pullback", reasons, passedFilter: true, confirmed: true };
  }

  // B. Try Breakout Strategy
  const breakout = detectBreakout(currentPrice, resistance, support, volumeContext, rsi);
  if (breakout !== "NONE") {
    const targetDirection = breakout === "BUY_BREAKOUT" ? "BUY" : "SELL";
    reasons.push(`Valid ${targetDirection} breakout detected`);
    
    if (!aggressiveBreakout) {
      reasons.push("Breakout detected, wait for confirmation or retest. Returning HOLD.");
      return { signal: "HOLD", strategyUsed: "breakout", reasons, passedFilter: true, confirmed: true };
    }

    const confirmation = checkConfirmation(candles, isVolumeSpike, macdSignal, targetDirection);
    if (!confirmation.confirmed) {
      reasons.push("Breakout signal not confirmed. Missing at least 2 confirmation factors.");
      return { signal: "NONE", strategyUsed: "breakout", reasons, passedFilter: true, confirmed: false };
    }

    reasons.push(`Breakout confirmed: ${confirmation.reasons.join(", ")} (Aggressive Mode)`);
    return { signal: targetDirection, strategyUsed: "breakout", reasons, passedFilter: true, confirmed: true };
  }

  // C. Try Trend Continuation Strategy
  const continuation = detectContinuation(currentPrice, maShort, maLong, rsi, trend);
  if (continuation !== "NONE") {
    const targetDirection = continuation === "BUY_CONTINUATION" ? "BUY" : "SELL";
    reasons.push(`Valid ${targetDirection} trend continuation detected`);
    
    const confirmation = checkConfirmation(candles, isVolumeSpike, macdSignal, targetDirection);
    if (!confirmation.confirmed) {
      reasons.push("Continuation signal not confirmed. Missing at least 2 confirmation factors.");
      return { signal: "NONE", strategyUsed: "continuation", reasons, passedFilter: true, confirmed: false };
    }

    reasons.push(`Continuation confirmed: ${confirmation.reasons.join(", ")}`);
    return { signal: targetDirection, strategyUsed: "continuation", reasons, passedFilter: true, confirmed: true };
  }

  reasons.push("No valid strategy setup found (Pullback, Breakout, or Continuation)");
  return { signal: "NONE", strategyUsed: null, reasons, passedFilter: true, confirmed: false };
}
