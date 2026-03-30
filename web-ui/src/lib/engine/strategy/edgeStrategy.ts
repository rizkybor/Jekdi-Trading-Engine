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
    reasons.push(`Trade filtered out: ${filter.reason}`);
    debug.rejectedReason.push(`Filter: ${filter.reason}`);
    return { signal: "NONE", strategyUsed: null, reasons, passedFilter: false, confirmed: false, debug };
  }

  // 2. Trend Filter (Only BUY above MA50, Only SELL below MA50)
  if (trend === "uptrend" && currentPrice < maLong) {
    reasons.push("Price is below MA50 during uptrend, invalidating BUY setup");
    debug.rejectedReason.push("Trend Filter: Price below MA50 in uptrend");
    return { signal: "NONE", strategyUsed: null, reasons, passedFilter: false, confirmed: false, debug };
  }

  if (trend === "downtrend" && currentPrice > maLong) {
    reasons.push("Price is above MA50 during downtrend, invalidating SELL setup");
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
    reasons.push(`Valid ${targetDirection} pullback detected`);
    
    const confirmation = checkConfirmation(candles, isVolumeSpike, macdSignal, targetDirection, market);
    if (!confirmation.confirmed) {
      reasons.push(`Pullback signal not confirmed. Missing confirmation factors (Req: ${market === "crypto" ? 1 : 2}).`);
      debug.rejectedReason.push("Pullback not confirmed");
      return { signal: "NONE", strategyUsed: "pullback", reasons, passedFilter: true, confirmed: false, debug };
    }

    reasons.push(`Pullback confirmed: ${confirmation.reasons.join(", ")}`);
    return { signal: targetDirection, strategyUsed: "pullback", reasons, passedFilter: true, confirmed: true, debug };
  } else {
    debug.rejectedReason.push("Pullback conditions not met");
  }

  // B. Try Breakout Strategy
  debug.strategyChecked.push("breakout");
  const breakout = detectBreakout(currentPrice, resistance, support, volumeContext, rsi);
  if (breakout !== "NONE") {
    const targetDirection = breakout === "BUY_BREAKOUT" ? "BUY" : "SELL";
    reasons.push(`Valid ${targetDirection} breakout detected`);
    
    if (!aggressiveBreakout) {
      reasons.push("Breakout detected, wait for confirmation or retest. Returning HOLD.");
      return { signal: "HOLD", strategyUsed: "breakout", reasons, passedFilter: true, confirmed: true, debug };
    }

    const confirmation = checkConfirmation(candles, isVolumeSpike, macdSignal, targetDirection, market);
    if (!confirmation.confirmed) {
      reasons.push(`Breakout signal not confirmed. Missing confirmation factors (Req: ${market === "crypto" ? 1 : 2}).`);
      debug.rejectedReason.push("Breakout not confirmed");
      return { signal: "NONE", strategyUsed: "breakout", reasons, passedFilter: true, confirmed: false, debug };
    }

    reasons.push(`Breakout confirmed: ${confirmation.reasons.join(", ")} (Aggressive Mode)`);
    return { signal: targetDirection, strategyUsed: "breakout", reasons, passedFilter: true, confirmed: true, debug };
  } else {
    debug.rejectedReason.push("Breakout conditions not met");
  }

  // C. Try Trend Continuation Strategy
  debug.strategyChecked.push("continuation");
  const continuation = detectContinuation(currentPrice, maShort, maLong, rsi, trend, market);
  if (continuation !== "NONE") {
    const targetDirection = continuation === "BUY_CONTINUATION" ? "BUY" : "SELL";
    reasons.push(`Valid ${targetDirection} trend continuation detected`);
    
    const confirmation = checkConfirmation(candles, isVolumeSpike, macdSignal, targetDirection, market);
    if (!confirmation.confirmed) {
      reasons.push(`Continuation signal not confirmed. Missing confirmation factors (Req: ${market === "crypto" ? 1 : 2}).`);
      debug.rejectedReason.push("Continuation not confirmed");
      return { signal: "NONE", strategyUsed: "continuation", reasons, passedFilter: true, confirmed: false, debug };
    }

    reasons.push(`Continuation confirmed: ${confirmation.reasons.join(", ")}`);
    return { signal: targetDirection, strategyUsed: "continuation", reasons, passedFilter: true, confirmed: true, debug };
  } else {
    debug.rejectedReason.push("Continuation conditions not met");
  }

  // Fallback if no strategy matches
  reasons.push("No clear trading setup detected");
  debug.rejectedReason.push("No strategy matched");
  return { signal: "NONE", strategyUsed: null, reasons, passedFilter: true, confirmed: false, debug };
}
