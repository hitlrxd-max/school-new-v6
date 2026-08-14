import { createAdminClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { GraduationCap, ArrowRight } from "lucide-react";
import { getTemplateById, GRADE_LABELS, calcPeriodMax, calcExamMax, calcTotalMax, calcTotalMin } from "@/lib/report-templates";
import PrintButton from "@/app/components/PrintButton";
import DownloadPDFButton from "@/app/components/DownloadPDFButton";
import MobileNavSidebar from "@/app/components/MobileNavSidebar";

export const metadata = { title: "صحيفة النتيجة — مدرسة ضياء المستقبل" };

function n(v: any) { const x = parseFloat(v ?? ""); return isNaN(x) ? 0 : x; }

export default async function PublicReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const admin = await createAdminClient();

  // Fetch student
  const { data: student, error } = await admin
    .from("students")
    .select("id, full_name, grade, class_section, enrollment_number, seat_number, academic_year, gender")
    .eq("id", id)
    .single();

  if (error || !student) notFound();

  // Fetch report — ONLY if published and not blocked
  const { data: report } = await admin
    .from("student_reports")
    .select("*")
    .eq("student_id", id)
    .eq("academic_year", student.academic_year)
    .eq("status", "published")
    .eq("result_blocked", false)
    .single();

  if (!report) notFound(); // security: nothing to show

  const template = getTemplateById(report.template_id);
  const scores = report.scores ?? {};
  const activity = report.activity_scores ?? {};
  const behavior = report.behavior ?? {};
  const coreSubjects = template.subjects.filter((s) => !s.isActivity);
  const isPeriods = template.type === "periods3" || template.type === "periods3_dour";
  const isDour = template.type === "periods3_dour";
  const isSecondary = template.type === "semesters_secondary";

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Nav */}
      <nav className="bg-white border-b border-blue-100 sticky top-0 z-10 print:hidden">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-blue-700">
            <GraduationCap className="w-6 h-6" />
            مدرسة ضياء المستقبل
          </Link>
          <div className="flex items-center gap-2">
            <DownloadPDFButton studentName={student.full_name} enrollmentNumber={student.enrollment_number ?? undefined} />
            <PrintButton />
            <Link href="/results" className="hidden sm:flex items-center gap-1 text-sm text-blue-600 hover:underline">
              <ArrowRight className="w-4 h-4" />بحث جديد
            </Link>
            <MobileNavSidebar />
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-2 md:px-4 py-6 md:py-10">
        {/* Report Card */}
        <div id="report-card" className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden print:shadow-none print:border-0">
          {/* Header */}
          <div className="border-b border-gray-100 px-6 py-6 text-center bg-gradient-to-l from-blue-50 to-white print:bg-white print:border-b print:border-gray-400 print:py-3">
            {/* Logo */}
            <div className="flex justify-center mb-3 print:mb-2">
              <img
                src="/school-logo-transparent.png"
                alt="شعار مدرسة ضياء المستقبل"
                className="w-[90px] h-[90px] object-contain print:w-[70px] print:h-[70px]"
              />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 print:text-[16pt]">مدرسة ضياء المستقبل</h1>
            <h2 className="text-lg font-semibold text-blue-600 mt-1 print:text-[12pt] print:text-gray-800">بطاقة تقدير الدرجات</h2>
            <p className="text-sm text-gray-500 mt-0.5 print:text-[9pt]">{template.name}</p>
          </div>

          {/* Student Info */}
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-500 text-xs block">الاسم الكامل</span>
                <span className="font-bold text-gray-900">{student.full_name}</span>
              </div>
              <div>
                <span className="text-gray-500 text-xs block">الصف الدراسي</span>
                <span className="font-semibold">{GRADE_LABELS[student.grade]}{student.class_section ? ` / ${student.class_section}` : ""}</span>
              </div>
              <div>
                <span className="text-gray-500 text-xs block">رقم القيد</span>
                <span className="font-mono font-semibold">{student.enrollment_number || "—"}</span>
              </div>
              <div>
                <span className="text-gray-500 text-xs block">السنة الدراسية</span>
                <span className="font-semibold">{student.academic_year}</span>
              </div>
            </div>
          </div>

          <div className="p-4">
            {/* Periods Table */}
            {isPeriods && (
              <div className="overflow-x-auto">
                <table className="w-full text-xs border-collapse border border-gray-300 min-w-[700px]">
                  <thead className="bg-blue-50">
                    <tr>
                      <th className="border border-gray-300 px-2 py-2 text-right" rowSpan={2}>المواد الدراسية المقررة</th>
                      <th className="border border-gray-300 px-1 py-1 text-center" rowSpan={2}>عدد العجمع</th>
                      <th className="border border-gray-300 px-1 py-1 text-center" colSpan={2}>الفترة الأولى 30%</th>
                      <th className="border border-gray-300 px-1 py-1 text-center" colSpan={2}>الفترة الثانية 30%</th>
                      {isDour
                        ? <th className="border border-gray-300 px-1 py-1 text-center" colSpan={3}>الامتحان النهائي 40%</th>
                        : <th className="border border-gray-300 px-1 py-1 text-center" colSpan={2}>الامتحان النهائي 40%</th>}
                      {isDour
                        ? <th className="border border-gray-300 px-1 py-1 text-center" colSpan={4}>النتيجة النهائية 100%</th>
                        : <th className="border border-gray-300 px-1 py-1 text-center" colSpan={3}>النتيجة النهائية 100%</th>}
                    </tr>
                    <tr className="text-[10px] bg-blue-50">
                      <th className="border border-gray-300 px-1 py-1">الدرجة الكبرى</th>
                      <th className="border border-gray-300 px-1 py-1">درجة التلميذ</th>
                      <th className="border border-gray-300 px-1 py-1">الدرجة الكبرى</th>
                      <th className="border border-gray-300 px-1 py-1">درجة التلميذ</th>
                      <th className="border border-gray-300 px-1 py-1">الدرجة الكبرى</th>
                      {isDour ? (
                        <><th className="border border-gray-300 px-1 py-1">الدور الأول</th>
                        <th className="border border-gray-300 px-1 py-1">الدور الثاني</th></>
                      ) : <th className="border border-gray-300 px-1 py-1">درجة التلميذ</th>}
                      <th className="border border-gray-300 px-1 py-1">الدرجة الكبرى</th>
                      <th className="border border-gray-300 px-1 py-1">الدرجة الصغرى</th>
                      {isDour ? (
                        <><th className="border border-gray-300 px-1 py-1">الدور الأول</th>
                        <th className="border border-gray-300 px-1 py-1">الدور الثاني</th></>
                      ) : <th className="border border-gray-300 px-1 py-1">درجة التلميذ</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {coreSubjects.map((sub) => {
                      const p1 = n(scores[sub.key]?.p1_score);
                      const p2 = n(scores[sub.key]?.p2_score);
                      const d1 = isDour ? n(scores[sub.key]?.dour1_score) : n(scores[sub.key]?.p3_score);
                      const d2 = n(scores[sub.key]?.dour2_score);
                      const fMax = calcTotalMax(sub.hours);
                      const fMin = calcTotalMin(sub.hours);
                      const total1 = p1 + p2 + d1;
                      const total2 = p1 + p2 + d2;
                      const pass = total1 >= fMin;
                      return (
                        <tr key={sub.key} className={pass ? "" : "bg-red-50"}>
                          <td className="border border-gray-300 px-2 py-1.5 font-medium">{sub.name}</td>
                          <td className="border border-gray-300 px-1 py-1 text-center text-gray-500">{sub.hours}</td>
                          <td className="border border-gray-300 px-1 py-1 text-center text-gray-400">{calcPeriodMax(sub.hours)}</td>
                          <td className="border border-gray-300 px-1 py-1 text-center font-semibold">{p1 || "—"}</td>
                          <td className="border border-gray-300 px-1 py-1 text-center text-gray-400">{calcPeriodMax(sub.hours)}</td>
                          <td className="border border-gray-300 px-1 py-1 text-center font-semibold">{p2 || "—"}</td>
                          <td className="border border-gray-300 px-1 py-1 text-center text-gray-400">{calcExamMax(sub.hours)}</td>
                          {isDour ? (
                            <><td className="border border-gray-300 px-1 py-1 text-center font-semibold">{d1 || "—"}</td>
                            <td className="border border-gray-300 px-1 py-1 text-center font-semibold">{d2 || "—"}</td></>
                          ) : (
                            <td className="border border-gray-300 px-1 py-1 text-center font-semibold">{d1 || "—"}</td>
                          )}
                          <td className="border border-gray-300 px-1 py-1 text-center text-gray-400">{fMax}</td>
                          <td className="border border-gray-300 px-1 py-1 text-center text-gray-400">{fMin}</td>
                          {isDour ? (
                            <><td className={`border border-gray-300 px-1 py-1 text-center font-bold ${pass ? "text-blue-700" : "text-red-600"}`}>{total1 || "—"}</td>
                            <td className="border border-gray-300 px-1 py-1 text-center font-bold text-blue-700">{d2 > 0 ? total2 : "—"}</td></>
                          ) : (
                            <td className={`border border-gray-300 px-1 py-1 text-center font-bold ${pass ? "text-blue-700" : "text-red-600"}`}>{total1 || "—"}</td>
                          )}
                        </tr>
                      );
                    })}
                    {/* Total row */}
                    <tr className="bg-gray-50 font-bold text-center text-xs">
                      <td className="border border-gray-300 px-2 py-1 text-right" colSpan={2}>المجموع</td>
                      <td className="border border-gray-300 p-1">{coreSubjects.reduce((s, sub) => s + calcPeriodMax(sub.hours), 0)}</td>
                      <td className="border border-gray-300 p-1 text-blue-700">{coreSubjects.reduce((s, sub) => s + n(scores[sub.key]?.p1_score), 0) || "—"}</td>
                      <td className="border border-gray-300 p-1">{coreSubjects.reduce((s, sub) => s + calcPeriodMax(sub.hours), 0)}</td>
                      <td className="border border-gray-300 p-1 text-blue-700">{coreSubjects.reduce((s, sub) => s + n(scores[sub.key]?.p2_score), 0) || "—"}</td>
                      <td className="border border-gray-300 p-1">{coreSubjects.reduce((s, sub) => s + calcExamMax(sub.hours), 0)}</td>
                      {isDour ? (
                        <><td className="border border-gray-300 p-1 text-blue-700">{coreSubjects.reduce((s, sub) => s + n(scores[sub.key]?.dour1_score), 0) || "—"}</td>
                        <td className="border border-gray-300 p-1 text-blue-700">{coreSubjects.reduce((s, sub) => s + n(scores[sub.key]?.dour2_score), 0) || "—"}</td></>
                      ) : (
                        <td className="border border-gray-300 p-1 text-blue-700">{coreSubjects.reduce((s, sub) => s + n(scores[sub.key]?.p3_score), 0) || "—"}</td>
                      )}
                      <td className="border border-gray-300 p-1">{coreSubjects.reduce((s, sub) => s + calcTotalMax(sub.hours), 0)}</td>
                      <td className="border border-gray-300 p-1">{coreSubjects.reduce((s, sub) => s + calcTotalMin(sub.hours), 0)}</td>
                      {isDour ? (
                        <><td className="border border-gray-300 p-1 text-green-700">{report.total_score || "—"}</td>
                        <td className="border border-gray-300 p-1 text-green-700">—</td></>
                      ) : (
                        <td className="border border-gray-300 p-1 text-green-700">{report.total_score || "—"}</td>
                      )}
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {/* Semesters Table */}
            {!isPeriods && (
              <div className="overflow-x-auto">
                <table className="w-full text-xs border-collapse border border-gray-300 min-w-[800px]">
                  <thead className="bg-blue-50">
                    <tr>
                      <th className="border border-gray-300 px-2 py-2 text-right" rowSpan={2}>المادة الدراسية</th>
                      <th className="border border-gray-300 px-1 py-1 text-center" rowSpan={2}>ح</th>
                      <th className="border border-gray-300 px-1 py-1 text-center" colSpan={2}>الفصل الأول</th>
                      <th className="border border-gray-300 px-1 py-1 text-center" colSpan={2}>الفصل الثاني</th>
                      {isSecondary ? (
                        <><th className="border border-gray-300 px-1 py-1 text-center" rowSpan={2}>مجموع الفصلين</th>
                        <th className="border border-gray-300 px-1 py-1 text-center" rowSpan={2}>الكبرى</th>
                        <th className="border border-gray-300 px-1 py-1 text-center" rowSpan={2}>الصغرى</th>
                        <th className="border border-gray-300 px-1 py-1 text-center" rowSpan={2}>الدور الثاني</th>
                        <th className="border border-gray-300 px-1 py-1 text-center" rowSpan={2}>النتيجة النهائية</th></>
                      ) : (
                        <><th className="border border-gray-300 px-1 py-1 text-center" rowSpan={2}>الكبرى</th>
                        <th className="border border-gray-300 px-1 py-1 text-center" rowSpan={2}>الصغرى</th>
                        <th className="border border-gray-300 px-1 py-1 text-center" rowSpan={2}>درجة الطالب</th>
                        <th className="border border-gray-300 px-1 py-1 text-center" rowSpan={2}>الدور الثاني</th></>
                      )}
                    </tr>
                    <tr className="text-[10px] bg-blue-50">
                      <th className="border border-gray-300 px-1 py-1">أعمال</th>
                      <th className="border border-gray-300 px-1 py-1">امتحان</th>
                      <th className="border border-gray-300 px-1 py-1">أعمال</th>
                      <th className="border border-gray-300 px-1 py-1">امتحان</th>
                    </tr>
                  </thead>
                  <tbody>
                    {coreSubjects.map((sub) => {
                      const s1w = n(scores[sub.key]?.s1_work);
                      const s1e = n(scores[sub.key]?.s1_exam);
                      const s2w = n(scores[sub.key]?.s2_work);
                      const s2e = n(scores[sub.key]?.s2_exam);
                      const s1 = s1w + s1e, s2 = s2w + s2e;
                      const total = s1 + s2;
                      const dour2 = n(scores[sub.key]?.dour2_score);
                      const fMax = calcTotalMax(sub.hours);
                      const fMin = calcTotalMin(sub.hours);
                      const bigger = Math.max(s1, s2);
                      const final = isSecondary
                        ? (dour2 > 0 ? s1 + s2 - Math.min(s1, s2) + dour2 : total)
                        : bigger;
                      const pass = final >= fMin;
                      return (
                        <tr key={sub.key} className={pass || final === 0 ? "" : "bg-red-50"}>
                          <td className="border border-gray-300 px-2 py-1.5 font-medium">{sub.name}</td>
                          <td className="border border-gray-300 px-1 py-1 text-center text-gray-500">{sub.hours}</td>
                          <td className="border border-gray-300 px-1 py-1 text-center font-semibold">{s1w || "—"}</td>
                          <td className="border border-gray-300 px-1 py-1 text-center font-semibold">{s1e || "—"}</td>
                          <td className="border border-gray-300 px-1 py-1 text-center font-semibold">{s2w || "—"}</td>
                          <td className="border border-gray-300 px-1 py-1 text-center font-semibold">{s2e || "—"}</td>
                          {isSecondary ? (
                            <><td className="border border-gray-300 px-1 py-1 text-center font-bold text-blue-700">{total || "—"}</td>
                            <td className="border border-gray-300 px-1 py-1 text-center text-gray-400">{fMax}</td>
                            <td className="border border-gray-300 px-1 py-1 text-center text-gray-400">{fMin}</td>
                            <td className="border border-gray-300 px-1 py-1 text-center font-semibold">{dour2 || "—"}</td>
                            <td className={`border border-gray-300 px-1 py-1 text-center font-bold ${pass || final === 0 ? "text-green-700" : "text-red-600"}`}>{final || "—"}</td></>
                          ) : (
                            <><td className="border border-gray-300 px-1 py-1 text-center text-gray-400">{fMax}</td>
                            <td className="border border-gray-300 px-1 py-1 text-center text-gray-400">{fMin}</td>
                            <td className={`border border-gray-300 px-1 py-1 text-center font-bold ${pass || final === 0 ? "text-blue-700" : "text-red-600"}`}>{bigger || "—"}</td>
                            <td className="border border-gray-300 px-1 py-1 text-center font-semibold">{dour2 || "—"}</td></>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Activity */}
            {template.activitySubjects.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">مواد النشاط</h3>
                <table className="w-full text-xs border-collapse border border-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="border border-gray-300 px-3 py-1.5 text-right">المادة</th>
                      {template.behaviorPeriods.map((p, i) => (
                        <th key={i} className="border border-gray-300 px-3 py-1.5 text-center">{p}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {template.activitySubjects.map((subj) => (
                      <tr key={subj}>
                        <td className="border border-gray-300 px-3 py-1">{subj}</td>
                        {template.behaviorPeriods.map((p, i) => (
                          <td key={i} className="border border-gray-300 px-3 py-1 text-center">{activity[subj]?.[p] || "—"}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Behavior */}
            <div className="mt-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">السلوك</h3>
              <table className="w-full text-xs border-collapse border border-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="border border-gray-300 px-3 py-1.5 text-right">البيان</th>
                    {template.behaviorPeriods.map((p, i) => (
                      <th key={i} className="border border-gray-300 px-3 py-1.5 text-center">{p}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 px-3 py-1">غياب مشروع (أيام)</td>
                    {template.behaviorPeriods.map((p, i) => (
                      <td key={i} className="border border-gray-300 px-3 py-1 text-center">{behavior[p]?.authorized || "—"}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-3 py-1">غياب غير مشروع (أيام)</td>
                    {template.behaviorPeriods.map((p, i) => (
                      <td key={i} className="border border-gray-300 px-3 py-1 text-center">{behavior[p]?.unauthorized || "—"}</td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Final result */}
            {report.result_label && (
              <div className="mt-6 flex flex-wrap items-center gap-4 bg-blue-50 rounded-xl px-5 py-4 border border-blue-100">
                {report.total_score != null && (
                  <div>
                    <span className="text-gray-500 text-sm">المجموع الكلي: </span>
                    <span className="text-2xl font-bold text-blue-700">{report.total_score}</span>
                    <span className="text-gray-400 text-sm"> / {report.total_max}</span>
                  </div>
                )}
                <div className={`text-base font-bold px-5 py-2 rounded-full ${
                  report.result_label.includes("ناجح") ? "bg-green-100 text-green-700"
                  : report.result_label === "راسب" ? "bg-red-100 text-red-700"
                  : "bg-gray-100 text-gray-700"
                }`}>
                  {report.result_label}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-100 px-6 py-4 text-center text-xs text-gray-400">
            مدرسة ضياء المستقبل — {student.academic_year} — هذه الوثيقة صادرة إلكترونياً
          </div>
        </div>

        <div className="mt-4 text-center print:hidden">
          <Link href="/results" className="text-sm text-blue-600 hover:underline">
            ← بحث عن طالب آخر
          </Link>
        </div>
      </div>
    </div>
  );
}
