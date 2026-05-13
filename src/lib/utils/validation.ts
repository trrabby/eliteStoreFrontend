import { z } from "zod";

export const passwordSchema = z
  .string()
  .min(6, "Password must be at least 6 characters")
  .max(100, "Password too long");

export const emailSchema = z
  .string()
  .min(1, "Email is required")
  .email("Invalid email format");

export const phoneSchema = z
  .string()
  .regex(/^(\+88)?01[3-9]\d{8}$/, "Invalid Bangladeshi phone number")
  .optional();
