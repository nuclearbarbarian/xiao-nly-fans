import { NextResponse } from "next/server";
import { explainTweet } from "@/lib/claude";

export async function POST(request: Request) {
  try {
    const { tweetText } = await request.json();
    if (!tweetText) return NextResponse.json({ error: "tweetText is required" }, { status: 400 });
    return NextResponse.json(await explainTweet(tweetText));
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed" }, { status: 500 });
  }
}
