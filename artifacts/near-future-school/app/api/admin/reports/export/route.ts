import { createClient, createAdminClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { GRADE_LABELS } from "@/lib/report-templates";

export const dynamic = "force-dynamic";

function statusLabel(report: any): string {
  if (!report) return "بدون صحيفة";
  if (report.result_blocked) return "محجوبة";
  if (report.status === "published") return "منشورة";
  return "مسودة";
}

export async function GET(req: NextRequest) {
  // Auth check
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  const { searchParams } = req.nextUrl;
  const grade = searchParams.get("grade") ?? "";
  const status = searchParams.get("status") ?? "";
  const search = searchParams.get("search") ?? "";
  const year = searchParams.get("year") ?? "2025-2026";

  const admin = await createAdminClient();

  let q = admin
    .from("students")
    .select(`
      id, full_name, enrollment_number, seat_number, grade, class_section,
      academic_year, gender,
      student_reports!student_reports_student_id_fkey (
        id, status, result_blocked, template_id, updated_at, total_score, total_max, result_label
      )
    `)
    .eq("academic_year", year)
    .order("grade")
    .order("full_name");

  if (grade) q = q.eq("grade", parseInt(grade));
  if (search)
    q = q.or(
      `full_name.ilike.%${search}%,enrollment_number.ilike.%${search}%,seat_number.ilike.%${search}%`
    );

  const { data: students = [], error } = await q;

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Filter by status (same logic as reports page)
  let filtered = students ?? [];
  if (status === "published")
    filtered = filtered.filter(
      (s: any) => (s.student_reports as any[])?.[0]?.status === "published"
    );
  if (status === "draft")
    filtered = filtered.filter((s: any) => {
      const r = (s.student_reports as any[])?.[0];
      return !r || r.status === "draft";
    });
  if (status === "blocked")
    filtered = filtered.filter(
      (s: any) => (s.student_reports as any[])?.[0]?.result_blocked === true
    );

  // Build Excel rows
  const rows = (filtered as any[]).map((s) => {
    const report = (s.student_reports as any[])?.[0];
    const pct =
      report?.total_max && report?.total_score != null
        ? `${Math.round((report.total_score / report.total_max) * 100)}%`
        : "";
    const total =
      report?.total_score != null && report?.total_max
        ? `${report.total_score} / ${report.total_max}`
        : "";

    return {
      الاسم: s.full_name ?? "",
      الصف: GRADE_LABELS[s.grade] ?? s.grade,
      الفصل: s.class_section ?? "",
      "رقم القيد": s.enrollment_number ?? "",
      "رقم الجلوس": s.seat_number ?? "",
      "حالة الصحيفة": statusLabel(report),
      المجموع: total,
      النسبة: pct,
      التقدير: report?.result_label ?? "",
    };
  });

  const ws = XLSX.utils.json_to_sheet(rows);

  // Set column widths
  ws["!cols"] = [
    { wch: 30 }, // الاسم
    { wch: 14 }, // الصف
    { wch: 10 }, // الفصل
    { wch: 14 }, // رقم القيد
    { wch: 14 }, // رقم الجلوس
    { wch: 14 }, // حالة الصحيفة
    { wch: 14 }, // المجموع
    { wch: 10 }, // النسبة
    { wch: 10 }, // التقدير
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "الطلاب");

  const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

  const filename = `students-${year}${grade ? `-grade${grade}` : ""}${status ? `-${status}` : ""}.xlsx`;

  return new NextResponse(buf, {
    status: 200,
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
