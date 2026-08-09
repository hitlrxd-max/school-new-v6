"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  StickyNote, PlusCircle, Pencil, Trash2, Pin, Check,
  Loader2, X, ChevronDown,
} from "lucide-react";
import type { AdminNote, NotePriority, NoteStatus } from "@/lib/supabase/types";

const PRIORITY_LABELS: Record<NotePriority, string> = { high: "عالية", normal: "عادية", low: "منخفضة" };
const PRIORITY_COLORS: Record<NotePriority, string> = { high: "bg-red-100 text-red-600", normal: "bg-amber-100 text-amber-600", low: "bg-green-100 text-green-600" };
const STATUS_LABELS: Record<NoteStatus, string> = { important: "مهمة", normal: "عادية", completed: "مكتملة" };
const STATUS_COLORS: Record<NoteStatus, string> = { important: "text-red-600", normal: "text-gray-500", completed: "text-green-600" };

interface NoteForm {
  title: string;
  content: string;
  priority: NotePriority;
  status: NoteStatus;
  is_pinned: boolean;
}

const emptyForm: NoteForm = { title: "", content: "", priority: "normal", status: "normal", is_pinned: false };

export default function AdminNotesPage() {
  const supabase = createClient();
  const [notes, setNotes] = useState<AdminNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<NoteForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function loadNotes() {
    const { data } = await supabase
      .from("admin_notes")
      .select("*")
      .order("is_pinned", { ascending: false })
      .order("created_at", { ascending: false });
    setNotes((data as AdminNote[]) ?? []);
    setLoading(false);
  }

  useEffect(() => { loadNotes(); }, []);

  function openNew() {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setShowForm(true);
  }

  function openEdit(note: AdminNote) {
    setEditingId(note.id);
    setForm({ title: note.title, content: note.content ?? "", priority: note.priority, status: note.status, is_pinned: note.is_pinned });
    setError("");
    setShowForm(true);
  }

  async function handleSave() {
    if (!form.title.trim()) { setError("العنوان مطلوب"); return; }
    setSaving(true);
    setError("");

    const method = editingId ? "PUT" : "POST";
    const res = await fetch("/api/admin/notes", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: editingId, ...form }),
    });

    if (!res.ok) {
      const d = await res.json();
      setError(d.error ?? "حدث خطأ");
      setSaving(false);
      return;
    }

    setShowForm(false);
    await loadNotes();
    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("هل أنت متأكد من حذف هذه الملاحظة؟")) return;
    await fetch(`/api/admin/notes?id=${id}`, { method: "DELETE" });
    await loadNotes();
  }

  async function togglePin(note: AdminNote) {
    await fetch("/api/admin/notes", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: note.id, is_pinned: !note.is_pinned }),
    });
    await loadNotes();
  }

  async function markCompleted(note: AdminNote) {
    await fetch("/api/admin/notes", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: note.id, status: note.status === "completed" ? "normal" : "completed" }),
    });
    await loadNotes();
  }

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString("ar-LY", { year: "numeric", month: "short", day: "numeric" });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <StickyNote className="w-7 h-7 text-amber-500" />
          الملاحظات المهمة
        </h1>
        <button
          onClick={openNew}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-bold shadow transition-all hover:opacity-90"
          style={{ background: "linear-gradient(135deg, #F59E0B, #EF4444)" }}
        >
          <PlusCircle className="w-4 h-4" />
          إضافة ملاحظة
        </button>
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" dir="rtl">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-800">
                {editingId ? "تعديل الملاحظة" : "إضافة ملاحظة"}
              </h2>
              <button onClick={() => setShowForm(false)} className="p-2 rounded-xl hover:bg-gray-100 transition text-gray-500">
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl">{error}</div>}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">العنوان *</label>
                <input
                  value={form.title}
                  onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                  placeholder="عنوان الملاحظة"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm transition"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">التفاصيل</label>
                <textarea
                  value={form.content}
                  onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))}
                  placeholder="تفاصيل الملاحظة..."
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm resize-none transition"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">الأولوية</label>
                  <select
                    value={form.priority}
                    onChange={(e) => setForm((p) => ({ ...p, priority: e.target.value as NotePriority }))}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 transition"
                  >
                    {Object.entries(PRIORITY_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">الحالة</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm((p) => ({ ...p, status: e.target.value as NoteStatus }))}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 transition"
                  >
                    {Object.entries(STATUS_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                </div>
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <div
                  onClick={() => setForm((p) => ({ ...p, is_pinned: !p.is_pinned }))}
                  className={`w-12 h-6 rounded-full transition-colors flex items-center px-1 ${form.is_pinned ? "bg-amber-400" : "bg-gray-200"}`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${form.is_pinned ? "translate-x-0" : "-translate-x-1"}`} />
                </div>
                <span className="text-sm text-gray-700 font-medium flex items-center gap-1">
                  <Pin className="w-4 h-4 text-amber-400" />
                  تثبيت الملاحظة
                </span>
              </label>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 py-3 rounded-xl text-white font-bold text-sm transition disabled:opacity-60 flex items-center justify-center gap-2"
                style={{ background: "linear-gradient(135deg, #F59E0B, #EF4444)" }}
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                حفظ
              </button>
              <button onClick={() => setShowForm(false)} className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-700 font-bold text-sm hover:bg-gray-200 transition">
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notes list */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
        </div>
      ) : notes.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 py-20 text-center">
          <StickyNote className="w-14 h-14 text-gray-200 mx-auto mb-4" />
          <p className="text-gray-400 font-medium">لا توجد ملاحظات بعد</p>
          <button onClick={openNew} className="mt-4 text-amber-500 text-sm hover:underline">
            أضف أول ملاحظة
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {notes.map((note) => (
            <div
              key={note.id}
              className={`bg-white rounded-2xl p-5 shadow-sm border transition-all ${
                note.status === "completed" ? "opacity-60 border-gray-100" : "border-gray-100 hover:shadow-md"
              } ${note.is_pinned ? "ring-2 ring-amber-300" : ""}`}
            >
              {/* Top row */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  {note.is_pinned && <Pin className="w-4 h-4 text-amber-400 flex-shrink-0" />}
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PRIORITY_COLORS[note.priority]}`}>
                    {PRIORITY_LABELS[note.priority]}
                  </span>
                  <span className={`text-xs font-medium ${STATUS_COLORS[note.status]}`}>
                    {STATUS_LABELS[note.status]}
                  </span>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button onClick={() => togglePin(note)} className="p-1.5 rounded-lg hover:bg-amber-50 text-amber-400 hover:text-amber-500 transition" title="تثبيت">
                    <Pin className="w-4 h-4" />
                  </button>
                  <button onClick={() => openEdit(note)} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-400 hover:text-blue-500 transition" title="تعديل">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(note.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 hover:text-red-500 transition" title="حذف">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <h3 className={`font-bold text-gray-800 mb-2 leading-snug ${note.status === "completed" ? "line-through text-gray-400" : ""}`}>
                {note.title}
              </h3>
              {note.content && (
                <p className="text-sm text-gray-500 leading-relaxed line-clamp-3">{note.content}</p>
              )}

              {/* Footer */}
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50">
                <span className="text-xs text-gray-400">{formatDate(note.created_at)}</span>
                <button
                  onClick={() => markCompleted(note)}
                  className={`flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg transition ${
                    note.status === "completed"
                      ? "bg-gray-100 text-gray-500 hover:bg-gray-200"
                      : "bg-green-50 text-green-600 hover:bg-green-100"
                  }`}
                >
                  <Check className="w-3 h-3" />
                  {note.status === "completed" ? "إلغاء الإكمال" : "مكتملة"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
