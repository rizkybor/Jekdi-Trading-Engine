import { Candle, EngineConfig, DecisionResult, SignalType, ConfidenceLevel } from "../types";
import { getMASeries, evaluateMA } from "../indicators/movingAverage";
import { getRSISeries, evaluateRSI } from "../indicators/rsi";
import { getMACDSeries, evaluateMACD } from "../indicators/macd";
import { getVolumeMA, evaluateVolume } from "../indicators/volume";

import { detectTrend } from "../context/trend";
import { detectSupportResistance, isNearSupportOrResistance } from "../context/supportResistance";
import { detectVolumeContext } from "../context/volume";
import { detectVolatility } from "../context/volatility";

import { evaluateEdgeStrategy } from "../strategy/edgeStrategy";
import { calculateScore } from "../scoring/scoring";

export function analyze(
  symbol: string,
  candles: Candle[],
  config: EngineConfig
): DecisionResult {
  if (candles.length < config.indicators.maLong) {
    throw new Error(`Not enough data. Need at least ${config.indicators.maLong} candles.`);
  }

  const prices = candles.map((c) => c.close);
  const volumes = candles.map((c) => c.volume);
  const currentPrice = prices[prices.length - 1];
  const currentCandle = candles[candles.length - 1];

  // --- 1. Indicator Layer ---
  const maShortSeries = getMASeries(prices, config.indicators.maShort);
  const maLongSeries = getMASeries(prices, config.indicators.maLong);
  const rsiSeries = getRSISeries(prices, config.indicators.rsiPeriod);
  const macdSeries = getMACDSeries(prices, config.indicators.macdFast, config.indicators.macdSlow, config.indicators.macdSignal);
  const volumeMaSeries = getVolumeMA(volumes, config.indicators.maShort);

  const maShortVal = maShortSeries[maShortSeries.length - 1];
  const maLongVal = maLongSeries[maLongSeries.length - 1];
  const rsiVal = rsiSeries[rsiSeries.length - 1];
  const macdVal = macdSeries.macdLine[macdSeries.macdLine.length - 1];
  const macdSignalVal = macdSeries.signalLine[macdSeries.signalLine.length - 1];
  const macdHistVal = macdSeries.histogram[macdSeries.histogram.length - 1];
  const volMaVal = volumeMaSeries[volumeMaSeries.length - 1];

  const rsiEval = evaluateRSI(rsiVal);
  const macdEval = evaluateMACD(macdVal, macdSignalVal, macdHistVal, macdSeries.histogram[macdSeries.histogram.length - 2]);
  const volumeEval = evaluateVolume(currentCandle.volume, volMaVal);

  // --- 2. Market Context Layer ---
  const trend = detectTrend(maShortVal, maLongVal, currentPrice);
  
  // Use previous candles to find support/resistance so current breakout candle doesn't become the resistance
  const previousCandles = candles.slice(0, -1);
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
  });

  // --- Decision Rules & Confidence ---
  let finalSignal: SignalType = "NO TRADE";
  if (score >= config.decisionThresholds.buy) {
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
  if (volumeContext === "spike" || volumeContext === "extreme_spike") {
    alignmentFactors++;
  }

  let confidence: ConfidenceLevel = "low";
  if (alignmentFactors >= 3) confidence = "high";
  else if (alignmentFactors === 2) confidence = "medium";
  else confidence = "low";

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
  };
}
