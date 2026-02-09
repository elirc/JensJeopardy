"use server";

import { prisma } from "@/lib/prisma";
import { PlayersSchema } from "@/lib/validators";

// ─── Types ──────────────────────────────────────────────────────

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

interface DailyDoubleState {
  clueId: string;
  playerOrder: number;
  wager: number;
}

interface FinalWagerState {
  wagers: { playerOrder: number; wager: number }[];
}

// ─── Helpers ────────────────────────────────────────────────────

/**
 * Shared optimistic concurrency helper. Performs an updateMany on SessionState
 * that only matches if `version` equals `expectedVersion`, and atomically
 * increments the version. Throws on version conflict (0 rows updated).
 */
async function updateSessionStateOptimistic(
  sessionId: string,
  expectedVersion: number,
  updates: Record<string, unknown>,
  tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0] = prisma
) {
  const result = await tx.sessionState.updateMany({
    where: { sessionId, version: expectedVersion },
    data: { ...updates, version: expectedVersion + 1 },
  });
  if (result.count === 0) {
    throw new Error(
      "Version conflict: the session was modified by another request. Please reload and try again."
    );
  }
}

/**
 * Gets the next monotonic sequence number for ActionLog entries in a session.
 */
async function getNextSequence(
  sessionId: string,
  tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0] = prisma
): Promise<number> {
  const last = await tx.actionLog.findFirst({
    where: { sessionId },
    orderBy: { sequence: "desc" },
    select: { sequence: true },
  });
  return (last?.sequence ?? -1) + 1;
}

/**
 * Gets the highest clue value on the current round's board for a session.
 */
async function getHighestBoardValue(
  sessionId: string,
  roundNumber: number,
  tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0] = prisma
): Promise<number> {
  const session = await tx.session.findUniqueOrThrow({
    where: { id: sessionId },
    select: { gameId: true },
  });

  const round = await tx.round.findUnique({
    where: { gameId_number: { gameId: session.gameId, number: roundNumber } },
    select: {
      categories: {
        select: {
          clues: {
            select: { value: true },
            orderBy: { value: "desc" },
            take: 1,
          },
        },
      },
    },
  });

  if (!round) return 0;

  let highest = 0;
  for (const cat of round.categories) {
    for (const clue of cat.clues) {
      if (clue.value > highest) highest = clue.value;
    }
  }
  return highest;
}

/**
 * Derives player scores from ActionLog entries (for verification).
 * Returns a map of playerOrder -> total score.
 */
async function getPlayerScores(
  sessionId: string,
  tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0] = prisma
): Promise<Map<number, number>> {
  const actions = await tx.actionLog.findMany({
    where: { sessionId },
    select: { playerOrder: true, delta: true },
  });

  const scores = new Map<number, number>();
  for (const action of actions) {
    scores.set(
      action.playerOrder,
      (scores.get(action.playerOrder) ?? 0) + action.delta
    );
  }
  return scores;
}

// ─── Server Actions ─────────────────────────────────────────────

/**
 * Creates a new play session from an existing game.
 * Initializes SessionState with roundNumber=1, status=BOARD, version=0.
 */
export async function createSessionFromGame(
  gameId: string
): Promise<ActionResult<{ sessionId: string }>> {
  try {
    const game = await prisma.game.findUnique({
      where: { id: gameId },
      select: { id: true },
    });
    if (!game) {
      return { success: false, error: "Game not found." };
    }

    const session = await prisma.session.create({
      data: {
        gameId,
        state: {
          create: {
            roundNumber: 1,
            status: "BOARD",
            version: 0,
          },
        },
      },
      select: { id: true },
    });

    return { success: true, data: { sessionId: session.id } };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to create session.",
    };
  }
}

/**
 * Sets the players for a session. Validates with PlayersSchema.
 * Deletes existing players and creates new ones in a transaction.
 */
