"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import PlayerSetup from "@/components/play/PlayerSetup";
import Board from "@/components/play/Board";
import Scoreboard from "@/components/play/Scoreboard";
import ClueModal from "@/components/play/ClueModal";
import DailyDoubleModal from "@/components/play/DailyDoubleModal";
import FinalJeopardy from "@/components/play/FinalJeopardy";
import UndoButton from "@/components/play/UndoButton";
import EndScreen from "@/components/play/EndScreen";
import {
  setSessionPlayers,
  selectClue,
  scoreClue,
  closeClue,
  startDailyDouble,
  scoreDailyDouble,
  nextRound,
  startFinal,
  setFinalWagers,
  applyFinalResults,
} from "@/app/play/actions";

interface Clue {
  id: string;
  order: number;
  value: number;
  question: string;
  answer: string;
  dailyDouble: boolean;
}

interface Category {
  id: string;
  name: string;
  order: number;
  clues: Clue[];
}

interface Round {
  id: string;
  number: number;
  categories: Category[];
}

interface Player {
  id: string;
  name: string;
  score: number;
  order: number;
}

interface SessionData {
  id: string;
  gameId: string;
  gameTitle: string;
  rounds: Round[];
  finalClue: { category: string; question: string; answer: string } | null;
  state: {
    roundNumber: number;
    activeClueId: string | null;
    status: string;
    dailyDoubleJson: string;
    version: number;
  } | null;
  players: Player[];
  revealedClueIds: string[];
}

