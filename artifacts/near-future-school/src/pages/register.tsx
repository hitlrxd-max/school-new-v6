import { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ArrowRight, CheckCircle, GraduationCap, Loader2 } from "lucide-react";
import schoolLogo from "@assets/Dشعار_المدرسة_3_1782634252188.png";

const BRANCHES = [
  "فرع المنطقة الجنوبية – تامزاوة الشاطئ",
  "فرع طرابلس – طريق المطار – شارع المطبات",
  "فرع طرابلس – السدرة شارع الحياة",
];

const GRADES = [
  "روضة",
  "تمهيدي",
  "الأول الابتدائي",
  "الثاني الابتدائي",
  "الثالث الابتدائي",
  "الرابع الابتدائي",
  "الخامس الابتدائي",
  "السادس الابتدائي",
  "السابع",
  "الثامن",
  "التاسع",
  "أول ثانوي",
  "ثاني ثانوي",
  "ثالث ثانوي",
];

const GENDERS = ["ذكر", "أنثى"];

interface FormData {
  branch: string;
  studentName: string;
  grade: string;
  gender: string;
  nationalId: string;
  birthDate: string;
  motherName: string;
  motherPhone: string;
  guardianName: string;
  guardianPhone: string;
}

const empty: FormData = {
  branch: "",
  studentName: "",
  grade: "",
  gender: "",
  nationalId: "",
  birthDate: "",
  motherName: "",
  motherPhone: "",
  guardianName: "",
  guardianPhone: "",
};

