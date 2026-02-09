"use client";

interface Player {
  id: string;
  name: string;
  score: number;
  order: number;
}

interface ScoreboardProps {
  players: Player[];
  activePlayerOrder?: number;
}

export default function Scoreboard({
  players,
  activePlayerOrder,
}: ScoreboardProps) {
  const sortedPlayers = [...players].sort((a, b) => a.order - b.order);

  return (
    <div className="flex justify-center gap-3 py-2">
      {sortedPlayers.map((player) => {
        const isActive = activePlayerOrder === player.order;
        return (
          <div
            key={player.id}
            className={`text-center px-4 py-2 rounded-lg min-w-[120px] transition-all ${
              isActive
                ? "ring-2 ring-[var(--jeopardy-gold)] bg-[var(--jeopardy-gold)]/15 shadow-[0_0_12px_rgba(255,204,0,0.3)]"
                : "bg-gray-800/80"
            }`}
          >
            <div className="text-xs text-gray-400 truncate max-w-[120px] mb-1 uppercase tracking-wider">
              {player.name}
            </div>
            <div
              className={`text-xl font-bold tabular-nums ${
                player.score < 0
                  ? "text-red-400"
                  : "gold-glow"
              }`}
            >
              ${player.score.toLocaleString()}
            </div>
          </div>
        );
      })}
    </div>
  );
}
