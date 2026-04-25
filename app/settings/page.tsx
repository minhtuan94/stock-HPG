"use client";

import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";

type WeightState = {
  news: number;
  technical: number;
  financial: number;
  macro: number;
};

const STORAGE_KEY = "hpg.recommendation.weights.v1";

export default function SettingsPage() {
  const [weights, setWeights] = useState<WeightState>({
    news: 30,
    technical: 30,
    financial: 20,
    macro: 20,
  });

  useEffect(() => {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as WeightState;
      setWeights(parsed);
    } catch {
      // Ignore malformed local settings.
    }
  }, []);

  const total = useMemo(() => weights.news + weights.technical + weights.financial + weights.macro, [weights]);

  const setWeight = (key: keyof WeightState, value: number) => {
    setWeights((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const save = () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(weights));
  };

  const reset = () => {
    const next = { news: 30, technical: 30, financial: 20, macro: 20 };
    setWeights(next);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  return (
    <AppShell>
      <div className="panel p-6">
        <h1 className="font-[var(--font-grotesk)] text-2xl font-semibold">Cài đặt</h1>
        <p className="mt-1 text-sm text-terminal-dim">Tinh chỉnh trọng số module recommendation để phù hợp chiến lược của bạn.</p>
      </div>

      <section className="panel p-5">
        <p className="mb-4 text-xs uppercase tracking-[0.2em] text-terminal-dim">Trọng số khuyến nghị</p>

        {([
          ["news", "Tin tức"],
          ["technical", "Kỹ thuật"],
          ["financial", "Tài chính"],
          ["macro", "Vĩ mô"],
        ] as Array<[keyof WeightState, string]>).map(([key, label]) => (
          <div key={key} className="mb-4">
            <div className="mb-1 flex items-center justify-between text-sm">
              <span>{label}</span>
              <span className="text-terminal-dim">{weights[key]}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={weights[key]}
              onChange={(e) => setWeight(key, Number(e.target.value))}
              className="w-full accent-[#38d39f]"
            />
          </div>
        ))}

        <div className="mt-4 rounded-lg border border-terminal-line bg-terminal-panelSoft/40 p-3 text-sm text-terminal-dim">
          Tổng trọng số hiện tại: <span className={total === 100 ? "text-terminal-positive" : "text-terminal-negative"}>{total}%</span>
          <p className="mt-1 text-xs">Khuyến nghị: để tổng = 100% để mô hình cân bằng.</p>
        </div>

        <div className="mt-4 flex gap-3">
          <button type="button" onClick={save} className="rounded-lg border border-terminal-line bg-terminal-positive/15 px-4 py-2 text-sm text-terminal-positive hover:bg-terminal-positive/25">
            Lưu cài đặt cục bộ
          </button>
          <button type="button" onClick={reset} className="rounded-lg border border-terminal-line px-4 py-2 text-sm text-terminal-dim hover:text-terminal-text">
            Đặt lại 30/30/20/20
          </button>
        </div>
      </section>
    </AppShell>
  );
}
