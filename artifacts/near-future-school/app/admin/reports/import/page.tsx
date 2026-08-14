"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import {
  ArrowRight, Upload, FileSpreadsheet, AlertCircle,
  CheckCircle2, XCircle, Download, Loader2, Users
} from "lucide-react";
import { GRADE_LABELS } from "@/lib/report-templates";
import * as XLSX from "xlsx";


/* ------------------------------------------------------------------ */
/* Types                                                                */
/* ------------------------------------------------------------------ */

interface ParsedRow {
  index: number;
  full_name: string;
  enrollment_number: string;
  seat_number: string;
  grade: string;
  class_section: string;
  academic_year: string;
  gender: string;
  errors: string[];
}

interface ImportResult {
  index: number;
  full_name: string;
  success: boolean;
  error?: string;
}

/* ------------------------------------------------------------------ */
/* Helpers                                                              */
/* ------------------------------------------------------------------ */

const REQUIRED_COLUMNS = ["الاسم", "الصف"];
const COLUMN_MAP: Record<string, keyof Omit<ParsedRow, "index" | "errors">> = {
  "الاسم": "full_name",
  "الاسم الكامل": "full_name",
  "اسم الطالب": "full_name",
  "رقم القيد": "enrollment_number",
  "رقم الجلوس": "seat_number",
  "الصف": "grade",
  "الصف الدراسي": "grade",
  "الفصل": "class_section",
  "الشعبة": "class_section",
  "الفصل/الشعبة": "class_section",
  "السنة الدراسية": "academic_year",
  "الجنس": "gender",
};

const GRADE_MAP: Record<string, number> = {
  "1": 1, "الأول": 1, "الصف الأول": 1,
  "2": 2, "الثاني": 2, "الصف الثاني": 2,
  "3": 3, "الثالث": 3, "الصف الثالث": 3,
  "4": 4, "الرابع": 4, "الصف الرابع": 4,
  "5": 5, "الخامس": 5, "الصف الخامس": 5,
  "6": 6, "السادس": 6, "الصف السادس": 6,
  "7": 7, "السابع": 7, "الصف السابع": 7,
  "8": 8, "الثامن": 8, "الصف الثامن": 8,
  "9": 9, "التاسع": 9, "الصف التاسع": 9,
  "10": 10, "العاشر": 10, "الصف العاشر": 10,
  "11": 11, "الحادي عشر": 11, "الصف الحادي عشر": 11,
  "12": 12, "الثاني عشر": 12, "الصف الثاني عشر": 12,
};

function normalizeGrade(raw: string): number | null {
  const trimmed = raw?.toString().trim();
  return GRADE_MAP[trimmed] ?? null;
}

function validateRow(row: ParsedRow, defaultYear: string): ParsedRow {
  const errors: string[] = [];
  if (!row.full_name.trim()) errors.push("الاسم مطلوب");
  const grade = normalizeGrade(row.grade);
  if (!grade) errors.push("الصف غير صحيح (يجب أن يكون رقماً من 1 إلى 12)");
  if (!row.academic_year) row.academic_year = defaultYear;
  return { ...row, grade: grade ? String(grade) : row.grade, errors };
}

function parseSheet(ws: XLSX.WorkSheet, defaultYear: string): { rows: ParsedRow[]; missingColumns: string[] } {
  const raw = XLSX.utils.sheet_to_json<Record<string, string>>(ws, { defval: "" });
  if (raw.length === 0) return { rows: [], missingColumns: [] };

  const headers = Object.keys(raw[0]);
  const missingColumns = REQUIRED_COLUMNS.filter(
    (c) => !headers.some((h) => COLUMN_MAP[h.trim()] === COLUMN_MAP[c])
  );

  const rows: ParsedRow[] = raw.map((rawRow, idx) => {
    const row: ParsedRow = {
      index: idx,
      full_name: "",
      enrollment_number: "",
      seat_number: "",
      grade: "",
      class_section: "",
      academic_year: defaultYear,
      gender: "female",
      errors: [],
    };

    for (const [header, value] of Object.entries(rawRow)) {
      const key = COLUMN_MAP[header.trim()];
      if (key) {
        if (key === "gender") {
          row.gender = value?.includes("ذكر") || value?.toLowerCase() === "male" ? "male" : "female";
        } else {
          (row as any)[key] = String(value ?? "").trim();
        }
      }
    }

    return validateRow(row, defaultYear);
  });

  return { rows, missingColumns };
}

