import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const registrationsTable = pgTable("registrations", {
  id: serial("id").primaryKey(),
  branch: text("branch").notNull(),
  studentName: text("student_name").notNull(),
  grade: text("grade").notNull(),
  gender: text("gender").notNull(),
  nationalId: text("national_id").notNull(),
  birthDate: text("birth_date").notNull(),
  motherName: text("mother_name").notNull(),
  motherPhone: text("mother_phone").notNull(),
  guardianName: text("guardian_name").notNull(),
  guardianPhone: text("guardian_phone").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertRegistrationSchema = createInsertSchema(registrationsTable).omit({
  id: true,
  createdAt: true,
});

export type InsertRegistration = z.infer<typeof insertRegistrationSchema>;
export type Registration = typeof registrationsTable.$inferSelect;
