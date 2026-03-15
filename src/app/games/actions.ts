"use server";

import { prisma } from "@/lib/prisma";
import {
  generateEditToken,
  setEditTokenCookie,
  canEditGame,
  getCurrentUser,
} from "@/lib/auth";
import { isAdminUser } from "@/lib/admin";
import {
  GameMetaSchema,
  CategoryNameSchema,
  ClueSchema,
  FinalClueSchema,
  GameExportSchema,
} from "@/lib/validators";

// ─── Helpers ──────────────────────────────────────────────────────

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

const ROUND_1_VALUES = [200, 400, 600, 800, 1000];
const ROUND_2_VALUES = [400, 800, 1200, 1600, 2000];
const CATEGORY_COUNT = 6;
const CLUE_COUNT = 5;

function buildRoundData(
  roundNumber: number,
  values: number[]
): {
  categories: {
    name: string;
    order: number;
    clues: {
      order: number;
      value: number;
      question: string;
      answer: string;
    }[];
  }[];
} {
  const categories = Array.from({ length: CATEGORY_COUNT }, (_, catIdx) => ({
    name: `Category ${catIdx + 1}`,
    order: catIdx,
    clues: Array.from({ length: CLUE_COUNT }, (_, clueIdx) => ({
      order: clueIdx + 1,
      value: values[clueIdx],
      question: "Question placeholder",
      answer: "Answer placeholder",
    })),
  }));
  return { categories };
}

async function requireEditPermission(
  gameId: string
): Promise<{ allowed: true } | { allowed: false; error: string }> {
  const allowed = await canEditGame(gameId);
  if (!allowed) {
    return { allowed: false, error: "You do not have permission to edit this game." };
  }
  return { allowed: true };
}

// ─── 1. createGame ───────────────────────────────────────────────

export async function createGame(options?: {
  sourceType?: "USER" | "OFFICIAL";
}): Promise<
  ActionResult<{ gameId: string; editToken: string }>
> {
  try {
    const sourceType = options?.sourceType === "OFFICIAL" ? "OFFICIAL" : "USER";
    const isOfficialGame = sourceType === "OFFICIAL";
    const editToken = generateEditToken();
    const { categories } = buildRoundData(1, ROUND_1_VALUES);
    const user = await getCurrentUser();

    if (isOfficialGame) {
      if (!user) {
        return {
          success: false,
          error: "You must be logged in to create a prebuilt game.",
        };
      }

      if (!(await isAdminUser(user))) {
        return {
          success: false,
          error: "Only admin accounts can create prebuilt games.",
        };
      }
    }

    const game = await prisma.game.create({
      data: {
        title: isOfficialGame ? "Untitled Prebuilt Game" : "Untitled Game",
        editToken,
        ownerId: user?.id ?? null,
        sourceType,
        ...(isOfficialGame
          ? {
              visibility: "PUBLIC",
              officialVersion: 1,
            }
          : {}),
        rounds: {
          create: {
            number: 1,
            categories: {
              create: categories.map((cat) => ({
                name: cat.name,
                order: cat.order,
                clues: {
                  create: cat.clues.map((clue) => ({
                    order: clue.order,
                    value: clue.value,
                    question: clue.question,
                    answer: clue.answer,
                  })),
                },
              })),
            },
          },
        },
      },
    });

    if (!isOfficialGame) {
      await setEditTokenCookie(game.id, editToken);
    }

    return { success: true, data: { gameId: game.id, editToken } };
  } catch (error) {
    console.error("createGame error:", error);
    return { success: false, error: "Failed to create game." };
  }
}

// ─── 2. updateGameMeta ──────────────────────────────────────────

export async function updateGameMeta(
  gameId: string,
  data: { title?: string; description?: string; visibility?: string }
): Promise<ActionResult> {
  try {
    const perm = await requireEditPermission(gameId);
    if (!perm.allowed) return { success: false, error: perm.error };

    const parsed = GameMetaSchema.partial().safeParse(data);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
    }

    await prisma.game.update({
      where: { id: gameId },
      data: parsed.data,
    });

    return { success: true, data: undefined };
  } catch (error) {
    console.error("updateGameMeta error:", error);
    return { success: false, error: "Failed to update game." };
  }
}

// ─── 3. updateCategory ─────────────────────────────────────────

export async function updateCategory(
  categoryId: string,
  name: string
): Promise<ActionResult> {
  try {
    const parsed = CategoryNameSchema.safeParse(name);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid category name." };
    }

    // Look up game through category -> round -> game
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      include: { round: { select: { gameId: true } } },
    });
    if (!category) return { success: false, error: "Category not found." };

    const perm = await requireEditPermission(category.round.gameId);
    if (!perm.allowed) return { success: false, error: perm.error };

    await prisma.category.update({
      where: { id: categoryId },
      data: { name: parsed.data },
    });

    return { success: true, data: undefined };
  } catch (error) {
    console.error("updateCategory error:", error);
    return { success: false, error: "Failed to update category." };
  }
}

