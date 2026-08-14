"use client";

import { useState } from "react";
import Link from "next/link";
import { XCircle, ExternalLink, Search } from "lucide-react";
import { GRADE_LABELS } from "@/lib/report-templates";

type Student = { id: string; name: string; grade: number };

interface Props {
  failedStudents: Student[];
  unlabeledStudents: Student[];
  year: string;
  gradeFilter: string;
}

/**
 * #31 — بحث سريع بالاسم في قائمة المتابعة
 */
export default function WatchListCard({
  failedStudents,
  unlabeledStudents,
  year,
  gradeFilter,
}: Props) {
  const [search, setSearch] = useState("");

  const filter = (list: Student[]) =>
    search.trim()
      ? list.filter((s) =>
          s.name.includes(search.trim())
        )
      : list;

  const filteredFailed = filter(failedStudents);
  const filteredUnlabeled = filter(unlabeledStudents);
  const totalFiltered = filteredFailed.length + filteredUnlabeled.length;
  const total = failedStudents.length + unlabeledStudents.length;

  if (total === 0) return null;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
          <XCircle className="w-5 h-5 text-red-500" />
          طلاب يحتاجون متابعة
        </h2>
        <span className="text-xs text-gray-400">{total} طالب</span>
      </div>

      {/* Search input */}
      <div className="px-6 pt-4 pb-2">
        <div className="relative max-w-sm">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث سريع بالاسم…"
            className="w-full pr-9 pl-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
        {search && (
          <p className="text-xs text-gray-400 mt-1">
            {totalFiltered} نتيجة من {total}
          </p>
        )}
      </div>

      <div className="divide-y divide-gray-50">
        {/* Failed */}
        {filteredFailed.length > 0 && (
          <div className="px-6 py-4">
            <p className="text-xs font-semibold text-red-600 uppercase tracking-wide mb-3 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
              راسب ({filteredFailed.length})
            </p>
            <div className="flex flex-wrap gap-2">
              {filteredFailed.map((s) => (
                <Link
                  key={s.id}
                  href={`/admin/reports/${s.id}?year=${encodeURIComponent(year)}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 rounded-lg text-sm font-medium hover:bg-red-100 transition"
                >
                  <span>{s.name}</span>
                  {!gradeFilter && (
                    <span className="text-red-400 text-xs font-normal">
                      {GRADE_LABELS[s.grade]}
                    </span>
                  )}
                  <ExternalLink className="w-3 h-3 opacity-60" />
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Unlabeled */}
        {filteredUnlabeled.length > 0 && (
          <div className="px-6 py-4">
            <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide mb-3 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
              غير محدد النتيجة ({filteredUnlabeled.length})
            </p>
            <div className="flex flex-wrap gap-2">
              {filteredUnlabeled.map((s) => (
                <Link
                  key={s.id}
                  href={`/admin/reports/${s.id}?year=${encodeURIComponent(year)}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 rounded-lg text-sm font-medium hover:bg-amber-100 transition"
                >
                  <span>{s.name}</span>
                  {!gradeFilter && (
                    <span className="text-amber-400 text-xs font-normal">
                      {GRADE_LABELS[s.grade]}
                    </span>
                  )}
                  <ExternalLink className="w-3 h-3 opacity-60" />
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* No results from search */}
        {search && totalFiltered === 0 && (
          <div className="px-6 py-6 text-center text-sm text-gray-400">
            لا يوجد طالب بهذا الاسم في قائمة المتابعة
          </div>
        )}
      </div>
    </div>
  );
}
