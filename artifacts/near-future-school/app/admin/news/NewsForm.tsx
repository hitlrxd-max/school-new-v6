"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  ArrowRight, Save, Send, Image as ImageIcon, Video, X,
  Loader2, Upload, Star, Newspaper,
} from "lucide-react";
import type { News, NewsMedia } from "@/lib/supabase/types";

const CATEGORIES = ["عام", "أكاديمي", "رياضي", "فني", "ترفيهي", "إداري"];

function generateSlug(title: string): string {
  const latin = title
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
  const base = latin || `news-${Date.now()}`;
  return base + "-" + Math.random().toString(36).slice(2, 7);
}

interface Props {
  news?: News;
  media?: NewsMedia[];
}

export default function NewsForm({ news, media }: Props) {
  const router = useRouter();
  const supabase = createClient();

  const [title, setTitle] = useState(news?.title ?? "");
  const [slug, setSlug] = useState(news?.slug ?? "");
  const [shortDesc, setShortDesc] = useState(news?.short_description ?? "");
  const [content, setContent] = useState(news?.content ?? "");
  const [category, setCategory] = useState(news?.category ?? "عام");
  const [status, setStatus] = useState<"draft" | "published">(news?.status ?? "draft");
  const [publishedAt, setPublishedAt] = useState(
    news?.published_at ? news.published_at.slice(0, 16) : ""
  );

  // Main image
  const [mainImageUrl, setMainImageUrl] = useState(news?.main_image ?? "");
  const [mainImageUploading, setMainImageUploading] = useState(false);
  const mainImageRef = useRef<HTMLInputElement>(null);

  // Gallery images
  const [galleryImages, setGalleryImages] = useState<NewsMedia[]>(
    media?.filter((m) => m.type === "image") ?? []
  );
  const [galleryUploading, setGalleryUploading] = useState(false);
  const galleryRef = useRef<HTMLInputElement>(null);

  // Videos
  const [videos, setVideos] = useState<NewsMedia[]>(
    media?.filter((m) => m.type === "video") ?? []
  );
  const [videoUploading, setVideoUploading] = useState(false);
  const videoRef = useRef<HTMLInputElement>(null);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Auto-generate slug from title
  function handleTitleChange(val: string) {
    setTitle(val);
    if (!news) setSlug(generateSlug(val));
  }

  // Upload to Supabase Storage
  async function uploadFile(file: File, folder: string): Promise<{ url: string; path: string }> {
    const ext = file.name.split(".").pop();
    const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage.from("news-media").upload(path, file, {
      cacheControl: "3600",
      upsert: false,
    });
    if (error) throw new Error(error.message);
    const { data: { publicUrl } } = supabase.storage.from("news-media").getPublicUrl(path);
    return { url: publicUrl, path };
  }

  // Upload main image
  async function handleMainImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setMainImageUploading(true);
    setError("");
    try {
      const { url } = await uploadFile(file, "main");
      setMainImageUrl(url);
    } catch (err: unknown) {
      setError("فشل رفع الصورة: " + (err instanceof Error ? err.message : ""));
    } finally {
      setMainImageUploading(false);
      if (mainImageRef.current) mainImageRef.current.value = "";
    }
  }

  // Upload gallery images
  async function handleGalleryImages(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setGalleryUploading(true);
    setError("");
    try {
      const uploaded = await Promise.all(
        files.map(async (file) => {
          const { url, path } = await uploadFile(file, "gallery");
          return { id: crypto.randomUUID(), news_id: news?.id ?? "", url, type: "image" as const, storage_path: path, created_at: new Date().toISOString() };
        })
      );
      setGalleryImages((prev) => [...prev, ...uploaded]);
    } catch (err: unknown) {
      setError("فشل رفع الصور: " + (err instanceof Error ? err.message : ""));
    } finally {
      setGalleryUploading(false);
      if (galleryRef.current) galleryRef.current.value = "";
    }
  }

  // Upload video
  async function handleVideo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 100 * 1024 * 1024) {
      setError("حجم الفيديو يجب أن يكون أقل من 100 ميغابايت");
      return;
    }
    setVideoUploading(true);
    setError("");
    try {
      const { url, path } = await uploadFile(file, "videos");
      setVideos((prev) => [...prev, { id: crypto.randomUUID(), news_id: news?.id ?? "", url, type: "video", storage_path: path, created_at: new Date().toISOString() }]);
    } catch (err: unknown) {
      setError("فشل رفع الفيديو: " + (err instanceof Error ? err.message : ""));
    } finally {
      setVideoUploading(false);
      if (videoRef.current) videoRef.current.value = "";
    }
  }

  function removeGalleryImage(id: string) {
    setGalleryImages((prev) => prev.filter((i) => i.id !== id));
  }

  function removeVideo(id: string) {
    setVideos((prev) => prev.filter((v) => v.id !== id));
  }

  // Save news
  async function handleSave(publishNow?: boolean) {
    if (!title.trim()) { setError("العنوان مطلوب"); return; }
    if (!slug.trim()) { setError("الرابط (slug) مطلوب"); return; }

    setSaving(true);
    setError("");

    const finalStatus = publishNow ? "published" : status;
    const finalPublishedAt = finalStatus === "published"
      ? (publishedAt || new Date().toISOString())
      : null;

    try {
      const method = news ? "PUT" : "POST";
      const body = {
        id: news?.id,
        title, slug, short_description: shortDesc, content, category,
        main_image: mainImageUrl || null,
        status: finalStatus,
        published_at: finalPublishedAt,
        media: [
          ...galleryImages.map((i) => ({ url: i.url, type: "image", storage_path: i.storage_path })),
          ...videos.map((v) => ({ url: v.url, type: "video", storage_path: v.storage_path })),
        ],
      };

      const res = await fetch("/api/admin/news", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "حدث خطأ");
      }

      router.push("/admin/news");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "حدث خطأ غير متوقع");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-3 flex-wrap">
        <button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-gray-100 transition text-gray-600">
          <ArrowRight className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Newspaper className="w-7 h-7 text-blue-500" />
          {news ? "تعديل الخبر" : "إضافة خبر جديد"}
        </h1>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
          {error}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-5">
          {/* Title */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">عنوان الخبر *</label>
              <input
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="أدخل عنوان الخبر"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-sm transition"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">الرابط (Slug)</label>
              <input
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""))}
                placeholder="news-slug"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-sm font-mono transition"
                dir="ltr"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">وصف مختصر</label>
              <textarea
                value={shortDesc}
                onChange={(e) => setShortDesc(e.target.value)}
                placeholder="وصف مختصر يظهر في بطاقة الخبر"
                rows={2}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-sm resize-none transition"
              />
            </div>
          </div>

          {/* Content */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <label className="block text-sm font-semibold text-gray-700 mb-2">محتوى الخبر</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="اكتب محتوى الخبر هنا..."
              rows={12}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-sm resize-none transition leading-relaxed"
            />
          </div>

          {/* Gallery images */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-purple-500" />
                معرض الصور
              </label>
              <button
                type="button"
                onClick={() => galleryRef.current?.click()}
                disabled={galleryUploading}
                className="flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-600 rounded-xl text-xs font-semibold hover:bg-purple-100 transition disabled:opacity-50"
              >
                {galleryUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                {galleryUploading ? "جارٍ الرفع..." : "رفع صور"}
              </button>
              <input ref={galleryRef} type="file" accept="image/*" multiple className="hidden" onChange={handleGalleryImages} />
            </div>
            {galleryImages.length > 0 ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {galleryImages.map((img) => (
                  <div key={img.id} className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                    <button
                      onClick={() => removeGalleryImage(img.id)}
                      className="absolute top-1 left-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition text-xs"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div
                onClick={() => galleryRef.current?.click()}
                className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center cursor-pointer hover:border-purple-300 hover:bg-purple-50/50 transition"
              >
                <ImageIcon className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-400">انقر لاختيار صور أو اسحب وأفلت</p>
                <p className="text-xs text-gray-300 mt-1">يمكن اختيار عدة صور دفعة واحدة</p>
              </div>
            )}
          </div>

          {/* Videos */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Video className="w-4 h-4 text-red-500" />
                فيديوهات
              </label>
              <button
                type="button"
                onClick={() => videoRef.current?.click()}
                disabled={videoUploading}
                className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-500 rounded-xl text-xs font-semibold hover:bg-red-100 transition disabled:opacity-50"
              >
                {videoUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                {videoUploading ? "جارٍ الرفع..." : "رفع فيديو"}
              </button>
              <input ref={videoRef} type="file" accept="video/*" className="hidden" onChange={handleVideo} />
            </div>
            {videos.length > 0 ? (
              <div className="space-y-3">
                {videos.map((v) => (
                  <div key={v.id} className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                    <Video className="w-5 h-5 text-red-400 flex-shrink-0" />
                    <span className="text-xs text-gray-600 flex-1 truncate">{v.url.split("/").pop()}</span>
                    <button onClick={() => removeVideo(v.id)} className="text-red-400 hover:text-red-600 transition">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div
                onClick={() => videoRef.current?.click()}
                className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center cursor-pointer hover:border-red-300 hover:bg-red-50/50 transition"
              >
                <Video className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-400">انقر لاختيار فيديو (أقل من 100 ميغابايت)</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Actions */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-3">
            <h3 className="font-bold text-gray-700 text-sm mb-4">النشر</h3>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-2">الحالة</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as "draft" | "published")}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              >
                <option value="draft">مسودة</option>
                <option value="published">منشور</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-2">تاريخ النشر</label>
              <input
                type="datetime-local"
                value={publishedAt}
                onChange={(e) => setPublishedAt(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                dir="ltr"
              />
            </div>
            <div className="pt-2 space-y-2">
              <button
                onClick={() => handleSave(true)}
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white text-sm font-bold transition disabled:opacity-60"
                style={{ background: "linear-gradient(135deg, #0D72BB, #1FA0FF)" }}
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                نشر الخبر
              </button>
              <button
                onClick={() => handleSave(false)}
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-gray-700 bg-gray-100 hover:bg-gray-200 text-sm font-bold transition disabled:opacity-60"
              >
                <Save className="w-4 h-4" />
                حفظ كمسودة
              </button>
            </div>
          </div>

          {/* Category */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <label className="block text-sm font-bold text-gray-700 mb-3">التصنيف</label>
            <div className="grid grid-cols-2 gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold transition border ${
                    category === cat
                      ? "border-blue-400 text-blue-600 bg-blue-50"
                      : "border-gray-200 text-gray-600 hover:border-blue-300"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Main image */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-400" />
              الصورة الرئيسية
            </label>
            {mainImageUrl ? (
              <div className="relative rounded-xl overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={mainImageUrl} alt="الصورة الرئيسية" className="w-full h-40 object-cover" />
                <button
                  onClick={() => setMainImageUrl("")}
                  className="absolute top-2 left-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div
                onClick={() => mainImageRef.current?.click()}
                className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center cursor-pointer hover:border-blue-300 hover:bg-blue-50/50 transition"
              >
                {mainImageUploading ? (
                  <Loader2 className="w-7 h-7 text-blue-400 mx-auto animate-spin mb-2" />
                ) : (
                  <ImageIcon className="w-7 h-7 text-gray-300 mx-auto mb-2" />
                )}
                <p className="text-xs text-gray-400">
                  {mainImageUploading ? "جارٍ الرفع..." : "انقر لاختيار صورة"}
                </p>
              </div>
            )}
            <input ref={mainImageRef} type="file" accept="image/*" className="hidden" onChange={handleMainImage} />
          </div>
        </div>
      </div>
    </div>
  );
}
