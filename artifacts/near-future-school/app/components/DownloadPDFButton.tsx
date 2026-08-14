"use client";

import { useState } from "react";
import { Download } from "lucide-react";

interface DownloadPDFButtonProps {
  targetId?: string;
  studentName?: string;
  enrollmentNumber?: string;
  label?: string;
  className?: string;
}

export default function DownloadPDFButton({
  targetId = "report-card",
  studentName = "صحيفة_النتيجة",
  enrollmentNumber,
  label = "تنزيل PDF",
  className,
}: DownloadPDFButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    const element = document.getElementById(targetId);
    if (!element) return;

    setLoading(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const { jsPDF } = await import("jspdf");

      // Use the element's full scrollable width so tables that overflow on
      // narrow viewports (min-w-[700px] / min-w-[800px]) are captured in full.
      const fullWidth = element.scrollWidth;

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        // Tell html2canvas to render at the full scroll width
        width: fullWidth,
        windowWidth: fullWidth,
        onclone: (_doc, clone) => {
          // Expand the cloned root so it doesn't clip at the viewport edge
          clone.style.width = fullWidth + "px";
          clone.style.overflow = "visible";
          // Remove overflow constraints from all scrollable inner containers
          clone.querySelectorAll<HTMLElement>(".overflow-x-auto").forEach((div) => {
            div.style.overflow = "visible";
            div.style.width = "auto";
          });
        },
      });

      // A4 dimensions in mm
      const A4_W = 210;
      const A4_H = 297;

      const imgW = canvas.width; // pixels at scale×2
      const imgH = canvas.height;

      // How many canvas pixels correspond to 1 mm on the A4 page
      const pxPerMm = imgW / A4_W;
      const pageHeightPx = A4_H * pxPerMm;

      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

      let yOffset = 0;
      let pageNum = 0;

      while (yOffset < imgH) {
        if (pageNum > 0) pdf.addPage();

        const sliceH = Math.min(pageHeightPx, imgH - yOffset);

        // Crop the canvas slice for this page
        const pageCanvas = document.createElement("canvas");
        pageCanvas.width = imgW;
        pageCanvas.height = sliceH;
        const ctx = pageCanvas.getContext("2d")!;
        ctx.drawImage(canvas, 0, -yOffset);

        // PNG بدلاً من JPEG لجودة أعلى (#34)
        const imgData = pageCanvas.toDataURL("image/png");
        const printH = sliceH / pxPerMm; // mm

        pdf.addImage(imgData, "PNG", 0, 0, A4_W, printH);

        yOffset += pageHeightPx;
        pageNum++;
      }

      const namePart = studentName.replace(/\s+/g, "_");
      const filename = enrollmentNumber
        ? `${namePart}_${enrollmentNumber}_صحيفة_النتيجة.pdf`
        : `${namePart}_صحيفة_النتيجة.pdf`;
      pdf.save(filename);
    } catch (err) {
      console.error("PDF generation failed:", err);
      alert("حدث خطأ أثناء إنشاء الملف. يرجى المحاولة مرة أخرى.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      className={
        className ??
        "flex items-center gap-1.5 text-sm border border-emerald-200 text-emerald-700 px-3 py-1.5 rounded-lg hover:bg-emerald-50 transition disabled:opacity-60"
      }
    >
      <Download className="w-4 h-4" />
      {loading ? "جارٍ التحضير..." : label}
    </button>
  );
}
