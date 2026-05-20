import { z } from "zod";

export const roleSchema = z.enum([
  "admin",
  "agent",
  "case_manager",
  "accountant",
]);

export const registerSchema = z.object({
  fullName: z.string().min(2).max(120),
  email: z.string().email(),
  password: z.string().min(8).max(128),
  phone: z.string().min(6).max(30).optional(),
  role: roleSchema.optional().default("agent"),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
});
