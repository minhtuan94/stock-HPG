import { RecommendationAction } from "@prisma/client";
import { clamp, toActionLabel } from "@/lib/utils";

export type RecommendationInput = {
  currentPrice: number;
  newsScore: number;
  technicalScore: number;
  financialScore: number;
  macroScore: number;
  reasons: string[];
  weights?: {
    news: number;
    technical: number;
    financial: number;
    macro: number;
  };
};

export function generateRecommendation(input: RecommendationInput) {
  const weights = input.weights ?? {
    news: 0.3,
    technical: 0.3,
    financial: 0.2,
    macro: 0.2,
  };

  const weightedScore =
    input.newsScore * weights.news +
    input.technicalScore * weights.technical +
    input.financialScore * weights.financial +
    input.macroScore * weights.macro;

  const finalScore = clamp(Math.round(weightedScore), 0, 100);
  const confidence = clamp(Math.round(finalScore * 0.85 + Math.abs(input.technicalScore - 50) * 0.15), 35, 95);

  const mapAction = (score: number): RecommendationAction => {
    const action = toActionLabel(score);
    if (action === "STRONG_BUY") return RecommendationAction.STRONG_BUY;
    if (action === "BUY") return RecommendationAction.BUY;
    if (action === "HOLD") return RecommendationAction.HOLD;
    if (action === "SELL") return RecommendationAction.SELL;
    return RecommendationAction.STRONG_SELL;
  };

  const shortTermScore = clamp(finalScore + (input.technicalScore - 50) * 0.3, 0, 100);
  const mediumTermScore = clamp(finalScore + (input.financialScore - 50) * 0.25, 0, 100);
  const longTermScore = clamp(finalScore + (input.macroScore - 50) * 0.2 + (input.financialScore - 50) * 0.25, 0, 100);

  const shortTarget = input.currentPrice * (1 + (shortTermScore - 50) / 220);
  const mediumTarget = input.currentPrice * (1 + (mediumTermScore - 50) / 130);
  const longTarget = input.currentPrice * (1 + (longTermScore - 50) / 95);

  const shortStop = input.currentPrice * 0.95;
  const mediumStop = input.currentPrice * 0.9;
  const longStop = input.currentPrice * 0.82;

  return {
    recommendation: mapAction(finalScore),
    confidence,
    weightedScore,
    shortTerm: {
      action: mapAction(shortTermScore),
      targetPrice: Number(shortTarget.toFixed(2)),
      stopLoss: Number(shortStop.toFixed(2)),
      takeProfit: Number((shortTarget * 1.03).toFixed(2)),
      timeFrame: "1-2 weeks",
    },
    mediumTerm: {
      action: mapAction(mediumTermScore),
      targetPrice: Number(mediumTarget.toFixed(2)),
      stopLoss: Number(mediumStop.toFixed(2)),
      takeProfit: Number((mediumTarget * 1.06).toFixed(2)),
      timeFrame: "3-6 months",
    },
    longTerm: {
      action: mapAction(longTermScore),
      targetPrice: Number(longTarget.toFixed(2)),
      stopLoss: Number(longStop.toFixed(2)),
      takeProfit: Number((longTarget * 1.1).toFixed(2)),
      timeFrame: "9-18 months",
    },
    reasoning: input.reasons,
    componentScores: {
      newsScore: input.newsScore,
      technicalScore: input.technicalScore,
      financialScore: input.financialScore,
      macroScore: input.macroScore,
    },
  };
}
