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
      className={`grid w-full gap-[2px] rounded-lg bg-black overflow-hidden ${
        fillHeight ? "h-full" : ""
      }`}
      style={{
        gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))`,
        ...(fillHeight ? { gridTemplateRows: "auto repeat(5, 1fr)" } : {}),
      }}
    >
      {sortedCategories.map((cat) => (
        <div
          key={cat.id}
          className="jeopardy-tile-header flex min-h-[68px] items-center justify-center p-2 sm:min-h-[60px] sm:p-3"
        >
          <span className="text-center text-[9px] font-bold uppercase leading-tight tracking-wide text-white sm:text-sm">
            {cat.name}
          </span>
        </div>
      ))}

      {rows.map((order) =>
        sortedCategories.map((cat) => {
          const clue = cat.clues.find((c) => c.order === order);
          if (!clue) {
            return (
              <div
                key={`${cat.id}-${order}`}
                className="jeopardy-tile-revealed min-h-[78px] sm:min-h-0"
              />
            );
          }

          const revealed = revealedClueIds.has(clue.id);

          if (revealed) {
            return (
              <div
                key={clue.id}
                className="jeopardy-tile-revealed min-h-[78px] sm:min-h-0"
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
              className="jeopardy-tile relative flex min-h-[78px] items-center justify-center cursor-pointer sm:min-h-0"
            >
              <span className="gold-glow px-0.5 text-base font-bold sm:px-1 sm:text-2xl md:text-3xl">
                ${clue.value}
              </span>
            </button>
          );
        })
      )}
    </div>
  );
}
