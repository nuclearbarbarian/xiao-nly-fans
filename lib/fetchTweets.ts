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
  retweetedFrom?: string;
}

const parser = new RSSParser();
const USERNAME = "xiaowang1984";
const RSSHUB_URL = process.env.RSSHUB_URL || "";
const PINNED_TWEET_TEXT = "I finally found a good summary of what it takes at a *technical* level to implement the mass VPP aggregator";

export async function fetchTweets(): Promise<Tweet[]> {
  if (!RSSHUB_URL) {
    console.warn("RSSHUB_URL not set");
    return [];
  }

  const feed = await parser.parseURL(`${RSSHUB_URL}/twitter/user/${USERNAME}`);

  const tweets: Tweet[] = (feed.items || []).map((item, i) => {
    const raw = item.content || item.contentSnippet || item.title || "";
    const images = extractImages(raw);
    if (item.enclosure?.url && !images.includes(item.enclosure.url)) images.push(item.enclosure.url);

    const { quotedTweet, mainContent } = extractQuotedTweet(raw);
    const { retweetedFrom, cleanText } = extractRetweet(stripHtml(mainContent));

    return {
      id: item.guid || item.link || `tweet-${i}`,
      text: cleanText,
      date: item.isoDate || item.pubDate || "",
      link: item.link || `https://x.com/${USERNAME}`,
      author: `@${USERNAME}`,
      images,
      ...(quotedTweet && { quotedTweet }),
      ...(retweetedFrom && { retweetedFrom }),
    };
  });

  return tweets.filter((t) => !t.text.startsWith(PINNED_TWEET_TEXT));
}

function extractRetweet(text: string): { retweetedFrom: string | null; cleanText: string } {
  const m = text.match(/^RT\s+@?(\w+):?\s*/);
  return m ? { retweetedFrom: m[1], cleanText: text.slice(m[0].length).trim() } : { retweetedFrom: null, cleanText: text };
}

function extractQuotedTweet(html: string): { quotedTweet: QuotedTweet | null; mainContent: string } {
  const match = html.match(/<div\s+class="rsshub-quote"[^>]*>([\s\S]*?)<\/div>/i)
    || html.match(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/i);
  if (!match) return { quotedTweet: null, mainContent: html };

  const quoteHtml = match[1];
  const linkMatch = quoteHtml.match(/<a[^>]+href=["']([^"']*(x\.com|twitter\.com)[^"']*)["'][^>]*>/i);

  let author = "Unknown";
  let link = "";
  if (linkMatch) {
    link = linkMatch[1];
    const m = link.match(/(?:x\.com|twitter\.com)\/([^/]+)/);
    if (m) author = `@${m[1]}`;
  }

  let quotedText = stripHtml(quoteHtml);

  if (author === "Unknown" && quotedText) {
    const m = quotedText.match(/^([^:]{1,40}):\s+/);
    if (m) {
      author = m[1];
      quotedText = quotedText.slice(m[0].length).trim();
    }
  }

  const mainContent = html.replace(match[0], "").trim();
  if (!quotedText) return { quotedTweet: null, mainContent: html };
  return { quotedTweet: { text: quotedText, author, link }, mainContent };
}

function extractImages(html: string): string[] {
  const regex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
  const images: string[] = [];
  let m;
  while ((m = regex.exec(html)) !== null) {
    if (m[1] && !m[1].includes("emoji") && !m[1].includes("hashflag")) {
      images.push(m[1].replace(/&amp;/g, "&"));
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
