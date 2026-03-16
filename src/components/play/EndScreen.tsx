"use client";

import Link from "next/link";

interface EndScreenProps {
  gameId: string;
}

export default function EndScreen({
  gameId,
}: EndScreenProps) {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[var(--background)] p-4 sm:p-8">
      <div className="mx-auto flex min-h-[100dvh] w-full max-w-lg items-center justify-center py-[calc(env(safe-area-inset-top)+1rem)] pb-[calc(env(safe-area-inset-bottom)+1rem)]">
        <div className="w-full animate-scale-in text-center">
          <h2 className="gold-glow-strong mb-2 text-3xl font-bold sm:text-4xl">
          Game Over!
          </h2>
          <p className="mb-8 animate-fade-in text-lg text-white sm:text-xl">
            The game is complete.
          </p>

          <div className="flex flex-col justify-center gap-3 sm:flex-row sm:gap-4">
            <Link
              href={`/games/${gameId}`}
              className="rounded-lg bg-[var(--jeopardy-gold)] px-6 py-3 font-semibold text-[var(--header-bg)] transition-colors hover:bg-[var(--jeopardy-gold-dark)]"
            >
              Play Again
            </Link>
            <Link
              href="/games"
              className="rounded-lg border border-gray-600 px-6 py-3 text-gray-300 transition-colors hover:border-gray-400 hover:text-white"
            >
              Browse Games
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
