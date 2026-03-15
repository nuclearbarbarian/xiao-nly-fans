import TweetCard from "./TweetCard";
import type { Tweet } from "@/lib/fetchTweets";

interface FeedProps {
  tweets: Tweet[];
}

export default function Feed({ tweets }: FeedProps) {
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
