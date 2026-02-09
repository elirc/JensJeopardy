"use client";

import Link from "next/link";
import { useTransition } from "react";
import { logout } from "@/app/auth/actions";

interface AuthNavProps {
  user: { id: string; email: string; name: string | null } | null;
}

export default function AuthNav({ user }: AuthNavProps) {
  const [isPending, startTransition] = useTransition();

  if (user) {
    return (
      <div className="flex items-center gap-4">
        <span className="text-gray-400 text-sm">
          {user.name || user.email}
        </span>
        <button
          onClick={() => startTransition(() => logout())}
          disabled={isPending}
          className="text-gray-400 hover:text-white text-sm transition-colors disabled:opacity-50"
        >
          {isPending ? "..." : "Log out"}
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Link
        href="/auth/login"
        className="text-gray-300 hover:text-white text-sm font-medium transition-colors"
      >
        Log in
      </Link>
      <Link
        href="/auth/register"
        className="border border-gray-600 text-gray-300 px-3 py-1 rounded text-sm hover:border-gray-400 hover:text-white transition-colors"
      >
        Register
      </Link>
    </div>
  );
}
