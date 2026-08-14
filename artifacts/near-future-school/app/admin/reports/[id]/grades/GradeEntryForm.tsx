"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Save, CheckCircle2, AlertCircle } from "lucide-react";
import {
  TemplateDef, SubjectDef,
  calcPeriodMax, calcExamMax, calcTotalMax, calcTotalMin,
} from "@/lib/report-templates";

// ────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────
type ScoreMap = Record<string, Record<string, string>>;
type ActivityMap = Record<string, Record<string, string>>;
type BehaviorMap = Record<string, { authorized: string; unauthorized: string }>;

const GRADE_OPTS = ["ممتاز", "جيد جداً", "جيد", "مقبول", "ضعيف"];

// ────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────
function n(v: string | undefined): number {
  const x = parseFloat(v ?? "");
  return isNaN(x) ? 0 : x;
}

function ScoreInput({
  value, onChange, max, readOnly = false, highlight = false, small = false,
}: {
  value: string; onChange?: (v: string) => void; max?: number;
  readOnly?: boolean; highlight?: boolean; small?: boolean;
}) {
  const num = parseFloat(value);
  const over = !isNaN(num) && max !== undefined && num > max;
  return (
    <input
      type="number" min={0} max={max}
      value={readOnly ? value || "" : value}
      readOnly={readOnly}
      onChange={(e) => onChange?.(e.target.value)}
      className={[
        "w-full text-center border rounded px-0.5 py-0.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400",
        small ? "h-7" : "h-8",
        readOnly ? "bg-gray-50 text-gray-500 cursor-default" : "bg-white",
        highlight ? "bg-blue-50 font-semibold" : "",
        over ? "border-red-400 bg-red-50" : "border-gray-200",
      ].filter(Boolean).join(" ")}
    />
  );
}

