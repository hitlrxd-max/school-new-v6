"use client";

import { useState } from "react";
import { FileSpreadsheet, Loader2 } from "lucide-react";

interface Props {
  grade: string;
  year: string;
}

export default function ExportButton({ grade, year }: Props) {
  const [loading, setLoading] = useState(false);

  async function handleExport() {
    setLoading(true);
    try {
      const params = new URLSearchParams({ year });
      if (grade) params.set("grade", grade);

      const res = await fetch(`/api/admin/statistics/export?${params}`);
      if (!res.ok) throw new Error("فشل التصدير");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);

      // Extract filename from Content-Disposition header
      const disposition = res.headers.get("Content-Disposition") ?? "";
      const match = disposition.match(/filename\*=UTF-8''(.+)/);
      const filename = match ? decodeURIComponent(match[1]) : "إحصائيات.xlsx";

      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("حدث خطأ أثناء تصدير الملف. حاول مجدداً.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleExport}
      disabled={loading}
      className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-4 py-2 rounded-xl text-sm font-medium transition"
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <FileSpreadsheet className="w-4 h-4" />
      )}
      {loading ? "جارٍ التصدير…" : "تصدير Excel"}
    </button>
  );
}
