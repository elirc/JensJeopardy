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
      <div className="fixed inset-0 z-50 overflow-y-auto bg-[var(--board-bg)] p-4 sm:p-8">
        <div className="mx-auto flex min-h-[100dvh] w-full max-w-lg items-center justify-center py-[calc(env(safe-area-inset-top)+1rem)] pb-[calc(env(safe-area-inset-bottom)+1rem)]">
          <div className="w-full text-center">
            <h2 className="mb-2 text-2xl font-bold text-[var(--jeopardy-gold)] sm:text-3xl">
            Final Jeopardy!
            </h2>
            <p className="mb-6 text-lg uppercase text-white sm:mb-8 sm:text-xl">
              {category}
            </p>

            {ineligiblePlayers.length > 0 && (
              <p className="mb-6 text-sm text-gray-400">
                Final Jeopardy is unavailable with a score at or below zero.
              </p>
            )}

            <div className="mb-8 space-y-4">
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
                    className="w-full max-w-[10rem] rounded bg-gray-700 px-3 py-2 text-center text-white focus:outline-none focus:ring-2 focus:ring-[var(--jeopardy-gold)]"
                  />
                </div>
              ) : (
                eligiblePlayers.map((player) => (
                  <div
                    key={player.order}
                    className="flex flex-col items-center gap-2 rounded-lg bg-white/5 p-3 sm:flex-row sm:justify-between sm:gap-4"
                  >
                    <div className="text-white sm:text-left">Enter wager</div>
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
                      className="w-full max-w-[10rem] rounded bg-gray-700 px-3 py-2 text-center text-white focus:outline-none focus:ring-2 focus:ring-[var(--jeopardy-gold)]"
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
              className="w-full rounded bg-[var(--jeopardy-gold)] px-6 py-3 text-lg font-semibold text-[var(--header-bg)] transition-colors hover:bg-[var(--jeopardy-gold-dark)] sm:w-auto sm:px-8"
            >
              {soloPlayer ? "Lock In Wager" : "Lock In All Wagers"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[var(--board-bg)] p-4 sm:p-8">
      <div className="mx-auto flex min-h-[100dvh] w-full max-w-2xl items-center justify-center py-[calc(env(safe-area-inset-top)+1rem)] pb-[calc(env(safe-area-inset-bottom)+1rem)]">
        <div className="w-full text-center">
          <div className="mb-2 text-xs font-semibold text-[var(--jeopardy-gold)] sm:text-sm">
            Final Jeopardy | {category}
          </div>
          <p className="mb-6 text-xl font-light leading-relaxed text-white uppercase sm:mb-8 sm:text-2xl">
            {question}
          </p>

          {!showAnswer && (
            <button
              onClick={() => setShowAnswer(true)}
              className="w-full rounded-lg bg-white/10 px-6 py-3 text-base text-white transition-colors hover:bg-white/20 sm:w-auto sm:text-lg"
            >
              Show Answer
            </button>
          )}

          {showAnswer && (
            <>
              <div className="mb-6 rounded-lg bg-white/10 p-4 sm:mb-8 sm:p-6">
                <p className="text-lg font-semibold text-[var(--jeopardy-gold)] sm:text-xl">
                  {answer}
                </p>
              </div>

              <div className="mb-8 space-y-4">
                {soloPlayer ? (
                  <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
                    <button
                      onClick={() =>
                        setResults((prev) => ({
                          ...prev,
                          [soloPlayer.order]: true,
                        }))
                      }
                      className={`w-full rounded px-5 py-2 text-sm transition-colors sm:w-auto ${
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
                      className={`w-full rounded px-5 py-2 text-sm transition-colors sm:w-auto ${
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
                      className="flex flex-col items-center gap-3 rounded-lg bg-white/5 p-3 sm:flex-row sm:justify-between sm:gap-4"
                    >
                      <span className="text-white">Result</span>
                      <div className="flex w-full gap-2 sm:w-auto">
                        <button
                          onClick={() =>
                            setResults((prev) => ({
                              ...prev,
                              [player.order]: true,
                            }))
                          }
                          className={`flex-1 rounded px-4 py-2 text-sm transition-colors sm:flex-none ${
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
                          className={`flex-1 rounded px-4 py-2 text-sm transition-colors sm:flex-none ${
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
                className="w-full rounded bg-[var(--jeopardy-gold)] px-6 py-3 text-lg font-semibold text-[var(--header-bg)] transition-colors hover:bg-[var(--jeopardy-gold-dark)] disabled:opacity-50 sm:w-auto sm:px-8"
              >
                Submit Final Results
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
