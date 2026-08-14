import { createClient, createAdminClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight, Pencil, ClipboardEdit, Printer, CheckCircle2, Clock, Ban
} from "lucide-react";
import { getTemplateById, GRADE_LABELS, calcTotalMax, calcTotalMin, calcPeriodMax, calcExamMax } from "@/lib/report-templates";
import ReportPublishButtons from "./ReportPublishButtons";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  return { title: "صحيفة الطالب — لوحة التحكم" };
}

function n(v: any) { const x = parseFloat(v ?? ""); return isNaN(x) ? 0 : x; }

export default async function StudentReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const admin = await createAdminClient();
  const { data: student, error } = await admin
    .from("students")
    .select(`*, student_reports!student_reports_student_id_fkey(*)`)
    .eq("id", id)
    .single();

  if (error || !student) notFound();

  const report = (student.student_reports as any[])?.[0];
  const template = getTemplateById(report?.template_id ?? "T1");
  const scores = report?.scores ?? {};
  const activity = report?.activity_scores ?? {};
  const behavior = report?.behavior ?? {};
  const coreSubjects = template.subjects.filter((s) => !s.isActivity);
  const isPeriods = template.type === "periods3" || template.type === "periods3_dour";
  const isDour = template.type === "periods3_dour";
  const isSecondary = template.type === "semesters_secondary";

  const statusBadge = !report
    ? <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">بدون صحيفة</span>
    : report.result_blocked
      ? <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full flex items-center gap-1"><Ban className="w-3 h-3" />محجوبة</span>
      : report.status === "published"
        ? <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full flex items-center gap-1"><CheckCircle2 className="w-3 h-3" />منشورة</span>
        : <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full flex items-center gap-1"><Clock className="w-3 h-3" />مسودة</span>;

  return (
    <div dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Link href="/admin/reports" className="text-gray-400 hover:text-gray-600 transition">
            <ArrowRight className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{student.full_name}</h1>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <span className="text-gray-500 text-sm">{GRADE_LABELS[student.grade]}</span>
              {student.class_section && <span className="text-gray-400 text-sm">— فصل {student.class_section}</span>}
              {student.enrollment_number && <span className="text-gray-400 text-xs">رقم القيد: {student.enrollment_number}</span>}
              {student.seat_number && <span className="text-gray-400 text-xs">رقم الجلوس: {student.seat_number}</span>}
              {statusBadge}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Link href={`/admin/reports/${id}/edit`}
            className="flex items-center gap-1.5 border border-gray-200 text-gray-600 px-3 py-2 rounded-xl text-sm hover:bg-gray-50 transition">
            <Pencil className="w-4 h-4" />تعديل البيانات
          </Link>
          <Link href={`/admin/reports/${id}/grades`}
            className="flex items-center gap-1.5 border border-blue-200 text-blue-600 px-3 py-2 rounded-xl text-sm hover:bg-blue-50 transition">
            <ClipboardEdit className="w-4 h-4" />إدخال الدرجات
          </Link>
          <button onClick={() => {}} className="flex items-center gap-1.5 border border-gray-200 text-gray-600 px-3 py-2 rounded-xl text-sm hover:bg-gray-50 transition print:hidden">
            <Printer className="w-4 h-4" />طباعة
          </button>
        </div>
      </div>

      {/* Publish actions */}
      {report && <ReportPublishButtons studentId={id} report={report} />}

      {/* Report Card */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden mt-4 print:shadow-none print:border-0">
        {/* Report Header */}
        <div className="border-b border-gray-100 px-6 py-5 text-center">
          <h2 className="text-xl font-bold text-gray-900">مدرسة ضياء المستقبل</h2>
          <h3 className="text-base font-semibold text-blue-600 mt-1">بطاقة تقدير الدرجات</h3>
          <p className="text-sm text-gray-500 mt-0.5">{template.name} — السنة الدراسية {student.academic_year}</p>
        </div>

        {/* Student Info */}
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div><span className="text-gray-500">الاسم: </span><span className="font-semibold">{student.full_name}</span></div>
            <div><span className="text-gray-500">الصف: </span><span className="font-semibold">{GRADE_LABELS[student.grade]}</span></div>
            <div><span className="text-gray-500">رقم القيد: </span><span className="font-semibold font-mono">{student.enrollment_number || "—"}</span></div>
            <div><span className="text-gray-500">رقم الجلوس: </span><span className="font-semibold font-mono">{student.seat_number || "—"}</span></div>
          </div>
        </div>

        <div className="p-4">
          {!report ? (
            <div className="text-center py-12 text-gray-400">
              <p>لم يتم إدخال درجات بعد</p>
              <Link href={`/admin/reports/${id}/grades`} className="mt-3 inline-block text-blue-600 underline text-sm">
                ابدأ إدخال الدرجات
              </Link>
            </div>
          ) : (
            <>
              {/* Periods Table */}
              {isPeriods && (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs border-collapse border border-gray-300 min-w-[700px]">
                    <thead className="bg-blue-50">
                      <tr>
                        <th className="border border-gray-300 px-2 py-2 text-right" rowSpan={2}>المواد الدراسية</th>
                        <th className="border border-gray-300 px-1 py-1 text-center" rowSpan={2}>ح</th>
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
                        <th className="border border-gray-300 px-1 py-1 text-center">الكبرى</th>
                        <th className="border border-gray-300 px-1 py-1 text-center">التلميذ</th>
                        <th className="border border-gray-300 px-1 py-1 text-center">الكبرى</th>
                        <th className="border border-gray-300 px-1 py-1 text-center">التلميذ</th>
                        <th className="border border-gray-300 px-1 py-1 text-center">الكبرى</th>
                        {isDour ? (
                          <><th className="border border-gray-300 px-1 py-1">الدور 1</th>
                          <th className="border border-gray-300 px-1 py-1">الدور 2</th></>
                        ) : <th className="border border-gray-300 px-1 py-1">التلميذ</th>}
                        <th className="border border-gray-300 px-1 py-1">الكبرى</th>
                        <th className="border border-gray-300 px-1 py-1">الصغرى</th>
                        {isDour ? (
                          <><th className="border border-gray-300 px-1 py-1">الدور 1</th>
                          <th className="border border-gray-300 px-1 py-1">الدور 2</th></>
                        ) : <th className="border border-gray-300 px-1 py-1">التلميذ</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {coreSubjects.map((sub) => {
                        const p1 = n(scores[sub.key]?.p1_score);
                        const p2 = n(scores[sub.key]?.p2_score);
                        const d1 = isDour ? n(scores[sub.key]?.dour1_score) : n(scores[sub.key]?.p3_score);
                        const d2 = n(scores[sub.key]?.dour2_score);
                        const total1 = p1 + p2 + d1;
                        const total2 = p1 + p2 + d2;
                        return (
                          <tr key={sub.key} className="hover:bg-gray-50">
                            <td className="border border-gray-300 px-2 py-1">{sub.name}</td>
                            <td className="border border-gray-300 px-1 py-1 text-center text-gray-500">{sub.hours}</td>
                            <td className="border border-gray-300 px-1 py-1 text-center text-gray-400">{calcPeriodMax(sub.hours)}</td>
                            <td className="border border-gray-300 px-1 py-1 text-center font-medium">{p1 || "—"}</td>
                            <td className="border border-gray-300 px-1 py-1 text-center text-gray-400">{calcPeriodMax(sub.hours)}</td>
                            <td className="border border-gray-300 px-1 py-1 text-center font-medium">{p2 || "—"}</td>
                            <td className="border border-gray-300 px-1 py-1 text-center text-gray-400">{calcExamMax(sub.hours)}</td>
                            {isDour ? (
                              <><td className="border border-gray-300 px-1 py-1 text-center font-medium">{d1 || "—"}</td>
                              <td className="border border-gray-300 px-1 py-1 text-center font-medium">{d2 || "—"}</td></>
                            ) : (
                              <td className="border border-gray-300 px-1 py-1 text-center font-medium">{d1 || "—"}</td>
                            )}
                            <td className="border border-gray-300 px-1 py-1 text-center text-gray-400">{calcTotalMax(sub.hours)}</td>
                            <td className="border border-gray-300 px-1 py-1 text-center text-gray-400">{calcTotalMin(sub.hours)}</td>
                            {isDour ? (
                              <><td className="border border-gray-300 px-1 py-1 text-center font-bold text-blue-700">{total1 || "—"}</td>
                              <td className="border border-gray-300 px-1 py-1 text-center font-bold text-blue-700">{d2 > 0 ? total2 : "—"}</td></>
                            ) : (
                              <td className="border border-gray-300 px-1 py-1 text-center font-bold text-blue-700">{total1 || "—"}</td>
                            )}
                          </tr>
                        );
                      })}
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
                        <th className="border border-gray-300 px-2 py-2 text-right" rowSpan={2}>المادة</th>
                        <th className="border border-gray-300 px-1 py-1 text-center" rowSpan={2}>ح</th>
                        <th className="border border-gray-300 px-1 py-1 text-center" colSpan={2}>الفصل الأول</th>
                        <th className="border border-gray-300 px-1 py-1 text-center" colSpan={2}>الفصل الثاني</th>
                        {isSecondary ? (
                          <><th className="border border-gray-300 px-1 py-1 text-center" rowSpan={2}>المجموع</th>
                          <th className="border border-gray-300 px-1 py-1 text-center" rowSpan={2}>الكبرى</th>
                          <th className="border border-gray-300 px-1 py-1 text-center" rowSpan={2}>الصغرى</th>
                          <th className="border border-gray-300 px-1 py-1 text-center" rowSpan={2}>الدور 2</th>
                          <th className="border border-gray-300 px-1 py-1 text-center" rowSpan={2}>النهائية</th></>
                        ) : (
                          <><th className="border border-gray-300 px-1 py-1 text-center" rowSpan={2}>الكبرى</th>
                          <th className="border border-gray-300 px-1 py-1 text-center" rowSpan={2}>الصغرى</th>
                          <th className="border border-gray-300 px-1 py-1 text-center" rowSpan={2}>درجة الطالب</th>
                          <th className="border border-gray-300 px-1 py-1 text-center" rowSpan={2}>الدور 2</th></>
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
                        const final = isSecondary
                          ? (dour2 > 0 ? s1 + s2 - Math.min(s1, s2) + dour2 : total)
                          : Math.max(s1, s2);
                        return (
                          <tr key={sub.key} className="hover:bg-gray-50">
                            <td className="border border-gray-300 px-2 py-1">{sub.name}</td>
                            <td className="border border-gray-300 px-1 py-1 text-center text-gray-500">{sub.hours}</td>
                            <td className="border border-gray-300 px-1 py-1 text-center font-medium">{s1w || "—"}</td>
                            <td className="border border-gray-300 px-1 py-1 text-center font-medium">{s1e || "—"}</td>
                            <td className="border border-gray-300 px-1 py-1 text-center font-medium">{s2w || "—"}</td>
                            <td className="border border-gray-300 px-1 py-1 text-center font-medium">{s2e || "—"}</td>
                            {isSecondary ? (
                              <><td className="border border-gray-300 px-1 py-1 text-center text-blue-700 font-bold">{total || "—"}</td>
                              <td className="border border-gray-300 px-1 py-1 text-center text-gray-400">{calcTotalMax(sub.hours)}</td>
                              <td className="border border-gray-300 px-1 py-1 text-center text-gray-400">{calcTotalMin(sub.hours)}</td>
                              <td className="border border-gray-300 px-1 py-1 text-center font-medium">{dour2 || "—"}</td>
                              <td className="border border-gray-300 px-1 py-1 text-center font-bold text-green-700">{final || "—"}</td></>
                            ) : (
                              <><td className="border border-gray-300 px-1 py-1 text-center text-gray-400">{calcTotalMax(sub.hours)}</td>
                              <td className="border border-gray-300 px-1 py-1 text-center text-gray-400">{calcTotalMin(sub.hours)}</td>
                              <td className="border border-gray-300 px-1 py-1 text-center font-bold text-blue-700">{final || "—"}</td>
                              <td className="border border-gray-300 px-1 py-1 text-center font-medium">{dour2 || "—"}</td></>
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
                            <td key={i} className="border border-gray-300 px-3 py-1 text-center">
                              {activity[subj]?.[p] || "—"}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Behavior */}
              <div className="mt-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">السلوك والانتظام</h3>
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

              {/* Summary */}
              {(report.total_score != null || report.result_label) && (
                <div className="mt-5 flex flex-wrap items-center gap-4 bg-blue-50 rounded-xl px-5 py-4 border border-blue-100">
                  {report.total_score != null && (
                    <div>
                      <span className="text-gray-500 text-sm">المجموع الكلي: </span>
                      <span className="text-2xl font-bold text-blue-700">{report.total_score}</span>
                      <span className="text-gray-400 text-sm"> / {report.total_max}</span>
                    </div>
                  )}
                  {report.result_label && (
                    <div className={`text-sm font-bold px-4 py-1.5 rounded-full ${
                      report.result_label.includes("ناجح") ? "bg-green-100 text-green-700"
                      : report.result_label === "راسب" ? "bg-red-100 text-red-700"
                      : "bg-gray-100 text-gray-700"
                    }`}>
                      {report.result_label}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
