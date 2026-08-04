import { NextRequest, NextResponse } from "next/server";
import { insertRegistrationSchema } from "@workspace/db";

export async function POST(request: NextRequest) {
 try {
 const body = await request.json();
 const parsed = insertRegistrationSchema.safeParse(body);

 if (!parsed.success) {
 return NextResponse.json({ error: parsed.error }, { status: 400 });
 }

 const { 
 student_name, 
 branch, 
 grade, 
 gender, 
 national_id, 
 birth_date, 
 mother_name, 
 mother_phone, 
 guardian_name, 
 guardian_phone 
 } = parsed.data;

 const message = `طلب تسجيل جديد:
اسم الطالب: ${student_name}
الفرع: ${branch}
الصف: ${grade}
الجنس: ${gender}
الرقم الوطني: ${national_id}
تاريخ الميلاد: ${birth_date}
اسم الأم: ${mother_name}
هاتف الأم: ${mother_phone}
ولي الأمر: ${guardian_name}
هاتف ولي الأمر: ${guardian_phone}`;

 const whatsappNumber = "218915463080";
 const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

 return NextResponse.redirect(whatsappUrl);
 } catch (error) {
 return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
 }
}
