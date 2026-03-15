"use client";

import { useState, useCallback } from "react";
import { updateCategory } from "@/app/games/actions";
import ClueEditor from "./ClueEditor";

interface Clue {
  id: string;
  order: number;
  value: number;
  question: string;
  answer: string;
}

interface Category {
  id: string;
  name: string;
  order: number;
  clues: Clue[];
}

interface RoundGridProps {
  roundNumber: number;
  categories: Category[];
  onRefresh: () => void;
}

function CategoryHeader({
  category,
  onRefresh,
}: {
  category: Category;
  onRefresh: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(category.name);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!name.trim()) return;
    setSaving(true);
    const result = await updateCategory(category.id, name);
    setSaving(false);
    if (result.success) {
      setEditing(false);
      onRefresh();
    }
  }

  if (editing) {
    return (
      <div className="p-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={40}
          className="w-full bg-gray-700 text-white rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-[var(--jeopardy-gold)]"
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSave();
            if (e.key === "Escape") {
              setName(category.name);
              setEditing(false);
            }
          }}
          autoFocus
          disabled={saving}
        />
      </div>
    );
  }

  return (
    <button
      onClick={() => setEditing(true)}
      className="w-full h-full p-3 text-white text-xs font-bold uppercase text-center hover:brightness-125 transition-all cursor-pointer truncate flex items-center justify-center"
      title={`Click to edit: ${category.name}`}
    >
      {category.name}
    </button>
  );
}

export default function RoundGrid({
  roundNumber,
  categories,
  onRefresh,
}: RoundGridProps) {
  const [editingClue, setEditingClue] = useState<Clue | null>(null);

  const sortedCategories = [...categories].sort((a, b) => a.order - b.order);
  const columnCount = Math.max(sortedCategories.length, 1);

  const handleClueClick = useCallback((clue: Clue) => {
    setEditingClue(clue);
  }, []);

  // Build rows: 5 rows of clue values
  const rows = [1, 2, 3, 4, 5];

  return (
    <div className="mb-6">
      <h3 className="text-md font-semibold text-white mb-3">
        Round {roundNumber}
      </h3>
      <div
        className="grid gap-[2px] bg-black rounded-lg overflow-hidden"
        style={{ gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))` }}
      >
        {/* Category headers */}
        {sortedCategories.map((cat) => (
          <div key={cat.id} className="jeopardy-tile-header min-h-[50px]">
            <CategoryHeader category={cat} onRefresh={onRefresh} />
          </div>
        ))}

        {/* Clue grid */}
        {rows.map((order) =>
          sortedCategories.map((cat) => {
            const clue = cat.clues.find((c) => c.order === order);
            if (!clue) return <div key={`${cat.id}-${order}`} className="jeopardy-tile-revealed p-3" />;

            const hasContent =
              clue.question !== "Question placeholder" &&
              clue.answer !== "Answer placeholder";

            return (
              <button
                key={clue.id}
                onClick={() => handleClueClick(clue)}
                className={`jeopardy-tile p-4 text-center font-bold text-sm cursor-pointer ${
                  hasContent
                    ? "gold-glow"
                    : "opacity-40"
                }`}
                title={hasContent ? "Click to edit" : "Click to add clue content"}
              >
                ${clue.value}
              </button>
            );
          })
        )}
      </div>

      {editingClue && (
        <ClueEditor
          clue={editingClue}
          onClose={() => setEditingClue(null)}
          onSaved={onRefresh}
        />
      )}
    </div>
  );
}
