import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import AuthNav from "@/components/AuthNav";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Jeopardy Maker",
  description: "Create and play custom Jeopardy games",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
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
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
