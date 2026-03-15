import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import PlaySessionClient from "./PlaySessionClient";

interface Props {
  params: Promise<{ sessionId: string }>;
}

export default async function PlaySessionPage({ params }: Props) {
  const { sessionId } = await params;

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: {
      game: {
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
      },
      state: true,
      players: { orderBy: { order: "asc" } },
      revealedClues: { select: { clueId: true } },
    },
  });

  if (!session) notFound();

  // Serialize dates and complex objects for client component
  const sessionData = {
    id: session.id,
    gameId: session.game.id,
    gameTitle: session.game.title,
    rounds: session.game.rounds.map((r) => ({
      id: r.id,
      number: r.number,
      categories: r.categories.map((c) => ({
        id: c.id,
        name: c.name,
        order: c.order,
        clues: c.clues.map((cl) => ({
          id: cl.id,
          order: cl.order,
          value: cl.value,
          question: cl.question,
          answer: cl.answer,
        })),
      })),
    })),
    finalClue: session.game.finalClue
      ? {
          category: session.game.finalClue.category,
          question: session.game.finalClue.question,
          answer: session.game.finalClue.answer,
        }
      : null,
    state: session.state
      ? {
          roundNumber: session.state.roundNumber,
          activeClueId: session.state.activeClueId,
          status: session.state.status,
          version: session.state.version,
        }
      : null,
    players: session.players.map((p) => ({
      id: p.id,
      name: p.name,
      score: p.score,
      order: p.order,
    })),
    revealedClueIds: session.revealedClues.map((rc) => rc.clueId),
  };

  return <PlaySessionClient initialSession={sessionData} />;
}