export async function setSessionPlayers(
  sessionId: string,
  players: { name: string; order: number }[]
): Promise<ActionResult> {
  try {
    const parsed = PlayersSchema.safeParse(players);
    if (!parsed.success) {
      return { success: false, error: "Invalid players data: " + parsed.error.message };
    }

    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      select: { id: true },
    });
    if (!session) {
      return { success: false, error: "Session not found." };
    }

    await prisma.$transaction(async (tx) => {
      await tx.sessionPlayer.deleteMany({ where: { sessionId } });
      await tx.sessionPlayer.createMany({
        data: parsed.data.map((p) => ({
          sessionId,
          name: p.name,
          order: p.order,
          score: 0,
        })),
      });
    });

    return { success: true, data: undefined };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to set players.",
    };
  }
}

/**
 * Selects a clue on the board. Sets activeClueId on state.
 * If the clue is a daily double, sets status to DAILY_DOUBLE; otherwise CLUE_OPEN.
 * Uses optimistic concurrency.
 */
export async function selectClue(
  sessionId: string,
  clueId: string,
  version: number
): Promise<ActionResult> {
  try {
    const clue = await prisma.clue.findUnique({
      where: { id: clueId },
      select: { id: true, dailyDouble: true },
    });
    if (!clue) {
      return { success: false, error: "Clue not found." };
    }

    const newStatus = clue.dailyDouble ? "DAILY_DOUBLE" : "CLUE_OPEN";

    await updateSessionStateOptimistic(sessionId, version, {
      activeClueId: clueId,
      status: newStatus,
    });

    return { success: true, data: undefined };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to select clue.",
    };
  }
}

/**
 * Scores a regular clue for a player. Creates an ActionLog entry, updates
 * cached SessionPlayer.score, marks the clue as revealed, and resets state.
 * All in a transaction with optimistic concurrency.
 */
export async function scoreClue(
  sessionId: string,
  clueId: string,
  playerOrder: number,
  correct: boolean,
  version: number
): Promise<ActionResult> {
  try {
    const clue = await prisma.clue.findUnique({
      where: { id: clueId },
      select: { value: true },
    });
    if (!clue) {
      return { success: false, error: "Clue not found." };
    }

    const delta = correct ? clue.value : -clue.value;
    const type = correct ? "CLUE_CORRECT" : "CLUE_INCORRECT";

    await prisma.$transaction(async (tx) => {
      // Optimistic concurrency check
      await updateSessionStateOptimistic(
        sessionId,
        version,
        {
          activeClueId: null,
          status: "BOARD",
        },
        tx
      );

      // Create action log entry
      const sequence = await getNextSequence(sessionId, tx);
      await tx.actionLog.create({
        data: {
          sessionId,
          sequence,
          type,
          playerOrder,
          delta,
          clueId,
        },
      });

      // Update cached player score
      await tx.sessionPlayer.updateMany({
        where: { sessionId, order: playerOrder },
        data: { score: { increment: delta } },
      });

      // Mark clue as revealed (upsert to avoid duplicates)
      await tx.revealedClue.upsert({
        where: {
          sessionId_clueId: { sessionId, clueId },
        },
        create: { sessionId, clueId },
        update: {},
      });
    });

    return { success: true, data: undefined };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to score clue.",
    };
  }
}

/**
 * Closes a clue without scoring (e.g. time ran out, no one buzzed in).
 * Clears activeClueId, sets status to BOARD, marks clue as revealed.
 * Uses optimistic concurrency.
 */
export async function closeClue(
  sessionId: string,
  version: number
): Promise<ActionResult> {
  try {
    // Read current state to get the activeClueId before clearing it
    const state = await prisma.sessionState.findUnique({
      where: { sessionId },
      select: { activeClueId: true },
    });
    if (!state || !state.activeClueId) {
      return { success: false, error: "No active clue to close." };
    }

    const clueId = state.activeClueId;

    await prisma.$transaction(async (tx) => {
      await updateSessionStateOptimistic(
        sessionId,
        version,
        {
          activeClueId: null,
          status: "BOARD",
        },
        tx
      );

      // Mark clue as revealed
      await tx.revealedClue.upsert({
        where: {
          sessionId_clueId: { sessionId, clueId },
        },
        create: { sessionId, clueId },
        update: {},
      });
    });

    return { success: true, data: undefined };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to close clue.",
    };
  }
}

