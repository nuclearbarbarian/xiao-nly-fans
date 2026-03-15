import Link from "next/link";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-dark/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-baseline gap-0.5">
          <span className="text-xl font-bold tracking-tight text-white">
            Xiao-nly
          </span>
          <span className="font-cursive text-2xl text-primary">Fans</span>
        </Link>

        <a
          href="https://x.com/xiaowang1984"
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full bg-primary px-4 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-accent"
        >
          Subscribe
        </a>
      </div>
    </header>
  );
}
