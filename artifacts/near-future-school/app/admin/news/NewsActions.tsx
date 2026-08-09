"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";

export default function NewsActions({ newsId, newsSlug }: { newsId: string; newsSlug: string }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm("هل أنت متأكد من حذف هذا الخبر؟")) return;
    setDeleting(true);
    try {
      await fetch(`/api/admin/news?id=${newsId}`, { method: "DELETE" });
      router.refresh();
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="flex items-center gap-2 flex-shrink-0">
      <Link
        href={`/admin/news/${newsId}/edit`}
        className="p-2 rounded-lg text-blue-400 hover:bg-blue-50 hover:text-blue-600 transition"
        title="تعديل"
      >
        <Pencil className="w-4 h-4" />
      </Link>
      <button
        onClick={handleDelete}
        disabled={deleting}
        className="p-2 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition disabled:opacity-50"
        title="حذف"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}
