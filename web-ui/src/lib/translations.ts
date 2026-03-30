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
    continuationDesc: "The trend is so strong that the price continues to move steadily without significant correction. This strategy follows the dominant ongoing momentum.",
    scalpingTitle: "Extreme Scalping Strategy",
    scalpingDesc: "Capturing quick reversal opportunities when the market is in a state of panic or extreme FOMO, usually when indicators touch extreme levels right at major support/resistance.",
    
    // Recommendations
    recommendationTitle: "Trading Recommendation",
    recBuy: "Good opportunity to enter. Make sure to set your Stop Loss according to the Trade Setup to protect your capital. Do not use all your funds in one trade.",
    recSell: "Consider taking profits or cutting losses. The momentum has shifted negatively. It's safer to wait in cash.",
    recHold: "You are currently in a profitable position or the market is still testing key levels. Keep holding but tighten your Stop Loss (Trailing Stop) to secure profits.",
    recNoTrade: "The market is too risky or unclear (sideways/extreme volatility). The best position right now is to stay out of the market and wait for a clearer setup.",

    // Reasons
    tradeFiltered: "Trade filtered out: ",
    trendFilterBuy: "Price is below MA50 during uptrend, invalidating BUY setup",
    trendFilterSell: "Price is above MA50 during downtrend, invalidating SELL setup",
    validPullback: "Valid {dir} pullback detected",
    unconfirmedPullback: "Pullback signal not confirmed. Missing confirmation factors (Req: {req}).",
    confirmedPullback: "Pullback confirmed: ",
    validBreakout: "Valid {dir} breakout detected",
    breakoutWaitConfirmation: "Breakout detected, wait for confirmation or retest. Returning HOLD.",
    unconfirmedBreakout: "Breakout signal not confirmed. Missing confirmation factors (Req: {req}).",
    confirmedBreakout: "Breakout confirmed: ",
    validContinuation: "Valid {dir} trend continuation detected",
    unconfirmedContinuation: "Continuation signal not confirmed. Missing confirmation factors (Req: {req}).",
    confirmedContinuation: "Continuation confirmed: ",
    validScalping: "Valid {dir} scalping setup detected (Extreme level near S/R)",
    unconfirmedScalping: "Scalping signal not confirmed. Missing confirmation factors.",
    confirmedScalping: "Scalping confirmed: ",
    noClearSetup: "No clear trading setup detected",
    bullishCandle: "Bullish candle close (Close > Prev Close)",
    bearishCandle: "Bearish candle close (Close < Prev Close)",
    volumeSpike: "Volume spike detected",
    macdBullish: "MACD indicates bullish momentum/cross",
    macdBearish: "MACD indicates bearish momentum/cross"
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
    continuationDesc: "Trend yang terjadi sangat kuat sehingga harga terus melaju stabil tanpa mengalami koreksi berarti. Strategi ini mengikuti momentum dominan yang sedang berlangsung.",
    scalpingTitle: "Strategi Extreme Scalping",
    scalpingDesc: "Menangkap peluang reversal cepat saat pasar sedang panik atau FOMO ekstrem, biasanya saat indikator menyentuh level sangat jenuh tepat di area support/resistance mayor.",
    
    // Recommendations
    recommendationTitle: "Rekomendasi Tindakan",
    recBuy: "Peluang yang baik untuk masuk. Pastikan memasang Batas Rugi (Stop Loss) sesuai Rencana Trading untuk melindungi modal Anda. Hindari menggunakan seluruh dana (all-in) dalam satu transaksi.",
    recSell: "Pertimbangkan untuk merealisasikan keuntungan (Take Profit) atau memotong kerugian (Cut Loss). Momentum telah berubah negatif. Lebih aman menunggu di posisi cash (uang tunai).",
    recHold: "Anda sedang dalam posisi untung atau pasar sedang menguji level penting. Tetap tahan posisi Anda namun ketatkan Batas Rugi (Trailing Stop) untuk mengamankan profit.",
    recNoTrade: "Kondisi pasar sedang terlalu berisiko atau tidak jelas arahnya (sideways parah / volatilitas ekstrem). Posisi terbaik saat ini adalah tidak melakukan transaksi dan menunggu pola yang lebih jelas.",

    // Reasons
    tradeFiltered: "Perdagangan disaring: ",
    trendFilterBuy: "Harga berada di bawah MA50 saat uptrend, membatalkan sinyal BUY",
    trendFilterSell: "Harga berada di atas MA50 saat downtrend, membatalkan sinyal SELL",
    validPullback: "Pola pullback {dir} yang valid terdeteksi",
    unconfirmedPullback: "Sinyal pullback tidak terkonfirmasi. Kurang faktor konfirmasi (Butuh: {req}).",
    confirmedPullback: "Pullback terkonfirmasi: ",
    validBreakout: "Pola breakout {dir} yang valid terdeteksi",
    breakoutWaitConfirmation: "Breakout terdeteksi, menunggu konfirmasi atau retest. Mengembalikan HOLD.",
    unconfirmedBreakout: "Sinyal breakout tidak terkonfirmasi. Kurang faktor konfirmasi (Butuh: {req}).",
    confirmedBreakout: "Breakout terkonfirmasi: ",
    validContinuation: "Pola penerusan tren {dir} yang valid terdeteksi",
    unconfirmedContinuation: "Sinyal penerusan tren tidak terkonfirmasi. Kurang faktor konfirmasi (Butuh: {req}).",
    confirmedContinuation: "Penerusan tren terkonfirmasi: ",
    validScalping: "Setup scalping {dir} yang valid terdeteksi (Level ekstrem dekat S/R)",
    unconfirmedScalping: "Sinyal scalping tidak terkonfirmasi. Kurang faktor konfirmasi.",
    confirmedScalping: "Scalping terkonfirmasi: ",
    noClearSetup: "Tidak ada setup trading yang jelas terdeteksi",
    bullishCandle: "Penutupan candle Bullish (Close > Prev Close)",
    bearishCandle: "Penutupan candle Bearish (Close < Prev Close)",
    volumeSpike: "Lonjakan volume terdeteksi",
    macdBullish: "MACD menunjukkan momentum/persilangan bullish",
    macdBearish: "MACD menunjukkan momentum/persilangan bearish"
  }
};

export type TranslationKey = keyof typeof translations.en;
