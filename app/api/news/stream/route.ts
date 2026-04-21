import { prisma } from "@/lib/db";

export const runtime = "nodejs";

export async function GET() {
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();

      const push = async () => {
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

        controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`));
      };

      await push();
      const interval = setInterval(() => {
        void push();
      }, 15000);

      // @ts-expect-error - custom property for cleanup in cancel.
      controller._interval = interval;
    },
    cancel() {
      // @ts-expect-error - custom property from start.
      if (this._interval) clearInterval(this._interval);
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
