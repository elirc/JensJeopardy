import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center">
      <h1 className="text-5xl font-bold text-[var(--jeopardy-gold)] mb-4">
        Jeopardy Maker
      </h1>
      <p className="text-gray-400 text-lg mb-8 max-w-md">
        Create custom Jeopardy games, share them with friends, and play
        together on a single device.
      </p>
      <div className="flex flex-wrap justify-center gap-4">
        <Link
          href="/games?tab=official"
          className="border border-[var(--jeopardy-gold)] text-[var(--jeopardy-gold)] px-6 py-3 rounded-lg text-lg font-medium hover:bg-[var(--jeopardy-gold)] hover:text-[var(--header-bg)] transition-colors"
        >
          Play Prebuilt Games
        </Link>
        <Link
          href="/games/new"
          className="bg-[var(--jeopardy-gold)] text-[var(--header-bg)] px-6 py-3 rounded-lg text-lg font-semibold hover:bg-[var(--jeopardy-gold-dark)] transition-colors"
        >
          Create a Game
        </Link>
        <Link
          href="/games"
          className="border border-gray-600 text-gray-300 px-6 py-3 rounded-lg text-lg font-medium hover:border-gray-400 hover:text-white transition-colors"
        >
          Browse Games
        </Link>
      </div>
    </div>
  );
}
