"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { register } from "@/app/auth/actions";

export default function RegisterForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      const result = await register({
        email,
        password,
        name: name || undefined,
      });
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
        <label className="block text-sm text-gray-400 mb-1">
          Name (optional)
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={50}
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
          minLength={8}
          className="w-full bg-gray-700 text-white rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--jeopardy-gold)]"
        />
        <p className="text-xs text-gray-500 mt-1">At least 8 characters</p>
      </div>
      {error && <p className="text-red-400 text-sm">{error}</p>}
      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-[var(--jeopardy-gold)] text-[var(--header-bg)] py-2 rounded font-semibold hover:bg-[var(--jeopardy-gold-dark)] transition-colors disabled:opacity-50"
      >
        {isPending ? "Creating account..." : "Create Account"}
      </button>
      <p className="text-center text-sm text-gray-400">
        Already have an account?{" "}
        <Link href="/auth/login" className="text-[var(--jeopardy-gold)] hover:underline">
          Log in
        </Link>
      </p>
    </form>
  );
}
