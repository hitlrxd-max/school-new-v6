import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/server";
import NewsForm from "../../NewsForm";
import type { News, NewsMedia } from "@/lib/supabase/types";

export default async function EditNewsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createAdminClient();

  const [{ data: news }, { data: media }] = await Promise.all([
    supabase.from("news").select("*").eq("id", id).single(),
    supabase.from("news_media").select("*").eq("news_id", id),
  ]);

  if (!news) notFound();

  return <NewsForm news={news as News} media={media as NewsMedia[]} />;
}