/**
 * Starts a daily double by validating the wager and storing DD state.
 * Wager must be min $5, max = max(playerScore, highestBoardValue).
 * Keeps status at DAILY_DOUBLE. Uses optimistic concurrency.
 */
export async function startDailyDouble(
  sessionId: string,
  clueId: string,
  playerOrder: number,
  wager: number,
  version: number
): Promise<ActionResult> {
  try {
    // Get player's current score
    const player = await prisma.sessionPlayer.findUnique({
      where: { sessionId_order: { sessionId, order: playerOrder } },
      select: { score: true },
    });
    if (!player) {
      return { success: false, error: "Player not found." };
    }

    // Get session state for round number
    const state = await prisma.sessionState.findUnique({
      where: { sessionId },
      select: { roundNumber: true },
    });
    if (!state) {
      return { success: false, error: "Session state not found." };
    }

    // Calculate max wager
    const highestValue = await getHighestBoardValue(
      sessionId,
      state.roundNumber
    );
    const maxWager = Math.max(player.score, highestValue);

    // Validate wager
    if (wager < 5) {
      return { success: false, error: "Wager must be at least $5." };
    }
    if (wager > maxWager) {
      return {
        success: false,
        error: `Wager cannot exceed $${maxWager}.`,
      };
    }

    const ddState: DailyDoubleState = { clueId, playerOrder, wager };

    await updateSessionStateOptimistic(sessionId, version, {
      dailyDoubleJson: JSON.stringify(ddState),
      status: "DAILY_DOUBLE",
    });

    return { success: true, data: undefined };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to start daily double.",
    };
  }
}

/**
 * Scores a daily double. Reads DD state from dailyDoubleJson, creates
 * ActionLog entry, updates cached score, marks clue as revealed, clears
 * DD state, and sets status to BOARD. Transaction + optimistic concurrency.
 */
export async function scoreDailyDouble(
  sessionId: string,
  correct: boolean,
  version: number
): Promise<ActionResult> {
  try {
    // Read the DD state
    const state = await prisma.sessionState.findUnique({
      where: { sessionId },
      select: { dailyDoubleJson: true },
    });
    if (!state) {
      return { success: false, error: "Session state not found." };
    }

    let ddState: DailyDoubleState;
    try {
      ddState = JSON.parse(state.dailyDoubleJson) as DailyDoubleState;
    } catch {
      return {
        success: false,
        error: "Invalid daily double state.",
      };
    }

    if (!ddState.clueId || ddState.wager === undefined) {
      return {
        success: false,
        error: "Daily double has not been started.",
      };
    }

    const delta = correct ? ddState.wager : -ddState.wager;
    const type = correct ? "DAILY_DOUBLE_CORRECT" : "DAILY_DOUBLE_INCORRECT";

    await prisma.$transaction(async (tx) => {
      // Optimistic concurrency check + reset state
      await updateSessionStateOptimistic(
        sessionId,
        version,
        {
          activeClueId: null,
          dailyDoubleJson: "{}",
          status: "BOARD",
        },
        tx
      );

      // Create action log entry
      const sequence = await getNextSequence(sessionId, tx);
      await tx.actionLog.create({
        data: {
          sessionId,
          sequence,
          type,
          playerOrder: ddState.playerOrder,
          delta,
          clueId: ddState.clueId,
        },
      });

      // Update cached player score
      await tx.sessionPlayer.updateMany({
        where: { sessionId, order: ddState.playerOrder },
        data: { score: { increment: delta } },
      });

      // Mark clue as revealed
      await tx.revealedClue.upsert({
        where: {
          sessionId_clueId: { sessionId, clueId: ddState.clueId },
        },
        create: { sessionId, clueId: ddState.clueId },
        update: {},
      });
    });

    return { success: true, data: undefined };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to score daily double.",
    };
  }
}

