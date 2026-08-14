import { createAdminClient } from "@/lib/supabase/server";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Plus, Search, ClipboardList, CheckCircle2, Clock, Ban, Users, Upload, Download
} from "lucide-react";
import { GRADE_LABELS } from "@/lib/report-templates";
import StudentRow from "./StudentRow";
import DownloadClassZipButton from "@/app/components/DownloadClassZipButton";

export const metadata = { title: "الصحائف والنتائج — لوحة التحكم" };

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ grade?: string; status?: string; search?: string; year?: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const sp = await searchParams;
  const grade = sp.grade ?? "";
  const status = sp.status ?? "";
  const search = sp.search ?? "";
  const year = sp.year ?? "2025-2026";

  const admin = await createAdminClient();

  // Build query
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
  if (search) q = q.or(
    `full_name.ilike.%${search}%,enrollment_number.ilike.%${search}%,seat_number.ilike.%${search}%`
  );

  const { data: students = [] } = await q;

  // Separate query for ZIP button: all students in the selected grade, independent of
  // search/status filters. Only runs when a grade is explicitly chosen.
  let gradeStudentsForZip: { id: string; full_name: string; enrollment_number: string | null }[] = [];
  if (grade) {
    const { data: gs } = await admin
      .from("students")
      .select("id, full_name, enrollment_number")
      .eq("academic_year", year)
      .eq("grade", parseInt(grade))
      .order("full_name");
    gradeStudentsForZip = gs ?? [];
  }

  // Filter by status client-side
  let filtered = students ?? [];
  if (status === "published") filtered = filtered.filter((s: any) => (s.student_reports as any[])?.[0]?.status === "published");
  if (status === "draft") filtered = filtered.filter((s: any) => { const r = (s.student_reports as any[])?.[0]; return !r || r.status === "draft"; });
  if (status === "blocked") filtered = filtered.filter((s: any) => (s.student_reports as any[])?.[0]?.result_blocked === true);

  const totalPublished = (students ?? []).filter((s: any) => (s.student_reports as any[])?.[0]?.status === "published").length;
  const totalDraft = (students ?? []).filter((s: any) => { const r = (s.student_reports as any[])?.[0]; return !r || r.status === "draft"; }).length;
  const totalBlocked = (students ?? []).filter((s: any) => (s.student_reports as any[])?.[0]?.result_blocked).length;

  return (
    <div dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ClipboardList className="w-7 h-7 text-blue-600" />
            الصحائف الإلكترونية
          </h1>
          <p className="text-gray-500 text-sm mt-1">إدارة نتائج الطلاب وصحائف التقدير</p>
        </div>
        <div className="flex items-center gap-2">
          <DownloadClassZipButton
            students={gradeStudentsForZip.map((s) => ({
              id: s.id,
              full_name: s.full_name,
              enrollment_number: s.enrollment_number ?? undefined,
            }))}
            gradeName={grade ? GRADE_LABELS[parseInt(grade)] : undefined}
            year={year}
            hasGradeFilter={!!grade}
          />
          <a
            href={`/api/admin/reports/export?year=${year}${grade ? `&grade=${grade}` : ""}${status ? `&status=${status}` : ""}${search ? `&search=${encodeURIComponent(search)}` : ""}`}
            className="flex items-center gap-2 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 px-4 py-2.5 rounded-xl text-sm font-semibold transition"
          >
            <Download className="w-4 h-4 text-green-500" />
            تصدير Excel
          </a>
          <Link
            href="/admin/reports/import"
            className="flex items-center gap-2 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 px-4 py-2.5 rounded-xl text-sm font-semibold transition"
          >
            <Upload className="w-4 h-4 text-blue-500" />
            استيراد قائمة
          </Link>
          <Link
            href="/admin/reports/new"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition"
          >
            <Plus className="w-4 h-4" />
            إضافة طالب
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "إجمالي الطلاب", val: students?.length ?? 0, icon: <Users className="w-5 h-5" />, color: "blue" },
          { label: "تم النشر", val: totalPublished, icon: <CheckCircle2 className="w-5 h-5" />, color: "green" },
          { label: "مسودة", val: totalDraft, icon: <Clock className="w-5 h-5" />, color: "amber" },
          { label: "محجوبة", val: totalBlocked, icon: <Ban className="w-5 h-5" />, color: "red" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm flex items-center gap-3">
            <div className={`p-2 rounded-lg bg-${s.color}-100 text-${s.color}-600`}>{s.icon}</div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{s.val}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <form className="bg-white border border-gray-100 rounded-xl shadow-sm p-4 mb-5 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            name="search"
            defaultValue={search}
            placeholder="ابحث بالاسم أو رقم القيد أو رقم الجلوس…"
            className="w-full pr-9 pl-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select name="grade" defaultValue={grade}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">كل الصفوف</option>
          {Array.from({ length: 12 }, (_, i) => i + 1).map((g) => (
            <option key={g} value={g}>{GRADE_LABELS[g]}</option>
          ))}
        </select>
        <select name="status" defaultValue={status}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">كل الحالات</option>
          <option value="published">منشورة</option>
          <option value="draft">مسودة</option>
          <option value="blocked">محجوبة</option>
        </select>
        <select name="year" defaultValue={year}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="2025-2026">2025-2026</option>
          <option value="2024-2025">2024-2025</option>
        </select>
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition">
          بحث
        </button>
        <a href="/admin/reports" className="border border-gray-200 text-gray-600 px-4 py-2 rounded-lg text-sm hover:bg-gray-50 transition">
          إعادة ضبط
        </a>
      </form>

      {/* Table */}
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-lg">لا توجد نتائج</p>
            <p className="text-sm mt-1">جرّب تغيير الفلتر أو أضف طلاباً جدداً</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-right px-4 py-3 font-semibold text-gray-600">الطالب</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-600">الصف</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-600">رقم القيد</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-600">رقم الجلوس</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-600">الحالة</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-600">المجموع</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-600">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {(filtered as any[]).map((student) => (
                  <StudentRow key={student.id} student={student} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {filtered.length > 0 && (
        <p className="text-center text-gray-400 text-xs mt-3">{filtered.length} طالب</p>
      )}
    </div>
  );
}
