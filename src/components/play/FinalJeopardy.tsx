"use client";

import { useState } from "react";

interface Player {
  id: string;
  name: string;
  score: number;
  order: number;
}

interface FinalJeopardyProps {
  category: string;
  question: string;
  answer: string;
  players: Player[];
  phase: "FINAL_WAGER" | "FINAL_ANSWER";
  onSubmitWagers: (wagers: { playerOrder: number; wager: number }[]) => void;
  onSubmitResults: (results: { playerOrder: number; correct: boolean }[]) => void;
}

export default function FinalJeopardy({
  category,
  question,
  answer,
  players,
  phase,
  onSubmitWagers,
  onSubmitResults,
}: FinalJeopardyProps) {
  const eligiblePlayers = players.filter((p) => p.score > 0);
  const ineligiblePlayers = players.filter((p) => p.score <= 0);
  const soloPlayer = eligiblePlayers.length === 1 ? eligiblePlayers[0] : null;

  const [wagers, setWagers] = useState<Record<number, number>>(() => {
    const initial: Record<number, number> = {};
    eligiblePlayers.forEach((p) => {
      initial[p.order] = 0;
    });
    return initial;
  });

  const [showAnswer, setShowAnswer] = useState(false);
  const [results, setResults] = useState<Record<number, boolean | null>>(() => {
    const initial: Record<number, boolean | null> = {};
    eligiblePlayers.forEach((p) => {
      initial[p.order] = null;
    });
    return initial;
  });

  if (phase === "FINAL_WAGER") {
    return (
      <div className="fixed inset-0 bg-[var(--board-bg)] flex flex-col items-center justify-center z-50 p-8">
        <div className="text-center max-w-lg w-full">
          <h2 className="text-3xl font-bold text-[var(--jeopardy-gold)] mb-2">
            Final Jeopardy!
          </h2>
          <p className="text-white text-xl mb-8 uppercase">{category}</p>

          {ineligiblePlayers.length > 0 && (
            <p className="text-gray-400 text-sm mb-6">
              Final Jeopardy is unavailable with a score at or below zero.
            </p>
          )}

          <div className="space-y-4 mb-8">
            {soloPlayer ? (
              <div className="space-y-3">
                <div className="text-white">Enter your wager.</div>
                <input
                  type="number"
                  value={wagers[soloPlayer.order] ?? 0}
                  onChange={(e) =>
                    setWagers((prev) => ({
                      ...prev,
                      [soloPlayer.order]: Math.min(
                        Math.max(0, Number(e.target.value)),
                        soloPlayer.score
                      ),
                    }))
                  }
                  min={0}
                  max={soloPlayer.score}
                  className="w-40 bg-gray-700 text-white text-center rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--jeopardy-gold)]"
                />
              </div>
            ) : (
              eligiblePlayers.map((player) => (
                <div
                  key={player.order}
                  className="flex items-center justify-between gap-4"
                >
                  <div className="text-white text-left">Enter wager</div>
                  <input
                    type="number"
                    value={wagers[player.order] ?? 0}
                    onChange={(e) =>
                      setWagers((prev) => ({
                        ...prev,
                        [player.order]: Math.min(
                          Math.max(0, Number(e.target.value)),
                          player.score
                        ),
                      }))
                    }
                    min={0}
                    max={player.score}
                    className="w-32 bg-gray-700 text-white text-center rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--jeopardy-gold)]"
                  />
                </div>
              ))
            )}
          </div>

          <button
            onClick={() =>
              onSubmitWagers(
                eligiblePlayers.map((p) => ({
                  playerOrder: p.order,
                  wager: wagers[p.order] ?? 0,
                }))
              )
            }
            className="bg-[var(--jeopardy-gold)] text-[var(--header-bg)] px-8 py-3 rounded font-semibold text-lg hover:bg-[var(--jeopardy-gold-dark)] transition-colors"
          >
            {soloPlayer ? "Lock In Wager" : "Lock In All Wagers"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-[var(--board-bg)] flex flex-col items-center justify-center z-50 p-8">
      <div className="text-center max-w-2xl w-full">
        <div className="text-[var(--jeopardy-gold)] text-sm font-semibold mb-2">
          Final Jeopardy | {category}
        </div>
        <p className="text-white text-2xl font-light leading-relaxed mb-8 uppercase">
          {question}
        </p>

        {!showAnswer && (
          <button
            onClick={() => setShowAnswer(true)}
            className="bg-white/10 text-white px-6 py-3 rounded-lg text-lg hover:bg-white/20 transition-colors"
          >
            Show Answer
          </button>
        )}

        {showAnswer && (
          <>
            <div className="bg-white/10 rounded-lg p-6 mb-8">
              <p className="text-[var(--jeopardy-gold)] text-xl font-semibold">
                {answer}
              </p>
            </div>

            <div className="space-y-4 mb-8">
              {soloPlayer ? (
                <div className="flex items-center justify-center gap-3">
                  <button
                    onClick={() =>
                      setResults((prev) => ({
                        ...prev,
                        [soloPlayer.order]: true,
                      }))
                    }
                    className={`px-5 py-2 rounded text-sm transition-colors ${
                      results[soloPlayer.order] === true
                        ? "bg-green-600 text-white"
                        : "bg-gray-700 text-gray-400 hover:bg-gray-600"
                    }`}
                  >
                    Correct
                  </button>
                  <button
                    onClick={() =>
                      setResults((prev) => ({
                        ...prev,
                        [soloPlayer.order]: false,
                      }))
                    }
                    className={`px-5 py-2 rounded text-sm transition-colors ${
                      results[soloPlayer.order] === false
                        ? "bg-red-600 text-white"
                        : "bg-gray-700 text-gray-400 hover:bg-gray-600"
                    }`}
                  >
                    Incorrect
                  </button>
                </div>
              ) : (
                eligiblePlayers.map((player) => (
                  <div
                    key={player.order}
                    className="flex items-center justify-between gap-4"
                  >
                    <span className="text-white">Result</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          setResults((prev) => ({
                            ...prev,
                            [player.order]: true,
                          }))
                        }
                        className={`px-4 py-2 rounded text-sm transition-colors ${
                          results[player.order] === true
                            ? "bg-green-600 text-white"
                            : "bg-gray-700 text-gray-400 hover:bg-gray-600"
                        }`}
                      >
                        Correct
                      </button>
                      <button
                        onClick={() =>
                          setResults((prev) => ({
                            ...prev,
                            [player.order]: false,
                          }))
                        }
                        className={`px-4 py-2 rounded text-sm transition-colors ${
                          results[player.order] === false
                            ? "bg-red-600 text-white"
                            : "bg-gray-700 text-gray-400 hover:bg-gray-600"
                        }`}
                      >
                        Incorrect
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <button
              onClick={() =>
                onSubmitResults(
                  eligiblePlayers.map((p) => ({
                    playerOrder: p.order,
                    correct: results[p.order] ?? false,
                  }))
                )
              }
              disabled={eligiblePlayers.some((p) => results[p.order] === null)}
              className="bg-[var(--jeopardy-gold)] text-[var(--header-bg)] px-8 py-3 rounded font-semibold text-lg hover:bg-[var(--jeopardy-gold-dark)] transition-colors disabled:opacity-50"
            >
              Submit Final Results
            </button>
          </>
        )}
      </div>
    </div>
  );
}
