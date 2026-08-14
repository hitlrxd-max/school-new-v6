import { Suspense } from "react";
import { createAdminClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Search, GraduationCap, AlertCircle } from "lucide-react";
import { GRADE_LABELS } from "@/lib/report-templates";

export const metadata = {
  title: "نتائج الطلاب — مدرسة ضياء المستقبل",
  description: "ابحث عن نتيجتك بإدخال رقم القيد أو رقم الجلوس",
};

async function SearchResults({ query }: { query: string }) {
  if (!query.trim()) return null;

  const admin = await createAdminClient();

  // Search students by enrollment or seat number
  const { data: students } = await admin
    .from("students")
    .select("id, full_name, grade, class_section, enrollment_number, seat_number, academic_year")
    .or(`enrollment_number.eq.${query},seat_number.eq.${query}`)
    .limit(5);

  if (!students || students.length === 0) {
    return (
      <div className="mt-8 flex flex-col items-center gap-3 text-gray-400">
        <AlertCircle className="w-10 h-10 opacity-40" />
        <p className="text-base">لم يتم العثور على طالب بهذا الرقم</p>
        <p className="text-sm">تأكد من رقم القيد أو رقم الجلوس وأعد المحاولة</p>
      </div>
    );
  }

  // For each student, check if their report is published and not blocked
  const results = await Promise.all(
    students.map(async (student) => {
      const { data: report } = await admin
        .from("student_reports")
        .select("id, status, result_blocked, result_label, total_score, total_max, rank_in_class")
        .eq("student_id", student.id)
        .eq("academic_year", student.academic_year)
        .single();
      return { student, report };
    })
  );

  return (
    <div className="mt-8 space-y-4">
      {results.map(({ student, report }) => {
        const available = report?.status === "published" && !report?.result_blocked;
        return (
          <div key={student.id} className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h3 className="font-bold text-gray-900 text-lg">{student.full_name}</h3>
                <div className="flex flex-wrap gap-3 mt-1 text-sm text-gray-500">
                  <span>{GRADE_LABELS[student.grade]}</span>
                  {student.class_section && <span>فصل {student.class_section}</span>}
                  <span>السنة الدراسية: {student.academic_year}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {!report ? (
                  <span className="text-sm text-gray-400">النتيجة غير متاحة بعد</span>
                ) : report.result_blocked ? (
                  <span className="text-sm text-red-500 bg-red-50 px-3 py-1.5 rounded-full">النتيجة محجوبة</span>
                ) : report.status !== "published" ? (
                  <span className="text-sm text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full">النتيجة لم تُنشر بعد</span>
                ) : (
                  <Link
                    href={`/results/${student.id}`}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition"
                  >
                    عرض الصحيفة
                  </Link>
                )}
              </div>
            </div>
            {available && (
              <div className="mt-3 flex flex-wrap items-center gap-3">
                {report.result_label && (
                  <span className={`text-sm font-bold px-4 py-1 rounded-full ${
                    report.result_label.includes("ناجح") ? "bg-green-100 text-green-700"
                    : report.result_label === "راسب" ? "bg-red-100 text-red-700"
                    : "bg-gray-100 text-gray-600"
                  }`}>
                    {report.result_label}
                  </span>
                )}
                {report.total_score != null && (
                  <span className="text-sm text-gray-500">
                    المجموع: <span className="font-bold text-gray-800">{report.total_score}</span>
                    {report.total_max ? <span className="text-gray-400"> / {report.total_max}</span> : null}
                  </span>
                )}
                {report.rank_in_class != null && (
                  <span className="text-sm text-gray-500">
                    الترتيب: <span className="font-bold text-blue-700">{report.rank_in_class}</span>
                  </span>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default async function ResultsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const sp = await searchParams;
  const query = (sp.q ?? "").trim();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white" dir="rtl">
      {/* Nav */}
      <nav className="bg-white/80 backdrop-blur border-b border-blue-100 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-blue-700">
            <GraduationCap className="w-6 h-6" />
            مدرسة ضياء المستقبل
          </Link>
          <Link href="/news" className="text-sm text-gray-600 hover:text-blue-600 transition">الأخبار</Link>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-16">
        {/* Title */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-2xl mb-4">
            <GraduationCap className="w-9 h-9 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">نتائج الطلاب</h1>
          <p className="text-gray-500 mt-2">أدخل رقم القيد أو رقم الجلوس للاطلاع على النتيجة</p>
        </div>

        {/* Search Form */}
        <form className="relative">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            name="q"
            defaultValue={query}
            placeholder="رقم القيد أو رقم الجلوس…"
            autoFocus
            className="w-full pr-12 pl-28 py-4 text-base border-2 border-blue-200 focus:border-blue-500 rounded-2xl focus:outline-none shadow-sm"
          />
          <button
            type="submit"
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl text-sm font-semibold transition"
          >
            بحث
          </button>
        </form>

        {/* Results */}
        <Suspense fallback={<div className="mt-8 text-center text-gray-400 text-sm">جاري البحث…</div>}>
          <SearchResults query={query} />
        </Suspense>

        {/* Instructions */}
        {!query && (
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-500">
            <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
              <p className="font-semibold text-gray-700 mb-1">رقم القيد</p>
              <p>الرقم المسجل عليه الطالب في سجلات المدرسة</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
              <p className="font-semibold text-gray-700 mb-1">رقم الجلوس</p>
              <p>الرقم المكتوب على بطاقة الجلوس في الامتحانات</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
