import RSSParser from "rss-parser";

export interface QuotedTweet {
  text: string;
  author: string;
  link: string;
}

export interface Tweet {
  id: string;
  text: string;
  date: string;
  link: string;
  author: string;
  images: string[];
  quotedTweet?: QuotedTweet;
  retweetedFrom?: string; // original author when this is a retweet
}

const parser = new RSSParser();

const USERNAME = "xiaowang1984";

// Set RSSHUB_URL in your environment to point at your RSSHub instance
// e.g. https://your-rsshub.railway.app
const RSSHUB_URL = process.env.RSSHUB_URL || "";

// Pinned tweet text to filter out (RSSHub includes pinned tweets in the feed)
const PINNED_TWEET_TEXT = "I finally found a good summary of what it takes at a *technical* level to implement the mass VPP aggregator";

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

      const tweets: Tweet[] = (feed.items || []).map((item, i) => {
        const rawContent = item.content || item.contentSnippet || item.title || "";
        const images = extractImages(rawContent);

        // Also check enclosure for media
        if (item.enclosure?.url && !images.includes(item.enclosure.url)) {
          images.push(item.enclosure.url);
        }


        // Extract quoted tweet before stripping HTML
        const { quotedTweet, mainContent } = extractQuotedTweet(rawContent);

        // Detect retweets (RT @username prefix)
        const strippedText = stripHtml(mainContent);
        const { retweetedFrom, cleanText } = extractRetweet(strippedText);

        return {
          id: item.guid || item.link || `tweet-${i}`,
          text: cleanText,
          date: item.isoDate || item.pubDate || "",
          link: item.link?.replace(linkPrefix, "https://x.com") || `https://x.com/${USERNAME}`,
          author: `@${USERNAME}`,
          images,
          ...(quotedTweet && { quotedTweet }),
          ...(retweetedFrom && { retweetedFrom }),
        };
      });

      // Filter out pinned tweet
      const filtered = tweets.filter((t) => !t.text.startsWith(PINNED_TWEET_TEXT));

      cache = { tweets: filtered, fetchedAt: Date.now() };
      console.log(`Fetched ${filtered.length} tweets from ${url}`);
      return filtered;
    } catch {
      continue;
    }
  }

  // Fallback: return sample tweets
  console.warn("All RSS sources unavailable, using sample tweets");
  return SAMPLE_TWEETS;
}

function extractRetweet(text: string): { retweetedFrom: string | null; cleanText: string } {
  // RSSHub formats retweets as "RT @username: ..." or "RT username\n..."
  const rtMatch = text.match(/^RT\s+@?(\w+):?\s*/);
  if (rtMatch) {
    return {
      retweetedFrom: rtMatch[1],
      cleanText: text.slice(rtMatch[0].length).trim(),
    };
  }
  return { retweetedFrom: null, cleanText: text };
}


