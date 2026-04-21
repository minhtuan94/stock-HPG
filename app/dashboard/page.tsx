"use client";

import { useEffect, useMemo } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { MetricCard } from "@/components/cards/metric-card";
import { RecommendationCard } from "@/components/recommendation/recommendation-card";
import { PriceChart } from "@/components/charts/price-chart";
import { NewsFeed } from "@/components/news/news-feed";
import { useDashboardStore } from "@/store/dashboard-store";

async function fetchSnapshot() {
  const response = await fetch("/api/dashboard", { cache: "no-store" });
  if (!response.ok) {
    throw new Error("Failed to load dashboard");
  }
  return response.json();
}

export default function DashboardPage() {
  const pathname = usePathname();
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
        if (!mounted || !data) return;
        setData({
          ...data,
          recentNews: parsed.items,
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
  }, [data, setData]);

  const chartPoints = useMemo(() => {
    const base = data?.currentPrice ?? 27.5;
    return Array.from({ length: 24 }).map((_, idx) => ({
      t: `${idx}:00`,
      close: Number((base + Math.sin(idx / 3) * 0.6 + idx * 0.02).toFixed(2)),
    }));
  }, [data?.currentPrice]);

  if (!data) {
    return <div className="p-8 text-sm text-terminal-dim">Loading HPG dashboard...</div>;
  }

  return (
    <main className="mx-auto grid max-w-[1400px] gap-4 p-4 md:grid-cols-[260px_1fr]">
      <Sidebar pathname={pathname} />

      <section className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard label="HPG Price" value={data.currentPrice.toFixed(2)} sub="VND x1000" tone="neutral" />
          <MetricCard
            label="Day Change"
            value={`${data.dayChangePct >= 0 ? "+" : ""}${data.dayChangePct.toFixed(2)}%`}
            tone={data.dayChangePct >= 0 ? "positive" : "negative"}
          />
          <MetricCard label="Volume" value={new Intl.NumberFormat("en-US").format(data.volume)} sub="Today" />
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
            <p className="mb-3 text-xs uppercase tracking-[0.2em] text-terminal-dim">Composite Scores</p>
            <div className="space-y-2 text-sm">
              <p>Sentiment: {data.scores.sentiment}</p>
              <p>Macro: {data.scores.macro}</p>
              <p>Micro: {data.scores.micro}</p>
              <p>Technical: {data.scores.technical}</p>
              <p className="pt-2 text-xs text-terminal-dim">Support {data.indicators.support.toFixed(2)} - Resistance {data.indicators.resistance.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <NewsFeed items={data.recentNews} />
      </section>
    </main>
  );
}