// ─── 4. updateClue ──────────────────────────────────────────────

export async function updateClue(
  clueId: string,
  data: {
    question?: string;
    answer?: string;
    value?: number;
  }
): Promise<ActionResult> {
  try {
    const parsed = ClueSchema.partial().safeParse(data);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid clue data." };
    }

    // Look up game through clue -> category -> round -> game
    const clue = await prisma.clue.findUnique({
      where: { id: clueId },
      include: {
        category: {
          include: {
            round: { select: { id: true, gameId: true, number: true } },
          },
        },
      },
    });
    if (!clue) return { success: false, error: "Clue not found." };

    const gameId = clue.category.round.gameId;
    const perm = await requireEditPermission(gameId);
    if (!perm.allowed) return { success: false, error: perm.error };

    await prisma.clue.update({
      where: { id: clueId },
      data: parsed.data,
    });

    return { success: true, data: undefined };
  } catch (error) {
    console.error("updateClue error:", error);
    return { success: false, error: "Failed to update clue." };
  }
}

// ─── 5. toggleRound2 ───────────────────────────────────────────

export async function toggleRound2(
  gameId: string,
  enabled: boolean
): Promise<ActionResult> {
  try {
    const perm = await requireEditPermission(gameId);
    if (!perm.allowed) return { success: false, error: perm.error };

    if (enabled) {
      // Check if Round 2 already exists
      const existingRound = await prisma.round.findUnique({
        where: { gameId_number: { gameId, number: 2 } },
      });
      if (existingRound) {
        return { success: false, error: "Round 2 already exists." };
      }

      const { categories } = buildRoundData(2, ROUND_2_VALUES);

      await prisma.$transaction(async (tx) => {
        await tx.round.create({
          data: {
            gameId,
            number: 2,
            categories: {
              create: categories.map((cat) => ({
                name: cat.name,
                order: cat.order,
                clues: {
                  create: cat.clues.map((clue) => ({
                    order: clue.order,
                    value: clue.value,
                    question: clue.question,
                    answer: clue.answer,
                  })),
                },
              })),
            },
          },
        });
      });
    } else {
      // Delete Round 2 (cascade will handle categories and clues)
      await prisma.$transaction(async (tx) => {
        const round2 = await tx.round.findUnique({
          where: { gameId_number: { gameId, number: 2 } },
        });
        if (!round2) {
          return; // Nothing to delete
        }
        await tx.round.delete({
          where: { id: round2.id },
        });
      });
    }

    return { success: true, data: undefined };
  } catch (error) {
    console.error("toggleRound2 error:", error);
    return { success: false, error: "Failed to toggle Round 2." };
  }
}

// ─── 6. upsertFinalClue ────────────────────────────────────────

export async function upsertFinalClue(
  gameId: string,
  data: { category: string; question: string; answer: string }
): Promise<ActionResult> {
  try {
    const perm = await requireEditPermission(gameId);
    if (!perm.allowed) return { success: false, error: perm.error };

    const parsed = FinalClueSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid final clue data." };
    }

    await prisma.finalClue.upsert({
      where: { gameId },
      create: {
        gameId,
        category: parsed.data.category,
        question: parsed.data.question,
        answer: parsed.data.answer,
      },
      update: {
        category: parsed.data.category,
        question: parsed.data.question,
        answer: parsed.data.answer,
      },
    });

    return { success: true, data: undefined };
  } catch (error) {
    console.error("upsertFinalClue error:", error);
    return { success: false, error: "Failed to save final clue." };
  }
}

// ─── 7. deleteFinalClue ────────────────────────────────────────

export async function deleteFinalClue(
  gameId: string
): Promise<ActionResult> {
  try {
    const perm = await requireEditPermission(gameId);
    if (!perm.allowed) return { success: false, error: perm.error };

    await prisma.finalClue.deleteMany({
      where: { gameId },
    });

    return { success: true, data: undefined };
  } catch (error) {
    console.error("deleteFinalClue error:", error);
    return { success: false, error: "Failed to delete final clue." };
  }
}

// ─── 8. copyGame ───────────────────────────────────────────────

