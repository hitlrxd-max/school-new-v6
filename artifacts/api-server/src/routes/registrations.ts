import { Router, type IRouter, type Request, type Response } from "express";
// NOTE: We dynamically import the DB module at runtime and cast to `any` so that
// TypeScript doesn't require building the `@workspace/db` project during the
// API server's tsc step on CI (this avoids project-reference / emit errors).
// At runtime (production) the import will resolve to the workspace package.

const router: IRouter = Router();

router.post("/registrations", async (req: Request, res: Response) => {
  try {
    const dbModule: any = await import("@workspace/db");
    const { db, insertRegistrationSchema, registrationsTable } = dbModule;

    const parsed = insertRegistrationSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "بيانات غير صحيحة", details: parsed.error.issues });
      return;
    }

    const [row] = await db.insert(registrationsTable).values(parsed.data).returning();
    res.status(201).json(row);
  } catch (err: any) {
    // Log and return a generic error response. We avoid referencing a logger
    // here to keep this file low-dependency and resilient during build/runtime.
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

router.get("/registrations", async (_req: Request, res: Response) => {
  try {
    const dbModule: any = await import("@workspace/db");
    const { db, registrationsTable } = dbModule;
    // Import `desc` dynamically and cast to any to avoid compile-time project ref issues
    const drizzle: any = await import("drizzle-orm");
    const rows = await db.select().from(registrationsTable).orderBy(drizzle.desc(registrationsTable.createdAt));
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

export default router;
