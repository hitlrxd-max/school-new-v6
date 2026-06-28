import { Router, type IRouter } from "express";
import { db, insertRegistrationSchema, registrationsTable } from "@workspace/db";
import { desc } from "drizzle-orm";

const router: IRouter = Router();

router.post("/registrations", async (req, res) => {
  const parsed = insertRegistrationSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "بيانات غير صحيحة", details: parsed.error.issues });
    return;
  }
  const [row] = await db.insert(registrationsTable).values(parsed.data).returning();
  res.status(201).json(row);
});

router.get("/registrations", async (req, res) => {
  const rows = await db.select().from(registrationsTable).orderBy(desc(registrationsTable.createdAt));
  res.json(rows);
});

export default router;
