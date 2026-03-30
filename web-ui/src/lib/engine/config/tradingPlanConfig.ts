export interface TradingPlanConfig {
  stock: {
    swing: {
      riskRewardRatio: number;
      stopLossTolerance: number; // e.g. 0.01 for 1%
    };
    position: {
      narrativeEntry: string;
      narrativeStopLoss: string;
      narrativeTakeProfit: string;
    };
  };
  crypto: {
    short: {
      riskRewardRatio: number;
      stopLossTolerance: number;
    };
    mid: {
      entryZoneTolerance: number; // e.g. 0.02 for 2%
      riskRewardRatio: number;
      stopLossTolerance: number;
    };
    long: {
      narrativeEntry: string;
      narrativeStopLoss: string;
      narrativeTakeProfit: string;
    };
  };
}

export const defaultTradingPlanConfig: TradingPlanConfig = {
  stock: {
    swing: {
      riskRewardRatio: 2.0,
      stopLossTolerance: 0.015, // 1.5% buffer for SL
    },
    position: {
      narrativeEntry: "Akumulasi bertahap di area Support Mayor atau saat harga mantul dari MA50",
      narrativeStopLoss: "Valid jika harga closing mingguan di bawah MA50 / Support Mayor",
      narrativeTakeProfit: "Ride the trend: Tahan selama struktur Uptrend (Higher High, Higher Low) terjaga",
    },
  },
  crypto: {
    short: {
      riskRewardRatio: 1.5, // Scalping/intraday often has tighter RR
      stopLossTolerance: 0.01, // 1% buffer
    },
    mid: {
      entryZoneTolerance: 0.02, // 2% range for entry zone
      riskRewardRatio: 2.0,
      stopLossTolerance: 0.025, // 2.5% buffer
    },
    long: {
      narrativeEntry: "Dollar Cost Averaging (DCA) secara konsisten selama harga berada di fase akumulasi atau di atas MA Long Term",
      narrativeStopLoss: "Cut loss strategis jika terjadi Winter/Bear Market (Harga break kuat di bawah Support Makro)",
      narrativeTakeProfit: "Trailing stop agresif saat terjadi fase euforia / extreme overbought mingguan",
    },
  },
};
