"use client";

import { useState } from "react";

interface Player {
  id: string;
  name: string;
  score: number;
  order: number;
}

interface DailyDoubleModalProps {
  question: string;
  answer: string;
  players: Player[];
  highestBoardValue: number;
  onSubmitWager: (playerOrder: number, wager: number) => void;
  onScore: (correct: boolean) => void;
  onCancel: () => void;
  // If wager is already set, show clue
  wagerState?: { playerOrder: number; wager: number } | null;
}

export default function DailyDoubleModal({
  question,
  answer,
  players,
  highestBoardValue,
  onSubmitWager,
  onScore,
  onCancel,
  wagerState,
}: DailyDoubleModalProps) {
  const [selectedPlayer, setSelectedPlayer] = useState<number>(
    players[0]?.order ?? 0
  );
  const [wager, setWager] = useState(5);
  const [showAnswer, setShowAnswer] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const activePlayer = players.find((p) => p.order === (wagerState?.playerOrder ?? selectedPlayer));
  const maxWager = activePlayer
    ? Math.max(activePlayer.score, highestBoardValue)
    : highestBoardValue;

  if (!wagerState) {
    // Wager entry phase with dramatic entrance
    return (
      <div className="fixed inset-0 bg-[var(--board-bg)] flex flex-col items-center justify-center z-50 p-8">
        <div className="text-center max-w-lg w-full animate-dd-entrance">
          {/* Glowing container */}
          <div className="border-2 border-[var(--jeopardy-gold)] rounded-xl p-8 animate-dd-glow">
            <h2 className="text-5xl font-bold gold-glow-strong mb-8 animate-gold-pulse">
              DAILY DOUBLE!
            </h2>
            <div className="space-y-6">
              <div>
                <label className="block text-gray-400 text-sm mb-2">
                  Select Player
                </label>
                <div className="flex flex-wrap justify-center gap-2">
                  {players.map((p) => (
                    <button
                      key={p.order}
                      onClick={() => setSelectedPlayer(p.order)}
                      className={`px-4 py-2 rounded text-sm transition-colors ${
                        selectedPlayer === p.order
                          ? "bg-[var(--jeopardy-gold)] text-[var(--header-bg)] font-semibold"
                          : "bg-gray-700 text-white hover:bg-gray-600"
                      }`}
                    >
                      {p.name} (${p.score.toLocaleString()})
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">
                  Wager (min $5, max ${maxWager.toLocaleString()})
                </label>
                <input
                  type="number"
                  value={wager}
                  onChange={(e) => setWager(Number(e.target.value))}
                  min={5}
                  max={maxWager}
                  className="w-48 bg-gray-700 text-white text-center text-xl rounded px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--jeopardy-gold)]"
                />
              </div>
              <div className="flex justify-center gap-4">
                <button
                  onClick={onCancel}
                  className="text-gray-400 hover:text-white text-sm px-4 py-2 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setSubmitting(true);
                    onSubmitWager(selectedPlayer, Math.min(Math.max(wager, 5), maxWager));
                  }}
                  disabled={submitting || wager < 5 || wager > maxWager}
                  className="bg-[var(--jeopardy-gold)] text-[var(--header-bg)] px-8 py-3 rounded font-semibold text-lg hover:bg-[var(--jeopardy-gold-dark)] transition-colors disabled:opacity-50"
                >
                  Lock In Wager
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Clue display phase (wager already set)
  const wageringPlayer = players.find((p) => p.order === wagerState.playerOrder);

  return (
    <div className="fixed inset-0 bg-[var(--board-bg)] flex flex-col items-center justify-center z-50 p-8">
      <div className="text-center max-w-2xl w-full animate-fade-in">
        <div className="gold-glow text-sm font-semibold mb-2">
          DAILY DOUBLE — {wageringPlayer?.name} wagered $
          {wagerState.wager.toLocaleString()}
        </div>
        <p className="text-white text-2xl md:text-3xl font-light leading-relaxed mb-8 uppercase">
          {question}
        </p>

        {!showAnswer && (
          <button
            onClick={() => setShowAnswer(true)}
            className="animate-fade-in bg-white/10 text-white px-6 py-3 rounded-lg text-lg hover:bg-white/20 transition-colors mb-8"
          >
            Show Answer
          </button>
        )}

        {showAnswer && (
          <div className="animate-fade-in-up">
            <div className="bg-white/10 rounded-lg p-6 mb-8">
              <p className="gold-glow-strong text-xl font-semibold">
                {answer}
              </p>
            </div>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => onScore(true)}
                className="bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg text-lg font-semibold transition-colors"
              >
                Correct (+${wagerState.wager.toLocaleString()})
              </button>
              <button
                onClick={() => onScore(false)}
                className="bg-red-600 hover:bg-red-500 text-white px-8 py-3 rounded-lg text-lg font-semibold transition-colors"
              >
                Incorrect (-${wagerState.wager.toLocaleString()})
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
