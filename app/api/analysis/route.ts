import { NextResponse } from "next/server";
import { getDashboardSnapshot } from "@/lib/dashboard/service";

export async function GET() {
  const snapshot = await getDashboardSnapshot();

  return NextResponse.json({
    symbol: snapshot.symbol,
    currentPrice: snapshot.currentPrice,
    dayChangePct: snapshot.dayChangePct,
    scores: snapshot.scores,
    recommendation: snapshot.recommendation,
    probabilities: {
      upShortTerm: Math.min(95, Math.max(5, Math.round(snapshot.scores.technical * 0.7 + snapshot.scores.sentiment * 0.3))),
      upMediumTerm: Math.min(95, Math.max(5, Math.round(snapshot.scores.micro * 0.5 + snapshot.scores.macro * 0.5))),
      downRisk: Math.min(95, Math.max(5, 100 - Math.round((snapshot.scores.technical + snapshot.scores.macro) / 2))),
    },
  });
}
