"use client";

import { useState } from "react";
import { updateClue } from "@/app/games/actions";

interface ClueEditorProps {
  clue: {
    id: string;
    order: number;
    value: number;
    question: string;
    answer: string;
    dailyDouble: boolean;
  };
  onClose: () => void;
  onSaved: () => void;
}

export default function ClueEditor({ clue, onClose, onSaved }: ClueEditorProps) {
  const [question, setQuestion] = useState(clue.question);
  const [answer, setAnswer] = useState(clue.answer);
  const [value, setValue] = useState(clue.value);
  const [dailyDouble, setDailyDouble] = useState(clue.dailyDouble);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSave() {
    setSaving(true);
    setError("");
    const result = await updateClue(clue.id, {
      question,
      answer,
      value,
      dailyDouble,
    });
    setSaving(false);
    if (result.success) {
      onSaved();
      onClose();
    } else {
      setError(result.error);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold text-white mb-4">
          Edit Clue (${value})
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">
              Point Value
            </label>
            <input
              type="number"
              value={value}
              onChange={(e) => setValue(Number(e.target.value))}
              min={1}
              className="w-full bg-gray-700 text-white rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--jeopardy-gold)]"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">
              Question (the &quot;answer&quot; shown on the board)
            </label>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              maxLength={300}
              rows={3}
              className="w-full bg-gray-700 text-white rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--jeopardy-gold)] resize-none"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">
              Answer (the &quot;question&quot; the player must give)
            </label>
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              maxLength={300}
              rows={2}
              className="w-full bg-gray-700 text-white rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--jeopardy-gold)] resize-none"
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
            <input
              type="checkbox"
              checked={dailyDouble}
              onChange={(e) => setDailyDouble(e.target.checked)}
              className="rounded"
            />
            Daily Double
          </label>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !question.trim() || !answer.trim()}
              className="bg-[var(--jeopardy-gold)] text-[var(--header-bg)] px-4 py-2 rounded text-sm font-semibold hover:bg-[var(--jeopardy-gold-dark)] transition-colors disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Clue"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
