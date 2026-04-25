import { AnalysisPayload, DashboardSnapshot, FinancialResponse, NewsResponse } from "../types/api";

const API_BASE = process.env.EXPO_PUBLIC_API_BASE_URL;

function ensureBaseUrl() {
  if (!API_BASE) {
    throw new Error("Missing EXPO_PUBLIC_API_BASE_URL in mobile/.env");
  }
  return API_BASE.replace(/\/$/, "");
}

async function getJson<T>(path: string): Promise<T> {
  const base = ensureBaseUrl();
  const res = await fetch(`${base}${path}`);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API ${path} failed: ${res.status} ${text}`);
  }
  return (await res.json()) as T;
}

export const api = {
  dashboard: () => getJson<DashboardSnapshot>("/api/dashboard"),
  analysis: () => getJson<AnalysisPayload>("/api/analysis"),
  news: (take = 30) => getJson<NewsResponse>(`/api/news?take=${take}`),
  financials: () => getJson<FinancialResponse>("/api/financials"),
};
