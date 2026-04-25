"use client";

import { create } from "zustand";

type DashboardData = {
  symbol: string;
  currentPrice: number;
  dayChangePct: number;
  volume: number;
  indicators: {
    rsi: number;
    macd: number;
    ma20: number;
    ma50: number;
    ma200: number;
    support: number;
    resistance: number;
  };
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
  recentNews: Array<{
    id: string;
    title: string;
    source: string;
    publishedAt: string;
    url: string;
    sentiment: number;
    summary: string;
  }>;
};

type DashboardStore = {
  data: DashboardData | null;
  setData: (payload: DashboardData | ((prev: DashboardData | null) => DashboardData | null)) => void;
};

export const useDashboardStore = create<DashboardStore>((set) => ({
  data: null,
  setData: (payload) =>
    set((state) => ({
      data: typeof payload === "function" ? payload(state.data) : payload,
    })),
}));
