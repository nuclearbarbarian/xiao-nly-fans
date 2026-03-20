import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

export interface Explanation {
  text: string;
  searchTerms: string[];
}

const explanationCache = new Map<string, Explanation>();

export async function explainTweet(tweetText: string, tweetId: string): Promise<Explanation> {
  const cached = explanationCache.get(tweetId);
  if (cached) return cached;

  const message = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 500,
    system:
      "You are an energy policy expert writing for a general audience. " +
      "Given a tweet about energy policy, explain it in 1-2 plain-English sentences. " +
      "Define any jargon, acronyms, or technical terms. " +
      "Then suggest 1-3 search terms the reader can Google to learn more. " +
      "These should be specific, useful search queries — e.g. 'FERC Order 2222 distributed energy', 'LCOE vs LCOS comparison', 'EIA electricity generation costs 2024'. " +
      "Respond ONLY with valid JSON in this exact format, no other text:\n" +
      '{"text": "your explanation here", "searchTerms": ["search term 1", "search term 2"]}',
    messages: [
      {
        role: "user",
        content: `Explain this tweet to someone with no energy policy background:\n\n"${tweetText}"`,
      },
    ],
  });

  const raw =
    message.content[0].type === "text"
      ? message.content[0].text
      : "";

  // Strip markdown code fences if present
  const cleaned = raw.replace(/^```(?:json)?\s*\n?/i, "").replace(/\n?```\s*$/i, "").trim();

  let explanation: Explanation;
  try {
    explanation = JSON.parse(cleaned);
    if (!explanation.text || !Array.isArray(explanation.searchTerms)) {
      throw new Error("Invalid shape");
    }
  } catch {
    explanation = { text: cleaned || "Could not generate explanation.", searchTerms: [] };
  }

  explanationCache.set(tweetId, explanation);
  return explanation;
}
