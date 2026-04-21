type FeedItem = {
  id: string;
  title: string;
  source: string;
  summary: string;
  publishedAt: string;
  sentiment: number;
  url: string;
};

export function NewsFeed({ items }: { items: FeedItem[] }) {
  return (
    <section className="panel h-[420px] overflow-y-auto p-4">
      <p className="mb-4 text-xs uppercase tracking-[0.2em] text-terminal-dim">Realtime News</p>
      <div className="space-y-3">
        {items.map((item) => (
          <article key={item.id} className="rounded-lg border border-terminal-line bg-terminal-panelSoft/40 p-3">
            <div className="flex items-center justify-between gap-3">
              <p className="line-clamp-2 text-sm font-medium text-terminal-text">{item.title}</p>
              <span
                className={`rounded px-2 py-1 text-xs ${
                  item.sentiment > 20
                    ? "bg-terminal-positive/20 text-terminal-positive"
                    : item.sentiment < -20
                      ? "bg-terminal-negative/20 text-terminal-negative"
                      : "bg-terminal-neutral/20 text-terminal-neutral"
                }`}
              >
                {item.sentiment}
              </span>
            </div>
            <p className="mt-2 line-clamp-2 text-xs text-terminal-dim">{item.summary}</p>
            <div className="mt-2 flex items-center justify-between text-[11px] text-terminal-dim">
              <span>{item.source}</span>
              <a href={item.url} target="_blank" rel="noreferrer" className="hover:text-terminal-positive">
                Open
              </a>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