export async function copyGame(
  gameId: string
): Promise<ActionResult<{ gameId: string; editToken: string }>> {
  try {
    // Fetch the full game structure
    const sourceGame = await prisma.game.findUnique({
      where: { id: gameId },
      include: {
        rounds: {
          include: {
            categories: {
              include: { clues: true },
              orderBy: { order: "asc" },
            },
          },
          orderBy: { number: "asc" },
        },
        finalClue: true,
      },
    });

    if (!sourceGame) {
      return { success: false, error: "Game not found." };
    }

    const editToken = generateEditToken();
    const user = await getCurrentUser();

    const newGame = await prisma.$transaction(async (tx) => {
      const game = await tx.game.create({
        data: {
          title: `${sourceGame.title} (Copy)`,
          description: sourceGame.description,
          editToken,
          ownerId: user?.id ?? null,
          sourceGameId: sourceGame.id,
          sourceType: "USER",
        },
      });

      for (const round of sourceGame.rounds) {
        const newRound = await tx.round.create({
          data: {
            gameId: game.id,
            number: round.number,
          },
        });

        for (const category of round.categories) {
          const newCategory = await tx.category.create({
            data: {
              roundId: newRound.id,
              name: category.name,
              order: category.order,
            },
          });

          await tx.clue.createMany({
            data: category.clues.map((clue) => ({
              categoryId: newCategory.id,
              order: clue.order,
              value: clue.value,
              question: clue.question,
              answer: clue.answer,
            })),
          });
        }
      }

      if (sourceGame.finalClue) {
        await tx.finalClue.create({
          data: {
            gameId: game.id,
            category: sourceGame.finalClue.category,
            question: sourceGame.finalClue.question,
            answer: sourceGame.finalClue.answer,
          },
        });
      }

      return game;
    });

    await setEditTokenCookie(newGame.id, editToken);

    return { success: true, data: { gameId: newGame.id, editToken } };
  } catch (error) {
    console.error("copyGame error:", error);
    return { success: false, error: "Failed to copy game." };
  }
}

// ─── 9. deleteGame ─────────────────────────────────────────────

export async function deleteGame(
  gameId: string
): Promise<ActionResult> {
  try {
    const perm = await requireEditPermission(gameId);
    if (!perm.allowed) return { success: false, error: perm.error };

    await prisma.game.delete({
      where: { id: gameId },
    });

    return { success: true, data: undefined };
  } catch (error) {
    console.error("deleteGame error:", error);
    return { success: false, error: "Failed to delete game." };
  }
}

// ─── 10. exportGame ────────────────────────────────────────────

export async function exportGame(
  gameId: string
): Promise<ActionResult<ReturnType<typeof buildExportData>>> {
  try {
    const game = await prisma.game.findUnique({
      where: { id: gameId },
      include: {
        rounds: {
          include: {
            categories: {
              include: { clues: { orderBy: { order: "asc" } } },
              orderBy: { order: "asc" },
            },
          },
          orderBy: { number: "asc" },
        },
        finalClue: true,
      },
    });

    if (!game) {
      return { success: false, error: "Game not found." };
    }

    const exportData = buildExportData(game);
    return { success: true, data: exportData };
  } catch (error) {
    console.error("exportGame error:", error);
    return { success: false, error: "Failed to export game." };
  }
}

function buildExportData(game: {
  title: string;
  description: string | null;
  rounds: {
    number: number;
    categories: {
      name: string;
      order: number;
      clues: {
        order: number;
        value: number;
        question: string;
        answer: string;
      }[];
    }[];
  }[];
  finalClue: {
    category: string;
    question: string;
    answer: string;
  } | null;
}) {
  return {
    version: 1 as const,
    title: game.title,
    ...(game.description ? { description: game.description } : {}),
    rounds: game.rounds.map((round) => ({
      number: round.number,
      categories: round.categories.map((cat) => ({
        name: cat.name,
        order: cat.order,
        clues: cat.clues.map((clue) => ({
          order: clue.order,
          value: clue.value,
          question: clue.question,
          answer: clue.answer,
        })),
      })),
    })),
    ...(game.finalClue
      ? {
          finalClue: {
            category: game.finalClue.category,
            question: game.finalClue.question,
            answer: game.finalClue.answer,
          },
        }
      : {}),
  };
}

// ─── 11. importGame ────────────────────────────────────────────

export async function importGame(
  json: unknown
): Promise<ActionResult<{ gameId: string; editToken: string }>> {
  try {
    const parsed = GameExportSchema.safeParse(json);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid game data." };
    }

    const data = parsed.data;
    const editToken = generateEditToken();
    const user = await getCurrentUser();

    const game = await prisma.$transaction(async (tx) => {
      const newGame = await tx.game.create({
        data: {
          title: data.title,
          description: data.description,
          editToken,
          ownerId: user?.id ?? null,
          sourceType: "USER",
        },
      });

      for (const round of data.rounds) {
        const newRound = await tx.round.create({
          data: {
            gameId: newGame.id,
            number: round.number,
          },
        });

        for (const category of round.categories) {
          const newCategory = await tx.category.create({
            data: {
              roundId: newRound.id,
              name: category.name,
              order: category.order,
            },
          });

          await tx.clue.createMany({
            data: category.clues.map((clue) => ({
              categoryId: newCategory.id,
              order: clue.order,
              value: clue.value,
              question: clue.question,
              answer: clue.answer,
            })),
          });
        }
      }

      if (data.finalClue) {
        await tx.finalClue.create({
          data: {
            gameId: newGame.id,
            category: data.finalClue.category,
            question: data.finalClue.question,
            answer: data.finalClue.answer,
          },
        });
      }

      return newGame;
    });

    await setEditTokenCookie(game.id, editToken);

    return { success: true, data: { gameId: game.id, editToken } };
  } catch (error) {
    console.error("importGame error:", error);
    return { success: false, error: "Failed to import game." };
  }
}
