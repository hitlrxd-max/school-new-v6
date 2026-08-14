---
name: Report Cards System
description: Electronic report cards (نظام الصحائف الإلكترونية) — architecture, templates, and key decisions
---

## Template Definitions
All 6 templates are hardcoded in `lib/report-templates.ts` (NOT in DB).
Template IDs: T1 (grades 1-2), T2 (grade 3), T3 (grades 4-6), T4 (grades 7-9), T5 (grade 10), T6 (grades 11-12).

## Template Types
- `periods3` — T1, T2: 3 periods (30%+30%+40%), no دور ثاني in exam
- `periods3_dour` — T3: 3 periods with دور ثاني in exam AND final columns
- `semesters_basic` — T4: 2 semesters, أعمال+امتحان per semester, bigger semester wins
- `semesters_secondary` — T5, T6: 2 semesters, دور ثاني optional, sum of both semesters

## Score Calculations (from weekly hours)
- Period max (30%): `hours × 12`
- Exam max (40%): `hours × 16` (= hours × 40 × 0.4)
- Total max (100%): `hours × 40`
- Pass min (50%): `hours × 20`

## Database Tables
Two new tables in `supabase-reports-setup.sql`:
- `students` — enrollment_number UNIQUE, seat_number UNIQUE
- `student_reports` — UNIQUE(student_id, academic_year); scores/activity_scores/behavior as JSONB

**Why JSONB:** Each template has completely different column structures; JSONB is flexible and avoids a complex EAV schema.

## Scores JSON shape (stored in student_reports.scores)
- periods3: `{ subjectKey: { p1_score, p2_score, p3_score } }`
- periods3_dour: `{ subjectKey: { p1_score, p2_score, dour1_score, dour2_score } }`
- semesters: `{ subjectKey: { s1_work, s1_exam, s2_work, s2_exam, dour2_score } }`

## Security (critical)
Public `/results/[id]` page ONLY serves data if `status='published' AND result_blocked=false`.
Check is done server-side in the Supabase query itself (not just UI-level).
Never expose draft/blocked reports — the page returns 404 via notFound() if check fails.

## File Structure
- `lib/report-templates.ts` — template constants
- `app/admin/reports/` — student list, new, [id] view, [id]/grades, [id]/edit
- `app/api/admin/reports/` — CRUD + grades + publish routes
- `app/results/` — public search + view
- `supabase-reports-setup.sql` — SQL to run in Supabase dashboard
