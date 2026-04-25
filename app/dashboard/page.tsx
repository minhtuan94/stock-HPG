"use client";

import { useEffect, useMemo } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { MetricCard } from "@/components/cards/metric-card";
import { RecommendationCard } from "@/components/recommendation/recommendation-card";
import { PriceChart } from "@/components/charts/price-chart";
import { NewsFeed } from "@/components/news/news-feed";
import { useDashboardStore } from "@/store/dashboard-store";

async function fetchSnapshot() {
  const response = await fetch("/api/dashboard", { cache: "no-store" });
  if (!response.ok) {
    throw new Error("Không thể tải trang tổng quan");
  }
  return response.json();
}

export default function DashboardPage() {
  const { data, setData } = useDashboardStore();

  useEffect(() => {
    let mounted = true;
    const sync = async () => {
      try {
        const payload = await fetchSnapshot();
        if (mounted) setData(payload);
      } catch {
        // Keep previous snapshot if fetch fails.
      }
    };

    void sync();
    const timer = setInterval(sync, 30000);

    const events = new EventSource("/api/news/stream");
    events.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data);
        if (!mounted) return;
        setData((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            recentNews: parsed.items,
          };
        });
      } catch {
        // Ignore malformed stream packets.
      }
    };

    return () => {
      mounted = false;
      clearInterval(timer);
      events.close();
    };
  }, [setData]);

  const chartPoints = useMemo(() => {
    const base = data?.currentPrice ?? 27.5;
    return Array.from({ length: 24 }).map((_, idx) => ({
      t: `${idx}:00`,
      close: Number((base + Math.sin(idx / 3) * 0.6 + idx * 0.02).toFixed(2)),
    }));
  }, [data?.currentPrice]);

  if (!data) {
    return <div className="p-8 text-sm text-terminal-dim">Đang tải trang tổng quan HPG...</div>;
  }

  return (
    <AppShell>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard label="Giá HPG" value={data.currentPrice.toFixed(2)} sub="VND x1000" tone="neutral" />
          <MetricCard
            label="Biến động trong ngày"
            value={`${data.dayChangePct >= 0 ? "+" : ""}${data.dayChangePct.toFixed(2)}%`}
            tone={data.dayChangePct >= 0 ? "positive" : "negative"}
          />
          <MetricCard label="Khối lượng" value={new Intl.NumberFormat("en-US").format(data.volume)} sub="Hôm nay" />
          <MetricCard label="RSI / MACD" value={`${data.indicators.rsi.toFixed(1)} / ${data.indicators.macd.toFixed(2)}`} />
        </div>

        <RecommendationCard
          action={data.recommendation.action}
          confidence={data.recommendation.confidence}
          shortTerm={data.recommendation.shortTerm}
          mediumTerm={data.recommendation.mediumTerm}
          longTerm={data.recommendation.longTerm}
          reasoning={data.recommendation.reasoning}
        />

        <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
          <PriceChart points={chartPoints} />
          <div className="panel p-4">
            <p className="mb-3 text-xs uppercase tracking-[0.2em] text-terminal-dim">Điểm tổng hợp</p>
            <div className="space-y-2 text-sm">
              <p>Điểm sentiment: {data.scores.sentiment}</p>
              <p>Điểm vĩ mô: {data.scores.macro}</p>
              <p>Điểm vi mô doanh nghiệp: {data.scores.micro}</p>
              <p>Điểm kỹ thuật: {data.scores.technical}</p>
              <p className="pt-2 text-xs text-terminal-dim">Hỗ trợ {data.indicators.support.toFixed(2)} - Kháng cự {data.indicators.resistance.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <NewsFeed items={data.recentNews} />
    </AppShell>
  );
}
