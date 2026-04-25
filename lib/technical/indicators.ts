import { clamp } from "@/lib/utils";
import type { TechnicalOutput } from "@/lib/types";

function sma(values: number[], period: number): number {
  const segment = values.slice(-period);
  return segment.reduce((acc, curr) => acc + curr, 0) / segment.length;
}

function ema(values: number[], period: number): number {
  const k = 2 / (period + 1);
  let prev = values[0];
  for (let i = 1; i < values.length; i += 1) {
    prev = values[i] * k + prev * (1 - k);
  }
  return prev;
}

function rsi(values: number[], period = 14): number {
  const diffs = values.slice(1).map((v, i) => v - values[i]);
  const recent = diffs.slice(-period);
  const gains = recent.filter((n) => n > 0).reduce((a, b) => a + b, 0) / period;
  const losses = Math.abs(recent.filter((n) => n < 0).reduce((a, b) => a + b, 0) / period);
  if (losses === 0) return 100;
  const rs = gains / losses;
  return 100 - 100 / (1 + rs);
}

function stdDev(values: number[]): number {
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((acc, val) => acc + (val - mean) ** 2, 0) / values.length;
  return Math.sqrt(variance);
}

export function computeTechnicalIndicators(prices: number[], volumes: number[]): TechnicalOutput {
  if (prices.length < 210 || volumes.length < 30) {
    throw new Error("Not enough data to compute technical indicators.");
  }

  const ma20 = sma(prices, 20);
  const ma50 = sma(prices, 50);
  const ma200 = sma(prices, 200);
  const ema9 = ema(prices, 9);
  const ema20 = ema(prices, 20);
  const ema50 = ema(prices, 50);
  const rsiValue = rsi(prices, 14);
  const macdLine = ema(prices, 12) - ema(prices, 26);
  const signal = ema(prices.slice(-35), 9);
  const histogram = macdLine - signal;

  const bbBase = prices.slice(-20);
  const bbMiddle = ma20;
  const bbStd = stdDev(bbBase);
  const bbUpper = bbMiddle + bbStd * 2;
  const bbLower = bbMiddle - bbStd * 2;

  const recentPrice = prices.slice(-30);
  const supportLevel = Math.min(...recentPrice);
  const resistanceLevel = Math.max(...recentPrice);

  const avgVolume = volumes.slice(-20).reduce((a, b) => a + b, 0) / 20;
  const volumeBreakout = volumes[volumes.length - 1] > avgVolume * 1.5;
  const goldenCross = ma50 > ma200;
  const deathCross = ma50 < ma200;

  let score = 50;
  score += rsiValue >= 45 && rsiValue <= 65 ? 8 : rsiValue < 35 ? -8 : 0;
  score += macdLine > signal ? 10 : -10;
  score += prices[prices.length - 1] > ma20 ? 6 : -6;
  score += prices[prices.length - 1] > ma50 ? 8 : -8;
  score += goldenCross ? 12 : 0;
  score += deathCross ? -12 : 0;
  score += volumeBreakout ? 8 : 0;

  score = clamp(score, 0, 100);

  const summary =
    `HPG ${prices[prices.length - 1] > ma20 ? "đang trên" : "đang dưới"} MA20/MA50, ` +
    `RSI=${rsiValue.toFixed(1)}, MACD ${macdLine > signal ? "cắt lên" : "cắt xuống"}, ` +
    `xác suất tăng ngắn hạn ${score}%.`;

  return {
    rsi: rsiValue,
    macd: macdLine,
    macdSignal: signal,
    macdHistogram: histogram,
    ma20,
    ma50,
    ma200,
    ema9,
    ema20,
    ema50,
    bbUpper,
    bbMiddle,
    bbLower,
    supportLevel,
    resistanceLevel,
    volumeBreakout,
    goldenCross,
    deathCross,
    score,
    summary,
  };
}
