type RecommendationCardProps = {
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

function actionTone(action: string): string {
  if (action.includes("BUY")) return "text-terminal-positive";
  if (action.includes("SELL")) return "text-terminal-negative";
  return "text-terminal-neutral";
}

export function RecommendationCard(props: RecommendationCardProps) {
  return (
    <section className="panel relative overflow-hidden p-6 shadow-glow">
      <div className="absolute right-[-60px] top-[-60px] h-44 w-44 rounded-full bg-terminal-positive/10 blur-2xl" />
      <p className="text-xs uppercase tracking-[0.22em] text-terminal-dim">AI Recommendation</p>
      <h2 className={`mt-2 font-[var(--font-grotesk)] text-3xl font-bold ${actionTone(props.action)}`}>{props.action}</h2>
      <p className="mt-1 text-sm text-terminal-dim">Confidence {props.confidence}% - probabilistic only, not certainty.</p>

      <div className="mt-6 grid gap-3 md:grid-cols-3">
        {[
          { title: "Short", ...props.shortTerm },
          { title: "Medium", ...props.mediumTerm },
          { title: "Long", ...props.longTerm },
        ].map((it) => (
          <div key={it.title} className="rounded-lg border border-terminal-line bg-terminal-panelSoft/60 p-3">
            <p className="text-xs uppercase text-terminal-dim">{it.title} term</p>
            <p className={`mt-2 text-lg font-semibold ${actionTone(it.action)}`}>{it.action}</p>
            <p className="mt-2 text-xs text-terminal-dim">Target {it.targetPrice}</p>
            <p className="text-xs text-terminal-dim">Stop-loss {it.stopLoss}</p>
            <p className="text-xs text-terminal-dim">Take-profit {it.takeProfit}</p>
            <p className="text-xs text-terminal-dim">{it.timeFrame}</p>
          </div>
        ))}
      </div>

      <ul className="mt-5 space-y-2 text-sm text-terminal-dim">
        {props.reasoning.map((reason) => (
          <li key={reason} className="border-l border-terminal-line pl-3">
            {reason}
          </li>
        ))}
      </ul>
    </section>
  );
}
