"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Board from "@/components/play/Board";
import ClueModal from "@/components/play/ClueModal";
import FinalJeopardy from "@/components/play/FinalJeopardy";
import EndScreen from "@/components/play/EndScreen";
import {
  selectClue,
  closeClue,
  returnClueToBoard,
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
  const [hideIntroText, setHideIntroText] = useState(false);
  const [showMobileIntro, setShowMobileIntro] = useState(false);

  const state = session.state!;
  const players = session.players;
  const revealedSet = new Set(session.revealedClueIds);

  const currentRound = session.rounds.find(
    (r) => r.number === state.roundNumber
  );

  const activeClue = state.activeClueId
    ? session.rounds
        .flatMap((r) => r.categories)
        .flatMap((c) => c.clues)
        .find((cl) => cl.id === state.activeClueId)
    : null;

  const allCluesRevealed = currentRound
    ? currentRound.categories.every((cat) =>
        cat.clues.every((clue) => revealedSet.has(clue.id))
      )
    : false;

  const isJensPassoverGame =
    session.gameTitle === "Jen's 2026 Passover Jeopardy";
  const hasRound2 = session.rounds.some((r) => r.number === 2);
  const hasFinalClue = !!session.finalClue;

  if (state.status === "COMPLETE") {
    return (
      <EndScreen
        gameId={session.gameId}
      />
    );
  }

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

  return (
    <div className="flex h-[100dvh] min-h-[100dvh] flex-col overflow-hidden">
      <div
        className={`shrink-0 px-4 flex flex-col items-center ${
          isJensPassoverGame && !hideIntroText
            ? "pb-2 pt-[calc(env(safe-area-inset-top)+0.5rem)] sm:pt-[4vh] sm:pb-3"
            : "pb-2 pt-[calc(env(safe-area-inset-top)+0.5rem)] sm:pt-4"
        }`}
      >
        <h1 className="w-full text-center text-base font-bold text-white sm:text-lg">
          {session.gameTitle}
        </h1>

        {isJensPassoverGame && (
          <>
            {!hideIntroText && (
              <div className="mt-2 hidden w-full max-w-5xl items-start justify-center gap-3 sm:flex">
                <p className="max-w-5xl text-center text-sm leading-relaxed text-gray-300 md:text-base">
                  These questions are a combination of basic Seder knowledge,
                  connections to current events, and Passover-related jokes. You
                  can find other versions on my website, rubinjen.com.
                </p>
                <button
                  onClick={() => setHideIntroText(true)}
                  className="shrink-0 rounded-lg border border-gray-500 bg-black/30 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:border-gray-300 hover:bg-black/45"
                >
                  Hide Text
                </button>
              </div>
            )}

            <div className="mt-2 flex flex-col items-center gap-2 sm:hidden">
              <button
                onClick={() => setShowMobileIntro((prev) => !prev)}
                className="rounded-lg border border-gray-500 bg-black/30 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:border-gray-300 hover:bg-black/45"
              >
                {showMobileIntro ? "Hide Game Info" : "Show Game Info"}
              </button>
              {showMobileIntro && (
                <p className="max-w-sm text-center text-xs leading-relaxed text-gray-300">
                  These questions are a combination of basic Seder knowledge,
                  connections to current events, and Passover-related jokes. You
                  can find other versions on my website, rubinjen.com.
                </p>
              )}
            </div>
          </>
        )}
      </div>

      {currentRound && (
        <div
          className={`flex min-h-0 flex-1 px-2 sm:px-4 ${
            isJensPassoverGame && !hideIntroText ? "pb-2" : "py-1 sm:py-2"
          }`}
        >
          <div className="flex-1 min-h-0">
            <Board
              categories={currentRound.categories}
              revealedClueIds={revealedSet}
              fillHeight
              onSelectClue={async (clueId, rect) => {
                setClueOriginRect(rect);
                const result = await selectClue(
                  session.id,
                  clueId,
                  state.version
                );
                if (result.success) router.refresh();
              }}
            />
          </div>
        </div>
      )}

      {allCluesRevealed && state.status === "BOARD" && (
        <div className="flex shrink-0 flex-wrap justify-center gap-3 px-4 py-3">
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

      {state.status === "CLUE_OPEN" && activeClue && (
        <ClueModal
          question={activeClue.question}
          answer={activeClue.answer}
          value={activeClue.value}
          originRect={clueOriginRect}
          onBack={async () => {
            const result = await returnClueToBoard(session.id, state.version);
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
    </div>
  );
}
