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
  originRect: DOMRect | null;
  onBack: () => void;
  onClose: () => void;
}

export default function ClueModal({
  question,
  answer,
  value,
  originRect,
  onBack,
  onClose,
}: ClueModalProps) {
  const [showAnswer, setShowAnswer] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setExpanded(true);
      });
    });
    return () => cancelAnimationFrame(timer);
  }, []);

  const getInitialTransform = () => {
    if (!originRect) return {};

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const scaleX = originRect.width / vw;
    const scaleY = originRect.height / vh;
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
      <div
        className={`fixed inset-0 z-40 bg-black/50 clue-modal-overlay transition-opacity duration-300 ${
          expanded ? "opacity-100" : "opacity-0"
        }`}
      />

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
          <div className="gold-glow text-sm font-semibold mb-4">${value}</div>
          <p className="text-white text-2xl md:text-3xl font-light leading-relaxed mb-8 uppercase">
            {question}
          </p>

          {!showAnswer && (
            <div className="mb-8 flex flex-wrap justify-center gap-3 animate-fade-in">
              <button
                onClick={onBack}
                className="bg-white/10 text-white px-6 py-3 rounded-lg text-lg hover:bg-white/20 transition-colors"
              >
                Back to Board
              </button>
              <button
                onClick={() => setShowAnswer(true)}
                className="bg-white/10 text-white px-6 py-3 rounded-lg text-lg hover:bg-white/20 transition-colors"
              >
                Reveal Answer
              </button>
            </div>
          )}

          {showAnswer && (
            <div className="animate-fade-in-up">
              <div className="bg-white/10 rounded-lg p-6 mb-8">
                <p className="gold-glow-strong text-xl font-semibold">
                  {answer}
                </p>
              </div>

              <div className="mb-4">
                <button
                  onClick={onClose}
                  className="bg-white/10 text-white px-6 py-3 rounded-lg hover:bg-white/20 transition-colors"
                >
                  Back to Board
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
