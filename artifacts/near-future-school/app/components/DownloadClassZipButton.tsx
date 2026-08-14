"use client";

import { useState } from "react";
import { Archive, AlertTriangle } from "lucide-react";

interface StudentMeta {
  id: string;
  full_name: string;
  enrollment_number?: string;
}

interface Props {
  students: StudentMeta[];
  gradeName?: string;
  /** Academic year string e.g. "2025-2026" — required to render the correct report */
  year: string;
  /** Whether a grade/class filter is currently active */
  hasGradeFilter: boolean;
}

export default function DownloadClassZipButton({ students, gradeName, year, hasGradeFilter }: Props) {
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [failedNames, setFailedNames] = useState<string[]>([]);
  const [successCount, setSuccessCount] = useState<number | null>(null);

  const handleDownload = async () => {
    if (!students.length) return;
    setLoading(true);
    setFailedNames([]);
    setSuccessCount(null);

    const failed: string[] = [];
    let succeeded = 0;

    try {
      const JSZip = (await import("jszip")).default;
      const html2canvas = (await import("html2canvas")).default;
      const { jsPDF } = await import("jspdf");

      const zip = new JSZip();
      const total = students.length;

      for (let i = 0; i < students.length; i++) {
        const student = students[i];
        setProgress({ current: i + 1, total });

        // Create an off-screen iframe pointing to the student's report page for the correct year
        const iframe = document.createElement("iframe");
        iframe.src = `/admin/reports/${student.id}?year=${encodeURIComponent(year)}`;
        iframe.style.cssText =
          "position:fixed;top:0;left:-9999px;width:1100px;height:1400px;opacity:0;pointer-events:none;border:none;";
        document.body.appendChild(iframe);

        // Wait for iframe to fully load (with timeout)
        const loaded = await new Promise<boolean>((resolve) => {
          const timeout = setTimeout(() => resolve(false), 12_000);
          iframe.onload = () => {
            clearTimeout(timeout);
            resolve(true);
          };
          iframe.onerror = () => {
            clearTimeout(timeout);
            resolve(false);
          };
        });

        if (!loaded) {
          failed.push(student.full_name);
          document.body.removeChild(iframe);
          continue;
        }

        // Extra settle time for fonts / images
        await new Promise((r) => setTimeout(r, 700));

        let captured = false;
        try {
          const iframeDoc = iframe.contentDocument;
          const element = iframeDoc?.getElementById("report-card");

          if (!element) {
            failed.push(student.full_name);
            document.body.removeChild(iframe);
            continue;
          }

          const fullWidth = element.scrollWidth;

          const canvas = await html2canvas(element, {
            scale: 2,
            useCORS: true,
            logging: false,
            backgroundColor: "#ffffff",
            width: fullWidth,
            windowWidth: fullWidth,
            onclone: (_doc, clone) => {
              clone.style.width = fullWidth + "px";
              clone.style.overflow = "visible";
              clone.querySelectorAll<HTMLElement>(".overflow-x-auto").forEach((div) => {
                div.style.overflow = "visible";
                div.style.width = "auto";
              });
            },
          });

          const A4_W = 210;
          const A4_H = 297;
          const imgW = canvas.width;
          const imgH = canvas.height;
          const pxPerMm = imgW / A4_W;
          const pageHeightPx = A4_H * pxPerMm;

          const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

          let yOffset = 0;
          let pageNum = 0;

          while (yOffset < imgH) {
            if (pageNum > 0) pdf.addPage();
            const sliceH = Math.min(pageHeightPx, imgH - yOffset);
            const pageCanvas = document.createElement("canvas");
            pageCanvas.width = imgW;
            pageCanvas.height = sliceH;
            const ctx = pageCanvas.getContext("2d")!;
            ctx.drawImage(canvas, 0, -yOffset);
            const imgData = pageCanvas.toDataURL("image/jpeg", 0.92);
            pdf.addImage(imgData, "JPEG", 0, 0, A4_W, sliceH / pxPerMm);
            yOffset += pageHeightPx;
            pageNum++;
          }

          const namePart = student.full_name.replace(/\s+/g, "_");
          const filename = student.enrollment_number
            ? `${namePart}_${student.enrollment_number}_صحيفة.pdf`
            : `${namePart}_صحيفة.pdf`;

          zip.file(filename, pdf.output("blob"));
          succeeded++;
          captured = true;
        } catch (err) {
          console.warn(`Failed to generate PDF for ${student.full_name}:`, err);
          if (!captured) failed.push(student.full_name);
        } finally {
          if (iframe.parentNode) document.body.removeChild(iframe);
        }
      }

      // Only produce a ZIP if at least one PDF was captured
      if (succeeded === 0) {
        setFailedNames(failed);
        setSuccessCount(0);
        return;
      }

      const content = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(content);
      const a = document.createElement("a");
      const label = gradeName ? `صحائف_${gradeName}` : "صحائف_الطلاب";
      a.href = url;
      a.download = `${label}.zip`;
      a.click();
      URL.revokeObjectURL(url);

      setFailedNames(failed);
      setSuccessCount(succeeded);
    } catch (err) {
      console.error("Bulk ZIP generation failed:", err);
      setFailedNames(["خطأ غير متوقع أثناء إنشاء الملف"]);
      setSuccessCount(0);
    } finally {
      setLoading(false);
      setProgress(null);
    }
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={handleDownload}
        disabled={loading || !students.length || !hasGradeFilter}
        className="flex items-center gap-2 bg-white hover:bg-purple-50 border border-purple-200 text-purple-700 px-4 py-2.5 rounded-xl text-sm font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
        title={
          !hasGradeFilter
            ? "يرجى تحديد صف أولاً لتفعيل هذا الخيار"
            : students.length === 0
            ? "لا يوجد طلاب للتنزيل"
            : `تنزيل ${students.length} صحيفة كملف ZIP`
        }
      >
        {loading ? (
          <>
            <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            {progress ? `تجهيز ${progress.current}/${progress.total}...` : "جارٍ التحضير..."}
          </>
        ) : (
          <>
            <Archive className="w-4 h-4 text-purple-500" />
            تنزيل PDF للصف كاملاً
          </>
        )}
      </button>

      {/* Post-download summary */}
      {successCount !== null && (
        <div className="text-xs text-right space-y-0.5">
          {successCount > 0 && (
            <p className="text-green-600">✓ تم تنزيل {successCount} صحيفة بنجاح</p>
          )}
          {failedNames.length > 0 && (
            <div className="flex items-start gap-1 text-amber-700 max-w-xs">
              <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              <p>
                تعذّر تجهيز {failedNames.length} صحيفة:{" "}
                <span className="font-medium">{failedNames.slice(0, 3).join("، ")}</span>
                {failedNames.length > 3 && ` وآخرون (${failedNames.length - 3})`}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
