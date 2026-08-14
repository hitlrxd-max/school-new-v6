import { createAdminClient } from "@/lib/supabase/server";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { BarChart2, Users, CheckCircle2, XCircle, AlertCircle, TrendingUp } from "lucide-react";
import { GRADE_LABELS } from "@/lib/report-templates";
import StatsCharts from "./StatsCharts";

export const metadata = { title: "الإحصائيات — لوحة التحكم" };

const SCORE_BUCKETS = [
  { min: 0,  max: 49,  label: "أقل من 50",  color: "#EF4444" },
  { min: 50, max: 59,  label: "50 – 59",     color: "#F97316" },
  { min: 60, max: 69,  label: "60 – 69",     color: "#F59E0B" },
  { min: 70, max: 79,  label: "70 – 79",     color: "#3B82F6" },
  { min: 80, max: 89,  label: "80 – 89",     color: "#8B5CF6" },
  { min: 90, max: 100, label: "90 – 100",    color: "#10B981" },
];

export default async function StatisticsPage({
  searchParams,
}: {
  searchParams: Promise<{ grade?: string; year?: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const sp = await searchParams;
  const gradeFilter = sp.grade ?? "";
  const year = sp.year ?? "2025-2026";

  const admin = await createAdminClient();

  // Fetch students with their reports
  let q = admin
    .from("students")
    .select(`
      id, grade,
      student_reports!student_reports_student_id_fkey (
        status, total_score, total_max, result_label
      )
    `)
    .eq("academic_year", year);

  if (gradeFilter) q = q.eq("grade", parseInt(gradeFilter));

  const { data: students = [] } = await q;

  // Compute aggregate stats
  const rows = (students ?? []) as Array<{
    id: string;
    grade: number;
    student_reports: Array<{ status: string; total_score: number | null; total_max: number | null; result_label: string | null }>;
  }>;

  // Only students that have a report (with grades entered)
  const withReports = rows.filter((s) => s.student_reports?.[0]);
  const allStudents = rows;

  function classify(report: { result_label: string | null; total_score: number | null }) {
    const label = report.result_label ?? "";
    if (label.includes("ناجح")) return "passed";
    if (label === "راسب") return "failed";
    if (label) return "other"; // غائب or other label
    // No label yet — skip from pass/fail counts
    return "unlabeled";
  }

  const totalStudents = allStudents.length;
  const gradedStudents = withReports.length;

  let passed = 0, failed = 0, other = 0;
  let totalScoreSum = 0;
  let scoredCount = 0;

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

      // Percentage score for bucketing
      const pct = (r.total_score / r.total_max) * 100;
      const bucket = distribution.find((b) => pct >= b.min && pct <= b.max);
      if (bucket) bucket.count++;
    }
  }

  const avgScore = scoredCount > 0 ? totalScoreSum / scoredCount : null;

  // Per-grade breakdown (only when no grade filter)
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

  const passRate = gradedStudents > 0 ? Math.round((passed / gradedStudents) * 100) : 0;

  return (
    <div dir="rtl" className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BarChart2 className="w-7 h-7 text-blue-600" />
            إحصائيات الصف
          </h1>
          <p className="text-gray-500 text-sm mt-1">نظرة شاملة على أداء الطلاب وتوزيع النتائج</p>
        </div>

        {/* Filters */}
        <form className="flex flex-wrap gap-3 items-center">
          <select
            name="grade"
            defaultValue={gradeFilter}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="">كل الصفوف</option>
            {Array.from({ length: 12 }, (_, i) => i + 1).map((g) => (
              <option key={g} value={g}>{GRADE_LABELS[g]}</option>
            ))}
          </select>
          <select
            name="year"
            defaultValue={year}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="2025-2026">2025-2026</option>
            <option value="2024-2025">2024-2025</option>
          </select>
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition"
          >
            عرض
          </button>
          <a
            href="/admin/statistics"
            className="border border-gray-200 text-gray-600 px-4 py-2 rounded-xl text-sm hover:bg-gray-50 transition"
          >
            إعادة ضبط
          </a>
        </form>
      </div>

      {/* Context label */}
      <div className="text-sm text-gray-500">
        <span className="font-medium text-gray-700">
          {gradeFilter ? GRADE_LABELS[parseInt(gradeFilter)] : "جميع الصفوف"}
        </span>
        {" — العام الدراسي "}
        <span className="font-medium text-gray-700">{year}</span>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {[
          {
            label: "إجمالي الطلاب",
            value: totalStudents,
            sub: `${gradedStudents} مكتملة`,
            icon: <Users className="w-5 h-5" />,
            color: "#1FA0FF",
            bg: "#EBF6FF",
          },
          {
            label: "الطلاب الناجحون",
            value: passed,
            sub: gradedStudents > 0 ? `${passRate}% نسبة النجاح` : "—",
            icon: <CheckCircle2 className="w-5 h-5" />,
            color: "#10B981",
            bg: "#ECFDF5",
          },
          {
            label: "الطلاب الراسبون",
            value: failed,
            sub: gradedStudents > 0 ? `${gradedStudents > 0 ? Math.round((failed / gradedStudents) * 100) : 0}% نسبة الرسوب` : "—",
            icon: <XCircle className="w-5 h-5" />,
            color: "#EF4444",
            bg: "#FEF2F2",
          },
          {
            label: "غائب / أخرى",
            value: other,
            sub: "لم يُحدَّد بعد",
            icon: <AlertCircle className="w-5 h-5" />,
            color: "#F59E0B",
            bg: "#FFFBEB",
          },
          {
            label: "متوسط المجموع",
            value: avgScore != null ? avgScore.toFixed(1) : "—",
            sub: scoredCount > 0 ? `من ${scoredCount} طالب` : "لا توجد درجات",
            icon: <TrendingUp className="w-5 h-5" />,
            color: "#8B5CF6",
            bg: "#F5F3FF",
          },
        ].map((card) => (
          <div
            key={card.label}
            className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
              style={{ backgroundColor: card.bg, color: card.color }}
            >
              {card.icon}
            </div>
            <div className="text-2xl font-bold text-gray-900">{card.value}</div>
            <div className="text-xs font-medium text-gray-500 mt-0.5">{card.label}</div>
            <div className="text-xs text-gray-400 mt-1">{card.sub}</div>
          </div>
        ))}
      </div>

      {/* Pass rate bar */}
      {gradedStudents > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-gray-700">توزيع النتائج العامة</span>
            <span className="text-xs text-gray-400">{gradedStudents} طالب بنتائج مكتملة</span>
          </div>
          <div className="h-5 bg-gray-100 rounded-full overflow-hidden flex">
            {passed > 0 && (
              <div
                className="h-full bg-green-500 flex items-center justify-center text-white text-xs font-bold transition-all"
                style={{ width: `${(passed / gradedStudents) * 100}%` }}
                title={`ناجح: ${passed}`}
              >
                {passed > 2 && `${Math.round((passed / gradedStudents) * 100)}%`}
              </div>
            )}
            {failed > 0 && (
              <div
                className="h-full bg-red-400 flex items-center justify-center text-white text-xs font-bold transition-all"
                style={{ width: `${(failed / gradedStudents) * 100}%` }}
                title={`راسب: ${failed}`}
              >
                {failed > 2 && `${Math.round((failed / gradedStudents) * 100)}%`}
              </div>
            )}
            {other > 0 && (
              <div
                className="h-full bg-amber-400"
                style={{ width: `${(other / gradedStudents) * 100}%` }}
                title={`أخرى: ${other}`}
              />
            )}
          </div>
          <div className="flex items-center gap-5 mt-3 text-xs text-gray-500">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-green-500 inline-block" /> ناجح ({passed})</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-red-400 inline-block" /> راسب ({failed})</span>
            {other > 0 && <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-amber-400 inline-block" /> أخرى ({other})</span>}
          </div>
        </div>
      )}

      {/* Charts and breakdown (client) */}
      <StatsCharts
        distribution={distribution.map((b) => ({ label: b.label, count: b.count, color: b.color }))}
        gradeBreakdown={gradeBreakdown}
        showBreakdown={!gradeFilter}
      />

      {/* Empty state */}
      {totalStudents === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center text-gray-400">
          <BarChart2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-lg">لا توجد بيانات</p>
          <p className="text-sm mt-1">لا يوجد طلاب مسجلون لهذا الصف والعام الدراسي</p>
        </div>
      )}
    </div>
  );
}
