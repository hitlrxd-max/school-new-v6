import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { getTemplateForGrade } from "@/lib/report-templates";

// GET /api/admin/reports/bulk?check=n1,n2,n3 — return which enrollment numbers already exist
export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const param = req.nextUrl.searchParams.get("check") ?? "";
  const numbers = param.split(",").map((n) => n.trim()).filter(Boolean);
  if (numbers.length === 0) return NextResponse.json({ duplicates: [] });

  const admin = await createAdminClient();
  const { data, error } = await admin
    .from("students")
    .select("enrollment_number")
    .in("enrollment_number", numbers);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const duplicates = (data ?? [])
    .map((r) => r.enrollment_number)
    .filter(Boolean) as string[];

  return NextResponse.json({ duplicates });
}

interface StudentInput {
  full_name: string;
  enrollment_number?: string;
  seat_number?: string;
  grade: number | string;
  class_section?: string;
  academic_year: string;
  gender?: string;
}

/**
 * POST /api/admin/reports/bulk — import multiple students at once.
 *
 * Body: { students, mode?: "insert" | "skip" | "upsert" }
 *
 * Duplicate handling (server-authoritative — the server re-checks the DB itself):
 *   mode="insert" (default): if any enrollment_number already exists in the DB,
 *     return HTTP 409 with { conflict: true, duplicates: string[] } so the client
 *     can ask the user how to proceed.
 *   mode="skip":  students whose enrollment_number already exists are silently skipped.
 *   mode="upsert": existing students are updated in-place (only fields present in
 *     the import file are changed; fields like `notes` that come from the admin UI
 *     are left untouched).
 */
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const {
    students,
    mode = "insert",
    suppliedFields = [],
  } = body as {
    students: StudentInput[];
    mode?: "insert" | "skip" | "upsert";
    /** Field names that were actually present as columns in the uploaded file */
    suppliedFields?: string[];
  };

  // Build a set for O(1) lookup
  const suppliedSet = new Set<string>(suppliedFields);

  if (!Array.isArray(students) || students.length === 0) {
    return NextResponse.json({ error: "قائمة الطلاب فارغة" }, { status: 400 });
  }

  if (students.length > 500) {
    return NextResponse.json({ error: "الحد الأقصى للاستيراد 500 طالب في المرة الواحدة" }, { status: 400 });
  }

  const admin = await createAdminClient();

  // ── Server-authoritative duplicate detection ──────────────────────────────
  // Collect enrollment numbers that are present in this batch
  const batchNumbers = students
    .map((s) => s.enrollment_number?.trim())
    .filter((n): n is string => Boolean(n));

  // Build a server-side set of which ones already exist in the DB
  const serverDbDuplicates = new Set<string>();
  if (batchNumbers.length > 0) {
    const { data: existing, error: chkErr } = await admin
      .from("students")
      .select("enrollment_number")
      .in("enrollment_number", batchNumbers);

    if (chkErr) {
      return NextResponse.json({ error: "فشل التحقق من التكرارات: " + chkErr.message }, { status: 500 });
    }
    for (const row of existing ?? []) {
      if (row.enrollment_number) serverDbDuplicates.add(row.enrollment_number);
    }
  }

  // In "insert" mode, if there are server-detected duplicates, reject and let
  // the client decide how to handle them.
  if (mode === "insert" && serverDbDuplicates.size > 0) {
    return NextResponse.json(
      { conflict: true, duplicates: [...serverDbDuplicates] },
      { status: 409 }
    );
  }

  // ── Per-row processing ────────────────────────────────────────────────────
  const results: Array<{
    index: number;
    full_name: string;
    success: boolean;
    error?: string;
    student_id?: string;
  }> = [];

  for (let i = 0; i < students.length; i++) {
    const s = students[i];
    const full_name = s.full_name?.trim();
    const grade = parseInt(String(s.grade));
    const enrollmentNum = s.enrollment_number?.trim() || null;
    const isDbDuplicate = enrollmentNum ? serverDbDuplicates.has(enrollmentNum) : false;

    // Basic validation
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

    // Skip mode: omit students that already exist
    if (mode === "skip" && isDbDuplicate) {
      results.push({ index: i, full_name, success: false, error: "تم تخطيه (موجود مسبقاً)" });
      continue;
    }

    // Upsert mode: update existing student — only fields from the import file;
    // never overwrite fields like `notes` that are managed elsewhere.
    if (mode === "upsert" && isDbDuplicate && enrollmentNum) {
      const { data: existing, error: findErr } = await admin
        .from("students")
        .select("id")
        .eq("enrollment_number", enrollmentNum)
        .single();

      if (findErr || !existing) {
        results.push({ index: i, full_name, success: false, error: "تعذّر العثور على الطالب للتحديث" });
        continue;
      }

      // Build a partial patch from only the fields that were present as columns
      // in the uploaded file (tracked via `suppliedSet`).  Required fields
      // (full_name, grade) are always updated; optional fields are only touched
      // when the column existed.  Fields managed outside the import flow
      // (notes, enrollment_number) are never overwritten.
      const patch: Record<string, unknown> = { full_name, grade };
      if (suppliedSet.has("seat_number")) patch.seat_number = s.seat_number?.trim() || null;
      if (suppliedSet.has("class_section")) patch.class_section = s.class_section?.trim() || "";
      if (suppliedSet.has("academic_year")) patch.academic_year = s.academic_year;
      if (suppliedSet.has("gender")) patch.gender = s.gender === "male" ? "male" : "female";
      // enrollment_number is the lookup key — never change it
      // notes: always omitted to preserve value set via the admin UI

      const { error: upErr } = await admin
        .from("students")
        .update(patch)
        .eq("id", existing.id);

      if (upErr) {
        results.push({ index: i, full_name, success: false, error: upErr.message });
        continue;
      }

      results.push({ index: i, full_name, success: true, student_id: existing.id });
      continue;
    }

    // Normal insert (new student)
    const { data: student, error: sErr } = await admin
      .from("students")
      .insert({
        full_name,
        enrollment_number: enrollmentNum,
        seat_number: s.seat_number?.trim() || null,
        grade,
        class_section: s.class_section?.trim() || "",
        academic_year: s.academic_year,
        gender: s.gender === "male" ? "male" : "female",
        notes: "",
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

    // Auto-create report for new students
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
      results.push({
        index: i,
        full_name,
        success: false,
        error: `تم إضافة الطالب لكن فشل إنشاء الصحيفة: ${rErr.message}`,
        student_id: student.id,
      });
      continue;
    }

    results.push({ index: i, full_name, success: true, student_id: student.id });
  }

  const added = results.filter((r) => r.success).length;
  const failed = results.filter((r) => !r.success).length;

  return NextResponse.json({ added, failed, results }, { status: 200 });
}
