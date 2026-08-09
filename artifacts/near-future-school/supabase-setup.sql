-- =====================================================
-- مدرسة ضياء المستقبل — إعداد قاعدة بيانات Supabase
-- شغّل هذا الملف في Supabase Dashboard → SQL Editor
-- =====================================================

-- =====================
-- 1. جدول الأخبار
-- =====================
CREATE TABLE IF NOT EXISTS news (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title       TEXT NOT NULL,
  slug        TEXT UNIQUE NOT NULL,
  short_description TEXT,
  content     TEXT,
  category    TEXT DEFAULT 'عام',
  main_image  TEXT,
  status      TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  published_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  author_id   UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- =====================
-- 2. جدول وسائط الأخبار
-- =====================
CREATE TABLE IF NOT EXISTS news_media (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  news_id      UUID REFERENCES news(id) ON DELETE CASCADE,
  url          TEXT NOT NULL,
  type         TEXT CHECK (type IN ('image', 'video')),
  storage_path TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- =====================
-- 3. جدول الملاحظات الإدارية
-- =====================
CREATE TABLE IF NOT EXISTS admin_notes (
  id        UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title     TEXT NOT NULL,
  content   TEXT,
  priority  TEXT DEFAULT 'normal' CHECK (priority IN ('high', 'normal', 'low')),
  status    TEXT DEFAULT 'normal' CHECK (status IN ('important', 'normal', 'completed')),
  is_pinned BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  author_id  UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- =====================
-- 4. دالة تحديث updated_at تلقائياً
-- =====================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_news_updated_at
  BEFORE UPDATE ON news
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_notes_updated_at
  BEFORE UPDATE ON admin_notes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =====================
-- 5. Row Level Security
-- =====================
ALTER TABLE news        ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_media  ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_notes ENABLE ROW LEVEL SECURITY;

-- الأخبار: الزوار يقرؤون المنشورة فقط
CREATE POLICY "public_read_published_news"
  ON news FOR SELECT
  USING (status = 'published');

-- الأخبار: المدير يملك صلاحية كاملة
CREATE POLICY "auth_full_access_news"
  ON news FOR ALL
  TO authenticated
  USING (TRUE) WITH CHECK (TRUE);

-- وسائط الأخبار: الزوار يقرؤون
CREATE POLICY "public_read_news_media"
  ON news_media FOR SELECT
  USING (TRUE);

-- وسائط الأخبار: المدير يديرها
CREATE POLICY "auth_manage_news_media"
  ON news_media FOR ALL
  TO authenticated
  USING (TRUE) WITH CHECK (TRUE);

-- الملاحظات: المدير فقط
CREATE POLICY "auth_manage_notes"
  ON admin_notes FOR ALL
  TO authenticated
  USING (TRUE) WITH CHECK (TRUE);

-- =====================
-- 6. Supabase Storage
-- =====================
INSERT INTO storage.buckets (id, name, public)
VALUES ('news-media', 'news-media', TRUE)
ON CONFLICT (id) DO NOTHING;

-- الزوار يقرؤون ملفات التخزين
CREATE POLICY "public_read_storage"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'news-media');

-- المدير يرفع الملفات
CREATE POLICY "auth_upload_storage"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'news-media');

-- المدير يحذف الملفات
CREATE POLICY "auth_delete_storage"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'news-media');

-- =====================
-- 7. فهارس الأداء
-- =====================
CREATE INDEX IF NOT EXISTS idx_news_status ON news(status);
CREATE INDEX IF NOT EXISTS idx_news_slug ON news(slug);
CREATE INDEX IF NOT EXISTS idx_news_published_at ON news(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_media_news_id ON news_media(news_id);
CREATE INDEX IF NOT EXISTS idx_notes_is_pinned ON admin_notes(is_pinned DESC, created_at DESC);
