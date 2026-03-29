import { EngineConfig } from "./types";

export const defaultConfig: EngineConfig = {
  indicators: {
    rsiPeriod: 14,
    macdFast: 12,
    macdSlow: 26,
    macdSignal: 9,
    maShort: 20,
    maLong: 50,
  },
  strategies: {
    aggressiveBreakout: false,
  },
  scoringWeights: {
    indicator: 40,
    context: 30,
    strategy: 30,
  },
  decisionThresholds: {
    buy: 70, // buy or sell if >= 70
    hold: 40, // hold if >= 40
  },
  riskManagement: {
    riskRewardRatio: 2, // 1:2 Risk to Reward
  },
};
