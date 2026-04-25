import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const take = Math.min(Number(url.searchParams.get("take") || "30"), 100);

  const rows = await prisma.news.findMany({
    orderBy: { publishedAt: "desc" },
    take,
    include: { sentiment: true, tags: { include: { tag: true } } },
  });

  return NextResponse.json({
    items: rows.map((item) => ({
      id: item.id,
      title: item.title,
      source: item.source,
      publishedAt: item.publishedAt.toISOString(),
      url: item.url,
      content: item.content,
      sentiment: item.sentiment?.score ?? 0,
      summary: item.sentiment?.summary || item.content.slice(0, 180),
      tags: item.tags.map((x) => x.tag.code),
    })),
  });
}
