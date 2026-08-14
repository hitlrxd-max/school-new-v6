import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

// POST /api/admin/reports/[id]/publish — toggle publish or block
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; // student id
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { action } = body; // "publish" | "unpublish" | "block" | "unblock"

  const admin = await createAdminClient();

  const { data: student } = await admin
    .from("students")
    .select("id, academic_year")
    .eq("id", id)
    .single();
  if (!student) return NextResponse.json({ error: "Student not found" }, { status: 404 });

  const update: Record<string, unknown> = {};
  if (action === "publish")   { update.status = "published"; }
  if (action === "unpublish") { update.status = "draft"; }
  if (action === "block")     { update.result_blocked = true; }
  if (action === "unblock")   { update.result_blocked = false; }

  const { data, error } = await admin
    .from("student_reports")
    .update(update)
    .eq("student_id", id)
    .eq("academic_year", student.academic_year)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
