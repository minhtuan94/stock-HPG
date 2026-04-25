import { PrismaClient } from "@prisma/client";
import { getOpenAIClient } from "@/lib/ai/openai";

const prisma = new PrismaClient();

type FinancialAnalysisResult = {
  strength: string;
  weakness: string;
  trend: string;
  financialScore: number;
  confidence: number;
};

type QuarterInput = {
  fiscalYear: number;
  fiscalQuarter: number;
  revenue: number;
  netProfit: number;
  grossMargin: number;
  eps: number;
  pe: number | null;
  pb: number | null;
  debt: number;
  cashFlow: number;
  inventory: number;
  steelOutput: number;
  qoqRevenue: number | null;
  qoqProfit: number | null;
  yoyRevenue: number | null;
  yoyProfit: number | null;
};

function buildQuarterKey(year: number, quarter: number): string {
  return `${year}-Q${quarter}`;
}

function previousQuarter(year: number, quarter: number): { year: number; quarter: number } {
  if (quarter === 1) {
    return { year: year - 1, quarter: 4 };
  }
  return { year, quarter: quarter - 1 };
}

function pctChange(current: number, previous: number | null): number | null {
  if (!previous || previous === 0) return null;
  return ((current - previous) / previous) * 100;
}

function toNumber(value: unknown): number {
  return Number(value ?? 0);
}

function formatPct(value: number | null): string {
  if (value === null || Number.isNaN(value)) return "N/A";
  return `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`;
}

function fallbackAnalysis(input: QuarterInput): FinancialAnalysisResult {
  let score = 50;
  score += input.qoqRevenue ? Math.max(-10, Math.min(10, Math.round(input.qoqRevenue / 2))) : 0;
  score += input.qoqProfit ? Math.max(-14, Math.min(14, Math.round(input.qoqProfit / 1.8))) : 0;
  score += input.yoyRevenue ? Math.max(-12, Math.min(12, Math.round(input.yoyRevenue / 2.2))) : 0;
  score += input.yoyProfit ? Math.max(-14, Math.min(14, Math.round(input.yoyProfit / 2))) : 0;
  score += input.cashFlow > 0 ? 6 : -8;
  score += input.grossMargin >= 0.17 ? 6 : input.grossMargin < 0.15 ? -6 : 0;
  score += input.debt < 47000000000000 ? 4 : -2;

  const financialScore = Math.max(0, Math.min(100, score));
  const confidence = Math.max(55, Math.min(88, 62 + Math.round(Math.abs(financialScore - 50) * 0.4)));

  const strength = `Doanh thu QoQ ${formatPct(input.qoqRevenue)}, lợi nhuận QoQ ${formatPct(input.qoqProfit)}; biên gộp đạt ${(input.grossMargin * 100).toFixed(2)}% và dòng tiền vận hành ${input.cashFlow > 0 ? "dương" : "âm"}.`;
  const weakness = `Áp lực còn lại đến từ hàng tồn kho ở mức ${(input.inventory / 1_000_000_000_000).toFixed(1)} nghìn tỷ và nợ vay ${(input.debt / 1_000_000_000_000).toFixed(1)} nghìn tỷ; cần theo dõi thêm chu kỳ tiêu thụ.`;
  const trend = `So với cùng kỳ, doanh thu ${formatPct(input.yoyRevenue)} và lợi nhuận ${formatPct(input.yoyProfit)}. Xu hướng hiện tại nghiêng ${financialScore >= 65 ? "tích cực" : financialScore >= 50 ? "trung tính tích cực" : "thận trọng"} cho quý kế tiếp.`;

  return {
    strength,
    weakness,
    trend,
    financialScore,
    confidence,
  };
}

