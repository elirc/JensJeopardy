"use client";

import { useState } from "react";
import { upsertFinalClue, deleteFinalClue } from "@/app/games/actions";

interface FinalClueEditorProps {
  gameId: string;
  initialData: {
    category: string;
    question: string;
    answer: string;
  } | null;
  onRefresh: () => void;
}

export default function FinalClueEditor({
  gameId,
  initialData,
  onRefresh,
}: FinalClueEditorProps) {
  const [enabled, setEnabled] = useState(!!initialData);
  const [category, setCategory] = useState(initialData?.category ?? "");
  const [question, setQuestion] = useState(initialData?.question ?? "");
  const [answer, setAnswer] = useState(initialData?.answer ?? "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSave() {
    setSaving(true);
    setMessage("");
    const result = await upsertFinalClue(gameId, { category, question, answer });
    setSaving(false);
    if (result.success) {
      setMessage("Saved!");
      setTimeout(() => setMessage(""), 2000);
      onRefresh();
    } else {
      setMessage(result.error);
    }
  }

  async function handleToggle() {
    if (enabled) {
      setSaving(true);
      const result = await deleteFinalClue(gameId);
      setSaving(false);
      if (result.success) {
        setEnabled(false);
        setCategory("");
        setQuestion("");
        setAnswer("");
        onRefresh();
      }
    } else {
      setEnabled(true);
    }
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">Final Jeopardy</h2>
        <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
          <input
            type="checkbox"
            checked={enabled}
            onChange={handleToggle}
            disabled={saving}
            className="rounded"
          />
          Enable
        </label>
      </div>
      {enabled && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Category</label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              maxLength={40}
              className="w-full bg-gray-700 text-white rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--jeopardy-gold)]"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Question</label>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              maxLength={300}
              rows={3}
              className="w-full bg-gray-700 text-white rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--jeopardy-gold)] resize-none"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Answer</label>
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              maxLength={300}
              rows={2}
              className="w-full bg-gray-700 text-white rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--jeopardy-gold)] resize-none"
            />
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={
                saving || !category.trim() || !question.trim() || !answer.trim()
              }
              className="bg-[var(--jeopardy-gold)] text-[var(--header-bg)] px-4 py-2 rounded text-sm font-semibold hover:bg-[var(--jeopardy-gold-dark)] transition-colors disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Final Clue"}
            </button>
            {message && (
              <span
                className={`text-sm ${message === "Saved!" ? "text-green-400" : "text-red-400"}`}
              >
                {message}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
