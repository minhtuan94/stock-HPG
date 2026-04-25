export type DashboardSnapshot = {
  symbol: string;
  currentPrice: number;
  dayChangePct: number;
  scores: {
    sentiment: number;
    technical: number;
    micro: number;
    macro: number;
  };
  recommendation: {
    action: string;
    confidence: number;
    reason: string;
  };
};

export type AnalysisPayload = {
  symbol: string;
  currentPrice: number;
  dayChangePct: number;
  scores: {
    sentiment: number;
    technical: number;
    micro: number;
    macro: number;
  };
  recommendation: {
    action: string;
    confidence: number;
    reason: string;
  };
  probabilities: {
    upShortTerm: number;
    upMediumTerm: number;
    downRisk: number;
  };
};

export type NewsItem = {
  id: string;
  title: string;
  source: string;
  publishedAt: string;
  url: string;
  content: string;
  sentiment: number;
  summary: string;
  tags: string[];
};

export type NewsResponse = {
  items: NewsItem[];
};

export type FinancialItem = {
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

export type FinancialResponse = {
  items: FinancialItem[];
};
