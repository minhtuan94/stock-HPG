"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";

type AnalysisPayload = {
  symbol: string;
  currentPrice: number;
  dayChangePct: number;
  scores: {
    sentiment: number;
    macro: number;
    micro: number;
    technical: number;
  };
  recommendation: {
    action: string;
    confidence: number;
    shortTerm: {
      action: string;
      targetPrice: number;
      stopLoss: number;
      takeProfit: number;
      timeFrame: string;
    };
    mediumTerm: {
      action: string;
      targetPrice: number;
      stopLoss: number;
      takeProfit: number;
      timeFrame: string;
    };
    longTerm: {
      action: string;
      targetPrice: number;
      stopLoss: number;
      takeProfit: number;
      timeFrame: string;
    };
    reasoning: string[];
  };
  probabilities: {
    upShortTerm: number;
    upMediumTerm: number;
    downRisk: number;
  };
};

export default function AnalysisPage() {
  const [data, setData] = useState<AnalysisPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetch("/api/analysis", { cache: "no-store" });
        if (!response.ok) throw new Error("Không thể tải phân tích");
        setData(await response.json());
      } catch (e) {
        setError(e instanceof Error ? e.message : "Lỗi không xác định");
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  return (
    <AppShell>
      <div className="panel p-6">
        <h1 className="font-[var(--font-grotesk)] text-2xl font-semibold">Phân tích chuyên sâu</h1>
        <p className="mt-1 text-sm text-terminal-dim">Tổng hợp technical, news sentiment, macro và financial theo mô hình weighted score.</p>
      </div>

      {loading ? <div className="panel p-4 text-sm text-terminal-dim">Đang tải phân tích...</div> : null}
      {error ? <div className="rounded-lg border border-terminal-negative/40 bg-terminal-negative/10 p-3 text-sm text-terminal-negative">{error}</div> : null}

      {data ? (
        <>
          <section className="grid gap-4 md:grid-cols-3">
            <article className="panel p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-terminal-dim">Xác suất tăng ngắn hạn</p>
              <p className="mt-2 text-3xl font-semibold text-terminal-positive">{data.probabilities.upShortTerm}%</p>
            </article>
            <article className="panel p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-terminal-dim">Xác suất tăng trung hạn</p>
              <p className="mt-2 text-3xl font-semibold text-terminal-neutral">{data.probabilities.upMediumTerm}%</p>
            </article>
            <article className="panel p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-terminal-dim">Xác suất rủi ro giảm</p>
              <p className="mt-2 text-3xl font-semibold text-terminal-negative">{data.probabilities.downRisk}%</p>
            </article>
          </section>

          <section className="grid gap-4 lg:grid-cols-[1.1fr_1fr]">
            <article className="panel p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-terminal-dim">Điểm tổng hợp</p>
              <div className="mt-3 space-y-2 text-sm text-terminal-dim">
                <p>Điểm sentiment: {data.scores.sentiment}</p>
                <p>Điểm technical: {data.scores.technical}</p>
                <p>Điểm tài chính: {data.scores.micro}</p>
                <p>Điểm macro: {data.scores.macro}</p>
                <p>Khuyến nghị hiện tại: <span className="text-terminal-positive">{data.recommendation.action}</span> (độ tin cậy {data.recommendation.confidence}%)</p>
              </div>
            </article>

            <article className="panel p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-terminal-dim">Luận điểm</p>
              <ul className="mt-3 space-y-2 text-sm text-terminal-dim">
                {data.recommendation.reasoning.map((reason) => (
                  <li key={reason} className="border-l border-terminal-line pl-3">
                    {reason}
                  </li>
                ))}
              </ul>
            </article>
          </section>

          <section className="grid gap-4 md:grid-cols-3">
            {[
              { title: "Ngắn hạn", data: data.recommendation.shortTerm },
              { title: "Trung hạn", data: data.recommendation.mediumTerm },
              { title: "Dài hạn", data: data.recommendation.longTerm },
            ].map((block) => (
              <article key={block.title} className="panel p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-terminal-dim">{block.title}</p>
                <p className="mt-2 text-lg font-semibold text-terminal-positive">{block.data.action}</p>
                <p className="mt-2 text-sm text-terminal-dim">Mục tiêu: {block.data.targetPrice}</p>
                <p className="text-sm text-terminal-dim">Stop-loss: {block.data.stopLoss}</p>
                <p className="text-sm text-terminal-dim">Take-profit: {block.data.takeProfit}</p>
                <p className="text-sm text-terminal-dim">Khung thời gian: {block.data.timeFrame}</p>
              </article>
            ))}
          </section>
        </>
      ) : null}
    </AppShell>
  );
}
