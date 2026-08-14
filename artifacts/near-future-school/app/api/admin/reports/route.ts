import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { getTemplateForGrade } from "@/lib/report-templates";

// GET /api/admin/reports — list students with their report status
export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const grade = searchParams.get("grade");
  const year = searchParams.get("year") ?? "2025-2026";
  const search = searchParams.get("search") ?? "";
  const status = searchParams.get("status");

  const admin = await createAdminClient();

  let query = admin
    .from("students")
    .select(`
      id, full_name, enrollment_number, seat_number, grade, class_section,
      academic_year, gender,
      student_reports!student_reports_student_id_fkey (
        id, status, result_blocked, template_id, updated_at, total_score, total_max, result_label
      )
    `)
    .eq("academic_year", year)
    .order("grade", { ascending: true })
    .order("full_name", { ascending: true });

  if (grade) query = query.eq("grade", parseInt(grade));
  if (search) {
    query = query.or(
      `full_name.ilike.%${search}%,enrollment_number.ilike.%${search}%,seat_number.ilike.%${search}%`
    );
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Filter by status if requested
  let result = data ?? [];
  if (status) {
    result = result.filter((s: any) => {
      const report = (s.student_reports as any[])?.[0];
      if (status === "draft") return !report || report.status === "draft";
      if (status === "published") return report?.status === "published";
      if (status === "blocked") return report?.result_blocked === true;
      return true;
    });
  }

  return NextResponse.json(result);
}

// POST /api/admin/reports — create new student (+ auto-create report)
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const {
    full_name, enrollment_number, seat_number, grade,
    class_section, academic_year, gender, notes
  } = body;

  if (!full_name || !grade || !academic_year) {
    return NextResponse.json({ error: "الاسم والصف والسنة الدراسية مطلوبة" }, { status: 400 });
  }

  const admin = await createAdminClient();

  // Insert student
  const { data: student, error: sErr } = await admin
    .from("students")
    .insert({
      full_name: full_name.trim(),
      enrollment_number: enrollment_number?.trim() || null,
      seat_number: seat_number?.trim() || null,
      grade: parseInt(grade),
      class_section: class_section?.trim() || "",
      academic_year,
      gender: gender || "female",
      notes: notes?.trim() || "",
    })
    .select()
    .single();

  if (sErr) {
    if (sErr.code === "23505")
      return NextResponse.json({ error: "رقم القيد أو رقم الجلوس مستخدم مسبقاً" }, { status: 409 });
    return NextResponse.json({ error: sErr.message }, { status: 500 });
  }

  // Auto-create report with matching template
  const template = getTemplateForGrade(parseInt(grade));
  const { data: report, error: rErr } = await admin
    .from("student_reports")
    .insert({
      student_id: student.id,
      template_id: template.id,
      academic_year,
      status: "draft",
      scores: {},
      activity_scores: {},
      behavior: {},
    })
    .select()
    .single();

  if (rErr) return NextResponse.json({ error: rErr.message }, { status: 500 });

  return NextResponse.json({ student, report }, { status: 201 });
}
