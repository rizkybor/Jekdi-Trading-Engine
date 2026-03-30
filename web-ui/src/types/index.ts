export type SignalType = "BUY" | "SELL" | "HOLD" | "NO TRADE";
export type ConfidenceLevel = "low" | "medium" | "high";
export type StrategyType = "pullback" | "breakout" | "continuation" | null;
export type TrendType = "uptrend" | "downtrend" | "sideways";

export interface IndicatorOutput {
  value: number;
  signal: "bullish" | "bearish" | "neutral";
  strength?: number;
}

export interface DecisionResult {
  symbol: string;
  signal: SignalType;
  strategyUsed: StrategyType;
  score: number;
  confidence: ConfidenceLevel;
  entry: number;
  stopLoss: number;
  takeProfit: number;
  reasons: string[];
  context: {
    trend: TrendType;
    volume: string;
  };
  indicators: {
    rsi: number;
    macd: number;
    ma20: number;
    ma50: number;
  };
  chartData?: {
    timestamp: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  }[];
  timeframeTargets?: {
    idx?: {
      swing: { action: "BUY" | "SELL" | "HOLD"; reason: string };
      position: { action: "BUY" | "SELL" | "HOLD"; reason: string };
    };
    crypto?: {
      shortTerm: { action: "BUY" | "SELL" | "HOLD"; reason: string };
      midTerm: { action: "BUY" | "SELL" | "HOLD"; reason: string };
      longTerm: { action: "BUY" | "SELL" | "HOLD"; reason: string };
    };
  };
  tradingPlans?: {
    type: "swing" | "position" | "short" | "mid" | "long";
    horizon: string;
    mode: "precise" | "range" | "narrative";
    entry?: number;
    entryZone?: [number, number] | string;
    stopLoss: number | string;
    takeProfit: number | string;
    riskReward?: number;
    description: string;
  }[];
}