"use client";

import { useState } from "react";
import { undoLastAction } from "@/app/play/actions";

interface UndoButtonProps {
  sessionId: string;
  disabled?: boolean;
  onUndo: () => void;
}

export default function UndoButton({
  sessionId,
  disabled,
  onUndo,
}: UndoButtonProps) {
  const [undoing, setUndoing] = useState(false);
  const [lastUndo, setLastUndo] = useState<string | null>(null);

  async function handleUndo() {
    setUndoing(true);
    const result = await undoLastAction(sessionId);
    setUndoing(false);
    if (result.success && result.data) {
      setLastUndo(
        `Undid ${result.data.type}: ${result.data.delta > 0 ? "+" : ""}$${result.data.delta}`
      );
      setTimeout(() => setLastUndo(null), 3000);
      onUndo();
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleUndo}
        disabled={disabled || undoing}
        className="text-sm text-gray-400 hover:text-white transition-colors disabled:opacity-30 px-3 py-1 border border-gray-700 rounded hover:border-gray-500"
      >
        {undoing ? "Undoing..." : "Undo"}
      </button>
      {lastUndo && (
        <span className="text-xs text-yellow-400">{lastUndo}</span>
      )}
    </div>
  );
}
