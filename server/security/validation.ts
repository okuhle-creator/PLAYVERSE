import { z } from 'zod';

// Disallow control characters, angle brackets, and markup in alias
const ALIAS_REGEX = /^[a-zA-Z0-9_\-. ]{2,16}$/;

export const CreateGameSchema = z.object({
  difficulty: z.enum(['easy', 'normal', 'hard']).default('normal'),
  challengeType: z.enum(['standard', 'daily']).default('standard'),
  challengeDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()
});

export const SubmitAnswerSchema = z.object({
  eventId: z.string().min(1).max(64)
});

export const SubmitLeaderboardSchema = z.object({
  gameId: z.string().min(1).max(64),
  alias: z
    .string()
    .trim()
    .min(2, 'Alias must be at least 2 characters')
    .max(16, 'Alias must not exceed 16 characters')
    .regex(ALIAS_REGEX, 'Alias contains invalid characters (letters, numbers, space, dot, underscore, dash only)')
    // Prevent script or html injection
    .refine((val) => !/[<>&"']/.test(val), {
      message: 'HTML or markup characters are not allowed'
    })
});

export type CreateGameInput = z.infer<typeof CreateGameSchema>;
export type SubmitAnswerInput = z.infer<typeof SubmitAnswerSchema>;
export type SubmitLeaderboardInput = z.infer<typeof SubmitLeaderboardSchema>;
