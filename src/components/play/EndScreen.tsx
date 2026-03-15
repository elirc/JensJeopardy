"use client";

import Link from "next/link";

interface EndScreenProps {
  gameId: string;
}

export default function EndScreen({
  gameId,
}: EndScreenProps) {
  return (
    <div className="fixed inset-0 bg-[var(--background)] flex flex-col items-center justify-center z-50 p-8">
      <div className="text-center max-w-lg w-full animate-scale-in">
        <h2 className="text-4xl font-bold gold-glow-strong mb-2">
          Game Over!
        </h2>
        <p className="text-white text-xl mb-8 animate-fade-in">
          The game is complete.
        </p>

        <div className="flex justify-center gap-4">
          <Link
            href={`/games/${gameId}`}
            className="bg-[var(--jeopardy-gold)] text-[var(--header-bg)] px-6 py-3 rounded-lg font-semibold hover:bg-[var(--jeopardy-gold-dark)] transition-colors"
          >
            Play Again
          </Link>
          <Link
            href="/games"
            className="border border-gray-600 text-gray-300 px-6 py-3 rounded-lg hover:border-gray-400 hover:text-white transition-colors"
          >
            Browse Games
          </Link>
        </div>
      </div>
    </div>
  );
}
