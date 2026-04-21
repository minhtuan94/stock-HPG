export default function NewsPage() {
  return (
    <main className="mx-auto max-w-5xl p-6">
      <div className="panel p-6">
        <h1 className="font-[var(--font-grotesk)] text-2xl font-semibold">News Module</h1>
        <p className="mt-2 text-sm text-terminal-dim">Use API /api/news/crawl to trigger immediate crawling. Scheduler runs every 15 minutes through cron.</p>
      </div>
    </main>
  );
}
