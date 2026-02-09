import { z } from "zod";

// ─── Auth ──────────────────────────────────────────────────────

export const LoginSchema = z.object({
  email: z.string().trim().email("Invalid email address.").max(255),
  password: z.string().min(1, "Password is required."),
});

export const RegisterSchema = z.object({
  email: z.string().trim().email("Invalid email address.").max(255),
  name: z.string().trim().min(1, "Name is required.").max(50).optional(),
  password: z.string().min(8, "Password must be at least 8 characters.").max(128),
});

// ─── Enum replacements ──────────────────────────────────────────

export const VisibilitySchema = z.enum(["PRIVATE", "UNLISTED", "PUBLIC"]);
export type Visibility = z.infer<typeof VisibilitySchema>;

export const GameSourceTypeSchema = z.enum(["USER", "OFFICIAL"]);
export type GameSourceType = z.infer<typeof GameSourceTypeSchema>;

export const SessionStatusSchema = z.enum([
  "BOARD",
  "CLUE_OPEN",
  "DAILY_DOUBLE",
  "FINAL_WAGER",
  "FINAL_ANSWER",
  "COMPLETE",
]);
export type SessionStatus = z.infer<typeof SessionStatusSchema>;

export const ActionTypeSchema = z.enum([
  "CLUE_CORRECT",
  "CLUE_INCORRECT",
  "DAILY_DOUBLE_CORRECT",
  "DAILY_DOUBLE_INCORRECT",
  "FINAL_CORRECT",
  "FINAL_INCORRECT",
]);
export type ActionType = z.infer<typeof ActionTypeSchema>;

// ─── Game structure ─────────────────────────────────────────────

export const GameMetaSchema = z.object({
  title: z.string().trim().min(1).max(100),
  description: z.string().trim().max(500).optional(),
  visibility: VisibilitySchema.default("PRIVATE"),
});

export const CategoryNameSchema = z.string().trim().min(1).max(40);

export const ClueSchema = z.object({
  question: z.string().trim().min(1).max(300),
  answer: z.string().trim().min(1).max(300),
  value: z.number().int().positive(),
  dailyDouble: z.boolean().default(false),
});

export const FinalClueSchema = z.object({
  category: z.string().trim().min(1).max(40),
  question: z.string().trim().min(1).max(300),
  answer: z.string().trim().min(1).max(300),
});

// ─── Play session ───────────────────────────────────────────────

export const PlayerSchema = z.object({
  name: z.string().trim().min(1).max(30),
  order: z.number().int().min(0),
});

export const PlayersSchema = z.array(PlayerSchema).min(2).max(6);

// ─── Wager validation ───────────────────────────────────────────

export const DailyDoubleWagerSchema = z.object({
  playerOrder: z.number().int().min(0),
  wager: z.number().int().min(5), // min $5 per Jeopardy rules
});

export const FinalWagerSchema = z.object({
  playerOrder: z.number().int().min(0),
  wager: z.number().int().min(0),
});

// ─── Import/Export ──────────────────────────────────────────────

export const GameExportSchema = z.object({
  version: z.literal(1),
  title: z.string(),
  description: z.string().optional(),
  rounds: z
    .array(
      z.object({
        number: z.number().int().min(1).max(2),
        categories: z
          .array(
            z.object({
              name: z.string(),
              order: z.number().int(),
              clues: z
                .array(
                  z.object({
                    order: z.number().int(),
                    value: z.number().int().positive(),
                    question: z.string(),
                    answer: z.string(),
                    dailyDouble: z.boolean(),
                  })
                )
                .length(5),
            })
          )
          .length(6),
      })
    )
    .min(1)
    .max(2),
  finalClue: FinalClueSchema.optional(),
});

export type GameExport = z.infer<typeof GameExportSchema>;
