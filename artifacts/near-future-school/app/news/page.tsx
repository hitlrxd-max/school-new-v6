import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Newspaper, Calendar, Tag, ArrowLeft, GraduationCap } from "lucide-react";
import type { News } from "@/lib/supabase/types";
import MobileNavSidebar from "@/app/components/MobileNavSidebar";

const CATEGORY_COLORS: Record<string, string> = {
  عام: "bg-gray-100 text-gray-600",
  أكاديمي: "bg-blue-100 text-blue-700",
  رياضي: "bg-green-100 text-green-700",
  فني: "bg-purple-100 text-purple-700",
  ترفيهي: "bg-pink-100 text-pink-700",
  إداري: "bg-amber-100 text-amber-700",
};

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("ar-LY", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export const revalidate = 60;

export default async function NewsPage() {
  const supabase = await createClient();
  const { data: news } = await supabase
    .from("news")
    .select("*")
    .eq("status", "published")
    .order("published_at", { ascending: false });

  const items = (news ?? []) as News[];

  return (
    <div className="min-h-screen bg-[#F0FAFF]" dir="rtl">
      {/* Sticky Nav */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-blue-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-blue-700">
            <GraduationCap className="w-6 h-6" />
            <span className="hidden sm:inline">مدرسة ضياء المستقبل</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/results" className="hidden md:inline text-sm font-medium text-gray-600 hover:text-blue-600 transition">النتائج</Link>
            <Link href="/" className="hidden md:inline text-sm font-medium text-gray-600 hover:text-blue-600 transition">الرئيسية</Link>
            <MobileNavSidebar />
          </div>
        </div>
      </nav>

      {/* Header */}
      <div
        className="relative py-16 px-4 text-center overflow-hidden"
        style={{ background: "linear-gradient(135deg, #0D72BB 0%, #1FA0FF 60%, #12DAFB 100%)" }}
      >
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-0 w-96 h-96 rounded-full opacity-10" style={{ background: "radial-gradient(circle, #fff 0%, transparent 70%)", transform: "translate(-30%, -30%)" }} />
          <div className="absolute bottom-0 right-0 w-72 h-72 rounded-full opacity-10" style={{ background: "radial-gradient(circle, #A7FDCC 0%, transparent 70%)", transform: "translate(30%, 30%)" }} />
        </div>

        <div className="relative max-w-3xl mx-auto">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Link href="/" className="text-blue-200 hover:text-white transition text-sm flex items-center gap-1">
              الرئيسية
              <ArrowLeft className="w-3.5 h-3.5" />
            </Link>
            <span className="text-blue-200 text-sm">آخر الأخبار</span>
          </div>
          <div className="flex items-center justify-center gap-3 mb-4">
            <Newspaper className="w-10 h-10 text-white/80" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">آخر الأخبار</h1>
          <p className="text-blue-100 text-lg">تابع أحدث أخبار وفعاليات مدرسة ضياء المستقبل</p>
        </div>
      </div>

      {/* News grid */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        {items.length === 0 ? (
          <div className="text-center py-20">
            <Newspaper className="w-16 h-16 text-blue-200 mx-auto mb-4" />
            <p className="text-gray-400 text-lg font-medium">لا توجد أخبار منشورة حتى الآن</p>
            <p className="text-gray-300 mt-2">تابعونا قريباً لمعرفة آخر الأخبار والفعاليات</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <Link
                key={item.id}
                href={`/news/${item.slug}`}
                className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-blue-50"
              >
                {/* Image */}
                <div className="relative aspect-video bg-gradient-to-br from-blue-50 to-cyan-50 overflow-hidden">
                  {item.main_image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.main_image}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Newspaper className="w-12 h-12 text-blue-200" />
                    </div>
                  )}
                  {/* Category badge */}
                  <div className="absolute top-3 right-3">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${CATEGORY_COLORS[item.category] ?? CATEGORY_COLORS["عام"]}`}>
                      {item.category}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <h2 className="font-bold text-gray-800 text-base leading-snug mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                    {item.title}
                  </h2>
                  {item.short_description && (
                    <p className="text-gray-500 text-sm leading-relaxed line-clamp-2 mb-4">
                      {item.short_description}
                    </p>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-xs text-gray-400">
                      <Calendar className="w-3.5 h-3.5" />
                      {formatDate(item.published_at ?? item.created_at)}
                    </span>
                    <span className="text-xs font-semibold text-blue-500 flex items-center gap-1 group-hover:gap-2 transition-all">
                      اقرأ المزيد
                      <ArrowLeft className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="text-center pb-12">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-blue-500 hover:text-blue-700 transition text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          العودة للصفحة الرئيسية
        </Link>
      </div>
    </div>
  );
}