async function analyzeQuarterWithAI(input: QuarterInput): Promise<FinancialAnalysisResult> {
  const client = getOpenAIClient();
  if (!client) {
    return fallbackAnalysis(input);
  }

  try {
    const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
    const completion = await client.chat.completions.create({
      model,
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "Bạn là chuyên gia phân tích tài chính chứng khoán Việt Nam. Trả về JSON thuần với các khóa: strength, weakness, trend, financialScore, confidence. Dùng tiếng Việt có dấu, mỗi mục text tối đa 1-2 câu, cụ thể theo số liệu. financialScore và confidence là số nguyên 0-100.",
        },
        {
          role: "user",
          content: JSON.stringify(input),
        },
      ],
    });

    const raw = completion.choices[0]?.message?.content || "{}";
    const parsed = JSON.parse(raw);

    return {
      strength: String(parsed.strength || "Doanh nghiệp có nền tảng tài chính ổn định."),
      weakness: String(parsed.weakness || "Một số chỉ số còn chịu áp lực theo chu kỳ ngành."),
      trend: String(parsed.trend || "Xu hướng trung hạn cần theo dõi thêm theo từng quý."),
      financialScore: Math.max(0, Math.min(100, Math.round(toNumber(parsed.financialScore) || 60))),
      confidence: Math.max(0, Math.min(100, Math.round(toNumber(parsed.confidence) || 65))),
    };
  } catch {
    return fallbackAnalysis(input);
  }
}

async function main() {
  const reports = await prisma.financialReport.findMany({
    where: { symbol: "HPG" },
    orderBy: [{ fiscalYear: "asc" }, { fiscalQuarter: "asc" }],
  });

  if (reports.length === 0) {
    throw new Error("Không có dữ liệu financial_reports cho HPG. Hãy chạy seed trước.");
  }

  const reportByKey = new Map<string, (typeof reports)[number]>();
  for (const report of reports) {
    reportByKey.set(buildQuarterKey(report.fiscalYear, report.fiscalQuarter), report);
  }

  let updated = 0;

  for (const report of reports) {
    const prevQ = previousQuarter(report.fiscalYear, report.fiscalQuarter);
    const prevQuarterReport = reportByKey.get(buildQuarterKey(prevQ.year, prevQ.quarter)) || null;
    const prevYearReport = reportByKey.get(buildQuarterKey(report.fiscalYear - 1, report.fiscalQuarter)) || null;

    const input = {
      fiscalYear: report.fiscalYear,
      fiscalQuarter: report.fiscalQuarter,
      revenue: Number(report.revenue),
      netProfit: Number(report.netProfit),
      grossMargin: Number(report.grossMargin),
      eps: Number(report.eps),
      pe: report.pe ? Number(report.pe) : null,
      pb: report.pb ? Number(report.pb) : null,
      debt: Number(report.debt),
      cashFlow: Number(report.cashFlow),
      inventory: Number(report.inventory),
      steelOutput: Number(report.steelOutput),
      qoqRevenue: pctChange(Number(report.revenue), prevQuarterReport ? Number(prevQuarterReport.revenue) : null),
      qoqProfit: pctChange(Number(report.netProfit), prevQuarterReport ? Number(prevQuarterReport.netProfit) : null),
      yoyRevenue: pctChange(Number(report.revenue), prevYearReport ? Number(prevYearReport.revenue) : null),
      yoyProfit: pctChange(Number(report.netProfit), prevYearReport ? Number(prevYearReport.netProfit) : null),
    };

    const analyzed = await analyzeQuarterWithAI(input);

    const existing = await prisma.quarterlyAnalysis.findFirst({
      where: { reportId: report.id },
      orderBy: { generatedAt: "desc" },
      select: { id: true },
    });

    if (existing) {
      await prisma.quarterlyAnalysis.update({
        where: { id: existing.id },
        data: {
          strength: analyzed.strength,
          weakness: analyzed.weakness,
          trend: analyzed.trend,
          financialScore: analyzed.financialScore,
          confidence: analyzed.confidence,
          generatedBy: "openai-financial-v1",
        },
      });
    } else {
      await prisma.quarterlyAnalysis.create({
        data: {
          reportId: report.id,
          strength: analyzed.strength,
          weakness: analyzed.weakness,
          trend: analyzed.trend,
          financialScore: analyzed.financialScore,
          confidence: analyzed.confidence,
          generatedBy: "openai-financial-v1",
        },
      });
    }

    updated += 1;
    console.log(`Đã phân tích xong Q${report.fiscalQuarter}/${report.fiscalYear}`);
  }

  console.log(`Hoàn tất phân tích AI cho ${updated} quý.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
