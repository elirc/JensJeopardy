"use client";

import Link from "next/link";

interface Player {
  id: string;
  name: string;
  score: number;
  order: number;
}

interface EndScreenProps {
  players: Player[];
  gameId: string;
  sessionId: string;
}

export default function EndScreen({
  players,
  gameId,
}: EndScreenProps) {
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
  const winner = sortedPlayers[0];

  return (
    <div className="fixed inset-0 bg-[var(--background)] flex flex-col items-center justify-center z-50 p-8">
      <div className="text-center max-w-lg w-full animate-scale-in">
        <h2 className="text-4xl font-bold gold-glow-strong mb-2">
          Game Over!
        </h2>
        {winner && (
          <p className="text-white text-xl mb-8 animate-fade-in">
            Winner: <span className="font-bold">{winner.name}</span> with $
            {winner.score.toLocaleString()}!
          </p>
        )}

        <div className="space-y-3 mb-8">
          {sortedPlayers.map((player, index) => (
            <div
              key={player.id}
              className={`flex items-center justify-between px-6 py-3 rounded-lg animate-fade-in-up ${
                index === 0
                  ? "ring-2 ring-[var(--jeopardy-gold)] bg-[var(--jeopardy-gold)]/15 shadow-[0_0_16px_rgba(255,204,0,0.3)]"
                  : "bg-gray-800"
              }`}
              style={{ animationDelay: `${index * 100}ms`, animationFillMode: "both" }}
            >
              <div className="flex items-center gap-3">
                <span className="text-gray-500 font-mono text-sm w-6">
                  #{index + 1}
                </span>
                <span className="text-white font-medium">{player.name}</span>
              </div>
              <span
                className={`font-bold ${
                  player.score < 0
                    ? "text-red-400"
                    : index === 0
                    ? "gold-glow"
                    : "text-[var(--jeopardy-gold)]"
                }`}
              >
                ${player.score.toLocaleString()}
              </span>
            </div>
          ))}
        </div>

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
