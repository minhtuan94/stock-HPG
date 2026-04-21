type MetricCardProps = {
  label: string;
  value: string;
  sub?: string;
  tone?: "positive" | "negative" | "neutral";
};

export function MetricCard({ label, value, sub, tone = "neutral" }: MetricCardProps) {
  const toneClass =
    tone === "positive"
      ? "text-terminal-positive"
      : tone === "negative"
        ? "text-terminal-negative"
        : "text-terminal-neutral";

  return (
    <article className="panel animate-riseIn p-4">
      <p className="text-xs uppercase tracking-wider text-terminal-dim">{label}</p>
      <p className={`mt-2 text-2xl font-semibold ${toneClass}`}>{value}</p>
      {sub ? <p className="mt-2 text-xs text-terminal-dim">{sub}</p> : null}
    </article>
  );
}
