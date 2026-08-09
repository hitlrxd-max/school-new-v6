import Link from "next/link";
import { Newspaper } from "lucide-react";

export default function NewsNotFound() {
  return (
    <div className="min-h-screen bg-[#F0FAFF] flex items-center justify-center p-4" dir="rtl">
      <div className="text-center">
        <Newspaper className="w-16 h-16 text-blue-200 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-700 mb-2">الخبر غير موجود</h1>
        <p className="text-gray-400 mb-6">ربما تم حذف هذا الخبر أو تغيير رابطه.</p>
        <Link
          href="/news"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-bold text-sm shadow"
          style={{ background: "linear-gradient(135deg, #0D72BB, #1FA0FF)" }}
        >
          العودة للأخبار
        </Link>
      </div>
    </div>
  );
}
