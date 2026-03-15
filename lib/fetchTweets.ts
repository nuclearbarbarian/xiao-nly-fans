import RSSParser from "rss-parser";

export interface Tweet {
  id: string;
  text: string;
  date: string;
  link: string;
  author: string;
}

const parser = new RSSParser();

const USERNAME = "xiaowang1984";

// Set RSSHUB_URL in your environment to point at your RSSHub instance
// e.g. https://your-rsshub.railway.app
const RSSHUB_URL = process.env.RSSHUB_URL || "";

const NITTER_INSTANCES = [
  "https://nitter.privacydev.net",
  "https://nitter.poast.org",
  "https://nitter.woodland.cafe",
];

let cache: { tweets: Tweet[]; fetchedAt: number } | null = null;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function fetchTweets(): Promise<Tweet[]> {
  if (cache && Date.now() - cache.fetchedAt < CACHE_TTL) {
    return cache.tweets;
  }

  // Build list of RSS URLs to try in priority order
  const rssUrls: { url: string; linkPrefix: string }[] = [];

  // 1. RSSHub (preferred — most reliable)
  if (RSSHUB_URL) {
    rssUrls.push({
      url: `${RSSHUB_URL}/twitter/user/${USERNAME}`,
      linkPrefix: "https://x.com",
    });
  }

  // 2. Nitter instances (fallback)
  for (const instance of NITTER_INSTANCES) {
    rssUrls.push({
      url: `${instance}/${USERNAME}/rss`,
      linkPrefix: instance,
    });
  }

  for (const { url, linkPrefix } of rssUrls) {
    try {
      const feed = await parser.parseURL(url);

      const tweets: Tweet[] = (feed.items || []).map((item, i) => ({
        id: item.guid || item.link || `tweet-${i}`,
        text: stripHtml(item.content || item.contentSnippet || item.title || ""),
        date: item.isoDate || item.pubDate || "",
        link: item.link?.replace(linkPrefix, "https://x.com") || `https://x.com/${USERNAME}`,
        author: `@${USERNAME}`,
      }));

      cache = { tweets, fetchedAt: Date.now() };
      console.log(`Fetched ${tweets.length} tweets from ${url}`);
      return tweets;
    } catch {
      continue;
    }
  }

  // Fallback: return sample tweets
  console.warn("All RSS sources unavailable, using sample tweets");
  return SAMPLE_TWEETS;
}

function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]*>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

const SAMPLE_TWEETS: Tweet[] = [
  {
    id: "sample-1",
    text: "I finally found a good summary of what it takes at a *technical* level to implement the mass VPP aggregator / economic DSO concepts so that DER can be taken on an equal footing to utility generation\n\nSpoiler:\nIt's a lot of work",
    date: "2023-11-29T12:00:00Z",
    link: "https://x.com/xiaowang1984",
    author: "@xiaowang1984",
  },
  {
    id: "sample-2",
    text: "\"Claude create a virtual service representative to deal with all the people who don't agree with their cost allocations\"",
    date: "2026-03-15T10:00:00Z",
    link: "https://x.com/xiaowang1984",
    author: "@xiaowang1984",
  },
  {
    id: "sample-3",
    text: "Seriously does anyone else see an issue with claiming to care about utilization by utilities on one hand and *SIMULTANEOUSLY* on the other promoting hurting utilization by forcing utilities to net meter community solar and accept connections of balcony solar. That line is gonna get harder and harder to walk.",
    date: "2026-03-15T09:30:00Z",
    link: "https://x.com/xiaowang1984",
    author: "@xiaowang1984",
  },
  {
    id: "sample-4",
    text: "Virginia is really doing all they can on the performative actions that makes it seem like you're addressing affordability to the masses with this and the VPP / utilization emphasis. What is next? Net metered community solar?",
    date: "2026-03-14T14:00:00Z",
    link: "https://x.com/xiaowang1984",
    author: "@xiaowang1984",
  },
  {
    id: "sample-5",
    text: "The generator interconnection queue is one of the biggest bottlenecks in the clean energy transition. Study cost can be accelerated and should be put into a real-time posture using AI.",
    date: "2026-03-15T08:00:00Z",
    link: "https://x.com/xiaowang1984",
    author: "@xiaowang1984",
  },
  {
    id: "sample-6",
    text: "Hot take: the biggest barrier to DER adoption isn't technology or even policy. It's the fact that distribution system planning is still done with spreadsheets and 20-year-old load forecasting models that don't account for EVs, heat pumps, or behind-the-meter solar.",
    date: "2026-03-13T16:00:00Z",
    link: "https://x.com/xiaowang1984",
    author: "@xiaowang1984",
  },
  {
    id: "sample-7",
    text: "Every time someone says \"just build more transmission\" I want to ask them if they've ever tried to permit a new line through three states, two RTOs, and a national forest. The interconnection problem is a coordination problem, not a technology problem.",
    date: "2026-03-12T11:00:00Z",
    link: "https://x.com/xiaowang1984",
    author: "@xiaowang1984",
  },
  {
    id: "sample-8",
    text: "The fundamental tension in utility regulation: we want utilities to be innovative and adopt new tech, but we also regulate them as monopolies with guaranteed returns. You can't have startup energy in a cost-of-service framework. Something has to give.",
    date: "2026-03-11T15:00:00Z",
    link: "https://x.com/xiaowang1984",
    author: "@xiaowang1984",
  },
];
