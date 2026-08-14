import { createClient, createAdminClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight, ClipboardEdit } from "lucide-react";
import { getTemplateById, GRADE_LABELS } from "@/lib/report-templates";
import GradeEntryForm from "./GradeEntryForm";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  return { title: "إدخال الدرجات — لوحة التحكم" };
}

export default async function GradesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const admin = await createAdminClient();
  const { data: student, error } = await admin
    .from("students")
    .select(`*, student_reports!student_reports_student_id_fkey(*)`)
    .eq("id", id)
    .single();

  if (error || !student) notFound();

  const report = (student.student_reports as any[])?.[0];
  const template = getTemplateById(report?.template_id ?? "T1");

  return (
    <div dir="rtl">
      <div className="flex items-center gap-3 mb-5">
        <Link href={`/admin/reports/${id}`} className="text-gray-400 hover:text-gray-600 transition">
          <ArrowRight className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <ClipboardEdit className="w-6 h-6 text-blue-600" />
            إدخال درجات — {student.full_name}
          </h1>
          <p className="text-gray-500 text-sm">
            {GRADE_LABELS[student.grade]} {student.class_section && `— فصل ${student.class_section}`}
            {student.enrollment_number && ` — رقم القيد: ${student.enrollment_number}`}
            <span className="mr-2 bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">{template.name}</span>
          </p>
        </div>
      </div>

      <GradeEntryForm
        studentId={id}
        student={student}
        report={report}
        template={template}
      />
    </div>
  );
}
