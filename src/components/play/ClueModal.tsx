"use client";

import { useState, useEffect, useRef } from "react";

interface Player {
  id: string;
  name: string;
  score: number;
  order: number;
}

interface ClueModalProps {
  question: string;
  answer: string;
  value: number;
  players: Player[];
  originRect: DOMRect | null;
  onScore: (playerOrder: number, correct: boolean) => void;
  onClose: () => void;
}

export default function ClueModal({
  question,
  answer,
  value,
  players,
  originRect,
  onScore,
  onClose,
}: ClueModalProps) {
  const [showAnswer, setShowAnswer] = useState(false);
  const [scored, setScored] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  // Trigger expansion animation on mount
  useEffect(() => {
    // Small delay to allow initial position render, then expand
    const timer = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setExpanded(true);
      });
    });
    return () => cancelAnimationFrame(timer);
  }, []);

  // Compute the initial transform (from cell to fullscreen)
  const getInitialTransform = () => {
    if (!originRect) return {};

    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // Scale factor: cell size / viewport size
    const scaleX = originRect.width / vw;
    const scaleY = originRect.height / vh;

    // Translation: from center of viewport to center of cell
    const cellCenterX = originRect.left + originRect.width / 2;
    const cellCenterY = originRect.top + originRect.height / 2;
    const viewCenterX = vw / 2;
    const viewCenterY = vh / 2;
    const translateX = cellCenterX - viewCenterX;
    const translateY = cellCenterY - viewCenterY;

    return {
      transform: `translate(${translateX}px, ${translateY}px) scale(${scaleX}, ${scaleY})`,
      borderRadius: "4px",
      borderWidth: "3px",
      borderStyle: "solid",
      borderColor: "var(--cell-border-light)",
    };
  };

  const expandedStyle = {
    transform: "translate(0, 0) scale(1, 1)",
    borderRadius: "0",
    borderWidth: "0px",
    borderStyle: "solid" as const,
    borderColor: "transparent",
  };

  const initialStyle = originRect ? getInitialTransform() : {};

  return (
    <>
      {/* Backdrop with blur */}
      <div
        className={`fixed inset-0 z-40 bg-black/50 clue-modal-overlay transition-opacity duration-300 ${
          expanded ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Modal */}
      <div
        ref={modalRef}
        className="fixed inset-0 z-50 bg-[var(--board-bg)] flex flex-col items-center justify-center clue-modal-expanding"
        style={expanded ? expandedStyle : initialStyle}
      >
        <div
          className={`text-center max-w-2xl w-full px-8 transition-opacity duration-300 ${
            expanded ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="gold-glow text-sm font-semibold mb-4">
            ${value}
          </div>
          <p className="text-white text-2xl md:text-3xl font-light leading-relaxed mb-8 uppercase">
            {question}
          </p>

          {!showAnswer && !scored && (
            <button
              onClick={() => setShowAnswer(true)}
              className="animate-fade-in bg-white/10 text-white px-6 py-3 rounded-lg text-lg hover:bg-white/20 transition-colors mb-8"
            >
              Show Answer
            </button>
          )}

          {showAnswer && !scored && (
            <div className="animate-fade-in-up">
              <div className="bg-white/10 rounded-lg p-6 mb-8">
                <p className="gold-glow-strong text-xl font-semibold">
                  {answer}
                </p>
              </div>

              <div className="mb-4">
                <p className="text-gray-400 text-sm mb-3">
                  Who answered? (or &quot;No Answer&quot; to skip)
                </p>
                <div className="flex flex-wrap justify-center gap-3 mb-4">
                  {players.map((player) => (
                    <div key={player.id} className="flex gap-2">
                      <button
                        onClick={() => {
                          onScore(player.order, true);
                          setScored(true);
                        }}
                        className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded text-sm transition-colors"
                      >
                        {player.name} ✓
                      </button>
                      <button
                        onClick={() => {
                          onScore(player.order, false);
                          setScored(true);
                        }}
                        className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded text-sm transition-colors"
                      >
                        {player.name} ✗
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-white text-sm transition-colors"
                >
                  No Answer (close clue)
                </button>
              </div>
            </div>
          )}

          {scored && (
            <div className="text-center animate-fade-in">
              <p className="text-green-400 mb-4">Score recorded!</p>
              <button
                onClick={onClose}
                className="bg-white/10 text-white px-6 py-3 rounded-lg hover:bg-white/20 transition-colors"
              >
                Back to Board
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
