import { NextResponse } from "next/server";
import { runNewsCrawler } from "@/lib/crawler/news-crawler";

export async function POST() {
  try {
    const result = await runNewsCrawler();
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        detail: error instanceof Error ? error.message : "Unknown crawler error",
      },
      { status: 500 },
    );
  }
}
