import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function Home() {
  const passoverGame = await prisma.game.findUnique({
    where: { slug: "jens-2026-passover-jeopardy" },
    select: { id: true },
  });

  const passoverHref = passoverGame
    ? `/games/${passoverGame.id}`
    : "/games?tab=official";

  return (
    <>
      <div className="pointer-events-none fixed inset-0 z-0">
        <div
          className="absolute inset-0 bg-center bg-no-repeat bg-cover opacity-35 blur-sm"
          style={{ backgroundImage: "url('/home-passover-bg.png')" }}
        />
        <div
          className="absolute inset-0 bg-center bg-no-repeat bg-contain opacity-85"
          style={{ backgroundImage: "url('/home-passover-bg.png')" }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,30,0.42),rgba(0,0,30,0.52))]" />
      </div>

      <div className="relative z-10 flex min-h-[70vh] flex-col items-center justify-center px-6 py-12 text-center">
        <h1 className="mb-4 text-5xl font-bold text-[var(--jeopardy-gold)]">
          Jeopardy Maker
        </h1>
        <p className="mb-8 max-w-md text-lg text-gray-100">
          Create custom Jeopardy games, share them with friends, and play
          together on a single device.
        </p>
        <div className="flex w-full max-w-5xl flex-col items-center gap-5">
          <Link
            href={passoverHref}
            className="inline-flex max-w-full items-center justify-center rounded-2xl border-2 border-[var(--jeopardy-gold)] bg-[linear-gradient(90deg,rgba(0,0,51,0.58),rgba(6,12,233,0.52),rgba(0,0,51,0.58))] px-6 py-5 text-center text-2xl font-bold text-[var(--jeopardy-gold)] shadow-[0_0_30px_rgba(255,204,0,0.18)] backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:shadow-[0_0_40px_rgba(255,204,0,0.28)] sm:px-8"
          >
            Play Jen&apos;s 2026 Passover Jeopardy
          </Link>

          <div className="mt-44 flex flex-wrap justify-center gap-4 sm:mt-52">
            <Link
              href="/games?tab=official"
              className="translate-y-12 rounded-lg border border-[var(--jeopardy-gold)] bg-[rgba(0,0,51,0.42)] px-6 py-3 text-lg font-medium text-[var(--jeopardy-gold)] backdrop-blur-sm transition-colors hover:bg-[var(--jeopardy-gold)] hover:text-[var(--header-bg)]"
            >
              Play Prebuilt Games
            </Link>
            <Link
              href="/games/new"
              className="translate-y-12 rounded-lg bg-[rgba(255,204,0,0.78)] px-6 py-3 text-lg font-semibold text-[var(--header-bg)] shadow-[0_0_20px_rgba(255,204,0,0.2)] backdrop-blur-sm transition-colors hover:bg-[var(--jeopardy-gold-dark)]"
            >
              Create a Game
            </Link>
            <Link
              href="/games"
              className="translate-y-12 rounded-lg border border-gray-300 bg-[rgba(0,0,51,0.42)] px-6 py-3 text-lg font-medium text-gray-100 backdrop-blur-sm transition-colors hover:border-white hover:text-white"
            >
              Browse Games
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
