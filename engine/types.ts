export interface Candle {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface IndicatorConfig {
  rsiPeriod: number;
  macdFast: number;
  macdSlow: number;
  macdSignal: number;
  maShort: number;
  maLong: number;
}

export interface EngineConfig {
  indicators: IndicatorConfig;
  strategies: {
    aggressiveBreakout: boolean;
  };
  scoringWeights: {
    indicator: number;
    context: number;
    strategy: number;
  };
  decisionThresholds: {
    buy: number; // >= 70
    hold: number; // >= 40
  };
  riskManagement: {
    riskRewardRatio: number; // e.g. 2 for 1:2
  };
}

export type SignalType = "BUY" | "SELL" | "HOLD" | "NO TRADE";
export type TrendType = "uptrend" | "downtrend" | "sideways";
export type ConfidenceLevel = "low" | "medium" | "high";
export type StrategyType = "pullback" | "breakout" | "continuation" | null;

export interface IndicatorOutput {
  value: number;
  signal: "bullish" | "bearish" | "neutral";
  strength: number; // 0 to 1
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
}
