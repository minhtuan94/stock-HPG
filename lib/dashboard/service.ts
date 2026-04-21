import { RecommendationAction } from "@prisma/client";
import { prisma } from "@/lib/db";
import { calculateFinancialScore } from "@/lib/financial/scoring";
import { calculateMacroScore } from "@/lib/macro/scoring";
import { generateRecommendation } from "@/lib/ai/recommendation";

function actionLabel(action: RecommendationAction): string {
  return action.replace("_", " ");
}

export async function getDashboardSnapshot() {
  const [latestQuote, technical, macroSnapshot, latestQuarterly, sentiments, recentNews] = await Promise.all([
    prisma.stockQuote.findFirst({ where: { symbol: "HPG" }, orderBy: { timestamp: "desc" } }),
    prisma.technicalSnapshot.findFirst({ where: { symbol: "HPG" }, orderBy: { createdAt: "desc" } }),
    prisma.macroSnapshot.findFirst({ orderBy: { createdAt: "desc" } }),
    prisma.financialReport.findFirst({ where: { symbol: "HPG" }, orderBy: [{ fiscalYear: "desc" }, { fiscalQuarter: "desc" }] }),
    prisma.newsSentiment.findMany({
      where: {
        news: {
          publishedAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
          },
        },
      },
      include: { news: true },
      orderBy: { createdAt: "desc" },
      take: 30,
    }),
    prisma.news.findMany({ orderBy: { publishedAt: "desc" }, take: 20, include: { sentiment: true } }),
  ]);

  const currentPrice = latestQuote ? Number(latestQuote.close) : 27.4;
  const previousClose = latestQuote ? Number(latestQuote.open) : 27.1;
  const dayChangePct = previousClose ? ((currentPrice - previousClose) / previousClose) * 100 : 0;

  const newsScore = sentiments.length
    ? Math.max(0, Math.min(100, Math.round(sentiments.reduce((acc, s) => acc + (s.score + 100) / 2, 0) / sentiments.length)))
    : 50;
  const technicalScore = technical?.score ?? 50;

  const financialScore = latestQuarterly
    ? calculateFinancialScore({
        revenueGrowthYoY: 8,
        netProfitGrowthYoY: 12,
        grossMargin: Number(latestQuarterly.grossMargin),
        debtToEquity: 0.65,
        operatingCashFlow: Number(latestQuarterly.cashFlow),
        peVsIndustry: Number(latestQuarterly.pe ?? 1.02),
        pbVsIndustry: Number(latestQuarterly.pb ?? 1.05),
      })
    : 52;

  const macroComputed = macroSnapshot
    ? { score: macroSnapshot.score }
    : calculateMacroScore({
        ironOreChangePct: -2.2,
        hrcChangePct: 0.8,
        usdVndChangePct: 0.4,
        interestRateChangePct: -0.2,
        publicInvestmentChangePct: 6.4,
        realEstateMomentum: -4,
        chinaSteelExportChangePct: 3.3,
      });

  const reasons = [
    newsScore >= 55 ? "Sentiment tin tuc trong ngay nghieng tich cuc" : "Sentiment tin tuc trung lap/yeu",
    technical?.summary || "Du lieu technical chua day du",
    macroComputed.score >= 55 ? "Dieu kien vi mo ho tro tuong doi" : "Vi mo van con trai chieu",
    financialScore >= 55 ? "Dinh gia va chat luong loi nhuan kha" : "Can theo doi them chi so tai chinh",
  ];

  const recommendation = generateRecommendation({
    currentPrice,
    newsScore,
    technicalScore,
    financialScore,
    macroScore: macroComputed.score,
    reasons,
  });

  await prisma.recommendationSnapshot.create({
    data: {
      symbol: "HPG",
      action: recommendation.recommendation,
      confidence: recommendation.confidence,
      weightedScore: recommendation.weightedScore,
      newsScore,
      technicalScore,
      financialScore,
      macroScore: macroComputed.score,
      shortAction: recommendation.shortTerm.action,
      shortTargetPrice: recommendation.shortTerm.targetPrice,
      shortStopLoss: recommendation.shortTerm.stopLoss,
      shortTakeProfit: recommendation.shortTerm.takeProfit,
      shortTimeFrame: recommendation.shortTerm.timeFrame,
      mediumAction: recommendation.mediumTerm.action,
      mediumTargetPrice: recommendation.mediumTerm.targetPrice,
      mediumStopLoss: recommendation.mediumTerm.stopLoss,
      mediumTakeProfit: recommendation.mediumTerm.takeProfit,
      mediumTimeFrame: recommendation.mediumTerm.timeFrame,
      longAction: recommendation.longTerm.action,
      longTargetPrice: recommendation.longTerm.targetPrice,
      longStopLoss: recommendation.longTerm.stopLoss,
      longTakeProfit: recommendation.longTerm.takeProfit,
      longTimeFrame: recommendation.longTerm.timeFrame,
      reasoning: recommendation.reasoning,
    },
  });

  return {
    symbol: "HPG",
    currentPrice,
    dayChangePct,
    volume: latestQuote ? Number(latestQuote.volume) : 9_800_000,
    indicators: {
      rsi: technical ? Number(technical.rsi) : 55,
      macd: technical ? Number(technical.macd) : 0.12,
      ma20: technical ? Number(technical.ma20) : 27.1,
      ma50: technical ? Number(technical.ma50) : 26.6,
      ma200: technical ? Number(technical.ma200) : 24.9,
      support: technical ? Number(technical.supportLevel) : 26.8,
      resistance: technical ? Number(technical.resistanceLevel) : 29,
    },
    scores: {
      sentiment: newsScore,
      macro: macroComputed.score,
      micro: financialScore,
      technical: technicalScore,
    },
    recommendation: {
      action: actionLabel(recommendation.recommendation),
      confidence: recommendation.confidence,
      shortTerm: recommendation.shortTerm,
      mediumTerm: recommendation.mediumTerm,
      longTerm: recommendation.longTerm,
      reasoning: recommendation.reasoning,
    },
    recentNews: recentNews.map((n) => ({
      id: n.id,
      title: n.title,
      source: n.source,
      publishedAt: n.publishedAt,
      url: n.url,
      sentiment: n.sentiment?.score ?? 0,
      summary: n.sentiment?.summary || n.content.slice(0, 180),
    })),
  };
}
