-- ============================================================
-- نظام الصحائف الإلكترونية — إنشاء الجداول
-- شغّل هذا في Supabase Dashboard → SQL Editor
-- ============================================================

-- جدول الطلاب
CREATE TABLE IF NOT EXISTS students (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name        TEXT NOT NULL,
  enrollment_number TEXT,          -- رقم القيد
  seat_number      TEXT,           -- رقم الجلوس
  grade            INTEGER NOT NULL CHECK (grade BETWEEN 1 AND 12),
  class_section    TEXT DEFAULT '', -- الفصل / الشعبة
  academic_year    TEXT NOT NULL DEFAULT '2025-2026',
  gender           TEXT DEFAULT 'female' CHECK (gender IN ('male', 'female')),
  notes            TEXT DEFAULT '',
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- جدول صحائف الطلاب (واحدة لكل طالب في كل سنة دراسية)
CREATE TABLE IF NOT EXISTS student_reports (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id       UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  template_id      TEXT NOT NULL,   -- T1..T6
  academic_year    TEXT NOT NULL DEFAULT '2025-2026',
  status           TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  result_blocked   BOOLEAN DEFAULT FALSE,
  -- الدرجات كـ JSONB مرن حسب نوع القالب
  scores           JSONB DEFAULT '{}',
  activity_scores  JSONB DEFAULT '{}',
  behavior         JSONB DEFAULT '{}',
  -- نتائج إجمالية (اختياري — للعرض السريع)
  total_score      DECIMAL(8,2),
  total_max        DECIMAL(8,2),
  result_label     TEXT DEFAULT '',  -- ناجح / راسب / غائب
  rank_in_class    INTEGER,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (student_id, academic_year)
);

-- فهارس للبحث
CREATE INDEX IF NOT EXISTS idx_students_enrollment  ON students(enrollment_number);
CREATE INDEX IF NOT EXISTS idx_students_seat        ON students(seat_number);
CREATE INDEX IF NOT EXISTS idx_students_grade       ON students(grade, academic_year);
CREATE INDEX IF NOT EXISTS idx_reports_student      ON student_reports(student_id);
CREATE INDEX IF NOT EXISTS idx_reports_status       ON student_reports(status);

-- Row-Level Security
ALTER TABLE students        ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_reports ENABLE ROW LEVEL SECURITY;

-- القراءة العامة للصحائف المنشورة وغير المحجوبة (للصفحة العامة)
CREATE POLICY "public_read_published_reports"
  ON student_reports FOR SELECT
  USING (status = 'published' AND result_blocked = FALSE);

-- المصادقة: قراءة كل شيء
CREATE POLICY "auth_read_students"
  ON students FOR SELECT TO authenticated USING (TRUE);

CREATE POLICY "auth_all_students"
  ON students FOR ALL TO authenticated USING (TRUE);

CREATE POLICY "auth_read_reports"
  ON student_reports FOR SELECT TO authenticated USING (TRUE);

CREATE POLICY "auth_all_reports"
  ON student_reports FOR ALL TO authenticated USING (TRUE);

-- تحديث updated_at تلقائياً
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'students_updated_at') THEN
    CREATE TRIGGER students_updated_at
      BEFORE UPDATE ON students
      FOR EACH ROW EXECUTE FUNCTION update_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'reports_updated_at') THEN
    CREATE TRIGGER reports_updated_at
      BEFORE UPDATE ON student_reports
      FOR EACH ROW EXECUTE FUNCTION update_updated_at();
  END IF;
END $$;
