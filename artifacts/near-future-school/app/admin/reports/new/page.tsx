"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, UserPlus } from "lucide-react";
import { GRADE_LABELS } from "@/lib/report-templates";

export default function NewStudentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    full_name: "", enrollment_number: "", seat_number: "",
    grade: "1", class_section: "", academic_year: "2025-2026",
    gender: "female", notes: "",
  });

  function set(k: string, v: string) { setForm((p) => ({ ...p, [k]: v })); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/admin/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "حدث خطأ"); return; }
      router.push(`/admin/reports/${data.student.id}/grades`);
    } catch {
      setError("خطأ في الاتصال");
    } finally { setLoading(false); }
  }

  return (
    <div dir="rtl" className="max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/reports" className="text-gray-400 hover:text-gray-600 transition">
          <ArrowRight className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <UserPlus className="w-6 h-6 text-blue-600" />
            إضافة طالب جديد
          </h1>
          <p className="text-gray-500 text-sm">سيتم إنشاء الصحيفة تلقائياً بعد الحفظ</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 space-y-5">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{error}</div>
        )}

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">الاسم الكامل *</label>
          <input
            required value={form.full_name} onChange={(e) => set("full_name", e.target.value)}
            placeholder="اسم الطالب/الطالبة كاملاً"
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">رقم القيد</label>
            <input
              value={form.enrollment_number} onChange={(e) => set("enrollment_number", e.target.value)}
              placeholder="مثل: 12345"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">رقم الجلوس</label>
            <input
              value={form.seat_number} onChange={(e) => set("seat_number", e.target.value)}
              placeholder="مثل: 6789"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">الصف الدراسي *</label>
            <select
              required value={form.grade} onChange={(e) => set("grade", e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((g) => (
                <option key={g} value={g}>{GRADE_LABELS[g]}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">الفصل / الشعبة</label>
            <input
              value={form.class_section} onChange={(e) => set("class_section", e.target.value)}
              placeholder="مثل: أ، ب"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">الجنس</label>
            <select
              value={form.gender} onChange={(e) => set("gender", e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="female">طالبة</option>
              <option value="male">طالب</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">السنة الدراسية *</label>
            <select
              value={form.academic_year} onChange={(e) => set("academic_year", e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="2025-2026">2025-2026</option>
              <option value="2024-2025">2024-2025</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">ملاحظات (اختياري)</label>
          <textarea
            value={form.notes} onChange={(e) => set("notes", e.target.value)}
            rows={2} placeholder="أي ملاحظات إضافية…"
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit" disabled={loading}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold text-sm transition disabled:opacity-60"
          >
            {loading ? "جاري الحفظ…" : "حفظ وإدخال الدرجات"}
          </button>
          <Link href="/admin/reports"
            className="px-6 py-3 border border-gray-200 text-gray-600 rounded-xl text-sm hover:bg-gray-50 transition text-center">
            إلغاء
          </Link>
        </div>
      </form>
    </div>
  );
}
