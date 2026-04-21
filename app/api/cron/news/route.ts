import { NextResponse } from "next/server";
import { runNewsCrawler } from "@/lib/crawler/news-crawler";

export async function GET(request: Request) {
  const auth = request.headers.get("authorization");
  const expected = process.env.CRON_SECRET;

  if (expected && auth !== `Bearer ${expected}`) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await runNewsCrawler();
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        detail: error instanceof Error ? error.message : "Cron crawler failed",
      },
      { status: 500 },
    );
  }
}
