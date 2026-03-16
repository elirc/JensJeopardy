"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import AuthNav from "@/components/AuthNav";

interface RootChromeProps {
  user: { id: string; email: string; name: string | null } | null;
  children: ReactNode;
}

function PlayRouteHome({
  pathname,
  onConfirmExit,
}: {
  pathname: string;
  onConfirmExit: () => void;
}) {
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [homeEnabled, setHomeEnabled] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setHomeEnabled(true);
    }, 400);

    return () => window.clearTimeout(timer);
  }, [pathname]);

  return (
    <>
      <div
        className="fixed z-40"
        style={{
          left: "max(0.5rem, env(safe-area-inset-left))",
          top: "calc(env(safe-area-inset-top) + 0.5rem)",
        }}
      >
        <button
          onClick={() => {
            if (homeEnabled) {
              setShowExitConfirm(true);
            }
          }}
          className="text-[var(--jeopardy-gold)] font-bold text-base tracking-wide md:text-xl"
        >
          Home
        </button>
      </div>

      {showExitConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-md rounded-2xl border border-gray-700 bg-[var(--header-bg)] p-6 text-center shadow-2xl">
            <h2 className="text-xl font-bold text-white">
              Are you sure you want to exit the game?
            </h2>
            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <button
                onClick={onConfirmExit}
                className="rounded-lg bg-[var(--jeopardy-gold)] px-5 py-2 font-semibold text-[var(--header-bg)] transition-colors hover:bg-[var(--jeopardy-gold-dark)]"
              >
                Yes
              </button>
              <button
                onClick={() => setShowExitConfirm(false)}
                className="rounded-lg border border-gray-600 px-5 py-2 text-gray-300 transition-colors hover:border-gray-400 hover:text-white"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function RootChrome({ user, children }: RootChromeProps) {
  const pathname = usePathname();
  const router = useRouter();
  const isPlayRoute = pathname.startsWith("/play/");
  const isHomeRoute = pathname === "/";
  const isGamePreviewRoute = /^\/games\/[^/]+$/.test(pathname);

  return (
    <>
      {isPlayRoute && (
        <PlayRouteHome
          key={pathname}
          pathname={pathname}
          onConfirmExit={() => router.push("/")}
        />
      )}

      {isGamePreviewRoute && (
        <div
          className="fixed z-40"
          style={{
            left: "max(0.5rem, env(safe-area-inset-left))",
            top: "calc(env(safe-area-inset-top) + 0.5rem)",
          }}
        >
          <Link
            href="/"
            className="text-[var(--jeopardy-gold)] font-bold text-base tracking-wide md:text-xl"
          >
            Home
          </Link>
        </div>
      )}

      {!isPlayRoute && !isHomeRoute && !isGamePreviewRoute && (
        <nav className="bg-[var(--header-bg)] border-b border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-14">
              <Link
                href="/"
                className="text-[var(--jeopardy-gold)] font-bold text-xl tracking-wide"
              >
                Jeopardy Maker
              </Link>
              <div className="flex items-center gap-6">
                <Link
                  href="/games"
                  className="text-gray-300 hover:text-white text-sm font-medium transition-colors"
                >
                  Games
                </Link>
                <Link
                  href="/games/new"
                  className="bg-[var(--jeopardy-gold)] text-[var(--header-bg)] px-4 py-1.5 rounded text-sm font-semibold hover:bg-[var(--jeopardy-gold-dark)] transition-colors"
                >
                  Create
                </Link>
                <AuthNav user={user} />
              </div>
            </div>
          </div>
        </nav>
      )}
      <main
        className={
          isPlayRoute || isHomeRoute
            ? "w-full"
            : "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
        }
      >
        {children}
      </main>
    </>
  );
}
