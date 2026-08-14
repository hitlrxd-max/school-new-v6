import { Suspense } from "react";
import { createAdminClient } from "@/lib/supabase/server";
import Link from "next/link";
import { GraduationCap, AlertCircle, Search } from "lucide-react";
import { GRADE_LABELS } from "@/lib/report-templates";

export const metadata = {
  title: "نتائج الطلاب — مدرسة ضياء المستقبل",
  description: "أدخل رقم الجلوس ورقم القيد للاطلاع على نتيجتك",
};

async function SearchResults({
  seat,
  enrollment,
}: {
  seat: string;
  enrollment: string;
}) {
  if (!seat.trim() || !enrollment.trim()) return null;

  const admin = await createAdminClient();

  const { data: students } = await admin
    .from("students")
    .select(
      "id, full_name, grade, class_section, enrollment_number, seat_number, academic_year"
    )
    .eq("seat_number", seat.trim())
    .eq("enrollment_number", enrollment.trim())
    .limit(5);

  if (!students || students.length === 0) {
    return (
      <div className="mt-8 flex flex-col items-center gap-3 text-gray-400">
        <AlertCircle className="w-10 h-10 opacity-40" />
        <p className="text-base font-semibold text-gray-500">
          لم يتم العثور على طالب
        </p>
        <p className="text-sm text-gray-400">
          تأكد من رقم الجلوس ورقم القيد وأعد المحاولة
        </p>
      </div>
    );
  }

  const results = await Promise.all(
    students.map(async (student) => {
      const { data: report } = await admin
        .from("student_reports")
        .select(
          "id, status, result_blocked, result_label, total_score, total_max, rank_in_class"
        )
        .eq("student_id", student.id)
        .eq("academic_year", student.academic_year)
        .single();
      return { student, report };
    })
  );

  return (
    <div className="mt-8 space-y-4">
      {results.map(({ student, report }) => {
        const available =
          report?.status === "published" && !report?.result_blocked;
        return (
          <div
            key={student.id}
            className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5"
          >
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h3 className="font-bold text-gray-900 text-lg">
                  {student.full_name}
                </h3>
                <div className="flex flex-wrap gap-3 mt-1 text-sm text-gray-500">
                  <span>{GRADE_LABELS[student.grade]}</span>
                  {student.class_section && (
                    <span>فصل {student.class_section}</span>
                  )}
                  <span>السنة الدراسية: {student.academic_year}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {!report ? (
                  <span className="text-sm text-gray-400">
                    النتيجة غير متاحة بعد
                  </span>
                ) : report.result_blocked ? (
                  <span className="text-sm text-red-500 bg-red-50 px-3 py-1.5 rounded-full">
                    النتيجة محجوبة
                  </span>
                ) : report.status !== "published" ? (
                  <span className="text-sm text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full">
                    النتيجة لم تُنشر بعد
                  </span>
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
                  <span
                    className={`text-sm font-bold px-4 py-1 rounded-full ${
                      report.result_label.includes("ناجح")
                        ? "bg-green-100 text-green-700"
                        : report.result_label === "راسب"
                        ? "bg-red-100 text-red-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {report.result_label}
                  </span>
                )}
                {report.total_score != null && (
                  <span className="text-sm text-gray-500">
                    المجموع:{" "}
                    <span className="font-bold text-gray-800">
                      {report.total_score}
                    </span>
                    {report.total_max ? (
                      <span className="text-gray-400"> / {report.total_max}</span>
                    ) : null}
                  </span>
                )}
                {report.rank_in_class != null && (
                  <span className="text-sm text-gray-500">
                    الترتيب:{" "}
                    <span className="font-bold text-blue-700">
                      {report.rank_in_class}
                    </span>
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
  searchParams: Promise<{ seat?: string; enrollment?: string }>;
}) {
  const sp = await searchParams;
  const seat = (sp.seat ?? "").trim();
  const enrollment = (sp.enrollment ?? "").trim();
  const searched = seat !== "" && enrollment !== "";

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white" dir="rtl">
      {/* Nav */}
      <nav className="bg-white/80 backdrop-blur border-b border-blue-100 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 font-bold text-blue-700"
          >
            <GraduationCap className="w-6 h-6" />
            مدرسة ضياء المستقبل
          </Link>
          <Link
            href="/news"
            className="text-sm text-gray-600 hover:text-blue-600 transition"
          >
            الأخبار
          </Link>
        </div>
      </nav>

      <div className="max-w-xl mx-auto px-4 py-14">
        {/* Title */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-2xl mb-4">
            <GraduationCap className="w-9 h-9 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">نتائج الطلاب</h1>
          <p className="text-gray-500 mt-2 text-sm">
            أدخل رقم الجلوس ورقم القيد معاً للاطلاع على نتيجتك
          </p>
        </div>

        {/* Search Form */}
        <form className="bg-white rounded-2xl border border-blue-100 shadow-sm p-6 space-y-4">
          {/* Seat number */}
          <div className="space-y-1.5">
            <label
              htmlFor="seat"
              className="block text-sm font-semibold text-gray-700"
            >
              رقم الجلوس
              <span className="text-red-500 mr-0.5">*</span>
            </label>
            <input
              id="seat"
              name="seat"
              defaultValue={seat}
              required
              placeholder="أدخل رقم الجلوس…"
              className="w-full px-4 py-3 text-base border-2 border-gray-200 focus:border-blue-500 rounded-xl focus:outline-none transition"
            />
            <p className="text-xs text-gray-400">
              الرقم المكتوب على بطاقة الجلوس في الامتحانات
            </p>
          </div>

          {/* Enrollment number */}
          <div className="space-y-1.5">
            <label
              htmlFor="enrollment"
              className="block text-sm font-semibold text-gray-700"
            >
              رقم القيد
              <span className="text-red-500 mr-0.5">*</span>
            </label>
            <input
              id="enrollment"
              name="enrollment"
              defaultValue={enrollment}
              required
              placeholder="أدخل رقم القيد…"
              className="w-full px-4 py-3 text-base border-2 border-gray-200 focus:border-blue-500 rounded-xl focus:outline-none transition"
            />
            <p className="text-xs text-gray-400">
              الرقم المسجل عليه الطالب في سجلات المدرسة
            </p>
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold text-base transition"
          >
            <Search className="w-5 h-5" />
            البحث عن النتيجة
          </button>
        </form>

        {/* Results */}
        {searched ? (
          <Suspense
            fallback={
              <div className="mt-8 text-center text-gray-400 text-sm">
                جاري البحث…
              </div>
            }
          >
            <SearchResults seat={seat} enrollment={enrollment} />
          </Suspense>
        ) : null}
      </div>
    </div>
  );
}
