"use client";

import { useState } from "react";

interface PlayerSetupProps {
  onStart: (players: { name: string; order: number }[]) => void;
}

export default function PlayerSetup({ onStart }: PlayerSetupProps) {
  const [players, setPlayers] = useState([
    { name: "", order: 0 },
    { name: "", order: 1 },
  ]);

  function addPlayer() {
    if (players.length >= 6) return;
    setPlayers([...players, { name: "", order: players.length }]);
  }

  function removePlayer(index: number) {
    if (players.length <= 2) return;
    const updated = players
      .filter((_, i) => i !== index)
      .map((p, i) => ({ ...p, order: i }));
    setPlayers(updated);
  }

  function updateName(index: number, name: string) {
    const updated = [...players];
    updated[index] = { ...updated[index], name };
    setPlayers(updated);
  }

  function moveUp(index: number) {
    if (index === 0) return;
    const updated = [...players];
    [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
    setPlayers(updated.map((p, i) => ({ ...p, order: i })));
  }

  function moveDown(index: number) {
    if (index === players.length - 1) return;
    const updated = [...players];
    [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
    setPlayers(updated.map((p, i) => ({ ...p, order: i })));
  }

  const canStart = players.every((p) => p.name.trim().length > 0);

  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-[var(--jeopardy-gold)] mb-6 text-center">
        Player Setup
      </h2>
      <div className="space-y-3 mb-6">
        {players.map((player, index) => (
          <div key={index} className="flex items-center gap-2">
            <div className="flex flex-col gap-1">
              <button
                onClick={() => moveUp(index)}
                disabled={index === 0}
                className="text-gray-500 hover:text-white text-xs disabled:opacity-30"
              >
                ▲
              </button>
              <button
                onClick={() => moveDown(index)}
                disabled={index === players.length - 1}
                className="text-gray-500 hover:text-white text-xs disabled:opacity-30"
              >
                ▼
              </button>
            </div>
            <span className="text-gray-500 text-sm w-6">{index + 1}.</span>
            <input
              type="text"
              value={player.name}
              onChange={(e) => updateName(index, e.target.value)}
              placeholder={`Player ${index + 1}`}
              maxLength={30}
              className="flex-1 bg-gray-700 text-white rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--jeopardy-gold)]"
            />
            {players.length > 2 && (
              <button
                onClick={() => removePlayer(index)}
                className="text-red-400 hover:text-red-300 text-sm px-2"
              >
                Remove
              </button>
            )}
          </div>
        ))}
      </div>
      <div className="flex justify-between items-center">
        <button
          onClick={addPlayer}
          disabled={players.length >= 6}
          className="text-sm text-gray-400 hover:text-white transition-colors disabled:opacity-30"
        >
          + Add Player ({players.length}/6)
        </button>
        <button
          onClick={() => onStart(players)}
          disabled={!canStart}
          className="bg-[var(--jeopardy-gold)] text-[var(--header-bg)] px-6 py-2 rounded font-semibold hover:bg-[var(--jeopardy-gold-dark)] transition-colors disabled:opacity-50"
        >
          Start Game
        </button>
      </div>
    </div>
  );
}
