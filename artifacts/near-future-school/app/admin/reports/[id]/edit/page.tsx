"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Save, Eye, AlertCircle } from "lucide-react";
import { GRADE_LABELS } from "@/lib/report-templates";

type FormData = {
  full_name: string;
  enrollment_number: string;
  seat_number: string;
  grade: string;
  class_section: string;
  gender: string;
  notes: string;
};

type OriginalData = FormData;

/** #23 — معاينة التغييرات قبل الحفظ */
function ChangesPreview({
  original,
  current,
}: {
  original: OriginalData;
  current: FormData;
}) {
  const LABELS: Record<keyof FormData, string> = {
    full_name: "الاسم الكامل",
    enrollment_number: "رقم القيد",
    seat_number: "رقم الجلوس",
    grade: "الصف",
    class_section: "الفصل",
    gender: "الجنس",
    notes: "ملاحظات",
  };

  const changes = (Object.keys(LABELS) as (keyof FormData)[]).filter(
    (k) => original[k] !== current[k]
  );

  if (changes.length === 0) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-700 flex items-center gap-2">
        <AlertCircle className="w-4 h-4 flex-shrink-0" />
        لم يتم تغيير أي بيانات
      </div>
    );
  }

  const displayVal = (k: keyof FormData, v: string) => {
    if (k === "grade") return GRADE_LABELS[parseInt(v)] ?? v;
    if (k === "gender") return v === "female" ? "طالبة" : "طالب";
    return v || "—";
  };

  return (
    <div className="border border-blue-200 rounded-xl overflow-hidden">
      <div className="bg-blue-50 px-4 py-2.5 text-sm font-semibold text-blue-700 flex items-center gap-2">
        <Eye className="w-4 h-4" />
        التغييرات التي ستُطبَّق ({changes.length})
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-xs text-gray-500 border-b border-gray-100">
            <th className="text-right px-4 py-2">الحقل</th>
            <th className="text-right px-4 py-2 text-red-500">قبل</th>
            <th className="text-right px-4 py-2 text-green-600">بعد</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {changes.map((k) => (
            <tr key={k}>
              <td className="px-4 py-2 font-medium text-gray-700">{LABELS[k]}</td>
              <td className="px-4 py-2 text-red-600 line-through opacity-70">
                {displayVal(k, original[k])}
              </td>
              <td className="px-4 py-2 text-green-700 font-semibold">
                {displayVal(k, current[k])}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function EditStudentPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState(false);
  const [original, setOriginal] = useState<OriginalData | null>(null);
  const [form, setForm] = useState<FormData>({
    full_name: "", enrollment_number: "", seat_number: "",
    grade: "1", class_section: "", gender: "female", notes: "",
  });

  useEffect(() => {
    fetch(`/api/admin/reports/${id}`)
      .then((r) => r.json())
      .then((data) => {
        const vals: FormData = {
          full_name: data.full_name ?? "",
          enrollment_number: data.enrollment_number ?? "",
          seat_number: data.seat_number ?? "",
          grade: String(data.grade ?? 1),
          class_section: data.class_section ?? "",
          gender: data.gender ?? "female",
          notes: data.notes ?? "",
        };
        setForm(vals);
        setOriginal(vals);
        setLoading(false);
      });
  }, [id]);

  function set(k: string, v: string) {
    setForm((p) => ({ ...p, [k]: v }));
    setPreview(false); // reset preview when form changes
  }

  async function handleSave() {
    setSaving(true); setError("");
    const res = await fetch(`/api/admin/reports/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) { setError(data.error || "حدث خطأ"); return; }
    router.push(`/admin/reports/${id}`);
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-gray-400">جاري التحميل…</div>
  );

  return (
    <div dir="rtl" className="max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href={`/admin/reports/${id}`} className="text-gray-400 hover:text-gray-600 transition">
          <ArrowRight className="w-5 h-5" />
        </Link>
        <h1 className="text-xl font-bold text-gray-900">تعديل بيانات الطالب</h1>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 space-y-5">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">الاسم الكامل *</label>
          <input required value={form.full_name} onChange={(e) => set("full_name", e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">رقم القيد</label>
            <input value={form.enrollment_number} onChange={(e) => set("enrollment_number", e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">رقم الجلوس</label>
            <input value={form.seat_number} onChange={(e) => set("seat_number", e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">الصف الدراسي</label>
            <select value={form.grade} onChange={(e) => set("grade", e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              {Array.from({ length: 12 }, (_, i) => i + 1).map((g) => (
                <option key={g} value={g}>{GRADE_LABELS[g]}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">الفصل / الشعبة</label>
            <input value={form.class_section} onChange={(e) => set("class_section", e.target.value)}
              placeholder="مثل: أ، ب"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">الجنس</label>
          <select value={form.gender} onChange={(e) => set("gender", e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="female">طالبة</option>
            <option value="male">طالب</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">ملاحظات</label>
          <textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} rows={2}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
        </div>

        {/* Preview changes section */}
        {preview && original && (
          <ChangesPreview original={original} current={form} />
        )}

        <div className="flex gap-3 pt-2">
          {!preview ? (
            <>
              <button
                type="button"
                onClick={() => setPreview(true)}
                className="flex items-center justify-center gap-2 flex-1 border border-blue-300 text-blue-700 py-3 rounded-xl font-semibold text-sm hover:bg-blue-50 transition"
              >
                <Eye className="w-4 h-4" />مراجعة التغييرات
              </button>
              <Link href={`/admin/reports/${id}`}
                className="px-6 py-3 border border-gray-200 text-gray-600 rounded-xl text-sm hover:bg-gray-50 transition text-center">
                إلغاء
              </Link>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="flex items-center justify-center gap-2 flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold text-sm transition disabled:opacity-60"
              >
                <Save className="w-4 h-4" />{saving ? "جاري الحفظ…" : "تأكيد الحفظ"}
              </button>
              <button
                type="button"
                onClick={() => setPreview(false)}
                className="px-6 py-3 border border-gray-200 text-gray-600 rounded-xl text-sm hover:bg-gray-50 transition"
              >
                تعديل
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
