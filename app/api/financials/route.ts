import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const reports = await prisma.financialReport.findMany({
    where: { symbol: "HPG" },
    orderBy: [{ fiscalYear: "desc" }, { fiscalQuarter: "desc" }],
    take: 12,
    include: {
      analyses: { orderBy: { generatedAt: "desc" }, take: 1 },
      metrics: true,
    },
  });

  return NextResponse.json({
    items: reports.map((report) => ({
      id: report.id,
      fiscalYear: report.fiscalYear,
      fiscalQuarter: report.fiscalQuarter,
      revenue: Number(report.revenue),
      netProfit: Number(report.netProfit),
      eps: Number(report.eps),
      grossMargin: Number(report.grossMargin),
      pe: report.pe ? Number(report.pe) : null,
      pb: report.pb ? Number(report.pb) : null,
      debt: Number(report.debt),
      cashFlow: Number(report.cashFlow),
      inventory: Number(report.inventory),
      steelOutput: Number(report.steelOutput),
      analysis: report.analyses[0]
        ? {
            strength: report.analyses[0].strength,
            weakness: report.analyses[0].weakness,
            trend: report.analyses[0].trend,
            financialScore: report.analyses[0].financialScore,
          }
        : null,
    })),
  });
}
