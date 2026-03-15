"use client";

import Tooltip from "./Tooltip";

interface TweetCardProps {
  id: string;
  text: string;
  date: string;
  link: string;
  author: string;
}

export default function TweetCard({ id, text, date, link, author }: TweetCardProps) {
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
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-medium text-primary">{author}</span>
        <time className="text-xs text-pink">{formattedDate}</time>
      </div>

      <p className="mb-3 whitespace-pre-wrap leading-relaxed text-white/90">{text}</p>

      <div className="flex items-center justify-between">
        <Tooltip tweetId={id} tweetText={text} />

        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-pink transition-colors hover:text-primary"
        >
          View on X &rarr;
        </a>
      </div>
    </article>
  );
}
