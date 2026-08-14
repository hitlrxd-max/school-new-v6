import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Calendar, Tag, ArrowLeft, Newspaper, Image as ImageIcon, Video, GraduationCap } from "lucide-react";
import type { News, NewsMedia } from "@/lib/supabase/types";
import MobileNavSidebar from "@/app/components/MobileNavSidebar";

export const revalidate = 60;

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("ar-LY", {
    year: "numeric", month: "long", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

const CATEGORY_COLORS: Record<string, string> = {
  عام: "bg-gray-100 text-gray-600",
  أكاديمي: "bg-blue-100 text-blue-700",
  رياضي: "bg-green-100 text-green-700",
  فني: "bg-purple-100 text-purple-700",
  ترفيهي: "bg-pink-100 text-pink-700",
  إداري: "bg-amber-100 text-amber-700",
};

export default async function NewsDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();

  // Fetch news first
  const { data: news } = await supabase
    .from("news")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (!news) notFound();

  const item = news as News;

  // Fetch media and related in parallel
  const [{ data: newsMedia }, { data: related }] = await Promise.all([
    supabase.from("news_media").select("*").eq("news_id", item.id),
    supabase
      .from("news")
      .select("id,title,slug,main_image,category,published_at")
      .eq("status", "published")
      .neq("slug", slug)
      .order("published_at", { ascending: false })
      .limit(3),
  ]);

  const images = ((newsMedia ?? []) as NewsMedia[]).filter((m) => m.type === "image");
  const videos = ((newsMedia ?? []) as NewsMedia[]).filter((m) => m.type === "video");
  const relatedItems = (related ?? []) as Partial<News>[];

  return (
    <div className="min-h-screen bg-[#F0FAFF]" dir="rtl">
      {/* Sticky breadcrumb */}
      <div className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b border-blue-50 px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-sm text-gray-500 min-w-0">
            <Link href="/" className="hover:text-blue-600 transition shrink-0">الرئيسية</Link>
            <span>/</span>
            <Link href="/news" className="hover:text-blue-600 transition shrink-0">الأخبار</Link>
            <span>/</span>
            <span className="text-gray-800 font-medium truncate">{item.title}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link href="/" className="hidden sm:flex items-center gap-1.5 font-bold text-blue-700 text-sm">
              <GraduationCap className="w-5 h-5" />
            </Link>
            <MobileNavSidebar />
          </div>
        </div>
      </div>

      <article className="max-w-4xl mx-auto px-4 py-10">
        {/* Meta */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <span className={`text-xs font-bold px-3 py-1 rounded-full ${CATEGORY_COLORS[item.category] ?? CATEGORY_COLORS["عام"]}`}>
              <Tag className="w-3 h-3 inline me-1" />
              {item.category}
            </span>
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {formatDate(item.published_at ?? item.created_at)}
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 leading-snug mb-4">{item.title}</h1>
          {item.short_description && (
            <p className="text-xl text-gray-500 leading-relaxed border-r-4 border-blue-400 pr-4">
              {item.short_description}
            </p>
          )}
        </div>

        {/* Main image */}
        {item.main_image && (
          <div className="rounded-2xl overflow-hidden mb-8 shadow-md">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={item.main_image} alt={item.title} className="w-full max-h-[500px] object-cover" />
          </div>
        )}

        {/* Content */}
        {item.content && (
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-blue-50 mb-8">
            <div className="text-gray-700 leading-loose text-base sm:text-lg" style={{ whiteSpace: "pre-wrap" }}>
              {item.content}
            </div>
          </div>
        )}

        {/* Image gallery */}
        {images.length > 0 && (
          <section className="mb-8">
            <h2 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-purple-500" />
              معرض الصور
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {images.map((img) => (
                <a key={img.id} href={img.url} target="_blank" rel="noopener noreferrer"
                  className="block rounded-xl overflow-hidden aspect-square bg-gray-100 hover:opacity-90 transition shadow-sm">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                </a>
              ))}
            </div>
          </section>
        )}

        {/* Videos */}
        {videos.length > 0 && (
          <section className="mb-8">
            <h2 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
              <Video className="w-5 h-5 text-red-500" />
              فيديوهات
            </h2>
            <div className="space-y-4">
              {videos.map((v) => (
                <div key={v.id} className="rounded-2xl overflow-hidden shadow-sm bg-black">
                  <video controls className="w-full max-h-96" preload="metadata">
                    <source src={v.url} />
                    متصفحك لا يدعم تشغيل الفيديو
                  </video>
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="text-center py-4">
          <Link href="/news" className="inline-flex items-center gap-2 text-blue-500 hover:text-blue-700 transition font-medium">
            <ArrowLeft className="w-4 h-4" />
            العودة للأخبار
          </Link>
        </div>
      </article>

      {/* Related news */}
      {relatedItems.length > 0 && (
        <section className="bg-white border-t border-blue-50 py-12 px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Newspaper className="w-6 h-6 text-blue-500" />
              أخبار ذات صلة
            </h2>
            <div className="grid sm:grid-cols-3 gap-5">
              {relatedItems.map((r) => (
                <Link key={r.id} href={`/news/${r.slug}`}
                  className="group flex gap-3 p-4 rounded-xl hover:bg-blue-50 transition">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-blue-50 flex-shrink-0">
                    {r.main_image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={r.main_image} alt={r.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Newspaper className="w-6 h-6 text-blue-200" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-800 leading-snug group-hover:text-blue-600 transition line-clamp-2">{r.title}</h3>
                    <span className="text-xs text-gray-400 mt-1 block">
                      {r.published_at ? formatDate(r.published_at) : ""}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
