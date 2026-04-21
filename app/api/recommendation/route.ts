import { NextResponse } from "next/server";
import { getDashboardSnapshot } from "@/lib/dashboard/service";

export async function GET() {
  try {
    const snapshot = await getDashboardSnapshot();
    return NextResponse.json({
      recommendation: snapshot.recommendation,
      scores: snapshot.scores,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        detail: error instanceof Error ? error.message : "Unknown recommendation error",
      },
      { status: 500 },
    );
  }
}
