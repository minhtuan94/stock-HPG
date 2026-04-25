"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";

type NewsItem = {
  id: string;
  title: string;
  source: string;
  publishedAt: string;
  url: string;
  summary: string;
  sentiment: number;
  tags: string[];
};

export default function NewsPage() {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [crawling, setCrawling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      setError(null);
      const response = await fetch("/api/news?take=50", { cache: "no-store" });
      if (!response.ok) throw new Error("Không thể tải dữ liệu tin tức");
      const payload = await response.json();
      setItems(payload.items || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Lỗi không xác định");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    const timer = setInterval(load, 20000);
    return () => clearInterval(timer);
  }, []);

  const runCrawl = async () => {
    setCrawling(true);
    try {
      const response = await fetch("/api/news/crawl", { method: "POST" });
      if (!response.ok) throw new Error("Quét tin thất bại");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Lỗi quét tin");
    } finally {
      setCrawling(false);
    }
  };

  return (
    <AppShell>
      <div className="panel p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="font-[var(--font-grotesk)] text-2xl font-semibold">Module Tin tức</h1>
            <p className="mt-1 text-sm text-terminal-dim">Tổng hợp tin trong ngày, sentiment và tag tự động. Cron có thể gọi mỗi 15 phút.</p>
          </div>
          <button
            type="button"
            onClick={runCrawl}
            disabled={crawling}
            className="rounded-lg border border-terminal-line bg-terminal-positive/15 px-4 py-2 text-sm text-terminal-positive hover:bg-terminal-positive/25 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {crawling ? "Đang quét tin..." : "Quét tin ngay"}
          </button>
        </div>
      </div>

      {error ? <div className="rounded-lg border border-terminal-negative/40 bg-terminal-negative/10 p-3 text-sm text-terminal-negative">{error}</div> : null}

      <section className="panel p-4">
        <p className="mb-3 text-xs uppercase tracking-[0.2em] text-terminal-dim">Tin mới nhất</p>
        {loading ? <p className="text-sm text-terminal-dim">Đang tải dữ liệu...</p> : null}
        <div className="space-y-3">
          {items.map((item) => (
            <article key={item.id} className="rounded-lg border border-terminal-line bg-terminal-panelSoft/40 p-3">
              <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                <div>
                  <a href={item.url} target="_blank" rel="noreferrer" className="text-sm font-medium hover:text-terminal-positive">
                    {item.title}
                  </a>
                  <p className="mt-1 text-xs text-terminal-dim">{item.source} - {new Date(item.publishedAt).toLocaleString("vi-VN")}</p>
                </div>
                <span
                  className={`rounded px-2 py-1 text-xs ${
                    item.sentiment > 20
                      ? "bg-terminal-positive/20 text-terminal-positive"
                      : item.sentiment < -20
                        ? "bg-terminal-negative/20 text-terminal-negative"
                        : "bg-terminal-neutral/20 text-terminal-neutral"
                  }`}
                >
                  Điểm sentiment {item.sentiment}
                </span>
              </div>
              <p className="mt-2 text-sm text-terminal-dim">{item.summary}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {item.tags.map((tag) => (
                  <span key={`${item.id}-${tag}`} className="rounded border border-terminal-line px-2 py-1 text-xs text-terminal-dim">
                    {tag}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
