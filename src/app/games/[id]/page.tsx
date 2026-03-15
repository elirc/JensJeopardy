import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { canEditGame } from "@/lib/auth";
import GamePreviewActions from "./GamePreviewActions";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function GamePreviewPage({ params }: Props) {
  const { id } = await params;

  const game = await prisma.game.findUnique({
    where: { id },
    include: {
      rounds: {
        include: {
          categories: {
            include: { clues: { orderBy: { order: "asc" } } },
            orderBy: { order: "asc" },
          },
        },
        orderBy: { number: "asc" },
      },
      finalClue: true,
    },
  });

  if (!game) notFound();

  // Check visibility: PRIVATE games require edit permission
  const hasEditPermission = await canEditGame(id);
  const isJensPassoverGame = game.slug === "jens-2026-passover-jeopardy";
  if (game.visibility === "PRIVATE" && !hasEditPermission) {
    return (
      <div className="text-center py-16">
        <h1 className="text-2xl text-red-400">Access Denied</h1>
        <p className="text-gray-400 mt-2">This game is private.</p>
      </div>
    );
  }

  return (
    <div>
      <div
        className={`mb-6 ${
          isJensPassoverGame
            ? "flex flex-col items-center gap-5 text-center"
            : "flex items-center justify-between"
        }`}
      >
        <div>
          <h1 className="text-2xl font-bold text-white">{game.title}</h1>
          {game.description && (
            <p className="text-gray-400 mt-1">{game.description}</p>
          )}
        </div>
        <div
          className={
            isJensPassoverGame
              ? "flex w-full justify-center"
              : "flex items-center gap-3"
          }
        >
          {hasEditPermission && (
            <Link
              href={`/games/${game.id}/edit`}
              className="border border-gray-600 text-gray-300 px-4 py-2 rounded text-sm hover:border-gray-400 hover:text-white transition-colors"
            >
              Edit
            </Link>
          )}
          <GamePreviewActions
            gameId={game.id}
            featuredPlay={isJensPassoverGame}
          />
        </div>
      </div>

      {/* Read-only board preview */}
      {game.rounds.map((round) => (
        <div key={round.id} className="mb-6">
          {(() => {
            const columnCount = Math.max(round.categories.length, 1);

            return (
              <>
          <h3 className="text-md font-semibold text-white mb-3">
            Round {round.number}
          </h3>
          <div
            className="grid gap-1 bg-black rounded-lg overflow-hidden"
            style={{ gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))` }}
          >
            {round.categories.map((cat) => (
              <div
                key={cat.id}
                className="bg-[var(--board-bg)] p-3 text-center"
              >
                <span className="text-white text-xs font-bold uppercase">
                  {cat.name}
                </span>
              </div>
            ))}
            {[1, 2, 3, 4, 5].map((order) =>
              round.categories.map((cat) => {
                const clue = cat.clues.find((c) => c.order === order);
                return (
                  <div
                    key={`${cat.id}-${order}`}
                    className="bg-[var(--clue-bg)] p-3 text-center"
                  >
                    <span className="text-[var(--jeopardy-gold)] font-bold text-sm">
                      {clue ? `$${clue.value}` : ""}
                    </span>
                  </div>
                );
              })
            )}
          </div>
              </>
            );
          })()}
        </div>
      ))}

      {game.finalClue && (
        <div className="bg-gray-800 rounded-lg p-4 mb-6">
          <h3 className="text-md font-semibold text-white mb-1">
            Final Jeopardy
          </h3>
          <p className="text-gray-400 text-sm">
            Category: {game.finalClue.category}
          </p>
        </div>
      )}
    </div>
  );
}
