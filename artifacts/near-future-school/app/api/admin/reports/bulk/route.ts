import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { getTemplateForGrade } from "@/lib/report-templates";

interface StudentInput {
  full_name: string;
  enrollment_number?: string;
  seat_number?: string;
  grade: number | string;
  class_section?: string;
  academic_year: string;
  gender?: string;
  notes?: string;
}

// POST /api/admin/reports/bulk — import multiple students at once
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { students } = body as { students: StudentInput[] };

  if (!Array.isArray(students) || students.length === 0) {
    return NextResponse.json({ error: "قائمة الطلاب فارغة" }, { status: 400 });
  }

  if (students.length > 500) {
    return NextResponse.json({ error: "الحد الأقصى للاستيراد 500 طالب في المرة الواحدة" }, { status: 400 });
  }

  const admin = await createAdminClient();

  const results: Array<{
    index: number;
    full_name: string;
    success: boolean;
    error?: string;
    student_id?: string;
  }> = [];

  // Process students one by one to capture per-row errors
  for (let i = 0; i < students.length; i++) {
    const s = students[i];
    const full_name = s.full_name?.trim();
    const grade = parseInt(String(s.grade));

    if (!full_name) {
      results.push({ index: i, full_name: s.full_name || `صف ${i + 1}`, success: false, error: "الاسم مطلوب" });
      continue;
    }
    if (!grade || grade < 1 || grade > 12) {
      results.push({ index: i, full_name, success: false, error: "رقم الصف غير صحيح (1-12)" });
      continue;
    }
    if (!s.academic_year) {
      results.push({ index: i, full_name, success: false, error: "السنة الدراسية مطلوبة" });
      continue;
    }

    // Insert student
    const { data: student, error: sErr } = await admin
      .from("students")
      .insert({
        full_name,
        enrollment_number: s.enrollment_number?.trim() || null,
        seat_number: s.seat_number?.trim() || null,
        grade,
        class_section: s.class_section?.trim() || "",
        academic_year: s.academic_year,
        gender: s.gender === "male" ? "male" : "female",
        notes: s.notes?.trim() || "",
      })
      .select("id")
      .single();

    if (sErr) {
      const errMsg = sErr.code === "23505"
        ? "رقم القيد أو رقم الجلوس مستخدم مسبقاً"
        : sErr.message;
      results.push({ index: i, full_name, success: false, error: errMsg });
      continue;
    }

    // Auto-create report
    const template = getTemplateForGrade(grade);
    const { error: rErr } = await admin
      .from("student_reports")
      .insert({
        student_id: student.id,
        template_id: template.id,
        academic_year: s.academic_year,
        status: "draft",
        scores: {},
        activity_scores: {},
        behavior: {},
      });

    if (rErr) {
      // Student was inserted but report failed — record partial success
      results.push({ index: i, full_name, success: false, error: `تم إضافة الطالب لكن فشل إنشاء الصحيفة: ${rErr.message}`, student_id: student.id });
      continue;
    }

    results.push({ index: i, full_name, success: true, student_id: student.id });
  }

  const added = results.filter((r) => r.success).length;
  const failed = results.filter((r) => !r.success).length;

  return NextResponse.json({ added, failed, results }, { status: 200 });
}