/**
 * Advances to the next round. Increments roundNumber, resets status to BOARD.
 * Uses optimistic concurrency.
 */
export async function nextRound(
  sessionId: string,
  version: number
): Promise<ActionResult> {
  try {
    const state = await prisma.sessionState.findUnique({
      where: { sessionId },
      select: { roundNumber: true },
    });
    if (!state) {
      return { success: false, error: "Session state not found." };
    }

    await updateSessionStateOptimistic(sessionId, version, {
      roundNumber: state.roundNumber + 1,
      status: "BOARD",
      activeClueId: null,
    });

    return { success: true, data: undefined };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to advance round.",
    };
  }
}

/**
 * Starts Final Jeopardy. Sets status to FINAL_WAGER, roundNumber to 3.
 * Uses optimistic concurrency.
 */
export async function startFinal(
  sessionId: string,
  version: number
): Promise<ActionResult> {
  try {
    await updateSessionStateOptimistic(sessionId, version, {
      roundNumber: 3,
      status: "FINAL_WAGER",
      activeClueId: null,
    });

    return { success: true, data: undefined };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to start final jeopardy.",
    };
  }
}

/**
 * Sets final jeopardy wagers for all players. Validates each wager
 * (min 0, max = player's current score; players with score <= 0 must wager 0).
 * Sets status to FINAL_ANSWER. Stores wagers in dailyDoubleJson (reused field).
 * Uses optimistic concurrency.
 */
export async function setFinalWagers(
  sessionId: string,
  wagers: { playerOrder: number; wager: number }[],
  version: number
): Promise<ActionResult> {
  try {
    // Load all players for validation
    const players = await prisma.sessionPlayer.findMany({
      where: { sessionId },
      select: { order: true, score: true },
    });
    if (players.length === 0) {
      return { success: false, error: "No players found in session." };
    }

    const playerMap = new Map(players.map((p) => [p.order, p]));

    // Validate each wager
    for (const w of wagers) {
      const player = playerMap.get(w.playerOrder);
      if (!player) {
        return {
          success: false,
          error: `Player with order ${w.playerOrder} not found.`,
        };
      }

      if (player.score <= 0) {
        if (w.wager !== 0) {
          return {
            success: false,
            error: `Player ${w.playerOrder} has a score of $${player.score} and must wager $0.`,
          };
        }
      } else {
        if (w.wager < 0) {
          return {
            success: false,
            error: `Wager cannot be negative.`,
          };
        }
        if (w.wager > player.score) {
          return {
            success: false,
            error: `Player ${w.playerOrder} cannot wager more than their score of $${player.score}.`,
          };
        }
      }
    }

    const finalState: FinalWagerState = { wagers };

    await updateSessionStateOptimistic(sessionId, version, {
      status: "FINAL_ANSWER",
      dailyDoubleJson: JSON.stringify(finalState),
    });

    return { success: true, data: undefined };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to set final wagers.",
    };
  }
}

/**
 * Applies final jeopardy results. Reads wagers from dailyDoubleJson, creates
 * ActionLog entries for each player (FINAL_CORRECT/FINAL_INCORRECT), updates
 * cached scores, and sets status to COMPLETE. Transaction + optimistic concurrency.
 */
