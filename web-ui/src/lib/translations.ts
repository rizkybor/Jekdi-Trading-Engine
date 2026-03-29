export type Language = 'en' | 'id';

export const translations = {
  en: {
    // Navbar & Common
    searchPlaceholder: "Enter Ticker (e.g. BBRI)",
    compilingData: "Compiling Market Data",
    fetchError: "Failed to fetch analysis for ",
    
    // Signal Card
    algorithmScore: "Algorithm Score",
    confidenceLevel: "Confidence Level",
    marketDataAsOf: "Market data as of",
    
    // Trade Setup
    tradeSetup: "Trade Setup",
    entryPrice: "Entry Price",
    stopLoss: "Stop Loss",
    takeProfit: "Take Profit",
    riskRewardRatio: "Risk : Reward Ratio",
    risk: "Risk",
    reward: "Reward",
    
    // Indicator Grid
    technicalIndicators: "Technical Indicators",
    overbought: "Overbought",
    oversold: "Oversold",
    neutral: "Neutral",
    bullish: "Bullish",
    bearish: "Bearish",
    bullishCross: "Bullish Cross",
    bearishCross: "Bearish Cross",
    liquidity: "Liquidity",
    
    // Reasoning Panel
    decisionLogic: "Decision Logic",
    less: "Less",
    all: "All",
    
    // Strategy Insight
    strategyInsight: "Strategy Insight",
    pullbackTitle: "Smart Pullback Strategy",
    pullbackDesc: "Price experiences a temporary correction (retrace) to a Support or Moving Average area within an ongoing trend, providing an entry opportunity with lower risk.",
    breakoutTitle: "Breakout Strategy",
    breakoutDesc: "Price successfully breaks through a key Resistance or Support level accompanied by a volume spike, indicating the start of a new directional momentum.",
    continuationTitle: "Trend Continuation Strategy",
    continuationDesc: "The trend is so strong that the price continues to move steadily without significant correction. This strategy follows the dominant ongoing momentum."
  },
  id: {
    // Navbar & Common
    searchPlaceholder: "Masukkan Kode (cth. BBRI)",
    compilingData: "Menyusun Data Pasar",
    fetchError: "Gagal melakukan analisa untuk saham ",
    
    // Signal Card
    algorithmScore: "Skor Algoritma",
    confidenceLevel: "Tingkat Keyakinan",
    marketDataAsOf: "Data pasar per",
    
    // Trade Setup
    tradeSetup: "Rencana Trading",
    entryPrice: "Harga Masuk",
    stopLoss: "Batas Rugi (SL)",
    takeProfit: "Ambil Untung (TP)",
    riskRewardRatio: "Rasio Risiko : Keuntungan",
    risk: "Risiko",
    reward: "Keuntungan",
    
    // Indicator Grid
    technicalIndicators: "Indikator Teknis",
    overbought: "Jenuh Beli",
    oversold: "Jenuh Jual",
    neutral: "Netral",
    bullish: "Bullish",
    bearish: "Bearish",
    bullishCross: "Persilangan Naik",
    bearishCross: "Persilangan Turun",
    liquidity: "Likuiditas",
    
    // Reasoning Panel
    decisionLogic: "Logika Keputusan",
    less: "Lebih Sedikit",
    all: "Semua",
    
    // Strategy Insight
    strategyInsight: "Wawasan Strategi",
    pullbackTitle: "Strategi Smart Pullback",
    pullbackDesc: "Harga mengalami koreksi sementara (retrace) ke area Support atau Moving Average dalam kondisi trend yang sedang berlangsung, memberikan peluang entry dengan risiko lebih rendah.",
    breakoutTitle: "Strategi Breakout",
    breakoutDesc: "Harga berhasil menembus level Resistance atau Support kunci yang disertai dengan lonjakan volume (volume spike), mengindikasikan dimulainya momentum pergerakan arah baru.",
    continuationTitle: "Strategi Trend Continuation",
    continuationDesc: "Trend yang terjadi sangat kuat sehingga harga terus melaju stabil tanpa mengalami koreksi berarti. Strategi ini mengikuti momentum dominan yang sedang berlangsung."
  }
};

export type TranslationKey = keyof typeof translations.en;
