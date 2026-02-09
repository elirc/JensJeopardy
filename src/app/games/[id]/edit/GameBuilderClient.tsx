"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toggleRound2, deleteGame } from "@/app/games/actions";
import MetaEditor from "@/components/game-builder/MetaEditor";
import RoundGrid from "@/components/game-builder/RoundGrid";
import FinalClueEditor from "@/components/game-builder/FinalClueEditor";

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

interface Game {
  id: string;
  title: string;
  description: string | null;
  visibility: string;
  rounds: Round[];
  finalClue: {
    id: string;
    category: string;
    question: string;
    answer: string;
  } | null;
}

export default function GameBuilderClient({ game }: { game: Game }) {
  const router = useRouter();
  const [togglingRound2, setTogglingRound2] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const round1 = game.rounds.find((r) => r.number === 1);
  const round2 = game.rounds.find((r) => r.number === 2);
  const hasRound2 = !!round2;

  const refresh = useCallback(() => {
    router.refresh();
  }, [router]);

  async function handleToggleRound2() {
    setTogglingRound2(true);
    await toggleRound2(game.id, !hasRound2);
    setTogglingRound2(false);
    router.refresh();
  }

  async function handleDelete() {
    setDeleting(true);
    const result = await deleteGame(game.id);
    if (result.success) {
      router.push("/games");
    } else {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Edit Game</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="text-red-400 hover:text-red-300 text-sm px-3 py-1 border border-red-400/30 rounded hover:border-red-400/60 transition-colors"
          >
            Delete Game
          </button>
        </div>
      </div>

      <MetaEditor
        gameId={game.id}
        initialTitle={game.title}
        initialDescription={game.description ?? ""}
        initialVisibility={game.visibility}
      />

      {round1 && (
        <RoundGrid
          roundNumber={1}
          categories={round1.categories}
          onRefresh={refresh}
        />
      )}

      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={handleToggleRound2}
          disabled={togglingRound2}
          className="border border-gray-600 text-gray-300 px-4 py-2 rounded text-sm hover:border-gray-400 hover:text-white transition-colors disabled:opacity-50"
        >
          {togglingRound2
            ? "Updating..."
            : hasRound2
              ? "Remove Round 2"
              : "Enable Round 2"}
        </button>
      </div>

      {round2 && (
        <RoundGrid
          roundNumber={2}
          categories={round2.categories}
          onRefresh={refresh}
        />
      )}

      <FinalClueEditor
        gameId={game.id}
        initialData={
          game.finalClue
            ? {
                category: game.finalClue.category,
                question: game.finalClue.question,
                answer: game.finalClue.answer,
              }
            : null
        }
        onRefresh={refresh}
      />

      {/* Delete confirmation dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-sm text-center">
            <h3 className="text-lg font-semibold text-white mb-2">
              Delete Game?
            </h3>
            <p className="text-gray-400 text-sm mb-6">
              This action cannot be undone. All rounds, clues, and sessions
              will be permanently deleted.
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="bg-red-600 text-white px-4 py-2 rounded text-sm font-semibold hover:bg-red-500 transition-colors disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
