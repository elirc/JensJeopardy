import { PrismaClient } from "@/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { existsSync } from "node:fs";
import path from "node:path";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function findProjectRoot(startDir: string): string {
  let dir = startDir;
  while (true) {
    if (existsSync(path.join(dir, "package.json"))) {
      return dir;
    }
    const parent = path.dirname(dir);
    if (parent === dir) {
      return startDir;
    }
    dir = parent;
  }
}

function resolveDatabaseUrl(rawUrl: string | undefined): string {
  const url = rawUrl || "file:./dev.db";
  if (!url.startsWith("file:")) {
    return url;
  }

  const sqlitePath = url.slice("file:".length);
  if (sqlitePath === ":memory:") {
    return url;
  }

  const normalizedPath = sqlitePath.replace(/\//g, path.sep);
  if (path.isAbsolute(normalizedPath)) {
    return `file:${normalizedPath.replace(/\\/g, "/")}`;
  }

  const rootDir = findProjectRoot(process.cwd());
  const absolutePath = path.resolve(rootDir, normalizedPath);
  return `file:${absolutePath.replace(/\\/g, "/")}`;
}

const databaseUrl = resolveDatabaseUrl(process.env.DATABASE_URL);

const adapter = new PrismaBetterSqlite3({
  url: databaseUrl,
});

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
