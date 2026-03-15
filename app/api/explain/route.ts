import { NextResponse } from "next/server";
import { explainTweet } from "@/lib/claude";

export async function POST(request: Request) {
  try {
    const { tweetText, tweetId } = await request.json();

    if (!tweetText || !tweetId) {
      return NextResponse.json(
        { error: "tweetText and tweetId are required" },
        { status: 400 }
      );
    }

    const explanation = await explainTweet(tweetText, tweetId);
    return NextResponse.json(explanation);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to generate explanation";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