function extractQuotedTweet(html: string): { quotedTweet: QuotedTweet | null; mainContent: string } {
  // RSSHub wraps quoted tweets in <div class="rsshub-quote"> or <blockquote> tags
  const quoteRegex = /<div\s+class="rsshub-quote"[^>]*>([\s\S]*?)<\/div>/i;
  const blockquoteRegex = /<blockquote[^>]*>([\s\S]*?)<\/blockquote>/i;
  const match = html.match(quoteRegex) || html.match(blockquoteRegex);

  if (!match) {
    return { quotedTweet: null, mainContent: html };
  }

  const blockquoteHtml = match[1];

  // Extract the link to the quoted tweet
  const linkMatch = blockquoteHtml.match(/<a[^>]+href=["']([^"']*x\.com[^"']*)["'][^>]*>/i)
    || blockquoteHtml.match(/<a[^>]+href=["']([^"']*twitter\.com[^"']*)["'][^>]*>/i);

  // Extract the author from the link (e.g., https://x.com/username/status/...)
  let author = "Unknown";
  let link = "";
  if (linkMatch) {
    link = linkMatch[1];
    const authorMatch = link.match(/(?:x\.com|twitter\.com)\/([^/]+)/);
    if (authorMatch) {
      author = `@${authorMatch[1]}`;
    }
  }

  // Get the quoted text
  let quotedText = stripHtml(blockquoteHtml);

  // RSSHub formats as "Author Name: quoted text" — extract author from text if not found via link
  if (author === "Unknown" && quotedText) {
    const inlineAuthorMatch = quotedText.match(/^([^:]{1,40}):\s+/);
    if (inlineAuthorMatch) {
      author = inlineAuthorMatch[1];
      quotedText = quotedText.slice(inlineAuthorMatch[0].length).trim();
    }
  }

  // Remove the blockquote from the main content
  const mainContent = html.replace(match[0], "").trim();

  if (!quotedText) {
    return { quotedTweet: null, mainContent: html };
  }

  return {
    quotedTweet: { text: quotedText, author, link },
    mainContent,
  };
}

function extractImages(html: string): string[] {
  const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
  const images: string[] = [];
  let match;
  while ((match = imgRegex.exec(html)) !== null) {
    // Skip emoji and tiny images, only keep tweet media
    if (match[1] && !match[1].includes("emoji") && !match[1].includes("hashflag")) {
      // Decode HTML entities in URLs (e.g. &amp; → &)
      const url = match[1].replace(/&amp;/g, "&");
      images.push(url);
    }
  }
  return images;
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
    id: "sample-2",
    text: "\"Claude create a virtual service representative to deal with all the people who don't agree with their cost allocations\"",
    date: "2026-03-15T10:00:00Z",
    link: "https://x.com/xiaowang1984",
    author: "@xiaowang1984",
    images: [],
  },
  {
    id: "sample-3",
    text: "Seriously does anyone else see an issue with claiming to care about utilization by utilities on one hand and *SIMULTANEOUSLY* on the other promoting hurting utilization by forcing utilities to net meter community solar and accept connections of balcony solar. That line is gonna get harder and harder to walk.",
    date: "2026-03-15T09:30:00Z",
    link: "https://x.com/xiaowang1984",
    author: "@xiaowang1984",
    images: [],
  },
  {
    id: "sample-4",
    text: "Virginia is really doing all they can on the performative actions that makes it seem like you're addressing affordability to the masses with this and the VPP / utilization emphasis. What is next? Net metered community solar?",
    date: "2026-03-14T14:00:00Z",
    link: "https://x.com/xiaowang1984",
    author: "@xiaowang1984",
    images: [],
  },
  {
    id: "sample-5",
    text: "The generator interconnection queue is one of the biggest bottlenecks in the clean energy transition. Study cost can be accelerated and should be put into a real-time posture using AI.",
    date: "2026-03-15T08:00:00Z",
    link: "https://x.com/xiaowang1984",
    author: "@xiaowang1984",
    images: [],
  },
  {
    id: "sample-6",
    text: "Hot take: the biggest barrier to DER adoption isn't technology or even policy. It's the fact that distribution system planning is still done with spreadsheets and 20-year-old load forecasting models that don't account for EVs, heat pumps, or behind-the-meter solar.",
    date: "2026-03-13T16:00:00Z",
    link: "https://x.com/xiaowang1984",
    author: "@xiaowang1984",
    images: [],
  },
  {
    id: "sample-7",
    text: "Every time someone says \"just build more transmission\" I want to ask them if they've ever tried to permit a new line through three states, two RTOs, and a national forest. The interconnection problem is a coordination problem, not a technology problem.",
    date: "2026-03-12T11:00:00Z",
    link: "https://x.com/xiaowang1984",
    author: "@xiaowang1984",
    images: [],
  },
  {
    id: "sample-8",
    text: "The fundamental tension in utility regulation: we want utilities to be innovative and adopt new tech, but we also regulate them as monopolies with guaranteed returns. You can't have startup energy in a cost-of-service framework. Something has to give.",
    date: "2026-03-11T15:00:00Z",
    link: "https://x.com/xiaowang1984",
    author: "@xiaowang1984",
    images: [],
  },
];
