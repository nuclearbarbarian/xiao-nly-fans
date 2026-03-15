"use client";

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
}

export default function TweetCard({ id, text, date, link, author, images, quotedTweet }: TweetCardProps) {
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
      {/* Tweet header — avatar, name, handle, date */}
      <div className="mb-3 flex items-start gap-3">
        <img
          src="https://pbs.twimg.com/profile_images/1437821373225717761/CzezIwWV_400x400.jpg"
          alt="@xiaowang1984"
          className="h-10 w-10 rounded-full object-cover"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-white">Xiao Wang</span>
            <span className="text-sm text-pink">{author}</span>
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
            <img
              key={i}
              src={src}
              alt={`Tweet image ${i + 1}`}
              className="w-full rounded-xl border border-white/5 object-cover"
              loading="lazy"
            />
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
