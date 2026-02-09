import { cookies } from "next/headers";
import { randomBytes, scrypt, timingSafeEqual } from "crypto";
import { prisma } from "./prisma";

// ─── Constants ─────────────────────────────────────────────────

const AUTH_SESSION_COOKIE = "auth_session";
const SESSION_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

// ─── Password Hashing (scrypt - built into Node.js) ───────────

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const hash = await new Promise<string>((resolve, reject) => {
    scrypt(password, salt, 64, (err, derivedKey) => {
      if (err) reject(err);
      else resolve(derivedKey.toString("hex"));
    });
  });
  return `${salt}:${hash}`;
}

export async function verifyPassword(
  password: string,
  storedHash: string
): Promise<boolean> {
  const [salt, hash] = storedHash.split(":");
  if (!salt || !hash) return false;
  const derivedKey = await new Promise<Buffer>((resolve, reject) => {
    scrypt(password, salt, 64, (err, derivedKey) => {
      if (err) reject(err);
      else resolve(derivedKey);
    });
  });
  const storedBuffer = Buffer.from(hash, "hex");
  return timingSafeEqual(derivedKey, storedBuffer);
}

// ─── Auth Session Management ──────────────────────────────────

function generateSessionToken(): string {
  return randomBytes(32).toString("hex");
}

export async function createAuthSession(userId: string): Promise<void> {
  const token = generateSessionToken();
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_MS);

  await prisma.authSession.create({
    data: { userId, token, expiresAt },
  });

  const cookieStore = await cookies();
  cookieStore.set(AUTH_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: Math.floor(SESSION_MAX_AGE_MS / 1000),
    path: "/",
  });
}

export async function getCurrentUser(): Promise<{
  id: string;
  email: string;
  name: string | null;
} | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_SESSION_COOKIE)?.value;
  if (!token) return null;

  const session = await prisma.authSession.findUnique({
    where: { token },
    include: {
      user: { select: { id: true, email: true, name: true } },
    },
  });

  if (!session) return null;

  if (session.expiresAt < new Date()) {
    await prisma.authSession.delete({ where: { id: session.id } });
    return null;
  }

  return session.user;
}

export async function destroyAuthSession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_SESSION_COOKIE)?.value;
  if (token) {
    await prisma.authSession.deleteMany({ where: { token } });
    cookieStore.delete(AUTH_SESSION_COOKIE);
  }
}

// ─── Edit Token Functions ─────────────────────────────────────

export function generateEditToken(): string {
  return crypto.randomUUID();
}

function editTokenCookieName(gameId: string): string {
  return `edit_token_${gameId}`;
}

export async function setEditTokenCookie(
  gameId: string,
  editToken: string
): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(editTokenCookieName(gameId), editToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365, // 1 year
    path: "/",
  });
}

export async function canEditGame(gameId: string): Promise<boolean> {
  const game = await prisma.game.findUnique({
    where: { id: gameId },
    select: { editToken: true, ownerId: true },
  });
  if (!game) return false;

  // Account-owned games require the owner account to be signed in.
  const user = await getCurrentUser();
  if (game.ownerId) {
    return !!user && game.ownerId === user.id;
  }

  // Anonymous-owned games can be edited by the guest that holds the token.
  const cookieStore = await cookies();
  const cookieToken = cookieStore.get(editTokenCookieName(gameId))?.value;
  if (game.editToken && cookieToken === game.editToken) return true;

  return false;
}

export async function getOwnedGameIds(): Promise<string[]> {
  const gameIds: string[] = [];

  // 1. Collect edit-token-based games
  const cookieStore = await cookies();
  const allCookies = cookieStore.getAll();
  for (const cookie of allCookies) {
    if (cookie.name.startsWith("edit_token_")) {
      const gameId = cookie.name.replace("edit_token_", "");
      const game = await prisma.game.findUnique({
        where: { id: gameId },
        select: { editToken: true, ownerId: true },
      });
      if (game && !game.ownerId && game.editToken === cookie.value) {
        gameIds.push(gameId);
      }
    }
  }

  // 2. Collect account-owned games
  const user = await getCurrentUser();
  if (user) {
    const accountGames = await prisma.game.findMany({
      where: { ownerId: user.id },
      select: { id: true },
    });
    for (const g of accountGames) {
      if (!gameIds.includes(g.id)) {
        gameIds.push(g.id);
      }
    }
  }

  return gameIds;
}
