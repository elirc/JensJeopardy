import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, getOwnedGameIds } from "@/lib/auth";
import { isAdminUser } from "@/lib/admin";

type Tab = "my" | "official" | "public";

interface Props {
  searchParams: Promise<{ tab?: string }>;
}

export default async function GamesPage({ searchParams }: Props) {
  const params = await searchParams;
  const activeTab = (params.tab as Tab) || "official";
  const user = await getCurrentUser();
  const isAdmin = await isAdminUser(user);

  let games: {
    id: string;
    title: string;
    description: string | null;
    visibility: string;
    sourceType: string;
    createdAt: Date;
    _count: { rounds: number; sessions: number };
  }[] = [];

  if (activeTab === "my") {
    const ownedIds = await getOwnedGameIds();
    if (ownedIds.length > 0) {
      games = await prisma.game.findMany({
        where: { id: { in: ownedIds } },
        include: { _count: { select: { rounds: true, sessions: true } } },
        orderBy: { updatedAt: "desc" },
      });
    }
  } else if (activeTab === "official") {
    games = await prisma.game.findMany({
      where: {
        sourceType: "OFFICIAL",
        visibility: "PUBLIC",
        slug: "jens-2026-passover-jeopardy",
      },
      include: { _count: { select: { rounds: true, sessions: true } } },
      orderBy: { createdAt: "desc" },
    });
  } else if (activeTab === "public") {
    games = await prisma.game.findMany({
      where: { visibility: "PUBLIC", sourceType: "USER" },
      include: { _count: { select: { rounds: true, sessions: true } } },
      orderBy: { createdAt: "desc" },
    });
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: "official", label: "Prebuilt Games" },
    { key: "my", label: "My Games" },
    { key: "public", label: "Public Games" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Games</h1>
        {activeTab === "official" && isAdmin && (
          <Link
            href="/games/new?sourceType=OFFICIAL"
            className="bg-[var(--jeopardy-gold)] text-[var(--header-bg)] px-4 py-2 rounded text-sm font-semibold hover:bg-[var(--jeopardy-gold-dark)] transition-colors"
          >
            Create Prebuilt Game
          </Link>
        )}
      </div>

      {/* Tab navigation */}
      <div className="flex gap-1 mb-6 bg-gray-800 rounded-lg p-1 w-fit">
        {tabs.map((tab) => (
          <Link
            key={tab.key}
            href={`/games?tab=${tab.key}`}
            className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? "bg-[var(--jeopardy-gold)] text-[var(--header-bg)]"
                : "text-gray-400 hover:text-white"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {/* Game list */}
      {games.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-400 mb-4">
            {activeTab === "my"
              ? "You haven't created any games yet."
              : activeTab === "official"
                ? "No prebuilt games available yet."
                : "No public games available yet."}
          </p>
          {activeTab === "my" && (
            <Link
              href="/games/new"
              className="bg-[var(--jeopardy-gold)] text-[var(--header-bg)] px-6 py-2 rounded font-semibold hover:bg-[var(--jeopardy-gold-dark)] transition-colors"
            >
              Create Your First Game
            </Link>
          )}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {games.map((game) => (
            <Link
              key={game.id}
              href={`/games/${game.id}`}
              className="bg-gray-800 rounded-lg p-5 hover:bg-gray-750 hover:ring-1 hover:ring-gray-600 transition-all"
            >
              <h3 className="text-white font-semibold mb-1 truncate">
                {game.title}
              </h3>
              {game.description && (
                <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                  {game.description}
                </p>
              )}
              <div className="flex gap-3 text-xs text-gray-500">
                <span>
                  {game._count.rounds} round{game._count.rounds !== 1 ? "s" : ""}
                </span>
                <span>
                  {game._count.sessions} session
                  {game._count.sessions !== 1 ? "s" : ""}
                </span>
                <span className="capitalize">{game.visibility.toLowerCase()}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
