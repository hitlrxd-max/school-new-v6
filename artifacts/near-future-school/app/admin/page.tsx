import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/server";
import { LayoutDashboard, Newspaper, StickyNote, Image, Video, PlusCircle, Camera, FileVideo, FilePen, Clock, CheckCircle2, FileEdit } from "lucide-react";
import type { News, AdminNote } from "@/lib/supabase/types";

async function getStats() {
  const supabase = await createAdminClient();

  const [
    { count: totalNews },
    { count: publishedNews },
    { count: draftNews },
    { count: totalImages },
    { count: totalVideos },
    { data: recentNews },
    { data: recentNotes },
  ] = await Promise.all([
    supabase.from("news").select("*", { count: "exact", head: true }),
    supabase.from("news").select("*", { count: "exact", head: true }).eq("status", "published"),
    supabase.from("news").select("*", { count: "exact", head: true }).eq("status", "draft"),
    supabase.from("news_media").select("*", { count: "exact", head: true }).eq("type", "image"),
    supabase.from("news_media").select("*", { count: "exact", head: true }).eq("type", "video"),
    supabase.from("news").select("id,title,status,created_at,category").order("created_at", { ascending: false }).limit(5),
    supabase.from("admin_notes").select("id,title,priority,status,is_pinned,created_at").order("is_pinned", { ascending: false }).order("created_at", { ascending: false }).limit(5),
  ]);

  return { totalNews, publishedNews, draftNews, totalImages, totalVideos, recentNews, recentNotes };
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("ar-LY", { year: "numeric", month: "short", day: "numeric" });
}

export default async function AdminDashboardPage() {
  const { totalNews, publishedNews, draftNews, totalImages, totalVideos, recentNews, recentNotes } = await getStats();

  const statCards = [
    { label: "إجمالي الأخبار", value: totalNews ?? 0, icon: <Newspaper className="w-6 h-6" />, color: "#1FA0FF", bg: "#EBF6FF" },
    { label: "الأخبار المنشورة", value: publishedNews ?? 0, icon: <CheckCircle2 className="w-6 h-6" />, color: "#10B981", bg: "#ECFDF5" },
    { label: "المسودات", value: draftNews ?? 0, icon: <FileEdit className="w-6 h-6" />, color: "#F59E0B", bg: "#FFFBEB" },
    { label: "الصور", value: totalImages ?? 0, icon: <Image className="w-6 h-6" />, color: "#8B5CF6", bg: "#F5F3FF" },
    { label: "الفيديوهات", value: totalVideos ?? 0, icon: <Video className="w-6 h-6" />, color: "#EF4444", bg: "#FEF2F2" },
  ];

  const quickActions = [
    { href: "/admin/news/new", label: "إضافة خبر", icon: <PlusCircle className="w-6 h-6" />, color: "#1FA0FF" },
    { href: "/admin/news/new?type=image", label: "رفع صور", icon: <Camera className="w-6 h-6" />, color: "#8B5CF6" },
    { href: "/admin/news/new?type=video", label: "رفع فيديو", icon: <FileVideo className="w-6 h-6" />, color: "#EF4444" },
    { href: "/admin/notes", label: "إضافة ملاحظة", icon: <FilePen className="w-6 h-6" />, color: "#10B981" },
  ];

  const priorityColors: Record<string, string> = { high: "#EF4444", normal: "#F59E0B", low: "#10B981" };
  const priorityLabels: Record<string, string> = { high: "عالية", normal: "عادية", low: "منخفضة" };
  const statusColors: Record<string, string> = { important: "#EF4444", normal: "#6B7280", completed: "#10B981" };
  const statusLabels: Record<string, string> = { important: "مهمة", normal: "عادية", completed: "مكتملة" };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <LayoutDashboard className="w-7 h-7 text-blue-500" />
          لوحة التحكم
        </h1>
        <p className="text-gray-500 mt-1">مرحباً! إليك نظرة عامة على المحتوى</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {statCards.map((s) => (
          <div key={s.label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ backgroundColor: s.bg, color: s.color }}>
                {s.icon}
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-800">{s.value}</div>
            <div className="text-sm text-gray-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="text-lg font-bold text-gray-700 mb-4">إجراءات سريعة</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {quickActions.map((a) => (
            <Link key={a.href} href={a.href}
              className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all flex flex-col items-center text-center gap-3 group"
            >
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110"
                style={{ backgroundColor: a.color + "15", color: a.color }}
              >
                {a.icon}
              </div>
              <span className="text-sm font-semibold text-gray-700">{a.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent content */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent news */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-gray-50">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <Newspaper className="w-5 h-5 text-blue-500" />
              آخر الأخبار
            </h3>
            <Link href="/admin/news" className="text-sm text-blue-500 hover:text-blue-700 transition">
              عرض الكل
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {!recentNews || recentNews.length === 0 ? (
              <div className="p-6 text-center text-gray-400 text-sm">لا توجد أخبار بعد</div>
            ) : (
              recentNews.map((item: Partial<News>) => (
                <div key={item.id} className="p-4 flex items-start gap-3">
                  <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${item.status === "published" ? "bg-green-400" : "bg-amber-400"}`} />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-800 text-sm truncate">{item.title}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {item.created_at ? formatDate(item.created_at) : ""}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">{item.category}</span>
                    </div>
                  </div>
                  <Link href={`/admin/news/${item.id}/edit`} className="text-xs text-blue-400 hover:text-blue-600 transition flex-shrink-0">
                    تعديل
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent notes */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-gray-50">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <StickyNote className="w-5 h-5 text-amber-500" />
              الملاحظات المهمة
            </h3>
            <Link href="/admin/notes" className="text-sm text-blue-500 hover:text-blue-700 transition">
              عرض الكل
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {!recentNotes || recentNotes.length === 0 ? (
              <div className="p-6 text-center text-gray-400 text-sm">لا توجد ملاحظات بعد</div>
            ) : (
              recentNotes.map((note: Partial<AdminNote>) => (
                <div key={note.id} className="p-4 flex items-start gap-3">
                  {note.is_pinned && <span className="text-amber-400 text-xs mt-1">📌</span>}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-800 text-sm truncate">{note.title}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: priorityColors[note.priority ?? "normal"] }}>
                        {priorityLabels[note.priority ?? "normal"]}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100" style={{ color: statusColors[note.status ?? "normal"] }}>
                        {statusLabels[note.status ?? "normal"]}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
