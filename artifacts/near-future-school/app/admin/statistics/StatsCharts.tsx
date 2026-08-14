"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts";

interface DistributionBucket {
  label: string;
  count: number;
  color: string;
}

interface GradeRow {
  grade: number;
  gradeLabel: string;
  total: number;
  passed: number;
  failed: number;
  other: number;
  avgScore: number | null;
}

interface Props {
  distribution: DistributionBucket[];
  gradeBreakdown: GradeRow[];
  showBreakdown: boolean;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-md px-3 py-2 text-sm" dir="rtl">
        <p className="font-semibold text-gray-700">{label}</p>
        <p className="text-blue-600">{payload[0].value} طالب</p>
      </div>
    );
  }
  return null;
};

export default function StatsCharts({ distribution, gradeBreakdown, showBreakdown }: Props) {
  return (
    <div className="space-y-6">
      {/* Distribution Chart */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-base font-bold text-gray-800 mb-5">توزيع الدرجات</h2>
        {distribution.every((b) => b.count === 0) ? (
          <div className="flex items-center justify-center h-40 text-gray-400 text-sm">
            لا توجد بيانات كافية لعرض التوزيع
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={distribution} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="label" tick={{ fontSize: 12, fill: "#6B7280" }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "#6B7280" }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {distribution.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Grade breakdown table */}
      {showBreakdown && gradeBreakdown.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-50">
            <h2 className="text-base font-bold text-gray-800">إحصائيات حسب الصف</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-right px-4 py-3 font-semibold text-gray-600">الصف</th>
                  <th className="text-center px-4 py-3 font-semibold text-gray-600">الطلاب</th>
                  <th className="text-center px-4 py-3 font-semibold text-green-600">ناجح</th>
                  <th className="text-center px-4 py-3 font-semibold text-red-600">راسب</th>
                  <th className="text-center px-4 py-3 font-semibold text-gray-500">غائب/أخرى</th>
                  <th className="text-center px-4 py-3 font-semibold text-blue-600">متوسط المجموع</th>
                  <th className="text-center px-4 py-3 font-semibold text-gray-600">نسبة النجاح</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {gradeBreakdown.map((row) => {
                  const passRate = row.total > 0 ? Math.round((row.passed / row.total) * 100) : 0;
                  return (
                    <tr key={row.grade} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3 font-medium text-gray-800">{row.gradeLabel}</td>
                      <td className="px-4 py-3 text-center text-gray-700 font-semibold">{row.total}</td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-block px-2.5 py-0.5 bg-green-50 text-green-700 rounded-full font-semibold">
                          {row.passed}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-block px-2.5 py-0.5 bg-red-50 text-red-700 rounded-full font-semibold">
                          {row.failed}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center text-gray-500">{row.other}</td>
                      <td className="px-4 py-3 text-center text-blue-700 font-semibold">
                        {row.avgScore != null ? row.avgScore.toFixed(1) : "—"}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-20 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{
                                width: `${passRate}%`,
                                backgroundColor: passRate >= 70 ? "#10B981" : passRate >= 50 ? "#F59E0B" : "#EF4444",
                              }}
                            />
                          </div>
                          <span className="text-xs font-semibold text-gray-600 w-8">{passRate}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