/* ------------------------------------------------------------------ */
/* Component                                                            */
/* ------------------------------------------------------------------ */

export default function ImportStudentsPage() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [missingColumns, setMissingColumns] = useState<string[]>([]);
  const [fileName, setFileName] = useState("");
  const [defaultYear, setDefaultYear] = useState("2025-2026");
  const [loading, setLoading] = useState(false);
  const [checkingDuplicates, setCheckingDuplicates] = useState(false);
  const [importResults, setImportResults] = useState<ImportResult[] | null>(null);
  const [importSummary, setImportSummary] = useState<{ added: number; failed: number } | null>(null);
  const [parseError, setParseError] = useState("");

  /* ---- Duplicate detection ---- */
  async function applyDuplicateErrors(parsed: ParsedRow[]): Promise<ParsedRow[]> {
    // Step 1: detect duplicates within the file itself
    const seenInFile = new Map<string, number>(); // enrollment_number -> first occurrence index
    const inFileDuplicates = new Set<number>(); // row indexes that are duplicates
    for (const row of parsed) {
      const num = row.enrollment_number.trim();
      if (!num) continue;
      if (seenInFile.has(num)) {
        inFileDuplicates.add(row.index);
        // also mark the first occurrence
        inFileDuplicates.add(seenInFile.get(num)!);
      } else {
        seenInFile.set(num, row.index);
      }
    }

    // Step 2: check against DB for numbers not already flagged as in-file duplicates
    const numsToCheck = parsed
      .filter((r) => r.enrollment_number.trim() && !inFileDuplicates.has(r.index))
      .map((r) => r.enrollment_number.trim());

    let dbDuplicates = new Set<string>();
    if (numsToCheck.length > 0) {
      setCheckingDuplicates(true);
      try {
        const res = await fetch(
          `/api/admin/reports/bulk?check=${encodeURIComponent(numsToCheck.join(","))}`
        );
        if (res.ok) {
          const data = await res.json() as { duplicates: string[] };
          dbDuplicates = new Set(data.duplicates);
        }
      } catch {
        // silently ignore — duplicates will be caught at save time if this fails
      } finally {
        setCheckingDuplicates(false);
      }
    }

    // Step 3: inject errors into rows
    return parsed.map((row) => {
      const num = row.enrollment_number.trim();
      const newErrors = [...row.errors];
      if (num && inFileDuplicates.has(row.index)) {
        newErrors.push("رقم القيد مكرر داخل الملف");
      } else if (num && dbDuplicates.has(num)) {
        newErrors.push("رقم القيد موجود مسبقاً في قاعدة البيانات");
      }
      return { ...row, errors: newErrors };
    });
  }

  /* ---- File parsing ---- */
  const processFile = useCallback((file: File) => {
    setParseError("");
    setRows([]);
    setMissingColumns([]);
    setImportResults(null);
    setImportSummary(null);
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target!.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: "array" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const { rows: parsed, missingColumns: missing } = parseSheet(ws, defaultYear);
        setMissingColumns(missing);
        const withDuplicates = await applyDuplicateErrors(parsed);
        setRows(withDuplicates);
      } catch {
        setParseError("تعذّر قراءة الملف — تأكد أنه ملف Excel أو CSV صحيح");
      }
    };
    reader.readAsArrayBuffer(file);
  }, [defaultYear]); // eslint-disable-line react-hooks/exhaustive-deps

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  }

  /* ---- Download template ---- */
  function downloadTemplate() {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([
      ["الاسم الكامل", "الصف", "رقم القيد", "رقم الجلوس", "الفصل/الشعبة", "الجنس", "السنة الدراسية"],
      ["فاطمة أحمد علي", "1", "10001", "201", "أ", "أنثى", "2025-2026"],
      ["محمد خالد ناصر", "2", "10002", "202", "ب", "ذكر", "2025-2026"],
    ]);
    ws["!cols"] = [{ wch: 25 }, { wch: 8 }, { wch: 12 }, { wch: 12 }, { wch: 10 }, { wch: 8 }, { wch: 12 }];
    XLSX.utils.book_append_sheet(wb, ws, "الطلاب");
    XLSX.writeFile(wb, "نموذج_استيراد_الطلاب.xlsx");
  }

  /* ---- Import ---- */
  async function handleImport() {
    const valid = rows.filter((r) => r.errors.length === 0);
    if (valid.length === 0) return;

    setLoading(true);
    try {
      const res = await fetch("/api/admin/reports/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          students: valid.map((r) => ({
            full_name: r.full_name,
            enrollment_number: r.enrollment_number || undefined,
            seat_number: r.seat_number || undefined,
            grade: parseInt(r.grade),
            class_section: r.class_section,
            academic_year: r.academic_year,
            gender: r.gender,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setParseError(data.error || "حدث خطأ أثناء الاستيراد");
        return;
      }
      setImportResults(data.results);
      setImportSummary({ added: data.added, failed: data.failed });
      setRows([]);
    } catch {
      setParseError("خطأ في الاتصال بالخادم");
    } finally {
      setLoading(false);
    }
  }

  const validCount = rows.filter((r) => r.errors.length === 0).length;
  const errorCount = rows.filter((r) => r.errors.length > 0).length;
  const canImport = validCount > 0 && missingColumns.length === 0 && !loading && !checkingDuplicates;

  return (
    <div dir="rtl" className="max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/reports" className="text-gray-400 hover:text-gray-600 transition">
          <ArrowRight className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-blue-600" />
            استيراد قائمة الطلاب
          </h1>
          <p className="text-gray-500 text-sm">ارفع ملف Excel أو CSV لإضافة طلاب دفعة واحدة</p>
        </div>
      </div>

      {/* Results panel (after import) */}
      {importSummary && importResults && (
        <div className="mb-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
              <CheckCircle2 className="w-8 h-8 text-green-500 shrink-0" />
              <div>
                <p className="text-2xl font-bold text-green-700">{importSummary.added}</p>
                <p className="text-sm text-green-600">طالب أُضيف بنجاح</p>
              </div>
            </div>
            <div className={`border rounded-xl p-4 flex items-center gap-3 ${importSummary.failed > 0 ? "bg-red-50 border-red-200" : "bg-gray-50 border-gray-200"}`}>
              <XCircle className={`w-8 h-8 shrink-0 ${importSummary.failed > 0 ? "text-red-500" : "text-gray-400"}`} />
              <div>
                <p className={`text-2xl font-bold ${importSummary.failed > 0 ? "text-red-700" : "text-gray-500"}`}>{importSummary.failed}</p>
                <p className={`text-sm ${importSummary.failed > 0 ? "text-red-600" : "text-gray-400"}`}>فشل في الإضافة</p>
              </div>
            </div>
          </div>

          {importSummary.failed > 0 && (
            <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
              <div className="bg-red-50 border-b border-red-100 px-4 py-2.5">
                <p className="text-sm font-semibold text-red-700 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4" /> الصفوف التي فشلت
                </p>
              </div>
              <div className="divide-y divide-gray-50">
                {importResults.filter((r) => !r.success).map((r) => (
                  <div key={r.index} className="px-4 py-2.5 flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-800">{r.full_name || `صف ${r.index + 1}`}</span>
                    <span className="text-red-600 text-xs bg-red-50 px-2 py-0.5 rounded-full">{r.error}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <Link href="/admin/reports"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl text-sm font-semibold text-center transition">
              عرض الطلاب المستوردين
            </Link>
            <button onClick={() => { setImportResults(null); setImportSummary(null); setFileName(""); }}
              className="px-5 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm hover:bg-gray-50 transition">
              استيراد ملف آخر
            </button>
          </div>
        </div>
      )}

      {!importSummary && (
        <>
          {/* Top controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-gray-700">السنة الدراسية الافتراضية:</label>
              <select
                value={defaultYear}
                onChange={(e) => setDefaultYear(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="2025-2026">2025-2026</option>
                <option value="2024-2025">2024-2025</option>
              </select>
            </div>
            <button onClick={downloadTemplate}
              className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 border border-blue-200 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition">
              <Download className="w-4 h-4" />
              تنزيل النموذج
            </button>
          </div>

          {/* Drop zone */}
          {rows.length === 0 && (
            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              onClick={() => fileRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition ${
                dragging ? "border-blue-400 bg-blue-50" : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
              }`}
            >
              <Upload className={`w-10 h-10 mx-auto mb-3 ${dragging ? "text-blue-500" : "text-gray-300"}`} />
              <p className="text-base font-semibold text-gray-600 mb-1">اسحب الملف هنا أو انقر للاختيار</p>
              <p className="text-xs text-gray-400">يدعم ملفات Excel (.xlsx, .xls) وCSV</p>
              <input
                ref={fileRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                className="hidden"
                onChange={onFileChange}
              />
            </div>
          )}

          {parseError && (
            <div className="mt-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" /> {parseError}
            </div>
          )}

          {/* Missing columns warning */}
          {missingColumns.length > 0 && (
            <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-amber-500" />
              <div>
                <p className="font-semibold">أعمدة مطلوبة غير موجودة في الملف:</p>
                <p className="mt-0.5">{missingColumns.join("، ")}</p>
                <p className="mt-1 text-xs text-amber-600">تنزيل النموذج أعلاه يحتوي على الأعمدة الصحيحة.</p>
              </div>
            </div>
          )}

          {/* Preview table */}
          {rows.length > 0 && (
            <div className="mt-4 space-y-4">
              {/* Summary bar */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
                    <Users className="w-4 h-4 text-blue-500" />
                    {rows.length} صف في الملف
                  </span>
                  {validCount > 0 && (
                    <span className="flex items-center gap-1 text-sm text-green-600">
                      <CheckCircle2 className="w-4 h-4" /> {validCount} صحيح
                    </span>
                  )}
                  {errorCount > 0 && (
                    <span className="flex items-center gap-1 text-sm text-red-600">
                      <XCircle className="w-4 h-4" /> {errorCount} يحتوي خطأ
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => { setRows([]); setFileName(""); setMissingColumns([]); if (fileRef.current) fileRef.current.value = ""; }}
                    className="text-sm border border-gray-200 text-gray-500 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition"
                  >
                    إعادة الاختيار
                  </button>
                  <button
                    onClick={handleImport}
                    disabled={!canImport}
                    className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold px-4 py-1.5 rounded-lg transition"
                  >
                    {(loading || checkingDuplicates) ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    {loading ? "جاري الاستيراد…" : checkingDuplicates ? "جاري التحقق من التكرار…" : `استيراد ${validCount} طالب`}
                  </button>
                </div>
              </div>

              <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto max-h-[480px] overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-100 sticky top-0">
                      <tr>
                        <th className="text-right px-3 py-2.5 font-semibold text-gray-600 w-8">#</th>
                        <th className="text-right px-3 py-2.5 font-semibold text-gray-600">الاسم</th>
                        <th className="text-right px-3 py-2.5 font-semibold text-gray-600">الصف</th>
                        <th className="text-right px-3 py-2.5 font-semibold text-gray-600">رقم القيد</th>
                        <th className="text-right px-3 py-2.5 font-semibold text-gray-600">رقم الجلوس</th>
                        <th className="text-right px-3 py-2.5 font-semibold text-gray-600">الفصل</th>
                        <th className="text-right px-3 py-2.5 font-semibold text-gray-600">الحالة</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {rows.map((row) => {
                        const hasError = row.errors.length > 0;
                        const gradeNum = parseInt(row.grade);
                        const gradeLabel = GRADE_LABELS[gradeNum] ?? row.grade;
                        return (
                          <tr key={row.index} className={hasError ? "bg-red-50" : ""}>
                            <td className="px-3 py-2 text-gray-400 text-xs">{row.index + 1}</td>
                            <td className="px-3 py-2 font-medium text-gray-900">{row.full_name || <span className="text-gray-300 italic">فارغ</span>}</td>
                            <td className="px-3 py-2 text-gray-600">{gradeLabel}</td>
                            <td className="px-3 py-2 text-gray-500">{row.enrollment_number || "—"}</td>
                            <td className="px-3 py-2 text-gray-500">{row.seat_number || "—"}</td>
                            <td className="px-3 py-2 text-gray-500">{row.class_section || "—"}</td>
                            <td className="px-3 py-2">
                              {hasError ? (
                                <span className="inline-flex items-center gap-1 text-xs text-red-600 bg-red-100 px-2 py-0.5 rounded-full">
                                  <XCircle className="w-3 h-3" />
                                  {row.errors[0]}
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                                  <CheckCircle2 className="w-3 h-3" />
                                  صحيح
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {fileName && (
                <p className="text-xs text-gray-400 text-center">الملف: {fileName}</p>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
