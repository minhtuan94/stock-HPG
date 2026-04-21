import { clamp } from "@/lib/utils";

export type FinancialScoreInput = {
  revenueGrowthYoY: number;
  netProfitGrowthYoY: number;
  grossMargin: number;
  debtToEquity: number;
  operatingCashFlow: number;
  peVsIndustry: number;
  pbVsIndustry: number;
};

export function calculateFinancialScore(input: FinancialScoreInput): number {
  let score = 50;
  score += clamp(Math.round(input.revenueGrowthYoY * 0.6), -12, 12);
  score += clamp(Math.round(input.netProfitGrowthYoY * 0.8), -16, 16);
  score += clamp(Math.round((input.grossMargin - 12) * 1.2), -10, 10);
  score += clamp(Math.round((1 - input.debtToEquity) * 8), -12, 12);
  score += input.operatingCashFlow > 0 ? 8 : -8;
  score += clamp(Math.round((1 - input.peVsIndustry) * 8), -8, 8);
  score += clamp(Math.round((1 - input.pbVsIndustry) * 6), -6, 6);
  return clamp(score, 0, 100);
}
