"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { Newspaper, Calendar, ArrowLeft, ChevronLeft } from "lucide-react";
import type { News } from "@/lib/supabase/types";

const CATEGORY_COLORS: Record<string, string> = {
  عام: "bg-gray-100 text-gray-600",
  أكاديمي: "bg-blue-100 text-blue-700",
  رياضي: "bg-green-100 text-green-700",
  فني: "bg-purple-100 text-purple-700",
  ترفيهي: "bg-pink-100 text-pink-700",
  إداري: "bg-amber-100 text-amber-700",
};

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("ar-LY", { year: "numeric", month: "short", day: "numeric" });
}

export default function LatestNewsSection() {
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("news")
      .select("*")
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(3)
      .then(({ data }) => {
        setNews((data ?? []) as News[]);
        setLoading(false);
      });
  }, []);

  // If no news and not loading, render nothing
  if (!loading && news.length === 0) return null;

  return (
    <section id="news" className="py-24" style={{ background: "linear-gradient(180deg, #F0FAFF 0%, #fff 100%)" }}>
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Newspaper className="w-8 h-8 text-[#1FA0FF]" />
          </div>
          <h2 className="font-display text-4xl font-bold mb-4" style={{ color: "#1FA0FF" }}>
            آخر الأخبار
          </h2>
          <div className="w-24 h-1.5 mx-auto rounded-full mb-6" style={{ background: "linear-gradient(90deg, #1FA0FF, #A7FDCC)" }} />
          <p className="text-xl text-gray-600">تابع أحدث أخبار وفعاليات مدرسة ضياء المستقبل</p>
        </motion.div>

        {/* News grid */}
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-blue-50 animate-pulse">
                <div className="aspect-video bg-gray-100" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-gray-100 rounded-full w-3/4" />
                  <div className="h-3 bg-gray-100 rounded-full w-full" />
                  <div className="h-3 bg-gray-100 rounded-full w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {news.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Link
                  href={`/news/${item.slug}`}
                  className="group block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-blue-50 h-full"
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
                    <div className="absolute top-3 right-3">
                      <span className={`text-xs font-bold px-3 py-1 rounded-full ${CATEGORY_COLORS[item.category] ?? CATEGORY_COLORS["عام"]}`}>
                        {item.category}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <h3 className="font-bold text-gray-800 text-base leading-snug mb-2 group-hover:text-[#1FA0FF] transition-colors line-clamp-2">
                      {item.title}
                    </h3>
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
                      <span className="text-xs font-semibold text-[#1FA0FF] flex items-center gap-1 group-hover:gap-2 transition-all">
                        اقرأ المزيد
                        <ArrowLeft className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        {/* View all */}
        {!loading && news.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <Link
              href="/news"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-white font-bold text-base shadow-lg transition-all hover:shadow-xl hover:-translate-y-0.5"
              style={{ background: "linear-gradient(135deg, #1FA0FF, #12DAFB)" }}
            >
              عرض جميع الأخبار
              <ChevronLeft className="w-5 h-5" />
            </Link>
          </motion.div>
        )}
      </div>
    </section>
  );
}
