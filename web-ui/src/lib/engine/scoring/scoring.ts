export interface ScoringInput {
  targetDirection: "BUY" | "SELL" | "HOLD" | "NONE";
  strategyUsed: "pullback" | "breakout" | "continuation" | null;
  rsiVal: number;
  rsiSignal: "bullish" | "bearish" | "neutral";
  macdSignal: "bullish" | "bearish" | "neutral";
  trend: "uptrend" | "downtrend" | "sideways";
  volumeContext: string;
  isConfirmed: boolean;
  market?: "idx" | "crypto";
}

export function calculateScore(input: ScoringInput): number {
  const { targetDirection, strategyUsed, rsiVal, macdSignal, trend, volumeContext, isConfirmed, market = "idx" } = input;
  let score = 0;

  if (targetDirection === "NONE" || targetDirection === "HOLD") return score;

  // 1. Base Score from Strategy (Max 40)
  if (strategyUsed === "pullback") score += 35;
  if (strategyUsed === "breakout") score += 40;
  if (strategyUsed === "continuation") score += 30;

  // 2. Trend Alignment (Max 20)
  if (targetDirection === "BUY" && trend === "uptrend") score += 20;
  if (targetDirection === "SELL" && trend === "downtrend") score += 20;

  // 3. Momentum (Max 20)
  if (targetDirection === "BUY") {
    if (macdSignal === "bullish") score += 10;
    const validRsi = market === "crypto" ? (rsiVal >= 35 && rsiVal <= 65) : (rsiVal >= 40 && rsiVal <= 60);
    if (validRsi) score += 10;
  } else if (targetDirection === "SELL") {
    if (macdSignal === "bearish") score += 10;
    const validRsi = market === "crypto" ? (rsiVal >= 35 && rsiVal <= 65) : (rsiVal >= 40 && rsiVal <= 60);
    if (validRsi) score += 10;
  }

  // 4. Volume Support (Max 10)
  if (volumeContext === "extreme_spike") score += 10;
  else if (volumeContext === "spike") score += 8;
  else if (volumeContext === "high") score += 5;
  else if (market === "crypto" && volumeContext === "normal") score += 3; // Crypto gets points for normal volume

  // 5. Confirmation Bonus (Max 10)
  if (isConfirmed) score += 10;

  return Math.min(100, Math.max(0, score));
}
