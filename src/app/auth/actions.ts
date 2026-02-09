"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  hashPassword,
  verifyPassword,
  createAuthSession,
  destroyAuthSession,
} from "@/lib/auth";
import { LoginSchema, RegisterSchema } from "@/lib/validators";

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

// ─── Register ─────────────────────────────────────────────────

export async function register(
  data: { email: string; password: string; name?: string }
): Promise<ActionResult<{ userId: string }>> {
  try {
    const parsed = RegisterSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
    }

    const existing = await prisma.user.findUnique({
      where: { email: parsed.data.email },
    });
    if (existing) {
      return { success: false, error: "An account with this email already exists." };
    }

    const passwordHash = await hashPassword(parsed.data.password);

    const user = await prisma.user.create({
      data: {
        email: parsed.data.email,
        name: parsed.data.name || null,
        passwordHash,
      },
    });

    await createAuthSession(user.id);
    await linkAnonymousGames(user.id);

    return { success: true, data: { userId: user.id } };
  } catch (error) {
    console.error("register error:", error);
    return { success: false, error: "Failed to create account." };
  }
}

// ─── Login ────────────────────────────────────────────────────

export async function login(
  data: { email: string; password: string }
): Promise<ActionResult<{ userId: string }>> {
  try {
    const parsed = LoginSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
    }

    const user = await prisma.user.findUnique({
      where: { email: parsed.data.email },
    });
    if (!user) {
      return { success: false, error: "Invalid email or password." };
    }

    const valid = await verifyPassword(parsed.data.password, user.passwordHash);
    if (!valid) {
      return { success: false, error: "Invalid email or password." };
    }

    await createAuthSession(user.id);
    await linkAnonymousGames(user.id);

    return { success: true, data: { userId: user.id } };
  } catch (error) {
    console.error("login error:", error);
    return { success: false, error: "Failed to log in." };
  }
}

// ─── Logout ───────────────────────────────────────────────────

export async function logout(): Promise<void> {
  await destroyAuthSession();
  redirect("/");
}

// ─── Link Anonymous Games ─────────────────────────────────────

async function linkAnonymousGames(userId: string): Promise<void> {
  try {
    const cookieStore = await cookies();
    const allCookies = cookieStore.getAll();

    for (const cookie of allCookies) {
      if (cookie.name.startsWith("edit_token_")) {
        const gameId = cookie.name.replace("edit_token_", "");
        const game = await prisma.game.findUnique({
          where: { id: gameId },
          select: { editToken: true, ownerId: true },
        });
        if (game && game.editToken === cookie.value && !game.ownerId) {
          await prisma.game.update({
            where: { id: gameId },
            data: { ownerId: userId },
          });
        }
      }
    }
  } catch (error) {
    console.error("linkAnonymousGames error:", error);
  }
}
