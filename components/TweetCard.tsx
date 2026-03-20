"use client";

import Image from "next/image";
import Tooltip from "./Tooltip";

interface QuotedTweet {
  text: string;
  author: string;
  link: string;
}

interface TweetCardProps {
  id: string;
  text: string;
  date: string;
  link: string;
  author: string;
  images?: string[];
  quotedTweet?: QuotedTweet;
  retweetedFrom?: string;
}

export default function TweetCard({ id, text, date, link, author, images, quotedTweet, retweetedFrom }: TweetCardProps) {
  const formattedDate = date
    ? new Date(date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : "";

  return (
    <article className="rounded-xl border border-white/5 bg-card p-5 transition-colors hover:bg-card-hover">
      {/* Retweet indicator */}
      {retweetedFrom && (
        <div className="mb-2 flex items-center gap-2 text-xs text-pink/60">
          <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M4.75 3.79l4.603 4.3-1.706 1.82L6 8.38v7.37c0 .97.784 1.75 1.75 1.75H13V19.5H7.75c-2.347 0-4.25-1.9-4.25-4.25V8.38L1.853 9.91.147 8.09l4.603-4.3zm11.5 2.71H11V4.5h5.25c2.347 0 4.25 1.9 4.25 4.25v7.37l1.647-1.53 1.706 1.82-4.603 4.3-4.603-4.3 1.706-1.82L18 16.12V8.75c0-.97-.784-1.75-1.75-1.75z" />
          </svg>
          <span>Xiao Wang retweeted <strong className="text-pink">@{retweetedFrom}</strong></span>
        </div>
      )}

      {/* Tweet header — avatar, name, handle, date */}
      <div className="mb-3 flex items-start gap-3">
        <img
          src="https://pbs.twimg.com/profile_images/1437821373225717761/CzezIwWV_400x400.jpg"
          alt="@xiaowang1984"
          className="h-10 w-10 rounded-full object-cover"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-white">{retweetedFrom || "Xiao Wang"}</span>
            <span className="text-sm text-pink">{retweetedFrom ? `@${retweetedFrom}` : author}</span>
          </div>
          <time className="text-xs text-pink/60">{formattedDate}</time>
        </div>
      </div>

      {/* Tweet body */}
      <p className="mb-4 whitespace-pre-wrap leading-relaxed text-white/90">{text}</p>

      {/* Quoted tweet */}
      {quotedTweet && (
        <a
          href={quotedTweet.link || "#"}
          target="_blank"
          rel="noopener noreferrer"
          className="mb-4 block rounded-lg border border-white/10 bg-white/5 p-3 transition-colors hover:bg-white/10"
        >
          <span className="mb-1 block text-xs font-medium text-pink">
            {quotedTweet.author}
          </span>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-white/70">
            {quotedTweet.text}
          </p>
        </a>
      )}

      {/* Tweet images */}
      {images && images.length > 0 && (
        <div className={`mb-4 grid gap-2 ${images.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}>
          {images.map((src, i) => (
            <div key={i} className="relative aspect-video w-full overflow-hidden rounded-xl border border-white/5">
              <Image
                src={src}
                alt={`Tweet image ${i + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 600px) 100vw, 600px"
                unoptimized={!src.includes("twimg.com")}
              />
            </div>
          ))}
        </div>
      )}

      {/* Actions row */}
      <div className="flex items-center justify-between border-t border-white/5 pt-3">
        <Tooltip tweetId={id} tweetText={text} />

        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 text-xs text-pink transition-colors hover:text-primary"
        >
          View on X &rarr;
        </a>
      </div>
    </article>
  );
}
