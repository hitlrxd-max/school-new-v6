import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const insertRegistrationSchema = z.object({
  student_name: z.string().min(1),
  branch: z.string().min(1),
  grade: z.string().min(1),
  gender: z.string().min(1),
  national_id: z.string().optional(),
  birth_date: z.string().optional(),
  mother_name: z.string().optional(),
  mother_phone: z.string().optional(),
  guardian_name: z.string().optional(),
  guardian_phone: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = insertRegistrationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    const {
      student_name, branch, grade, gender,
      national_id, birth_date, mother_name,
      mother_phone, guardian_name, guardian_phone,
    } = parsed.data;

    const message = `طلب تسجيل جديد:
اسم الطالب: ${student_name}
الفرع: ${branch}
الصف: ${grade}
الجنس: ${gender}
الرقم الوطني: ${national_id ?? "—"}
تاريخ الميلاد: ${birth_date ?? "—"}
اسم الأم: ${mother_name ?? "—"}
هاتف الأم: ${mother_phone ?? "—"}
ولي الأمر: ${guardian_name ?? "—"}
هاتف ولي الأمر: ${guardian_phone ?? "—"}`;

    const whatsappNumber = "218915463080";
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

    return NextResponse.redirect(whatsappUrl);
  } catch {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
