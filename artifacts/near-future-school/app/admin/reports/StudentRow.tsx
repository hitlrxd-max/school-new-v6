"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Pencil, Trash2, Eye, ClipboardEdit, CheckCircle2, Clock, Ban } from "lucide-react";
import { GRADE_LABELS } from "@/lib/report-templates";

function StatusBadge({ report }: { report: any }) {
  if (!report) return <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">بدون صحيفة</span>;
  if (report.result_blocked) return <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full flex items-center gap-1 w-fit"><Ban className="w-3 h-3" />محجوبة</span>;
  if (report.status === "published") return <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full flex items-center gap-1 w-fit"><CheckCircle2 className="w-3 h-3" />منشورة</span>;
  return <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full flex items-center gap-1 w-fit"><Clock className="w-3 h-3" />مسودة</span>;
}

export default function StudentRow({ student }: { student: any }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const report = (student.student_reports as any[])?.[0];

  async function handleDelete() {
    if (!confirm(`حذف الطالب "${student.full_name}" وكل بياناته؟`)) return;
    setDeleting(true);
    await fetch(`/api/admin/reports/${student.id}`, { method: "DELETE" });
    router.refresh();
  }

  const pct = report?.total_max
    ? Math.round((report.total_score / report.total_max) * 100)
    : null;

  return (
    <tr className="hover:bg-gray-50 transition">
      <td className="px-4 py-3 font-medium text-gray-900">{student.full_name}</td>
      <td className="px-4 py-3 text-gray-600">{GRADE_LABELS[student.grade]}</td>
      <td className="px-4 py-3 text-gray-500 font-mono text-xs">{student.enrollment_number || "—"}</td>
      <td className="px-4 py-3 text-gray-500 font-mono text-xs">{student.seat_number || "—"}</td>
      <td className="px-4 py-3"><StatusBadge report={report} /></td>
      <td className="px-4 py-3 text-gray-700 text-xs">
        {report?.total_score != null ? (
          <span>{report.total_score} / {report.total_max} {pct !== null ? `(${pct}%)` : ""}</span>
        ) : "—"}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <Link href={`/admin/reports/${student.id}`}
            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition" title="عرض الصحيفة">
            <Eye className="w-4 h-4" />
          </Link>
          <Link href={`/admin/reports/${student.id}/grades`}
            className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition" title="إدخال الدرجات">
            <ClipboardEdit className="w-4 h-4" />
          </Link>
          <Link href={`/admin/reports/${student.id}/edit`}
            className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition" title="تعديل بيانات الطالب">
            <Pencil className="w-4 h-4" />
          </Link>
          <button onClick={handleDelete} disabled={deleting}
            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50" title="حذف">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}
