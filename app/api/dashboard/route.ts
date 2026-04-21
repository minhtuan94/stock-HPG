import { NextResponse } from "next/server";
import { getDashboardSnapshot } from "@/lib/dashboard/service";

export async function GET() {
  try {
    const snapshot = await getDashboardSnapshot();
    return NextResponse.json(snapshot);
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to load dashboard snapshot",
        detail: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
