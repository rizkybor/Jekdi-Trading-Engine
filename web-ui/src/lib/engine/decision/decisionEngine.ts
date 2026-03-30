import { Candle, EngineConfig, DecisionResult, SignalType, ConfidenceLevel } from "../types";
import { getMASeries } from "../indicators/movingAverage";
import { getRSISeries, evaluateRSI } from "../indicators/rsi";
import { getMACDSeries, evaluateMACD } from "../indicators/macd";
import { getVolumeMA } from "../indicators/volume";

import { detectTrend } from "../context/trend";
import { detectSupportResistance, isNearSupportOrResistance } from "../context/supportResistance";
import { detectVolumeContext } from "../context/volume";
import { detectVolatility } from "../context/volatility";

import { evaluateEdgeStrategy } from "../strategy/edgeStrategy";
import { calculateScore } from "../scoring/scoring";
import { PreCalculatedIndicators } from "../indicators/datasectorsAdapter";

export function analyze(
  symbol: string,
  candles: Candle[],
  config: EngineConfig,
  preCalculated?: PreCalculatedIndicators,
  market: "idx" | "crypto" = "idx"
): DecisionResult {
  if (
    candles.length < config.indicators.maLong &&
    (!preCalculated || Object.values(preCalculated).some((v) => v === 0))
  ) {
    throw new Error(`Not enough data. Need at least ${config.indicators.maLong} candles or pre-calculated indicators.`);
  }

  const prices = candles.map((c) => c.close);
  const volumes = candles.map((c) => c.volume);
  const currentPrice = prices[prices.length - 1] || (preCalculated ? 0 : 0); // fallback if only precalc is passed
  const currentCandle = candles[candles.length - 1] || { volume: preCalculated?.volume || 0 };

  // --- 1. Indicator Layer ---
  let maShortVal = preCalculated?.ma20 || 0;
  let maLongVal = preCalculated?.ma50 || 0;
  let rsiVal = preCalculated?.rsi || 0;
  let macdVal = preCalculated?.macd || 0;
  let volMaVal = 0;
  
  let macdSignalVal = 0;
  let macdHistVal = 0;
  let prevMacdHistVal = undefined;

  // Calculate manually if not pre-calculated or to fill in missing parts (like signal line)
  if (!preCalculated && prices.length > 0) {
    const maShortSeries = getMASeries(prices, config.indicators.maShort);
    const maLongSeries = getMASeries(prices, config.indicators.maLong);
    const rsiSeries = getRSISeries(prices, config.indicators.rsiPeriod);
    const macdSeries = getMACDSeries(prices, config.indicators.macdFast, config.indicators.macdSlow, config.indicators.macdSignal);
    const volumeMaSeries = getVolumeMA(volumes, config.indicators.maShort);

    maShortVal = maShortSeries[maShortSeries.length - 1];
    maLongVal = maLongSeries[maLongSeries.length - 1];
    rsiVal = rsiSeries[rsiSeries.length - 1];
    macdVal = macdSeries.macdLine[macdSeries.macdLine.length - 1];
    macdSignalVal = macdSeries.signalLine[macdSeries.signalLine.length - 1];
    macdHistVal = macdSeries.histogram[macdSeries.histogram.length - 1];
    prevMacdHistVal = macdSeries.histogram[macdSeries.histogram.length - 2];
    volMaVal = volumeMaSeries[volumeMaSeries.length - 1];
  } else if (preCalculated) {
    // Basic fallback for volume MA if using pre-calc
    volMaVal = preCalculated.volume; // Assuming the precalculated volume is the context or we use it directly
    // Basic MACD evaluation fallback since we only get the MACD line from adapter
    macdHistVal = macdVal; // Simplification if signal line isn't provided
  }

  const rsiEval = evaluateRSI(rsiVal);
  const macdEval = evaluateMACD(macdVal, macdSignalVal, macdHistVal, prevMacdHistVal);

  // --- 2. Market Context Layer ---
  const trend = detectTrend(maShortVal, maLongVal, currentPrice);
  
  // Use previous candles to find support/resistance so current breakout candle doesn't become the resistance
  const previousCandles = candles.length > 1 ? candles.slice(0, -1) : candles;
  const supportResistanceLevels = detectSupportResistance(previousCandles);
  
  const nearSr = isNearSupportOrResistance(currentPrice, supportResistanceLevels);
  const volumeContext = detectVolumeContext(currentCandle.volume, volMaVal);
  const volatility = detectVolatility(candles);

  // --- 3. Edge Strategy Layer ---
  const edgeResult = evaluateEdgeStrategy({
    currentPrice,
    candles,
    maShort: maShortVal,
    maLong: maLongVal,
    rsi: rsiVal,
    trend,
    support: supportResistanceLevels.support,
    resistance: supportResistanceLevels.resistance,
    nearSupport: nearSr.nearSupport,
    nearResistance: nearSr.nearResistance,
    volumeContext,
    isExtremeVolatility: volatility.isExtreme,
    macdSignal: macdEval.signal,
    aggressiveBreakout: config.strategies.aggressiveBreakout,
    market
  });

  // --- 4. Scoring System ---
  const score = calculateScore({
    targetDirection: edgeResult.signal,
    strategyUsed: edgeResult.strategyUsed,
    rsiVal,
    rsiSignal: rsiEval.signal,
    macdSignal: macdEval.signal,
    trend,
    volumeContext,
    isConfirmed: edgeResult.confirmed,
    market
  });

  // --- Decision Rules & Confidence ---
  let finalSignal: SignalType = "NO TRADE";
  const buyThreshold = market === "crypto" ? 60 : config.decisionThresholds.buy;
  if (score >= buyThreshold) {
    // Breakout non-aggressive might return HOLD from edgeResult, but if score is high enough we still output what edge says
    finalSignal = edgeResult.signal as SignalType;
  } else if (score >= config.decisionThresholds.hold || edgeResult.signal === "HOLD") {
    finalSignal = "HOLD";
  }

  // Calculate alignment factors for confidence
  let alignmentFactors = 0;
  if ((finalSignal === "BUY" && trend === "uptrend") || (finalSignal === "SELL" && trend === "downtrend")) {
    alignmentFactors++;
  }
  if (edgeResult.strategyUsed !== null) {
    alignmentFactors++;
  }
  if (volumeContext === "spike" || volumeContext === "extreme_spike" || (market === "crypto" && (volumeContext === "normal" || volumeContext === "high"))) {
    // In crypto, normal/high volume is enough for alignment confidence, doesn't need to be a spike
    alignmentFactors++;
  }

  let confidence: ConfidenceLevel = "low";
  if (market === "crypto") {
    if (alignmentFactors >= 3) confidence = "high";
    else if (alignmentFactors === 2) confidence = "medium";
    else confidence = "low";
  } else {
    if (alignmentFactors >= 3) confidence = "high";
    else if (alignmentFactors === 2) confidence = "medium";
    else confidence = "low";
  }

  // --- Risk Management ---
  let stopLoss = 0;
  let takeProfit = 0;

  if (finalSignal === "BUY" || (finalSignal === "HOLD" && edgeResult.strategyUsed === "breakout")) {
    stopLoss = supportResistanceLevels.support * 0.99;
    const risk = currentPrice - stopLoss;
    takeProfit = currentPrice + (risk * config.riskManagement.riskRewardRatio);
  } else if (finalSignal === "SELL") {
    stopLoss = supportResistanceLevels.resistance * 1.01;
    const risk = stopLoss - currentPrice;
    takeProfit = currentPrice - (risk * config.riskManagement.riskRewardRatio);
  }

  return {
    symbol,
    signal: finalSignal,
    strategyUsed: edgeResult.strategyUsed,
    score,
    confidence,
    entry: finalSignal === "BUY" || finalSignal === "SELL" ? currentPrice : 0,
    stopLoss,
    takeProfit,
    reasons: edgeResult.reasons,
    context: {
      trend,
      volume: volumeContext,
    },
    indicators: {
      rsi: Number(rsiVal.toFixed(2)),
      macd: Number(macdVal.toFixed(2)),
      ma20: Number(maShortVal.toFixed(2)),
      ma50: Number(maLongVal.toFixed(2)),
    },
    debug: edgeResult.debug,
  };
}
