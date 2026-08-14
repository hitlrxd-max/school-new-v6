import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

// POST /api/admin/reports/[id]/grades — save grades for a student report
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; // student id
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { scores, activity_scores, behavior, total_score, total_max, result_label } = body;

  const admin = await createAdminClient();

  // Find the report for this student
  const { data: student } = await admin.from("students").select("id, academic_year").eq("id", id).single();
  if (!student) return NextResponse.json({ error: "Student not found" }, { status: 404 });

  const { data: report, error: findErr } = await admin
    .from("student_reports")
    .select("id")
    .eq("student_id", id)
    .eq("academic_year", student.academic_year)
    .single();

  if (findErr || !report) return NextResponse.json({ error: "Report not found" }, { status: 404 });

  const { data, error } = await admin
    .from("student_reports")
    .update({
      scores: scores ?? {},
      activity_scores: activity_scores ?? {},
      behavior: behavior ?? {},
      total_score: total_score ?? null,
      total_max: total_max ?? null,
      result_label: result_label ?? "",
    })
    .eq("id", report.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
