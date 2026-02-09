"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createGame } from "@/app/games/actions";

interface NewGameClientProps {
  sourceType: "USER" | "OFFICIAL";
}

export default function NewGameClient({ sourceType }: NewGameClientProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    startTransition(async () => {
      const result = await createGame({ sourceType });
      if (result.success) {
        router.replace(`/games/${result.data.gameId}/edit`);
      } else {
        setError(result.error);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const label =
    sourceType === "OFFICIAL" ? "prebuilt game" : "game";

  if (error) {
    return (
      <div className="text-center py-16">
        <h1 className="text-2xl text-red-400">Failed to create {label}</h1>
        <p className="text-gray-400 mt-2">{error}</p>
      </div>
    );
  }

  return (
    <div className="text-center py-16">
      <p className="text-gray-400">Creating your {label}...</p>
    </div>
  );
}
