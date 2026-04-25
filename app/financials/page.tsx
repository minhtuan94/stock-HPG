"use client";

import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";

type FinancialItem = {
  id: string;
  fiscalYear: number;
  fiscalQuarter: number;
  revenue: number;
  netProfit: number;
  eps: number;
  grossMargin: number;
  pe: number | null;
  pb: number | null;
  debt: number;
  cashFlow: number;
  inventory: number;
  steelOutput: number;
  analysis: {
    strength: string;
    weakness: string;
    trend: string;
    financialScore: number;
  } | null;
};

function formatNghinTy(value: number): string {
  return `${(value / 1_000_000_000_000).toFixed(1)} nghìn tỷ`;
}

export default function FinancialsPage() {
  const [items, setItems] = useState<FinancialItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetch("/api/financials", { cache: "no-store" });
        if (!response.ok) throw new Error("Không thể tải báo cáo tài chính");
        const payload = await response.json();
        setItems(payload.items || []);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Lỗi không xác định");
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  const yoyHint = useMemo(() => {
    if (items.length < 2) return null;
    const latest = items[0];
    const prevYearSameQuarter = items.find(
      (x) => x.fiscalQuarter === latest.fiscalQuarter && x.fiscalYear === latest.fiscalYear - 1,
    );
    if (!prevYearSameQuarter) return null;
    const revGrowth = ((latest.revenue - prevYearSameQuarter.revenue) / Math.max(prevYearSameQuarter.revenue, 1)) * 100;
    const npGrowth = ((latest.netProfit - prevYearSameQuarter.netProfit) / Math.max(prevYearSameQuarter.netProfit, 1)) * 100;
    return { revGrowth, npGrowth };
  }, [items]);

  return (
    <AppShell>
      <div className="panel p-6">
        <h1 className="font-[var(--font-grotesk)] text-2xl font-semibold">Báo cáo tài chính</h1>
        <p className="mt-1 text-sm text-terminal-dim">So sánh quý, theo dõi margin, định giá và nhận xét tự động.</p>
        {yoyHint ? (
          <p className="mt-3 text-sm text-terminal-dim">
            YoY quý gần nhất: Doanh thu {yoyHint.revGrowth.toFixed(2)}% | Lợi nhuận {yoyHint.npGrowth.toFixed(2)}%
          </p>
        ) : null}
      </div>

      {error ? <div className="rounded-lg border border-terminal-negative/40 bg-terminal-negative/10 p-3 text-sm text-terminal-negative">{error}</div> : null}

      <section className="panel overflow-x-auto p-4">
        <p className="mb-3 text-xs uppercase tracking-[0.2em] text-terminal-dim">Dữ liệu theo quý</p>
        {loading ? <p className="text-sm text-terminal-dim">Đang tải dữ liệu...</p> : null}
        <table className="min-w-[980px] text-sm">
          <thead>
            <tr className="border-b border-terminal-line text-left text-terminal-dim">
              <th className="px-2 py-2">Kỳ báo cáo</th>
              <th className="px-2 py-2">Doanh thu</th>
              <th className="px-2 py-2">Lợi nhuận ròng</th>
              <th className="px-2 py-2">EPS</th>
              <th className="px-2 py-2">Biên lợi nhuận gộp</th>
              <th className="px-2 py-2">P/E</th>
              <th className="px-2 py-2">P/B</th>
              <th className="px-2 py-2">Nợ vay</th>
              <th className="px-2 py-2">Dòng tiền</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b border-terminal-line/60">
                <td className="px-2 py-2">Q{item.fiscalQuarter}/{item.fiscalYear}</td>
                <td className="px-2 py-2">{formatNghinTy(item.revenue)}</td>
                <td className="px-2 py-2">{formatNghinTy(item.netProfit)}</td>
                <td className="px-2 py-2">{item.eps.toFixed(2)}</td>
                <td className="px-2 py-2">{(item.grossMargin * 100).toFixed(2)}%</td>
                <td className="px-2 py-2">{item.pe?.toFixed(2) ?? "-"}</td>
                <td className="px-2 py-2">{item.pb?.toFixed(2) ?? "-"}</td>
                <td className="px-2 py-2">{formatNghinTy(item.debt)}</td>
                <td className="px-2 py-2">{formatNghinTy(item.cashFlow)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {items.slice(0, 2).map((item) => (
          <article key={`analysis-${item.id}`} className="panel p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-terminal-dim">Phân tích AI Q{item.fiscalQuarter}/{item.fiscalYear}</p>
            {item.analysis ? (
              <div className="mt-3 space-y-2 text-sm text-terminal-dim">
                <p><span className="text-terminal-positive">Điểm mạnh:</span> {item.analysis.strength}</p>
                <p><span className="text-terminal-negative">Điểm yếu:</span> {item.analysis.weakness}</p>
                <p><span className="text-terminal-neutral">Xu hướng:</span> {item.analysis.trend}</p>
                <p>Điểm tài chính: {item.analysis.financialScore}</p>
              </div>
            ) : (
              <p className="mt-3 text-sm text-terminal-dim">Chưa có phân tích cho kỳ này.</p>
            )}
          </article>
        ))}
      </section>
    </AppShell>
  );
}
