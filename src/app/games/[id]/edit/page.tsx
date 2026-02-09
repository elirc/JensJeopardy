import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { canEditGame } from "@/lib/auth";
import GameBuilderClient from "./GameBuilderClient";

interface Props {
  params: Promise<{ id: string }>;
}

async function loadGameFull(gameId: string) {
  return prisma.game.findUnique({
    where: { id: gameId },
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
}

export default async function EditGamePage({ params }: Props) {
  const { id } = await params;
  const hasPermission = await canEditGame(id);
  if (!hasPermission) {
    return (
      <div className="text-center py-16">
        <h1 className="text-2xl text-red-400">Access Denied</h1>
        <p className="text-gray-400 mt-2">
          You do not have permission to edit this game.
        </p>
      </div>
    );
  }

  const game = await loadGameFull(id);
  if (!game) notFound();

  return <GameBuilderClient game={game} />;
}
