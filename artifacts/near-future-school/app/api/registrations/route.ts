import { NextRequest, NextResponse } from "next/server";
import { db, registrationsTable, insertRegistrationSchema } from "@/lib/db";
import { desc } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = insertRegistrationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "بيانات غير صحيحة", details: parsed.error.issues },
        { status: 400 }
      );
    }
    const [row] = await db
      .insert(registrationsTable)
      .values(parsed.data)
      .returning();
    return NextResponse.json(row, { status: 201 });
  } catch {
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const rows = await db
      .select()
      .from(registrationsTable)
      .orderBy(desc(registrationsTable.createdAt));
    return NextResponse.json(rows);
  } catch {
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}
