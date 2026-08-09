import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/server";
import { Newspaper, PlusCircle, Pencil, Trash2, Eye, EyeOff } from "lucide-react";
import type { News } from "@/lib/supabase/types";
import NewsActions from "./NewsActions";

async function getNews(status?: string) {
  const supabase = await createAdminClient();
  let q = supabase.from("news").select("*").order("created_at", { ascending: false });
  if (status && status !== "all") q = q.eq("status", status);
  const { data } = await q;
  return data as News[] | null;
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("ar-LY", { year: "numeric", month: "short", day: "numeric" });
}

const CATEGORIES: Record<string, string> = {
  عام: "bg-gray-100 text-gray-600",
  أكاديمي: "bg-blue-100 text-blue-700",
  رياضي: "bg-green-100 text-green-700",
  فني: "bg-purple-100 text-purple-700",
  ترفيهي: "bg-pink-100 text-pink-700",
  إداري: "bg-amber-100 text-amber-700",
};

export default async function AdminNewsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status = "all" } = await searchParams;
  const news = await getNews(status);

  const tabs = [
    { key: "all", label: "الكل" },
    { key: "published", label: "المنشورة" },
    { key: "draft", label: "المسودات" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Newspaper className="w-7 h-7 text-blue-500" />
          إدارة الأخبار
        </h1>
        <Link
          href="/admin/news/new"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-bold shadow transition-all hover:opacity-90"
          style={{ background: "linear-gradient(135deg, #0D72BB, #1FA0FF)" }}
        >
          <PlusCircle className="w-4 h-4" />
          إضافة خبر جديد
        </Link>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 bg-white rounded-2xl p-2 shadow-sm border border-gray-100 w-fit">
        {tabs.map((t) => (
          <Link
            key={t.key}
            href={`/admin/news?status=${t.key}`}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              status === t.key
                ? "text-white shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
            style={status === t.key ? { background: "linear-gradient(135deg, #0D72BB, #1FA0FF)" } : {}}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {/* News list */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {!news || news.length === 0 ? (
          <div className="py-20 text-center">
            <Newspaper className="w-14 h-14 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-400 font-medium">لا توجد أخبار</p>
            <Link href="/admin/news/new" className="mt-4 inline-block text-blue-500 text-sm hover:underline">
              أضف أول خبر
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {news.map((item) => (
              <div key={item.id} className="flex items-start gap-4 p-4 hover:bg-gray-50/50 transition">
                {/* Image */}
                <div className="w-16 h-16 rounded-xl bg-gray-100 flex-shrink-0 overflow-hidden">
                  {item.main_image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.main_image} alt={item.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Newspaper className="w-6 h-6 text-gray-300" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2 flex-wrap">
                    <span className="font-semibold text-gray-800 text-sm leading-snug">{item.title}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${CATEGORIES[item.category] || CATEGORIES["عام"]}`}>
                      {item.category}
                    </span>
                  </div>
                  {item.short_description && (
                    <p className="text-gray-500 text-xs mt-1 line-clamp-1">{item.short_description}</p>
                  )}
                  <div className="flex items-center gap-3 mt-2 flex-wrap">
                    <span className={`flex items-center gap-1 text-xs font-medium ${item.status === "published" ? "text-green-600" : "text-amber-600"}`}>
                      {item.status === "published" ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      {item.status === "published" ? "منشور" : "مسودة"}
                    </span>
                    <span className="text-gray-400 text-xs">{formatDate(item.created_at)}</span>
                    {item.status === "published" && (
                      <a
                        href={`/news/${item.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-400 hover:text-blue-600 transition"
                      >
                        عرض ↗
                      </a>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <NewsActions newsId={item.id} newsSlug={item.slug} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
