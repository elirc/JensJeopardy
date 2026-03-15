"use client";

import { useRef, useCallback } from "react";

interface Category {
  id: string;
  name: string;
  order: number;
  clues: {
    id: string;
    order: number;
    value: number;
  }[];
}

interface BoardProps {
  categories: Category[];
  revealedClueIds: Set<string>;
  onSelectClue: (clueId: string, rect: DOMRect) => void;
  fillHeight?: boolean;
}

export default function Board({
  categories,
  revealedClueIds,
  onSelectClue,
  fillHeight = false,
}: BoardProps) {
  const sortedCategories = [...categories].sort((a, b) => a.order - b.order);
  const columnCount = Math.max(sortedCategories.length, 1);
  const rows = [1, 2, 3, 4, 5];
  const cellRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  const handleCellClick = useCallback(
    (clueId: string) => {
      const el = cellRefs.current.get(clueId);
      if (el) {
        const rect = el.getBoundingClientRect();
        onSelectClue(clueId, rect);
      }
    },
    [onSelectClue]
  );

  return (
    <div
      className={`grid gap-[2px] bg-black rounded-lg overflow-hidden ${
        fillHeight ? "h-full" : ""
      }`}
      style={{
        gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))`,
        ...(fillHeight ? { gridTemplateRows: "auto repeat(5, 1fr)" } : {}),
      }}
    >
      {/* Category headers */}
      {sortedCategories.map((cat) => (
        <div
          key={cat.id}
          className="jeopardy-tile-header flex items-center justify-center p-3 min-h-[60px]"
        >
          <span className="text-white text-sm font-bold uppercase tracking-wide text-center leading-tight">
            {cat.name}
          </span>
        </div>
      ))}

      {/* Clue tiles */}
      {rows.map((order) =>
        sortedCategories.map((cat) => {
          const clue = cat.clues.find((c) => c.order === order);
          if (!clue) {
            return (
              <div
                key={`${cat.id}-${order}`}
                className="jeopardy-tile-revealed"
              />
            );
          }

          const revealed = revealedClueIds.has(clue.id);

          if (revealed) {
            return (
              <div
                key={clue.id}
                className="jeopardy-tile-revealed"
              />
            );
          }

          return (
            <button
              key={clue.id}
              ref={(el) => {
                if (el) cellRefs.current.set(clue.id, el);
              }}
              onClick={() => handleCellClick(clue.id)}
              className="jeopardy-tile flex items-center justify-center cursor-pointer relative"
            >
              <span className="gold-glow font-bold text-2xl md:text-3xl">
                ${clue.value}
              </span>
            </button>
          );
        })
      )}
    </div>
  );
}
