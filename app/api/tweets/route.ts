import { NextResponse } from "next/server";
import { fetchTweets } from "@/lib/fetchTweets";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const tweets = await fetchTweets();
    return NextResponse.json(tweets);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to fetch tweets";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
