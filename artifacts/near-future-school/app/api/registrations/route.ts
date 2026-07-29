import { NextRequest, NextResponse } from "next/server";
import { db, registrationsTable, insertRegistrationSchema } from "@workspace/db";
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

    // 1. إدخال البيانات في قاعدة البيانات
    const [row] = await db
      .insert(registrationsTable)
      .values(parsed.data)
      .returning();

    // 2. رقم الواتساب ورابط التحويل
    const whatsappNumber = "218915463080"; 
    const message = "مرحباً، أود إتمام إجراءات التسجيل."; 
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

    // 3. إرجاع البيانات ورابط التحويل
    return NextResponse.json(
      { row, redirectUrl: whatsappUrl }, 
      { status: 201 }
    );
    
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "حدث خطأ في الخادم" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const rows = await db
      .select()
      .from(registrationsTable)
      .orderBy(desc(registrationsTable.createdAt));

    return NextResponse.json(rows);
  } catch (error) {
    console.error("Fetch error:", error);
    return NextResponse.json({ error: "حدث خطأ في جلب البيانات" }, { status: 500 });
  }
} 