// ────────────────────────────────────────────────────────────
// Periods table (T1, T2, T3)
// ────────────────────────────────────────────────────────────
function PeriodsTable({
  template, scores, setScores,
}: {
  template: TemplateDef;
  scores: ScoreMap;
  setScores: (fn: (prev: ScoreMap) => ScoreMap) => void;
}) {
  const isDour = template.type === "periods3_dour";
  const coreSubjects = template.subjects.filter((s) => !s.isActivity);

  function setScore(key: string, col: string, val: string) {
    setScores((p) => ({ ...p, [key]: { ...(p[key] ?? {}), [col]: val } }));
  }
  function get(key: string, col: string) {
    return scores[key]?.[col] ?? "";
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs border-collapse border border-gray-300 min-w-[900px]">
        <thead>
          <tr className="bg-blue-50">
            <th className="border border-gray-300 px-2 py-2 text-right" rowSpan={2}>المواد الدراسية المقررة</th>
            <th className="border border-gray-300 px-1 py-2 text-center" rowSpan={2}>عدد العجمع</th>
            <th className="border border-gray-300 px-2 py-1 text-center" colSpan={2}>الفترة الأولى 30%</th>
            <th className="border border-gray-300 px-2 py-1 text-center" colSpan={2}>الفترة الثانية 30%</th>
            {isDour ? (
              <th className="border border-gray-300 px-2 py-1 text-center" colSpan={3}>الامتحان النهائي 40%</th>
            ) : (
              <th className="border border-gray-300 px-2 py-1 text-center" colSpan={2}>الامتحان النهائي 40%</th>
            )}
            {isDour ? (
              <th className="border border-gray-300 px-2 py-1 text-center" colSpan={4}>النتيجة النهائية 100%</th>
            ) : (
              <th className="border border-gray-300 px-2 py-1 text-center" colSpan={3}>النتيجة النهائية 100%</th>
            )}
          </tr>
          <tr className="bg-blue-50 text-[10px]">
            <th className="border border-gray-300 px-1 py-1 text-center">الكبرى</th>
            <th className="border border-gray-300 px-1 py-1 text-center">التلميذ</th>
            <th className="border border-gray-300 px-1 py-1 text-center">الكبرى</th>
            <th className="border border-gray-300 px-1 py-1 text-center">التلميذ</th>
            <th className="border border-gray-300 px-1 py-1 text-center">الكبرى</th>
            {isDour ? (
              <>
                <th className="border border-gray-300 px-1 py-1 text-center">الدور الأول</th>
                <th className="border border-gray-300 px-1 py-1 text-center">الدور الثاني</th>
              </>
            ) : (
              <th className="border border-gray-300 px-1 py-1 text-center">التلميذ</th>
            )}
            <th className="border border-gray-300 px-1 py-1 text-center">الكبرى</th>
            <th className="border border-gray-300 px-1 py-1 text-center">الصغرى</th>
            {isDour ? (
              <>
                <th className="border border-gray-300 px-1 py-1 text-center">الدور الأول</th>
                <th className="border border-gray-300 px-1 py-1 text-center">الدور الثاني</th>
              </>
            ) : (
              <th className="border border-gray-300 px-1 py-1 text-center">التلميذ</th>
            )}
          </tr>
        </thead>
        <tbody>
          {coreSubjects.map((sub) => {
            const p1Max = calcPeriodMax(sub.hours, 30);
            const p2Max = calcPeriodMax(sub.hours, 30);
            const p3Max = calcExamMax(sub.hours);
            const fMax = calcTotalMax(sub.hours);
            const fMin = calcTotalMin(sub.hours);

            const p1s = n(get(sub.key, "p1_score"));
            const p2s = n(get(sub.key, "p2_score"));
            const p3s = isDour
              ? n(get(sub.key, "dour1_score"))
              : n(get(sub.key, "p3_score"));
            const dour2s = n(get(sub.key, "dour2_score"));
            const finalScore = isDour ? p1s + p2s + p3s : p1s + p2s + p3s;

            return (
              <tr key={sub.key} className="hover:bg-gray-50">
                <td className="border border-gray-300 px-2 py-1 font-medium whitespace-nowrap">{sub.name}</td>
                <td className="border border-gray-300 px-1 py-1 text-center text-gray-500">{sub.hours}</td>
                {/* P1 */}
                <td className="border border-gray-300 p-1 w-14">
                  <ScoreInput value={String(p1Max)} readOnly />
                </td>
                <td className="border border-gray-300 p-1 w-16">
                  <ScoreInput value={get(sub.key, "p1_score")} max={p1Max}
                    onChange={(v) => setScore(sub.key, "p1_score", v)} />
                </td>
                {/* P2 */}
                <td className="border border-gray-300 p-1 w-14">
                  <ScoreInput value={String(p2Max)} readOnly />
                </td>
                <td className="border border-gray-300 p-1 w-16">
                  <ScoreInput value={get(sub.key, "p2_score")} max={p2Max}
                    onChange={(v) => setScore(sub.key, "p2_score", v)} />
                </td>
                {/* P3 / Exam */}
                <td className="border border-gray-300 p-1 w-14">
                  <ScoreInput value={String(p3Max)} readOnly />
                </td>
                {isDour ? (
                  <>
                    <td className="border border-gray-300 p-1 w-16">
                      <ScoreInput value={get(sub.key, "dour1_score")} max={p3Max}
                        onChange={(v) => setScore(sub.key, "dour1_score", v)} />
                    </td>
                    <td className="border border-gray-300 p-1 w-16">
                      <ScoreInput value={get(sub.key, "dour2_score")} max={p3Max}
                        onChange={(v) => setScore(sub.key, "dour2_score", v)} />
                    </td>
                  </>
                ) : (
                  <td className="border border-gray-300 p-1 w-16">
                    <ScoreInput value={get(sub.key, "p3_score")} max={p3Max}
                      onChange={(v) => setScore(sub.key, "p3_score", v)} />
                  </td>
                )}
                {/* Final */}
                <td className="border border-gray-300 p-1 w-14">
                  <ScoreInput value={String(fMax)} readOnly />
                </td>
                <td className="border border-gray-300 p-1 w-14">
                  <ScoreInput value={String(fMin)} readOnly />
                </td>
                {isDour ? (
                  <>
                    <td className="border border-gray-300 p-1 w-16 bg-blue-50">
                      <ScoreInput value={finalScore > 0 ? String(finalScore) : ""} readOnly highlight />
                    </td>
                    <td className="border border-gray-300 p-1 w-16 bg-blue-50">
                      <ScoreInput
                        value={dour2s > 0 ? String(p1s + p2s + dour2s) : ""}
                        readOnly highlight />
                    </td>
                  </>
                ) : (
                  <td className="border border-gray-300 p-1 w-16 bg-blue-50">
                    <ScoreInput value={finalScore > 0 ? String(finalScore) : ""} readOnly highlight />
                  </td>
                )}
              </tr>
            );
          })}
          {/* Total row */}
          <tr className="bg-gray-50 font-semibold">
            <td className="border border-gray-300 px-2 py-1" colSpan={2}>المجموع</td>
            <td className="border border-gray-300 p-1 text-center text-xs">
              {coreSubjects.reduce((s, sub) => s + calcPeriodMax(sub.hours, 30), 0)}
            </td>
            <td className="border border-gray-300 p-1 text-center text-xs">
              {coreSubjects.reduce((s, sub) => s + n(scores[sub.key]?.p1_score), 0) || ""}
            </td>
            <td className="border border-gray-300 p-1 text-center text-xs">
              {coreSubjects.reduce((s, sub) => s + calcPeriodMax(sub.hours, 30), 0)}
            </td>
            <td className="border border-gray-300 p-1 text-center text-xs">
              {coreSubjects.reduce((s, sub) => s + n(scores[sub.key]?.p2_score), 0) || ""}
            </td>
            <td className="border border-gray-300 p-1 text-center text-xs">
              {coreSubjects.reduce((s, sub) => s + calcExamMax(sub.hours), 0)}
            </td>
            {isDour ? (
              <>
                <td className="border border-gray-300 p-1 text-center text-xs">
                  {coreSubjects.reduce((s, sub) => s + n(scores[sub.key]?.dour1_score), 0) || ""}
                </td>
                <td className="border border-gray-300 p-1 text-center text-xs">
                  {coreSubjects.reduce((s, sub) => s + n(scores[sub.key]?.dour2_score), 0) || ""}
                </td>
              </>
            ) : (
              <td className="border border-gray-300 p-1 text-center text-xs">
                {coreSubjects.reduce((s, sub) => s + n(scores[sub.key]?.p3_score), 0) || ""}
              </td>
            )}
            <td className="border border-gray-300 p-1 text-center text-xs">
              {coreSubjects.reduce((s, sub) => s + calcTotalMax(sub.hours), 0)}
            </td>
            <td className="border border-gray-300 p-1 text-center text-xs">
              {coreSubjects.reduce((s, sub) => s + calcTotalMin(sub.hours), 0)}
            </td>
            {isDour ? (
              <>
                <td className="border border-gray-300 p-1 text-center text-xs bg-blue-50">
                  {coreSubjects.reduce((s, sub) => s + n(scores[sub.key]?.p1_score) + n(scores[sub.key]?.p2_score) + n(scores[sub.key]?.dour1_score), 0) || ""}
                </td>
                <td className="border border-gray-300 p-1 text-center text-xs bg-blue-50">
                  {coreSubjects.reduce((s, sub) => s + n(scores[sub.key]?.p1_score) + n(scores[sub.key]?.p2_score) + n(scores[sub.key]?.dour2_score), 0) || ""}
                </td>
              </>
            ) : (
              <td className="border border-gray-300 p-1 text-center text-xs bg-blue-50">
                {coreSubjects.reduce((s, sub) => s + n(scores[sub.key]?.p1_score) + n(scores[sub.key]?.p2_score) + n(scores[sub.key]?.p3_score), 0) || ""}
              </td>
            )}
          </tr>
        </tbody>
      </table>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// Semesters table (T4, T5, T6)
// ────────────────────────────────────────────────────────────
function SemestersTable({
  template, scores, setScores,
}: {
  template: TemplateDef;
  scores: ScoreMap;
  setScores: (fn: (prev: ScoreMap) => ScoreMap) => void;
}) {
  const isSecondary = template.type === "semesters_secondary";
  const coreSubjects = template.subjects.filter((s) => !s.isActivity);

  function setScore(key: string, col: string, val: string) {
    setScores((p) => ({ ...p, [key]: { ...(p[key] ?? {}), [col]: val } }));
  }
  function get(key: string, col: string) { return scores[key]?.[col] ?? ""; }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs border-collapse border border-gray-300 min-w-[960px]">
        <thead>
          <tr className="bg-blue-50">
            <th className="border border-gray-300 px-2 py-2 text-right" rowSpan={2}>المادة الدراسية</th>
            <th className="border border-gray-300 px-1 py-1 text-center" rowSpan={2}>ح</th>
            <th className="border border-gray-300 px-2 py-1 text-center" colSpan={2}>الفصل الأول</th>
            <th className="border border-gray-300 px-2 py-1 text-center" colSpan={2}>الفصل الثاني</th>
            {isSecondary ? (
              <>
                <th className="border border-gray-300 px-1 py-1 text-center" rowSpan={2}>مجموع<br/>الفصلين</th>
                <th className="border border-gray-300 px-1 py-1 text-center" rowSpan={2}>الصغرى<br/>(50%)</th>
                <th className="border border-gray-300 px-1 py-1 text-center" rowSpan={2}>الكبرى<br/>(100%)</th>
                <th className="border border-gray-300 px-1 py-1 text-center" rowSpan={2}>امتحان<br/>الدور الثاني</th>
                <th className="border border-gray-300 px-1 py-1 text-center" rowSpan={2}>النتيجة<br/>النهائية</th>
              </>
            ) : (
              <>
                <th className="border border-gray-300 px-1 py-1 text-center" rowSpan={2}>الكبرى</th>
                <th className="border border-gray-300 px-1 py-1 text-center" rowSpan={2}>الصغرى</th>
                <th className="border border-gray-300 px-1 py-1 text-center" rowSpan={2}>درجة<br/>الطالب</th>
                <th className="border border-gray-300 px-1 py-1 text-center" rowSpan={2}>الدور<br/>الثاني</th>
              </>
            )}
          </tr>
          <tr className="bg-blue-50 text-[10px]">
            <th className="border border-gray-300 px-1 py-1 text-center">أعمال</th>
            <th className="border border-gray-300 px-1 py-1 text-center">امتحان</th>
            <th className="border border-gray-300 px-1 py-1 text-center">أعمال</th>
            <th className="border border-gray-300 px-1 py-1 text-center">امتحان</th>
          </tr>
        </thead>
        <tbody>
          {coreSubjects.map((sub) => {
            const s1w = n(get(sub.key, "s1_work"));
            const s1e = n(get(sub.key, "s1_exam"));
            const s2w = n(get(sub.key, "s2_work"));
            const s2e = n(get(sub.key, "s2_exam"));
            const s1Total = s1w + s1e;
            const s2Total = s2w + s2e;
            const semTotal = s1Total + s2Total;
            const fMax = calcTotalMax(sub.hours);
            const fMin = calcTotalMin(sub.hours);
            const bigger = Math.max(s1Total, s2Total);
            const dour2 = n(get(sub.key, "dour2_score"));
            const finalScore = isSecondary
              ? (dour2 > 0 ? semTotal - Math.min(s1Total, s2Total) + dour2 : semTotal)
              : bigger;

            return (
              <tr key={sub.key} className="hover:bg-gray-50">
                <td className="border border-gray-300 px-2 py-1 font-medium whitespace-nowrap">{sub.name}</td>
                <td className="border border-gray-300 px-1 py-1 text-center text-gray-500">{sub.hours}</td>
                <td className="border border-gray-300 p-1 w-16">
                  <ScoreInput value={get(sub.key, "s1_work")} onChange={(v) => setScore(sub.key, "s1_work", v)} />
                </td>
                <td className="border border-gray-300 p-1 w-16">
                  <ScoreInput value={get(sub.key, "s1_exam")} onChange={(v) => setScore(sub.key, "s1_exam", v)} />
                </td>
                <td className="border border-gray-300 p-1 w-16">
                  <ScoreInput value={get(sub.key, "s2_work")} onChange={(v) => setScore(sub.key, "s2_work", v)} />
                </td>
                <td className="border border-gray-300 p-1 w-16">
                  <ScoreInput value={get(sub.key, "s2_exam")} onChange={(v) => setScore(sub.key, "s2_exam", v)} />
                </td>
                {isSecondary ? (
                  <>
                    <td className="border border-gray-300 p-1 w-16 bg-blue-50">
                      <ScoreInput value={semTotal > 0 ? String(semTotal) : ""} readOnly highlight />
                    </td>
                    <td className="border border-gray-300 p-1 w-14">
                      <ScoreInput value={String(fMin)} readOnly />
                    </td>
                    <td className="border border-gray-300 p-1 w-14">
                      <ScoreInput value={String(fMax)} readOnly />
                    </td>
                    <td className="border border-gray-300 p-1 w-16">
                      <ScoreInput value={get(sub.key, "dour2_score")} onChange={(v) => setScore(sub.key, "dour2_score", v)} />
                    </td>
                    <td className="border border-gray-300 p-1 w-16 bg-green-50">
                      <ScoreInput value={finalScore > 0 ? String(finalScore) : ""} readOnly highlight />
                    </td>
                  </>
                ) : (
                  <>
                    <td className="border border-gray-300 p-1 w-14">
                      <ScoreInput value={String(fMax)} readOnly />
                    </td>
                    <td className="border border-gray-300 p-1 w-14">
                      <ScoreInput value={String(fMin)} readOnly />
                    </td>
                    <td className="border border-gray-300 p-1 w-16 bg-blue-50">
                      <ScoreInput value={bigger > 0 ? String(bigger) : ""} readOnly highlight />
                    </td>
                    <td className="border border-gray-300 p-1 w-16">
                      <ScoreInput value={get(sub.key, "dour2_score")} onChange={(v) => setScore(sub.key, "dour2_score", v)} />
                    </td>
                  </>
                )}
              </tr>
            );
          })}
          {/* Totals */}
          <tr className="bg-gray-50 font-semibold text-center text-xs">
            <td className="border border-gray-300 px-2 py-1 text-right" colSpan={2}>المجموع</td>
            <td className="border border-gray-300 p-1">{coreSubjects.reduce((s, sub) => s + n(scores[sub.key]?.s1_work), 0) || ""}</td>
            <td className="border border-gray-300 p-1">{coreSubjects.reduce((s, sub) => s + n(scores[sub.key]?.s1_exam), 0) || ""}</td>
            <td className="border border-gray-300 p-1">{coreSubjects.reduce((s, sub) => s + n(scores[sub.key]?.s2_work), 0) || ""}</td>
            <td className="border border-gray-300 p-1">{coreSubjects.reduce((s, sub) => s + n(scores[sub.key]?.s2_exam), 0) || ""}</td>
            {isSecondary ? (
              <>
                <td className="border border-gray-300 p-1 bg-blue-50">
                  {coreSubjects.reduce((s, sub) => {
                    const s1 = n(scores[sub.key]?.s1_work) + n(scores[sub.key]?.s1_exam);
                    const s2 = n(scores[sub.key]?.s2_work) + n(scores[sub.key]?.s2_exam);
                    return s + s1 + s2;
                  }, 0) || ""}
                </td>
                <td className="border border-gray-300 p-1">{coreSubjects.reduce((s, sub) => s + calcTotalMin(sub.hours), 0)}</td>
                <td className="border border-gray-300 p-1">{coreSubjects.reduce((s, sub) => s + calcTotalMax(sub.hours), 0)}</td>
                <td className="border border-gray-300 p-1">{coreSubjects.reduce((s, sub) => s + n(scores[sub.key]?.dour2_score), 0) || ""}</td>
                <td className="border border-gray-300 p-1 bg-green-50">—</td>
              </>
            ) : (
              <>
                <td className="border border-gray-300 p-1">{coreSubjects.reduce((s, sub) => s + calcTotalMax(sub.hours), 0)}</td>
                <td className="border border-gray-300 p-1">{coreSubjects.reduce((s, sub) => s + calcTotalMin(sub.hours), 0)}</td>
                <td className="border border-gray-300 p-1 bg-blue-50">
                  {coreSubjects.reduce((s, sub) => {
                    const s1 = n(scores[sub.key]?.s1_work) + n(scores[sub.key]?.s1_exam);
                    const s2 = n(scores[sub.key]?.s2_work) + n(scores[sub.key]?.s2_exam);
                    return s + Math.max(s1, s2);
                  }, 0) || ""}
                </td>
                <td className="border border-gray-300 p-1">{coreSubjects.reduce((s, sub) => s + n(scores[sub.key]?.dour2_score), 0) || ""}</td>
              </>
            )}
          </tr>
        </tbody>
      </table>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// Activity Section
// ────────────────────────────────────────────────────────────
function ActivitySection({
  subjects, periods, activity, setActivity,
}: {
  subjects: string[];
  periods: string[];
  activity: ActivityMap;
  setActivity: (fn: (prev: ActivityMap) => ActivityMap) => void;
}) {
  if (subjects.length === 0) return null;

  function set(subj: string, period: string, val: string) {
    setActivity((p) => ({ ...p, [subj]: { ...(p[subj] ?? {}), [period]: val } }));
  }

  return (
    <div className="mt-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-2">مواد النشاط</h3>
      <table className="w-full text-xs border-collapse border border-gray-300">
        <thead className="bg-gray-50">
          <tr>
            <th className="border border-gray-300 px-3 py-1.5 text-right">المادة</th>
            {periods.map((p, i) => (
              <th key={i} className="border border-gray-300 px-3 py-1.5 text-center">{p}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {subjects.map((subj) => (
            <tr key={subj} className="hover:bg-gray-50">
              <td className="border border-gray-300 px-3 py-1">{subj}</td>
              {periods.map((p, i) => (
                <td key={i} className="border border-gray-300 p-1">
                  <select
                    value={activity[subj]?.[p] ?? ""}
                    onChange={(e) => set(subj, p, e.target.value)}
                    className="w-full border-0 bg-transparent text-center text-xs focus:outline-none focus:ring-1 focus:ring-blue-400 rounded"
                  >
                    <option value="">—</option>
                    {GRADE_OPTS.map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// Behavior Section
// ────────────────────────────────────────────────────────────
function BehaviorSection({
  periods, behavior, setBehavior,
}: {
  periods: string[];
  behavior: BehaviorMap;
  setBehavior: (fn: (prev: BehaviorMap) => BehaviorMap) => void;
}) {
  function set(p: string, k: "authorized" | "unauthorized", val: string) {
    setBehavior((prev) => ({ ...prev, [p]: { ...(prev[p] ?? { authorized: "", unauthorized: "" }), [k]: val } }));
  }

  return (
    <div className="mt-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-2">السلوك والانتظام</h3>
      <table className="w-full text-xs border-collapse border border-gray-300">
        <thead className="bg-gray-50">
          <tr>
            <th className="border border-gray-300 px-3 py-1.5 text-right">البيان</th>
            {periods.map((p, i) => (
              <th key={i} className="border border-gray-300 px-3 py-1.5 text-center">{p}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {(["authorized", "unauthorized"] as const).map((k) => (
            <tr key={k} className="hover:bg-gray-50">
              <td className="border border-gray-300 px-3 py-1">
                {k === "authorized" ? "غياب مشروع (أيام)" : "غياب غير مشروع (أيام)"}
              </td>
              {periods.map((p, i) => (
                <td key={i} className="border border-gray-300 p-1">
                  <input
                    type="number" min={0}
                    value={behavior[p]?.[k] ?? ""}
                    onChange={(e) => set(p, k, e.target.value)}
                    className="w-full text-center border-0 bg-transparent text-xs focus:outline-none focus:ring-1 focus:ring-blue-400 rounded h-7"
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// Main Form
// ────────────────────────────────────────────────────────────
export default function GradeEntryForm({
  studentId, student, report, template,
}: {
  studentId: string;
  student: any;
  report: any;
  template: TemplateDef;
}) {
  const router = useRouter();
  const [scores, setScores] = useState<ScoreMap>(report?.scores ?? {});
  const [activity, setActivity] = useState<ActivityMap>(report?.activity_scores ?? {});
  const [behavior, setBehavior] = useState<BehaviorMap>(report?.behavior ?? {});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [resultLabel, setResultLabel] = useState(report?.result_label ?? "");

  const coreSubjects = template.subjects.filter((s) => !s.isActivity);
  const isPeriods = template.type === "periods3" || template.type === "periods3_dour";
  const isDour = template.type === "periods3_dour";
  const isSecondary = template.type === "semesters_secondary";

  // Compute totals
  const totalScore = (() => {
    if (isPeriods) {
      return coreSubjects.reduce((sum, sub) => {
        const p1 = n(scores[sub.key]?.p1_score);
        const p2 = n(scores[sub.key]?.p2_score);
        const p3 = isDour ? n(scores[sub.key]?.dour1_score) : n(scores[sub.key]?.p3_score);
        return sum + p1 + p2 + p3;
      }, 0);
    } else {
      return coreSubjects.reduce((sum, sub) => {
        const s1 = n(scores[sub.key]?.s1_work) + n(scores[sub.key]?.s1_exam);
        const s2 = n(scores[sub.key]?.s2_work) + n(scores[sub.key]?.s2_exam);
        return sum + (isSecondary ? s1 + s2 : Math.max(s1, s2));
      }, 0);
    }
  })();

  const totalMax = coreSubjects.reduce((s, sub) => s + calcTotalMax(sub.hours), 0);
  const totalMin = coreSubjects.reduce((s, sub) => s + calcTotalMin(sub.hours), 0);
  const pct = totalMax > 0 ? Math.round((totalScore / totalMax) * 100) : 0;

  async function handleSave() {
    setSaving(true); setSaved(false); setError("");
    try {
      const res = await fetch(`/api/admin/reports/${studentId}/grades`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scores, activity_scores: activity, behavior,
          total_score: totalScore || null,
          total_max: totalMax || null,
          result_label: resultLabel,
        }),
      });
      if (!res.ok) { const d = await res.json(); setError(d.error || "خطأ"); return; }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch { setError("خطأ في الاتصال"); }
    finally { setSaving(false); }
  }

  async function handlePublish(action: string) {
    await fetch(`/api/admin/reports/${studentId}/publish`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    router.push(`/admin/reports/${studentId}`);
  }

  return (
    <div className="space-y-5">
      {/* Status bar */}
      <div className="flex items-center justify-between bg-white border border-gray-100 rounded-xl shadow-sm px-5 py-3">
        <div className="flex items-center gap-4">
          <div className="text-sm">
            <span className="text-gray-500">المجموع: </span>
            <span className="font-bold text-blue-700 text-lg">{totalScore}</span>
            <span className="text-gray-400"> / {totalMax}</span>
          </div>
          {totalScore > 0 && (
            <div className="text-sm">
              <span className="text-gray-500">النسبة: </span>
              <span className={`font-bold ${pct >= 50 ? "text-green-600" : "text-red-600"}`}>{pct}%</span>
            </div>
          )}
          {totalScore > 0 && totalMin > 0 && (
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${totalScore >= totalMin ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
              {totalScore >= totalMin ? "ناجح" : "راسب"}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {error && <span className="text-red-600 text-xs flex items-center gap-1"><AlertCircle className="w-3 h-3" />{error}</span>}
          {saved && <span className="text-green-600 text-xs flex items-center gap-1"><CheckCircle2 className="w-3 h-3" />تم الحفظ</span>}
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition disabled:opacity-60">
            <Save className="w-4 h-4" />
            {saving ? "جاري الحفظ…" : "حفظ الدرجات"}
          </button>
        </div>
      </div>

      {/* Grade table */}
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-4">
        <h2 className="text-sm font-bold text-gray-800 mb-3">
          {isPeriods ? "نظام الفترات الثلاث" : "نظام الفصلين الدراسيين"}
        </h2>
        {isPeriods
          ? <PeriodsTable template={template} scores={scores} setScores={setScores} />
          : <SemestersTable template={template} scores={scores} setScores={setScores} />
        }
      </div>

      {/* Activity + Behavior */}
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-4">
        <ActivitySection
          subjects={template.activitySubjects}
          periods={template.behaviorPeriods}
          activity={activity}
          setActivity={setActivity}
        />
        <BehaviorSection
          periods={template.behaviorPeriods}
          behavior={behavior}
          setBehavior={setBehavior}
        />
      </div>

      {/* Result & Publish */}
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-4 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2 flex-1 min-w-48">
          <label className="text-sm font-semibold text-gray-700">نتيجة الطالب:</label>
          <select value={resultLabel} onChange={(e) => setResultLabel(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
            <option value="">اختر…</option>
            <option value="ناجح">ناجح</option>
            <option value="راسب">راسب</option>
            <option value="ناجح بالدور الثاني">ناجح بالدور الثاني</option>
            <option value="غائب">غائب</option>
            <option value="منقول">منقول</option>
          </select>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-1.5 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-60">
            <Save className="w-4 h-4" />حفظ
          </button>
          <button onClick={() => handlePublish("publish")}
            className="flex items-center gap-1.5 bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-green-700 transition">
            <CheckCircle2 className="w-4 h-4" />نشر الصحيفة
          </button>
          <button onClick={() => handlePublish("unpublish")}
            className="flex items-center gap-1.5 border border-amber-300 text-amber-700 px-4 py-2 rounded-xl text-sm hover:bg-amber-50 transition">
            تحويل لمسودة
          </button>
          <button onClick={() => handlePublish("block")}
            className="flex items-center gap-1.5 border border-red-300 text-red-700 px-4 py-2 rounded-xl text-sm hover:bg-red-50 transition">
            حجب النتيجة
          </button>
        </div>
      </div>
    </div>
  );
}
