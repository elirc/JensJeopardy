"use client";

import { useState } from "react";
import { updateGameMeta } from "@/app/games/actions";

interface MetaEditorProps {
  gameId: string;
  initialTitle: string;
  initialDescription: string;
  initialVisibility: string;
}

export default function MetaEditor({
  gameId,
  initialTitle,
  initialDescription,
  initialVisibility,
}: MetaEditorProps) {
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [visibility, setVisibility] = useState(initialVisibility);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSave() {
    setSaving(true);
    setMessage("");
    const result = await updateGameMeta(gameId, {
      title,
      description: description || undefined,
      visibility,
    });
    setSaving(false);
    if (result.success) {
      setMessage("Saved!");
      setTimeout(() => setMessage(""), 2000);
    } else {
      setMessage(result.error);
    }
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6 mb-6">
      <h2 className="text-lg font-semibold text-white mb-4">Game Details</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={100}
            className="w-full bg-gray-700 text-white rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--jeopardy-gold)]"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">
            Description (optional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={500}
            rows={2}
            className="w-full bg-gray-700 text-white rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--jeopardy-gold)] resize-none"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">
            Visibility
          </label>
          <select
            value={visibility}
            onChange={(e) => setVisibility(e.target.value)}
            className="bg-gray-700 text-white rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--jeopardy-gold)]"
          >
            <option value="PRIVATE">Private</option>
            <option value="UNLISTED">Unlisted (share via link)</option>
            <option value="PUBLIC">Public</option>
          </select>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={saving || !title.trim()}
            className="bg-[var(--jeopardy-gold)] text-[var(--header-bg)] px-4 py-2 rounded text-sm font-semibold hover:bg-[var(--jeopardy-gold-dark)] transition-colors disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Details"}
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
    </div>
  );
}
