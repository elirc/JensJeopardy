"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { copyGame } from "@/app/games/actions";
import { createSessionFromGame } from "@/app/play/actions";

export default function GamePreviewActions({
  gameId,
  featuredPlay = false,
}: {
  gameId: string;
  featuredPlay?: boolean;
}) {
  const router = useRouter();
  const [starting, setStarting] = useState(false);
  const [copying, setCopying] = useState(false);

  async function handlePlay() {
    setStarting(true);
    const result = await createSessionFromGame(gameId);
    if (result.success) {
      router.push(`/play/${result.data.sessionId}`);
    } else {
      setStarting(false);
    }
  }

  async function handleCopy() {
    setCopying(true);
    const result = await copyGame(gameId);
    if (result.success) {
      router.push(`/games/${result.data.gameId}/edit`);
    } else {
      setCopying(false);
    }
  }

  return (
    <div
      className={
        featuredPlay
          ? "flex w-full flex-col items-center gap-4"
          : "flex items-center gap-3"
      }
    >
      {!featuredPlay && (
        <button
          onClick={handleCopy}
          disabled={copying}
          className="border border-gray-600 text-gray-300 px-4 py-2 rounded text-sm hover:border-gray-400 hover:text-white transition-colors disabled:opacity-50"
        >
          {copying ? "Copying..." : "Copy to My Games"}
        </button>
      )}
      <button
        onClick={handlePlay}
        disabled={starting}
        className={
          featuredPlay
            ? "min-w-[16rem] rounded-2xl bg-[var(--jeopardy-gold)] px-16 py-6 text-3xl font-bold text-[var(--header-bg)] shadow-[0_0_24px_rgba(255,204,0,0.35)] transition-colors hover:bg-[var(--jeopardy-gold-dark)] disabled:opacity-50 md:min-w-[20rem] md:px-24 md:py-8 md:text-4xl"
            : "bg-[var(--jeopardy-gold)] text-[var(--header-bg)] px-6 py-2 rounded font-semibold hover:bg-[var(--jeopardy-gold-dark)] transition-colors disabled:opacity-50"
        }
      >
        {starting ? "Starting..." : "Play"}
      </button>
    </div>
  );
}