export default function PlaySessionClient({
  initialSession,
}: {
  initialSession: SessionData;
}) {
  const router = useRouter();
  const session = initialSession;
  const [clueOriginRect, setClueOriginRect] = useState<DOMRect | null>(null);

  const state = session.state!;
  const players = session.players;
  const revealedSet = new Set(session.revealedClueIds);

  // Find current round
  const currentRound = session.rounds.find(
    (r) => r.number === state.roundNumber
  );

  // Find active clue details
  const activeClue = state.activeClueId
    ? session.rounds
        .flatMap((r) => r.categories)
        .flatMap((c) => c.clues)
        .find((cl) => cl.id === state.activeClueId)
    : null;

  // Parse daily double state
  let ddState: { clueId: string; playerOrder: number; wager: number } | null =
    null;
  try {
    const parsed = JSON.parse(state.dailyDoubleJson);
    if (parsed.clueId) ddState = parsed;
  } catch {
    // ignore
  }

  // Check if all clues in current round are revealed
  const allCluesRevealed = currentRound
    ? currentRound.categories.every((cat) =>
        cat.clues.every((clue) => revealedSet.has(clue.id))
      )
    : false;

  const hasRound2 = session.rounds.some((r) => r.number === 2);
  const hasFinalClue = !!session.finalClue;

  // Compute highest board value for DD wager
  const highestBoardValue = currentRound
    ? Math.max(...currentRound.categories.flatMap((c) => c.clues.map((cl) => cl.value)))
    : 1000;

  const refreshSession = useCallback(() => {
    router.refresh();
  }, [router]);

  // ── Player Setup Phase ──
  if (players.length === 0) {
    return (
      <div className="py-8">
        <h1 className="text-xl font-bold text-white text-center mb-8">
          {session.gameTitle}
        </h1>
        <PlayerSetup
          onStart={async (playerList) => {
            const result = await setSessionPlayers(session.id, playerList);
            if (result.success) {
              router.refresh();
            }
          }}
        />
      </div>
    );
  }

  // ── Game Complete ──
  if (state.status === "COMPLETE") {
    return (
      <EndScreen
        players={players}
        gameId={session.gameId}
        sessionId={session.id}
      />
    );
  }

  // ── Final Jeopardy ──
  if (
    (state.status === "FINAL_WAGER" || state.status === "FINAL_ANSWER") &&
    session.finalClue
  ) {
    return (
      <FinalJeopardy
        category={session.finalClue.category}
        question={session.finalClue.question}
        answer={session.finalClue.answer}
        players={players}
        phase={state.status as "FINAL_WAGER" | "FINAL_ANSWER"}
        onSubmitWagers={async (wagers) => {
          const result = await setFinalWagers(session.id, wagers, state.version);
          if (result.success) router.refresh();
        }}
        onSubmitResults={async (results) => {
          const result = await applyFinalResults(
            session.id,
            results,
            state.version
          );
          if (result.success) router.refresh();
        }}
      />
    );
  }

  // ── Board Phase (viewport-filling layout) ──
  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Slim header bar */}
      <div className="flex items-center justify-between px-4 py-2 shrink-0">
        <h1 className="text-lg font-bold text-white truncate">
          {session.gameTitle}
        </h1>
        <div className="flex items-center gap-3">
          <span className="text-gray-500 text-sm">
            Round {state.roundNumber}
          </span>
          <UndoButton
            sessionId={session.id}
            disabled={
              state.status === "DAILY_DOUBLE" ||
              state.status === "FINAL_WAGER" ||
              state.status === "FINAL_ANSWER"
            }
            onUndo={refreshSession}
          />
        </div>
      </div>

      {/* Scoreboard */}
      <div className="shrink-0 px-4">
        <Scoreboard
          players={players}
        />
      </div>

      {/* Board fills remaining space */}
      {currentRound && (
        <div className="flex-1 min-h-0 px-4 py-2">
          <Board
            categories={currentRound.categories}
            revealedClueIds={revealedSet}
            fillHeight
            onSelectClue={async (clueId, rect) => {
              setClueOriginRect(rect);
              const result = await selectClue(session.id, clueId, state.version);
              if (result.success) router.refresh();
            }}
          />
        </div>
      )}

      {/* Round progression */}
      {allCluesRevealed && state.status === "BOARD" && (
        <div className="flex justify-center py-3 gap-4 shrink-0">
          {state.roundNumber === 1 && hasRound2 && (
            <button
              onClick={async () => {
                const result = await nextRound(session.id, state.version);
                if (result.success) router.refresh();
              }}
              className="bg-[var(--jeopardy-gold)] text-[var(--header-bg)] px-6 py-3 rounded-lg font-semibold hover:bg-[var(--jeopardy-gold-dark)] transition-colors"
            >
              Next Round
            </button>
          )}
          {((state.roundNumber === 1 && !hasRound2) ||
            state.roundNumber === 2) &&
            hasFinalClue && (
              <button
                onClick={async () => {
                  const result = await startFinal(session.id, state.version);
                  if (result.success) router.refresh();
                }}
                className="bg-[var(--jeopardy-gold)] text-[var(--header-bg)] px-6 py-3 rounded-lg font-semibold hover:bg-[var(--jeopardy-gold-dark)] transition-colors"
              >
                Final Jeopardy!
              </button>
            )}
          {((state.roundNumber === 1 && !hasRound2 && !hasFinalClue) ||
            (state.roundNumber === 2 && !hasFinalClue)) && (
            <button
              onClick={async () => {
                const { endGame } = await import("@/app/play/actions");
                const result = await endGame(session.id, state.version);
                if (result.success) router.refresh();
              }}
              className="bg-[var(--jeopardy-gold)] text-[var(--header-bg)] px-6 py-3 rounded-lg font-semibold hover:bg-[var(--jeopardy-gold-dark)] transition-colors"
            >
              End Game
            </button>
          )}
        </div>
      )}

      {/* Clue Modal (regular clue) */}
      {state.status === "CLUE_OPEN" && activeClue && (
        <ClueModal
          question={activeClue.question}
          answer={activeClue.answer}
          value={activeClue.value}
          players={players}
          originRect={clueOriginRect}
          onScore={async (playerOrder, correct) => {
            const result = await scoreClue(
              session.id,
              activeClue.id,
              playerOrder,
              correct,
              state.version
            );
            if (result.success) {
              setClueOriginRect(null);
              router.refresh();
            }
          }}
          onClose={async () => {
            const result = await closeClue(session.id, state.version);
            if (result.success) {
              setClueOriginRect(null);
              router.refresh();
            }
          }}
        />
      )}

      {/* Daily Double Modal */}
      {state.status === "DAILY_DOUBLE" && activeClue && (
        <DailyDoubleModal
          question={activeClue.question}
          answer={activeClue.answer}
          players={players}
          highestBoardValue={highestBoardValue}
          wagerState={ddState}
          onSubmitWager={async (playerOrder, wager) => {
            const result = await startDailyDouble(
              session.id,
              activeClue.id,
              playerOrder,
              wager,
              state.version
            );
            if (result.success) router.refresh();
          }}
          onScore={async (correct) => {
            const result = await scoreDailyDouble(
              session.id,
              correct,
              state.version
            );
            if (result.success) {
              setClueOriginRect(null);
              router.refresh();
            }
          }}
          onCancel={async () => {
            const result = await closeClue(session.id, state.version);
            if (result.success) {
              setClueOriginRect(null);
              router.refresh();
            }
          }}
        />
      )}
    </div>
  );
}
