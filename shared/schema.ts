import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const scans = pgTable("scans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: text("session_id").notNull(),
  scanType: text("scan_type").notNull().default("initial"),
  intake: jsonb("intake").notNull(),
  medgemmaRaw: jsonb("medgemma_raw"),
  experiment: jsonb("experiment"),
  confidence: integer("confidence"),
  resultCard: jsonb("result_card"),
  parseMethod: text("parse_method"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertScanSchema = createInsertSchema(scans).omit({
  id: true,
  createdAt: true,
});

export type InsertScan = z.infer<typeof insertScanSchema>;
export type Scan = typeof scans.$inferSelect;

export const intakeFormSchema = z.object({
  age: z.number().min(12).max(19),
  biological_sex: z.enum(["male", "female", "prefer_not_to_say"]),
  concern_zones: z.array(z.string()).min(1),
  duration_weeks: z.number(),
  is_itchy: z.boolean(),
  is_painful: z.boolean(),
  is_uniform_size: z.boolean(),
  plays_sport_sweats: z.boolean(),
  wears_daily_makeup: z.boolean(),
  stress_level: z.number().min(1).max(3),
  uses_oily_hair_products: z.boolean(),
  tried_before: z.array(z.string()),
  antibiotic_cream_no_improvement: z.boolean(),
  family_acne_history: z.enum(["none", "mild", "moderate", "severe"]),
  tracks_cycle: z.boolean().optional(),
  cycle_stage: z.enum(["period", "week2", "premenstrual", "unsure"]).nullable().optional(),
  acne_worsens_before_period: z.boolean().nullable().optional(),
  other_changes_this_week: z.string().nullable().optional(),
});

export type IntakeForm = z.infer<typeof intakeFormSchema>;

export interface MedGemmaResponse {
  skin_tone: string;
  pattern: string;
  severity: string;
  zones: string[];
  confidence: string;
  flags: string[];
  message: string;
  hypothesis: string;
  see_doctor: boolean;
  _method?: string;
}

export interface ExperimentPlan {
  type: string;
  title: string;
  hypothesis: string;
  explanation?: string;
  experiment_question?: string;
  duration_days: number | null;
  purge_warning?: boolean;
  purge_message?: string;
  products: Array<{
    step: string;
    name: string;
    instruction: string;
    budget: string;
  }>;
  avoid?: string[];
  routine_tips?: string[];
  check_in_prompt?: string;
  skin_tone_note?: string;
  note?: string;
  see_doctor: boolean;
  message?: string;
  experiment_valid?: boolean;
}

export interface ResultCard {
  title: string;
  confidence_percent: number;
  confidence_label: string;
  what_we_see: string;
  disclaimer: string;
  image_warning?: string;
  hypothesis: string;
  explanation?: string;
  experiment_question?: string;
  duration_days: number | null;
  check_in_date: string | null;
  purge_warning?: string;
  products: ExperimentPlan["products"];
  avoid?: string[];
  tips?: string[];
  skin_tone_note?: string;
  check_in_prompt?: string;
  see_doctor: boolean;
  doctor_message?: string;
}
