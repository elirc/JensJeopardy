"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { login } from "@/app/auth/actions";

export default function LoginForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      const result = await login({ email, password });
      if (result.success) {
        router.push("/games");
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm text-gray-400 mb-1">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full bg-gray-700 text-white rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--jeopardy-gold)]"
        />
      </div>
      <div>
        <label className="block text-sm text-gray-400 mb-1">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full bg-gray-700 text-white rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--jeopardy-gold)]"
        />
      </div>
      {error && <p className="text-red-400 text-sm">{error}</p>}
      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-[var(--jeopardy-gold)] text-[var(--header-bg)] py-2 rounded font-semibold hover:bg-[var(--jeopardy-gold-dark)] transition-colors disabled:opacity-50"
      >
        {isPending ? "Logging in..." : "Log In"}
      </button>
      <p className="text-center text-sm text-gray-400">
        Don&apos;t have an account?{" "}
        <Link href="/auth/register" className="text-[var(--jeopardy-gold)] hover:underline">
          Register
        </Link>
      </p>
    </form>
  );
}
