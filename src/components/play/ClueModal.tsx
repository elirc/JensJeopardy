"use client";

import { useState, useEffect, useRef } from "react";

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
        className="fixed inset-0 z-50 overflow-y-auto bg-[var(--board-bg)] clue-modal-expanding"
        style={expanded ? expandedStyle : initialStyle}
      >
        <div className="flex min-h-[100dvh] items-center justify-center px-4 py-[calc(env(safe-area-inset-top)+1rem)] pb-[calc(env(safe-area-inset-bottom)+1rem)] sm:px-6">
          <div
            className={`w-full max-w-3xl text-center transition-opacity duration-300 ${
              expanded ? "opacity-100" : "opacity-0"
            }`}
          >
            <div className="gold-glow mb-3 text-xs font-semibold sm:mb-4 sm:text-sm">
              ${value}
            </div>
            <p className="mb-6 text-xl font-light leading-relaxed text-white uppercase sm:mb-8 sm:text-2xl md:text-3xl">
              {question}
            </p>

            {!showAnswer && (
              <div className="animate-fade-in mb-6 flex flex-col justify-center gap-3 sm:mb-8 sm:flex-row">
                <button
                  onClick={onBack}
                  className="w-full rounded-lg bg-white/10 px-5 py-3 text-base text-white transition-colors hover:bg-white/20 sm:w-auto sm:px-6 sm:text-lg"
                >
                  Back to Board
                </button>
                <button
                  onClick={() => setShowAnswer(true)}
                  className="w-full rounded-lg bg-white/10 px-5 py-3 text-base text-white transition-colors hover:bg-white/20 sm:w-auto sm:px-6 sm:text-lg"
                >
                  Reveal Answer
                </button>
              </div>
            )}

            {showAnswer && (
              <div className="animate-fade-in-up">
                <div className="mb-6 rounded-lg bg-white/10 p-4 sm:mb-8 sm:p-6">
                  <p className="gold-glow-strong text-lg font-semibold sm:text-xl">
                    {answer}
                  </p>
                </div>

                <div className="mb-4">
                  <button
                    onClick={onClose}
                    className="w-full rounded-lg bg-white/10 px-5 py-3 text-base text-white transition-colors hover:bg-white/20 sm:w-auto sm:px-6"
                  >
                    Back to Board
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
