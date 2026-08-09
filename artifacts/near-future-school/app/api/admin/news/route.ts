import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { createClient } from "@/lib/supabase/server";

async function getAuthUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function POST(req: NextRequest) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { title, slug, short_description, content, category, main_image, status, published_at, media } = body;

  if (!title || !slug) {
    return NextResponse.json({ error: "العنوان والرابط مطلوبان" }, { status: 400 });
  }

  const supabase = await createAdminClient();

  const { data: news, error } = await supabase
    .from("news")
    .insert({ title, slug, short_description, content, category, main_image, status, published_at, author_id: user.id })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ error: "هذا الرابط (slug) مستخدم من قبل، غيّر الرابط" }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Insert media
  if (media && media.length > 0 && news) {
    await supabase.from("news_media").insert(
      media.map((m: { url: string; type: string; storage_path: string }) => ({
        news_id: news.id,
        url: m.url,
        type: m.type,
        storage_path: m.storage_path,
      }))
    );
  }

  return NextResponse.json({ data: news }, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { id, title, slug, short_description, content, category, main_image, status, published_at, is_pinned, media } = body;

  if (!id) return NextResponse.json({ error: "id مطلوب" }, { status: 400 });

  const supabase = await createAdminClient();

  const updateData: Record<string, unknown> = {};
  if (title !== undefined) updateData.title = title;
  if (slug !== undefined) updateData.slug = slug;
  if (short_description !== undefined) updateData.short_description = short_description;
  if (content !== undefined) updateData.content = content;
  if (category !== undefined) updateData.category = category;
  if (main_image !== undefined) updateData.main_image = main_image;
  if (status !== undefined) updateData.status = status;
  if (published_at !== undefined) updateData.published_at = published_at;
  if (is_pinned !== undefined) updateData.is_pinned = is_pinned;

  const { data: news, error } = await supabase
    .from("news")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Replace media if provided
  if (media !== undefined) {
    await supabase.from("news_media").delete().eq("news_id", id);
    if (media.length > 0) {
      await supabase.from("news_media").insert(
        media.map((m: { url: string; type: string; storage_path: string }) => ({
          news_id: id,
          url: m.url,
          type: m.type,
          storage_path: m.storage_path,
        }))
      );
    }
  }

  return NextResponse.json({ data: news });
}

export async function DELETE(req: NextRequest) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id مطلوب" }, { status: 400 });

  const supabase = await createAdminClient();

  // Get storage paths to delete files
  const { data: media } = await supabase.from("news_media").select("storage_path").eq("news_id", id);
  const { data: newsRow } = await supabase.from("news").select("main_image").eq("id", id).single();

  // Delete news (cascade deletes media rows)
  const { error } = await supabase.from("news").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Clean up storage files
  const paths: string[] = [];
  media?.forEach((m) => { if (m.storage_path) paths.push(m.storage_path); });
  if (newsRow?.main_image) {
    const url = new URL(newsRow.main_image);
    const path = url.pathname.split("/news-media/").at(1);
    if (path) paths.push(path);
  }
  if (paths.length > 0) {
    await supabase.storage.from("news-media").remove(paths);
  }

  return NextResponse.json({ success: true });
}
