"use client";

interface PrintButtonProps {
  label?: string;
  className?: string;
}

export default function PrintButton({
  label = "طباعة الصحيفة",
  className,
}: PrintButtonProps) {
  return (
    <button
      onClick={() => window.print()}
      className={
        className ??
        "text-sm border border-gray-200 text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition"
      }
    >
      {label}
    </button>
  );
}
