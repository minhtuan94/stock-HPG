import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const sampleReports = [
  { year: 2024, quarter: 1, revenue: 34500000000000, grossProfit: 5400000000000, netProfit: 2820000000000, eps: 470, pe: 12.6, pb: 1.45, grossMargin: 0.1565, debt: 49800000000000, cashFlow: 3650000000000, inventory: 25800000000000, steelOutput: 2110000 },
  { year: 2024, quarter: 2, revenue: 36800000000000, grossProfit: 5950000000000, netProfit: 3210000000000, eps: 535, pe: 11.9, pb: 1.41, grossMargin: 0.1617, debt: 49200000000000, cashFlow: 3890000000000, inventory: 24900000000000, steelOutput: 2240000 },
  { year: 2024, quarter: 3, revenue: 38150000000000, grossProfit: 6320000000000, netProfit: 3460000000000, eps: 578, pe: 11.4, pb: 1.38, grossMargin: 0.1657, debt: 48700000000000, cashFlow: 4120000000000, inventory: 24300000000000, steelOutput: 2310000 },
  { year: 2024, quarter: 4, revenue: 39500000000000, grossProfit: 6580000000000, netProfit: 3610000000000, eps: 602, pe: 11.1, pb: 1.36, grossMargin: 0.1666, debt: 48100000000000, cashFlow: 4360000000000, inventory: 23800000000000, steelOutput: 2390000 },
  { year: 2025, quarter: 1, revenue: 40200000000000, grossProfit: 6740000000000, netProfit: 3730000000000, eps: 621, pe: 10.9, pb: 1.33, grossMargin: 0.1677, debt: 47400000000000, cashFlow: 4490000000000, inventory: 23100000000000, steelOutput: 2440000 },
  { year: 2025, quarter: 2, revenue: 41600000000000, grossProfit: 7010000000000, netProfit: 3880000000000, eps: 646, pe: 10.7, pb: 1.31, grossMargin: 0.1685, debt: 46800000000000, cashFlow: 4630000000000, inventory: 22600000000000, steelOutput: 2510000 },
  { year: 2025, quarter: 3, revenue: 42950000000000, grossProfit: 7330000000000, netProfit: 4070000000000, eps: 678, pe: 10.5, pb: 1.29, grossMargin: 0.1707, debt: 46000000000000, cashFlow: 4810000000000, inventory: 21900000000000, steelOutput: 2590000 },
  { year: 2025, quarter: 4, revenue: 44100000000000, grossProfit: 7610000000000, netProfit: 4260000000000, eps: 709, pe: 10.3, pb: 1.26, grossMargin: 0.1725, debt: 45200000000000, cashFlow: 4980000000000, inventory: 21300000000000, steelOutput: 2670000 },
];

function periodStart(year: number, quarter: number): Date {
  const month = (quarter - 1) * 3;
  return new Date(Date.UTC(year, month, 1));
}

function periodEnd(year: number, quarter: number): Date {
  const month = quarter * 3;
  return new Date(Date.UTC(year, month, 0, 23, 59, 59));
}

async function main() {
  for (const report of sampleReports) {
    const upserted = await prisma.financialReport.upsert({
      where: {
        symbol_fiscalYear_fiscalQuarter: {
          symbol: "HPG",
          fiscalYear: report.year,
          fiscalQuarter: report.quarter,
        },
      },
      create: {
        symbol: "HPG",
        fiscalYear: report.year,
        fiscalQuarter: report.quarter,
        periodStart: periodStart(report.year, report.quarter),
        periodEnd: periodEnd(report.year, report.quarter),
        revenue: report.revenue,
        grossProfit: report.grossProfit,
        netProfit: report.netProfit,
        eps: report.eps,
        pe: report.pe,
        pb: report.pb,
        grossMargin: report.grossMargin,
        debt: report.debt,
        cashFlow: report.cashFlow,
        inventory: report.inventory,
        steelOutput: report.steelOutput,
      },
      update: {
        revenue: report.revenue,
        grossProfit: report.grossProfit,
        netProfit: report.netProfit,
        eps: report.eps,
        pe: report.pe,
        pb: report.pb,
        grossMargin: report.grossMargin,
        debt: report.debt,
        cashFlow: report.cashFlow,
        inventory: report.inventory,
        steelOutput: report.steelOutput,
      },
    });

    await prisma.financialMetric.upsert({
      where: {
        reportId_metricKey: {
          reportId: upserted.id,
          metricKey: "roe",
        },
      },
      create: {
        reportId: upserted.id,
        metricKey: "roe",
        metricName: "Return on Equity",
        value: 0.14 + report.quarter * 0.003,
        unit: "%",
      },
      update: {
        value: 0.14 + report.quarter * 0.003,
      },
    });

    await prisma.financialMetric.upsert({
      where: {
        reportId_metricKey: {
          reportId: upserted.id,
          metricKey: "ebitda_margin",
        },
      },
      create: {
        reportId: upserted.id,
        metricKey: "ebitda_margin",
        metricName: "EBITDA Margin",
        value: 0.165 + report.quarter * 0.002,
        unit: "%",
      },
      update: {
        value: 0.165 + report.quarter * 0.002,
      },
    });

    const existingAnalysis = await prisma.quarterlyAnalysis.findFirst({
      where: { reportId: upserted.id },
      orderBy: { generatedAt: "desc" },
      select: { id: true },
    });

    if (existingAnalysis) {
      await prisma.quarterlyAnalysis.update({
        where: { id: existingAnalysis.id },
        data: {
          strength: "Biên lợi nhuận gộp cải thiện nhờ giá quặng giảm và hiệu suất lò cao tốt hơn.",
          weakness: "Thị trường bất động sản phục hồi chậm, áp lực giá bán vẫn hiện hữu.",
          trend: "Sản lượng và dòng tiền tăng dần qua từng quý, xu hướng trung hạn tích cực.",
          financialScore: 68 + report.quarter,
          confidence: 72,
        },
      });
    } else {
      await prisma.quarterlyAnalysis.create({
        data: {
          reportId: upserted.id,
          strength: "Biên lợi nhuận gộp cải thiện nhờ giá quặng giảm và hiệu suất lò cao tốt hơn.",
          weakness: "Thị trường bất động sản phục hồi chậm, áp lực giá bán vẫn hiện hữu.",
          trend: "Sản lượng và dòng tiền tăng dần qua từng quý, xu hướng trung hạn tích cực.",
          financialScore: 68 + report.quarter,
          confidence: 72,
          generatedBy: "seed-script",
        },
      });
    }
  }

  const total = await prisma.financialReport.count({ where: { symbol: "HPG" } });
  console.log(`Seeded financial reports for HPG: ${total}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
