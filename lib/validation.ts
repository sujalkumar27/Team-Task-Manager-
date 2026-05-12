import { z } from "zod";

const emailField = z
  .email({ error: "Please enter a valid email address" })
  .max(255)
  .transform((v) => v.toLowerCase().trim());

export const signupSchema = z.object({
  email: emailField,
  password: z.string().min(8, "Password must be at least 8 characters").max(100),
  name: z.string().trim().min(1, "Name is required").max(80),
});

export const loginSchema = z.object({
  email: emailField,
  password: z.string().min(1, "Password is required").max(100),
});

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .nullable()
    .transform((v) => (v === "" || v == null ? null : v));

export const projectCreateSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  description: optionalText(500),
});

export const projectUpdateSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  description: optionalText(500),
});

export const memberAddSchema = z.object({
  email: emailField,
  role: z.enum(["ADMIN", "MEMBER"]).default("MEMBER"),
});

export const memberUpdateSchema = z.object({
  role: z.enum(["ADMIN", "MEMBER"]),
});

const optionalDate = z
  .union([z.iso.datetime(), z.literal(""), z.null()])
  .optional()
  .transform((v) => (v === "" || v == null ? null : new Date(v)));

const optionalAssignee = z
  .union([z.string().min(1), z.literal(""), z.null()])
  .optional()
  .transform((v) => (v === "" || v == null ? null : v));

export const taskCreateSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  description: optionalText(2000),
  status: z.enum(["TODO", "IN_PROGRESS", "DONE"]).default("TODO"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).default("MEDIUM"),
  dueDate: optionalDate,
  assigneeId: optionalAssignee,
});

export const taskUpdateSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  description: optionalText(2000),
  status: z.enum(["TODO", "IN_PROGRESS", "DONE"]).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
  dueDate: optionalDate,
  assigneeId: optionalAssignee,
});

export const taskFilterSchema = z.object({
  status: z.enum(["TODO", "IN_PROGRESS", "DONE"]).optional(),
  assignee: z.literal("me").optional(),
  overdue: z
    .union([z.literal("true"), z.literal("false")])
    .optional()
    .transform((v) => v === "true"),
});