export default function Register() {
  const [form, setForm] = useState<FormData>(empty);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { toast } = useToast();

  function set(key: keyof FormData, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    for (const [, v] of Object.entries(form)) {
      if (!v.trim()) {
        toast({ title: "خطأ", description: "يرجى تعبئة جميع الحقول المطلوبة.", variant: "destructive" });
        return;
      }
    }
    setLoading(true);
    try {
      const base = import.meta.env.BASE_URL.replace(/\/$/, "");
      const res = await fetch(`${base}/api/registrations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("فشل الإرسال");

      const msg = [
        "📋 *طلب تسجيل طالب جديد*",
        "━━━━━━━━━━━━━━━━━━━━",
        `🏫 *الفرع:* ${form.branch}`,
        "",
        "👤 *بيانات الطالب*",
        `• الاسم: ${form.studentName}`,
        `• الصف: ${form.grade}`,
        `• الجنس: ${form.gender}`,
        `• الرقم الوطني: ${form.nationalId}`,
        `• تاريخ الميلاد: ${form.birthDate}`,
        "",
        "👨‍👩‍👦 *بيانات ولي الأمر والأم*",
        `• اسم ولي الأمر: ${form.guardianName}`,
        `• هاتف ولي الأمر: ${form.guardianPhone}`,
        `• اسم الأم: ${form.motherName}`,
        `• هاتف الأم: ${form.motherPhone}`,
        "━━━━━━━━━━━━━━━━━━━━",
        "مدرسة ضياء المستقبل ✨",
      ].join("\n");

      const waUrl = `https://wa.me/218915463080?text=${encodeURIComponent(msg)}`;
      window.open(waUrl, "_blank");

      setSuccess(true);
    } catch {
      toast({ title: "خطأ", description: "حدث خطأ أثناء الإرسال. يرجى المحاولة مجدداً.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f7fa 50%, #f0fff4 100%)' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl shadow-2xl p-12 max-w-md w-full text-center"
          style={{ borderTop: '4px solid #1FA0FF' }}
        >
          <div className="w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #1FA0FF, #12DAFB)' }}>
            <CheckCircle className="w-14 h-14 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-[#1A1A1A] mb-3">تم التسجيل بنجاح!</h2>
          <p className="text-gray-500 text-lg mb-8 leading-relaxed">
            شكراً لكم. سيتواصل معكم فريقنا قريباً لتأكيد التسجيل واستكمال الإجراءات.
          </p>
          <Button
            className="text-white rounded-full px-8 h-12 font-bold text-lg w-full"
            style={{ background: 'linear-gradient(135deg, #1FA0FF, #12DAFB)' }}
            onClick={() => { setSuccess(false); setForm(empty); }}
          >
            تسجيل طالب آخر
          </Button>
          <Link href="/">
            <Button variant="ghost" className="mt-3 w-full text-gray-500" style={{ color: '#1FA0FF' }}>
              العودة للصفحة الرئيسية
            </Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" dir="rtl" style={{ background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f7fa 50%, #f0fff4 100%)' }}>
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10" style={{ borderBottom: '2px solid #1FA0FF22' }}>
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <Link href="/">
            <div className="flex items-center gap-3 cursor-pointer">
              <img src={schoolLogo} alt="شعار المدرسة" className="h-12 w-auto object-contain" />
              <span className="font-bold text-xl" style={{ color: '#1FA0FF' }}>ضياء المستقبل</span>
            </div>
          </Link>
          <Link href="/">
            <Button variant="ghost" className="flex items-center gap-2 text-gray-600" style={{ color: '#1FA0FF' }}>
              <ArrowRight className="w-4 h-4" />
              العودة للرئيسية
            </Button>
          </Link>
        </div>
      </header>

      {/* Form */}
      <main className="container mx-auto px-4 py-12 max-w-2xl">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>
          {/* Title */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center rounded-full p-4 mb-4" style={{ background: 'linear-gradient(135deg, #1FA0FF22, #12DAFB22)' }}>
              <GraduationCap className="w-10 h-10" style={{ color: '#1FA0FF' }} />
            </div>
            <h1 className="text-4xl font-bold text-[#1A1A1A] mb-2">تسجيل طالب جديد</h1>
            <p className="text-gray-500 text-lg">يرجى تعبئة جميع الحقول بدقة لاستكمال طلب التسجيل</p>
            <div className="w-24 h-1.5 mx-auto rounded-full mt-4" style={{ background: 'linear-gradient(90deg, #1FA0FF, #12DAFB, #A7FDCC)' }} />
          </div>

          <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-xl p-8 space-y-6" style={{ borderTop: '4px solid #1FA0FF' }}>
            {/* Branch */}
            <div className="space-y-2">
              <Label className="text-base font-semibold text-[#1A1A1A]">اختيار الفرع *</Label>
              <Select onValueChange={(v) => set("branch", v)} value={form.branch}>
                <SelectTrigger className="h-12 rounded-xl text-right" style={{ borderColor: '#1FA0FF44' }}>
                  <SelectValue placeholder="اختر الفرع..." />
                </SelectTrigger>
                <SelectContent>
                  {BRANCHES.map((b) => (
                    <SelectItem key={b} value={b}>{b}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Student data divider */}
            <div className="border-t border-dashed pt-2" style={{ borderColor: '#1FA0FF33' }}>
              <p className="text-sm font-bold mb-4 flex items-center gap-2" style={{ color: '#1FA0FF' }}>
                <span className="inline-block w-2 h-2 rounded-full" style={{ background: '#1FA0FF' }} />
                بيانات الطالب
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2 sm:col-span-2">
                  <Label className="font-semibold text-[#1A1A1A]">اسم الطالب كاملاً *</Label>
                  <Input
                    className="h-12 rounded-xl"
                    style={{ borderColor: '#1FA0FF33' }}
                    placeholder="أدخل الاسم الرباعي"
                    value={form.studentName}
                    onChange={(e) => set("studentName", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="font-semibold text-[#1A1A1A]">الصف الدراسي *</Label>
                  <Select onValueChange={(v) => set("grade", v)} value={form.grade}>
                    <SelectTrigger className="h-12 rounded-xl" style={{ borderColor: '#1FA0FF33' }}>
                      <SelectValue placeholder="اختر الصف..." />
                    </SelectTrigger>
                    <SelectContent>
                      {GRADES.map((g) => (
                        <SelectItem key={g} value={g}>{g}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="font-semibold text-[#1A1A1A]">الجنس *</Label>
                  <Select onValueChange={(v) => set("gender", v)} value={form.gender}>
                    <SelectTrigger className="h-12 rounded-xl" style={{ borderColor: '#1FA0FF33' }}>
                      <SelectValue placeholder="اختر..." />
                    </SelectTrigger>
                    <SelectContent>
                      {GENDERS.map((g) => (
                        <SelectItem key={g} value={g}>{g}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="font-semibold text-[#1A1A1A]">الرقم الوطني *</Label>
                  <Input
                    className="h-12 rounded-xl"
                    style={{ borderColor: '#1FA0FF33' }}
                    placeholder="أدخل الرقم الوطني"
                    value={form.nationalId}
                    onChange={(e) => set("nationalId", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="font-semibold text-[#1A1A1A]">تاريخ الميلاد *</Label>
                  <Input
                    type="date"
                    className="h-12 rounded-xl"
                    style={{ borderColor: '#1FA0FF33' }}
                    value={form.birthDate}
                    onChange={(e) => set("birthDate", e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Guardian info */}
            <div className="border-t border-dashed pt-2" style={{ borderColor: '#12DAFB33' }}>
              <p className="text-sm font-bold mb-4 flex items-center gap-2" style={{ color: '#12DAFB' }}>
                <span className="inline-block w-2 h-2 rounded-full" style={{ background: '#12DAFB' }} />
                بيانات ولي الأمر والأم
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-semibold text-[#1A1A1A]">اسم ولي الأمر *</Label>
                  <Input
                    className="h-12 rounded-xl"
                    style={{ borderColor: '#12DAFB33' }}
                    placeholder="اسم ولي الأمر"
                    value={form.guardianName}
                    onChange={(e) => set("guardianName", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="font-semibold text-[#1A1A1A]">رقم هاتف ولي الأمر *</Label>
                  <Input
                    className="h-12 rounded-xl"
                    style={{ borderColor: '#12DAFB33' }}
                    placeholder="09XXXXXXXX"
                    value={form.guardianPhone}
                    onChange={(e) => set("guardianPhone", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="font-semibold text-[#1A1A1A]">اسم الأم *</Label>
                  <Input
                    className="h-12 rounded-xl"
                    style={{ borderColor: '#12DAFB33' }}
                    placeholder="اسم الأم"
                    value={form.motherName}
                    onChange={(e) => set("motherName", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="font-semibold text-[#1A1A1A]">رقم هاتف الأم *</Label>
                  <Input
                    className="h-12 rounded-xl"
                    style={{ borderColor: '#12DAFB33' }}
                    placeholder="09XXXXXXXX"
                    value={form.motherPhone}
                    onChange={(e) => set("motherPhone", e.target.value)}
                  />
                </div>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-14 rounded-2xl text-white text-xl font-bold shadow-lg transition-all hover:shadow-xl hover:-translate-y-0.5 mt-2 border-0"
              style={{ background: 'linear-gradient(135deg, #1FA0FF, #12DAFB)', boxShadow: '0 8px 24px #1FA0FF44' }}
            >
              {loading ? (
                <span className="flex items-center gap-2"><Loader2 className="w-5 h-5 animate-spin" /> جاري الإرسال...</span>
              ) : (
                "إرسال طلب التسجيل ✦"
              )}
            </Button>
          </form>
        </motion.div>
      </main>
    </div>
  );
}
