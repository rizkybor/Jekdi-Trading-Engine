import { TrendType, StrategyType } from "../types";

export interface ScoringInput {
  targetDirection: "BUY" | "SELL" | "HOLD" | "NONE";
  strategyUsed: StrategyType;
  rsiVal: number;
  rsiSignal: "bullish" | "bearish" | "neutral";
  macdSignal: "bullish" | "bearish" | "neutral";
  trend: TrendType;
  volumeContext: string;
  isConfirmed: boolean;
}

export function calculateScore(input: ScoringInput): number {
  let score = 0;
  
  if (input.targetDirection === "NONE") {
    return 0; // If no clear direction, score is 0
  }

  const isBuy = input.targetDirection === "BUY" || (input.targetDirection === "HOLD" && input.strategyUsed === "breakout");

  // --- 1. Indicator Layer (Max ~30-40) ---
  // RSI Alignment (10)
  if ((isBuy && input.rsiSignal === "bullish") || (!isBuy && input.rsiSignal === "bearish")) {
    score += 10;
  } else if (input.rsiSignal === "neutral") {
    score += 5;
  }

  // MACD Alignment (15)
  if ((isBuy && input.macdSignal === "bullish") || (!isBuy && input.macdSignal === "bearish")) {
    score += 15;
  }

  // MA Alignment
  if ((isBuy && input.trend === "uptrend") || (!isBuy && input.trend === "downtrend")) {
    score += 15;
  }

  // --- 2. Market Context Layer (Max ~30) ---
  // Trend Validity (15)
  if (input.trend !== "sideways") {
    score += 15; 
  }

  // Volume Support (15)
  if (input.volumeContext === "spike" || input.volumeContext === "extreme_spike") {
    score += 15;
  } else if (input.volumeContext === "normal") {
    score += 5;
  }

  // --- 3. Edge Strategy Layer (Variable up to +40) ---
  if (input.strategyUsed === "pullback") {
    score += 40;
  } else if (input.strategyUsed === "breakout") {
    score += 30;
  } else if (input.strategyUsed === "continuation") {
    score += 25;
  }

  // Confirmation (10)
  if (input.isConfirmed) {
    score += 10;
  }

  // --- 4. Penalties ---
  if (input.rsiVal > 80) score -= 20;
  if (input.rsiVal < 20) score -= 20;
  if (input.volumeContext === "low") score -= 15;
  if (input.trend === "sideways") score -= 25;

  return Math.max(0, Math.min(score, 100)); // Ensure score is between 0 and 100
}
