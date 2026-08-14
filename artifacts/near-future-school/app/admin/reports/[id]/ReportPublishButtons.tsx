"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, EyeOff, Ban, ShieldCheck } from "lucide-react";

export default function ReportPublishButtons({ studentId, report }: { studentId: string; report: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  async function action(act: string) {
    setLoading(act);
    await fetch(`/api/admin/reports/${studentId}/publish`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: act }),
    });
    setLoading(null);
    router.refresh();
  }

  return (
    <div className="flex flex-wrap gap-2 bg-white border border-gray-100 rounded-xl shadow-sm px-4 py-3">
      <span className="text-sm font-semibold text-gray-700 flex items-center ml-2">إجراءات النشر:</span>
      {report.status !== "published" ? (
        <button onClick={() => action("publish")} disabled={loading === "publish"}
          className="flex items-center gap-1.5 bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-green-700 transition disabled:opacity-60">
          <CheckCircle2 className="w-4 h-4" />{loading === "publish" ? "جاري…" : "نشر الصحيفة"}
        </button>
      ) : (
        <button onClick={() => action("unpublish")} disabled={loading === "unpublish"}
          className="flex items-center gap-1.5 border border-amber-300 text-amber-700 px-3 py-1.5 rounded-lg text-sm hover:bg-amber-50 transition disabled:opacity-60">
          <EyeOff className="w-4 h-4" />{loading === "unpublish" ? "جاري…" : "تحويل لمسودة"}
        </button>
      )}
      {!report.result_blocked ? (
        <button onClick={() => action("block")} disabled={loading === "block"}
          className="flex items-center gap-1.5 border border-red-300 text-red-600 px-3 py-1.5 rounded-lg text-sm hover:bg-red-50 transition disabled:opacity-60">
          <Ban className="w-4 h-4" />{loading === "block" ? "جاري…" : "حجب النتيجة"}
        </button>
      ) : (
        <button onClick={() => action("unblock")} disabled={loading === "unblock"}
          className="flex items-center gap-1.5 border border-green-300 text-green-700 px-3 py-1.5 rounded-lg text-sm hover:bg-green-50 transition disabled:opacity-60">
          <ShieldCheck className="w-4 h-4" />{loading === "unblock" ? "جاري…" : "رفع الحجب"}
        </button>
      )}
    </div>
  );
}
