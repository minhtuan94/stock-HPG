import { prisma } from "@/lib/db";

export const runtime = "nodejs";

export async function GET(request: Request) {
  let closed = false;
  let interval: ReturnType<typeof setInterval> | null = null;

  const closeStream = () => {
    if (closed) return;
    closed = true;
    if (interval) {
      clearInterval(interval);
      interval = null;
    }
  };

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();

      const push = async () => {
        if (closed) return;

        const rows = await prisma.news.findMany({
          orderBy: { publishedAt: "desc" },
          take: 15,
          include: { sentiment: true },
        });

        const payload = {
          ts: Date.now(),
          items: rows.map((item) => ({
            id: item.id,
            title: item.title,
            source: item.source,
            summary: item.sentiment?.summary || item.content.slice(0, 180),
            publishedAt: item.publishedAt.toISOString(),
            sentiment: item.sentiment?.score ?? 0,
            url: item.url,
          })),
        };

        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`));
        } catch {
          closeStream();
        }
      };

      request.signal.addEventListener("abort", closeStream);

      await push();
      interval = setInterval(() => {
        void push().catch(() => {
          closeStream();
        });
      }, 15000);
    },
    cancel() {
      closeStream();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      Connection: "keep-alive",
      "Cache-Control": "no-cache, no-transform",
    },
  });
}
