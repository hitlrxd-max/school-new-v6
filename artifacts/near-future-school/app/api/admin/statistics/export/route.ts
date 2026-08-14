import { createAdminClient, createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { GRADE_LABELS } from "@/lib/report-templates";

const SCORE_BUCKETS = [
  { min: 0,  max: 49,  label: "أقل من 50" },
  { min: 50, max: 59,  label: "50 – 59" },
  { min: 60, max: 69,  label: "60 – 69" },
  { min: 70, max: 79,  label: "70 – 79" },
  { min: 80, max: 89,  label: "80 – 89" },
  { min: 90, max: 100, label: "90 – 100" },
];

function classify(report: { result_label: string | null }) {
  const label = report.result_label ?? "";
  if (label.includes("ناجح")) return "passed";
  if (label === "راسب") return "failed";
  if (label) return "other";
  return "unlabeled";
}

export async function GET(req: NextRequest) {
  // Auth check
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = req.nextUrl;
  const gradeFilter = searchParams.get("grade") ?? "";
  const year = searchParams.get("year") ?? "2025-2026";

  const admin = await createAdminClient();

  let q = admin
    .from("students")
    .select(`id, grade, student_reports!student_reports_student_id_fkey (status, total_score, total_max, result_label, academic_year)`)
    .eq("academic_year", year)
    .eq("student_reports.academic_year", year);

  if (gradeFilter) q = q.eq("grade", parseInt(gradeFilter));

  const { data: students = [] } = await q;

  const rows = (students ?? []) as Array<{
    id: string;
    grade: number;
    student_reports: Array<{ status: string; total_score: number | null; total_max: number | null; result_label: string | null; academic_year: string }>;
  }>;

  // Each student has at most one report for the selected year (unique constraint).
  // The embedded filter ensures only the matching year's report is returned.
  const withReports = rows.filter((s) => s.student_reports?.length > 0);
  const totalStudents = rows.length;
  const gradedStudents = withReports.length;

  let passed = 0, failed = 0, other = 0;
  let totalScoreSum = 0, scoredCount = 0;
  const distribution = SCORE_BUCKETS.map((b) => ({ ...b, count: 0 }));

  for (const s of withReports) {
    const r = s.student_reports[0];
    const cls = classify(r);
    if (cls === "passed") passed++;
    else if (cls === "failed") failed++;
    else if (cls === "other") other++;

    if (r.total_score != null && r.total_max != null && r.total_max > 0) {
      totalScoreSum += r.total_score;
      scoredCount++;
      const pct = (r.total_score / r.total_max) * 100;
      const bucket = distribution.find((b) => pct >= b.min && pct <= b.max);
      if (bucket) bucket.count++;
    }
  }

  const avgScore = scoredCount > 0 ? totalScoreSum / scoredCount : null;
  const passRate = gradedStudents > 0 ? Math.round((passed / gradedStudents) * 100) : 0;
  const failRate = gradedStudents > 0 ? Math.round((failed / gradedStudents) * 100) : 0;

  const gradeBreakdown = !gradeFilter
    ? Array.from({ length: 12 }, (_, i) => {
        const g = i + 1;
        const gradeStudents = withReports.filter((s) => s.grade === g);
        let gPassed = 0, gFailed = 0, gOther = 0, gSum = 0, gCount = 0;
        for (const s of gradeStudents) {
          const r = s.student_reports[0];
          const cls = classify(r);
          if (cls === "passed") gPassed++;
          else if (cls === "failed") gFailed++;
          else if (cls === "other") gOther++;
          if (r.total_score != null) { gSum += r.total_score; gCount++; }
        }
        return {
          grade: g,
          gradeLabel: GRADE_LABELS[g],
          total: gradeStudents.length,
          passed: gPassed,
          failed: gFailed,
          other: gOther,
          avgScore: gCount > 0 ? gSum / gCount : null,
        };
      }).filter((row) => row.total > 0)
    : [];

  // ── Build workbook ──────────────────────────────────────────────────────────
  const wb = XLSX.utils.book_new();

  // Sheet 1: Summary
  const summaryRows = [
    ["إحصائيات الصف — ملخص عام"],
    [],
    ["العام الدراسي", year],
    ["الصف", gradeFilter ? GRADE_LABELS[parseInt(gradeFilter)] : "جميع الصفوف"],
    [],
    ["البيان", "القيمة"],
    ["إجمالي الطلاب", totalStudents],
    ["الطلاب المكتملة نتائجهم", gradedStudents],
    ["الطلاب الناجحون", passed],
    ["نسبة النجاح (%)", passRate],
    ["الطلاب الراسبون", failed],
    ["نسبة الرسوب (%)", failRate],
    ["غائب / أخرى", other],
    ["متوسط المجموع", avgScore != null ? parseFloat(avgScore.toFixed(2)) : "—"],
    [],
    ["توزيع الدرجات"],
    ["الفئة", "عدد الطلاب"],
    ...distribution.map((b) => [b.label, b.count]),
  ];
  const wsSummary = XLSX.utils.aoa_to_sheet(summaryRows);

  // Column widths for summary
  wsSummary["!cols"] = [{ wch: 30 }, { wch: 20 }];

  // Style the header cell (xlsx community edition has limited styling, we use cell format)
  XLSX.utils.book_append_sheet(wb, wsSummary, "ملخص الإحصائيات");

  // Sheet 2: Grade breakdown (only when no grade filter)
  if (gradeBreakdown.length > 0) {
    const breakdownHeader = [
      "الصف",
      "إجمالي الطلاب",
      "الناجحون",
      "الراسبون",
      "غائب / أخرى",
      "متوسط المجموع",
      "نسبة النجاح (%)",
    ];
    const breakdownData = gradeBreakdown.map((row) => {
      const pr = row.total > 0 ? Math.round((row.passed / row.total) * 100) : 0;
      return [
        row.gradeLabel,
        row.total,
        row.passed,
        row.failed,
        row.other,
        row.avgScore != null ? parseFloat(row.avgScore.toFixed(2)) : "",
        pr,
      ];
    });

    const wsBreakdown = XLSX.utils.aoa_to_sheet([breakdownHeader, ...breakdownData]);
    wsBreakdown["!cols"] = [
      { wch: 18 }, { wch: 14 }, { wch: 12 },
      { wch: 12 }, { wch: 14 }, { wch: 16 }, { wch: 16 },
    ];
    XLSX.utils.book_append_sheet(wb, wsBreakdown, "تفصيل حسب الصف");
  }

  // Generate buffer
  const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

  const gradeLabel = gradeFilter ? `_الصف_${GRADE_LABELS[parseInt(gradeFilter)]}` : "";
  const filename = `إحصائيات${gradeLabel}_${year}.xlsx`;

  return new NextResponse(buf, {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`,
    },
  });
}
