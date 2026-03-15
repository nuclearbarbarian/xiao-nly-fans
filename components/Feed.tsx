"use client";

import { useEffect, useState } from "react";
import TweetCard from "./TweetCard";

interface Tweet {
  id: string;
  text: string;
  date: string;
  link: string;
  author: string;
}

export default function Feed() {
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/tweets");
        if (!res.ok) throw new Error("Failed to fetch tweets");
        const data = await res.json();
        setTweets(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="animate-pulse rounded-xl border border-white/5 bg-card p-5"
          >
            <div className="mb-2 flex justify-between">
              <div className="h-4 w-24 rounded bg-white/10" />
              <div className="h-3 w-20 rounded bg-white/10" />
            </div>
            <div className="mb-2 h-4 w-full rounded bg-white/10" />
            <div className="mb-2 h-4 w-3/4 rounded bg-white/10" />
            <div className="h-4 w-1/2 rounded bg-white/10" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-6 text-center">
        <p className="mb-2 text-red-400">Failed to load tweets</p>
        <p className="text-sm text-gray">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-3 rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-white hover:bg-accent"
        >
          Retry
        </button>
      </div>
    );
  }

  if (tweets.length === 0) {
    return (
      <div className="rounded-xl border border-white/5 bg-card p-6 text-center text-gray">
        No tweets found.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {tweets.map((tweet) => (
        <TweetCard key={tweet.id} {...tweet} />
      ))}
    </div>
  );
}
