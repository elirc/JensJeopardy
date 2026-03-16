import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createSessionFromGame } from "@/app/play/actions";

export default async function Home() {
  const passoverGame = await prisma.game.findUnique({
    where: { slug: "jens-2026-passover-jeopardy" },
    select: { id: true },
  });

  const passoverHref = passoverGame
    ? `/games/${passoverGame.id}`
    : "/games?tab=official";

  async function startPassoverGame() {
    "use server";

    if (!passoverGame) {
      redirect("/games?tab=official");
    }

    const result = await createSessionFromGame(passoverGame.id);

    if (result.success) {
      redirect(`/play/${result.data.sessionId}`);
    }

    redirect(passoverHref);
  }

  return (
    <section className="relative min-h-[100dvh] w-full overflow-y-auto overflow-x-hidden bg-[var(--background)] lg:overflow-hidden">
      <div className="pointer-events-none absolute inset-0 z-0">
        <div
          className="absolute inset-0 bg-center bg-no-repeat bg-contain"
          style={{ backgroundImage: "url('/home-passover-bg.png')" }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,20,0.32),rgba(0,0,20,0.48))]" />
      </div>

      <div className="relative z-10 flex min-h-[100dvh] flex-col justify-between px-5 pb-8 pt-[calc(env(safe-area-inset-top)+1.25rem)] text-center lg:hidden">
        <div className="mx-auto max-w-[17rem] text-sm leading-6 text-slate-100">
          I make a new Passover Jeopardy game every year. The questions are a
          combination of basic Seder knowledge, connections to current events,
          and Passover-related jokes. It is designed to be a fun addition to a
          Seder. (You can find other versions on my website,{" "}
          <a
            href="https://rubinjen.com"
            target="_blank"
            rel="noreferrer"
            className="text-[var(--jeopardy-gold)] underline underline-offset-4"
          >
            rubinjen.com
          </a>
          .)
        </div>

        <div className="flex flex-1 items-center justify-center py-8">
          <div className="flex max-w-xs flex-col items-center gap-4">
            <h1
              className="text-3xl font-bold text-white sm:text-4xl"
              style={{ textShadow: "0 2px 16px rgba(0,0,0,0.8)" }}
            >
              Passover Jeopardy
            </h1>
            <form action={startPassoverGame} className="w-full">
              <button
                type="submit"
                className="inline-flex w-full items-center justify-center rounded-full bg-[#d4a017] px-5 py-4 text-center text-lg font-bold text-[#0a0a2e] shadow-[0_0_30px_rgba(255,204,0,0.18)] transition-all hover:brightness-110"
              >
                Play Jen&apos;s 2026 Passover Jeopardy
              </button>
            </form>
          </div>
        </div>

        <div className="mx-auto max-w-[17rem] text-sm leading-6 text-slate-100">
          If you use Passover Jeopardy in your Seder, email me at
          rubinjen@gmail.com. I would love to know if you used it and your
          experience with the game.
        </div>
      </div>

      <div className="absolute inset-y-0 left-0 z-10 hidden w-full max-w-sm -translate-x-3 items-center justify-center px-6 text-center lg:flex lg:max-w-md">
        <p className="max-w-[18.5rem] px-4 text-base leading-7 text-slate-100">
          I make a new Passover Jeopardy game every year. The questions are a
          combination of basic Seder knowledge, connections to current events,
          and Passover-related jokes. It is designed to be a fun addition to a
          Seder. (You can find other versions on my website,{" "}
          <a
            href="https://rubinjen.com"
            target="_blank"
            rel="noreferrer"
            className="text-[var(--jeopardy-gold)] underline underline-offset-4"
          >
            rubinjen.com
          </a>
          .)
        </p>
      </div>

      <div className="absolute inset-y-0 right-0 z-10 hidden w-full max-w-sm translate-x-3 items-center justify-center px-6 text-center lg:flex lg:max-w-md">
        <p className="max-w-[18.5rem] px-4 text-base leading-7 text-slate-100">
          If you use Passover Jeopardy in your Seder, email me at
          rubinjen@gmail.com. I would love to know if you used it and your
          experience with the game.
        </p>
      </div>

      <div className="absolute inset-0 z-10 hidden items-center justify-center px-6 text-center lg:flex">
        <div className="flex flex-col items-center gap-5 px-6 py-8 sm:px-8">
          <h1
            className="text-2xl font-bold text-white sm:text-3xl md:text-[2.2rem]"
            style={{ textShadow: "0 2px 16px rgba(0,0,0,0.8)" }}
          >
            Passover Jeopardy
          </h1>
          <form action={startPassoverGame}>
            <button
              type="submit"
              className="inline-flex max-w-full items-center justify-center rounded-full bg-[#d4a017] px-4 py-5 text-center text-2xl font-bold text-[#0a0a2e] shadow-[0_0_30px_rgba(255,204,0,0.18)] backdrop-blur-sm transition-all hover:brightness-110 sm:px-5"
            >
              Play Jen&apos;s 2026 Passover Jeopardy
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