export async function applyFinalResults(
  sessionId: string,
  results: { playerOrder: number; correct: boolean }[],
  version: number
): Promise<ActionResult> {
  try {
    // Read wagers from state
    const state = await prisma.sessionState.findUnique({
      where: { sessionId },
      select: { dailyDoubleJson: true },
    });
    if (!state) {
      return { success: false, error: "Session state not found." };
    }

    let finalState: FinalWagerState;
    try {
      finalState = JSON.parse(state.dailyDoubleJson) as FinalWagerState;
    } catch {
      return {
        success: false,
        error: "Invalid final wager state.",
      };
    }

    if (!finalState.wagers || finalState.wagers.length === 0) {
      return {
        success: false,
        error: "Final wagers have not been set.",
      };
    }

    // Build a wager lookup by playerOrder
    const wagerMap = new Map(
      finalState.wagers.map((w) => [w.playerOrder, w.wager])
    );

    await prisma.$transaction(async (tx) => {
      // Optimistic concurrency check + set status to COMPLETE
      await updateSessionStateOptimistic(
        sessionId,
        version,
        {
          status: "COMPLETE",
          dailyDoubleJson: "{}",
          activeClueId: null,
        },
        tx
      );

      // Get the next starting sequence
      let sequence = await getNextSequence(sessionId, tx);

      for (const result of results) {
        const wager = wagerMap.get(result.playerOrder) ?? 0;
        const delta = result.correct ? wager : -wager;
        const type = result.correct ? "FINAL_CORRECT" : "FINAL_INCORRECT";

        // Create action log entry (clueId is null for final jeopardy)
        await tx.actionLog.create({
          data: {
            sessionId,
            sequence,
            type,
            playerOrder: result.playerOrder,
            delta,
            clueId: null,
          },
        });

        // Update cached player score
        await tx.sessionPlayer.updateMany({
          where: { sessionId, order: result.playerOrder },
          data: { score: { increment: delta } },
        });

        sequence++;
      }
    });

    return { success: true, data: undefined };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to apply final results.",
    };
  }
}

/**
 * Ends the game immediately. Sets status to COMPLETE.
 * Uses optimistic concurrency.
 */
export async function endGame(
  sessionId: string,
  version: number
): Promise<ActionResult> {
  try {
    await updateSessionStateOptimistic(sessionId, version, {
      status: "COMPLETE",
    });

    return { success: true, data: undefined };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to end game.",
    };
  }
}

/**
 * Undoes the last ActionLog entry. Reverses the cached score on the
 * SessionPlayer. Returns the undone action for UI feedback.
 */
export async function undoLastAction(
  sessionId: string
): Promise<
  ActionResult<{
    type: string;
    playerOrder: number;
    delta: number;
    clueId: string | null;
  }>
> {
  try {
    const result = await prisma.$transaction(async (tx) => {
      // Find the last action log entry
      const lastAction = await tx.actionLog.findFirst({
        where: { sessionId },
        orderBy: { sequence: "desc" },
      });
      if (!lastAction) {
        throw new Error("No actions to undo.");
      }

      // Delete the action log entry
      await tx.actionLog.delete({
        where: { id: lastAction.id },
      });

      // Reverse the cached score on the player
      await tx.sessionPlayer.updateMany({
        where: { sessionId, order: lastAction.playerOrder },
        data: { score: { increment: -lastAction.delta } },
      });

      return {
        type: lastAction.type,
        playerOrder: lastAction.playerOrder,
        delta: lastAction.delta,
        clueId: lastAction.clueId,
      };
    });

    return { success: true, data: result };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to undo last action.",
    };
  }
}

/**
 * Manually adjusts a player's score by a given delta (e.g. +100 or -100).
 * Creates an ActionLog entry for undo support.
 */
export async function adjustScore(
  sessionId: string,
  playerOrder: number,
  delta: number
): Promise<ActionResult> {
  try {
    if (delta === 0) {
      return { success: false, error: "Delta must be non-zero." };
    }

    const player = await prisma.sessionPlayer.findUnique({
      where: { sessionId_order: { sessionId, order: playerOrder } },
      select: { order: true },
    });
    if (!player) {
      return { success: false, error: "Player not found." };
    }

    await prisma.$transaction(async (tx) => {
      const sequence = await getNextSequence(sessionId, tx);
      await tx.actionLog.create({
        data: {
          sessionId,
          sequence,
          type: delta > 0 ? "MANUAL_ADD" : "MANUAL_SUBTRACT",
          playerOrder,
          delta,
          clueId: null,
        },
      });

      await tx.sessionPlayer.updateMany({
        where: { sessionId, order: playerOrder },
        data: { score: { increment: delta } },
      });
    });

    return { success: true, data: undefined };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to adjust score.",
    };
  }
}

// ─── Exported helpers (for use in other server code if needed) ──

export { getNextSequence, getHighestBoardValue, getPlayerScores };
