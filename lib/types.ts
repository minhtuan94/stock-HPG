export type NewsSentimentResponse = {
  summary: string;
  label: "VERY_POSITIVE" | "POSITIVE" | "NEUTRAL" | "NEGATIVE" | "VERY_NEGATIVE";
  score: number;
  confidence: number;
  reason: string;
  tags: string[];
};

export type TechnicalOutput = {
  rsi: number;
  macd: number;
  macdSignal: number;
  macdHistogram: number;
  ma20: number;
  ma50: number;
  ma200: number;
  ema9: number;
  ema20: number;
  ema50: number;
  bbUpper: number;
  bbMiddle: number;
  bbLower: number;
  supportLevel: number;
  resistanceLevel: number;
  volumeBreakout: boolean;
  goldenCross: boolean;
  deathCross: boolean;
  score: number;
  summary: string;
};
