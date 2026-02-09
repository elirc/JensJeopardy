import { getCurrentUser } from "@/lib/auth";

interface BasicUser {
  email: string;
}

function parseAdminEmails(): Set<string> {
  const raw = [process.env.ADMIN_EMAILS, process.env.ADMIN_EMAIL]
    .filter(Boolean)
    .join(",");

  return new Set(
    raw
      .split(/[,\s;]+/)
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean)
  );
}

export async function isAdminUser(
  user?: BasicUser | null
): Promise<boolean> {
  const current = user ?? (await getCurrentUser());
  if (!current) return false;

  const adminEmails = parseAdminEmails();
  if (adminEmails.size === 0) return false;

  return adminEmails.has(current.email.trim().toLowerCase());
}
