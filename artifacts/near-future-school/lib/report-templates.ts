/**
 * نظام الصحائف الإلكترونية — تعريف القوالب الستة
 * مستخرجة من صور الصحائف الرسمية للمدرسة
 */

export type SubjectDef = {
  key: string;
  name: string;
  hours: number; // عدد الحصص الأسبوعية
  isActivity?: boolean; // مواد النشاط (تربية فنية، موسيقية، بدنية)
};

export type TemplateType = "periods3" | "periods3_dour" | "semesters_basic" | "semesters_secondary";

export type TemplateDef = {
  id: string;
  name: string;
  grades: number[]; // الصفوف التي يشملها (1-12)
  type: TemplateType;
  subjects: SubjectDef[];
  activitySubjects: string[];
  behaviorPeriods: string[]; // labels for behavior periods
  gender: "female" | "male" | "both";
};

// ─────────────────────────────────────────────────────────────────────────────
// القالب 1: الصف الأول والثاني (نظام 3 فترات — بدون دور ثاني)
// ─────────────────────────────────────────────────────────────────────────────
export const TEMPLATE_1: TemplateDef = {
  id: "T1",
  name: "الصف الأول والثاني",
  grades: [1, 2],
  type: "periods3",
  subjects: [
    { key: "islamic",  name: "التربية الإسلامية",       hours: 3 },
    { key: "arabic",   name: "اللغة العربية",           hours: 6 },
    { key: "english",  name: "اللغة الإنجليزية",        hours: 3 },
    { key: "computer", name: "الحاسوب",                 hours: 1 },
    { key: "math",     name: "الرياضيات",               hours: 5 },
  ],
  activitySubjects: ["التربية الفنية", "التربية الموسيقية", "التربية البدنية"],
  behaviorPeriods: ["الفترة الأولى", "الفترة الثانية", "الفترة الثالثة"],
  gender: "female",
};

// ─────────────────────────────────────────────────────────────────────────────
// القالب 2: الصف الثالث (مثل القالب 1 + العلوم)
// ─────────────────────────────────────────────────────────────────────────────
export const TEMPLATE_2: TemplateDef = {
  id: "T2",
  name: "الصف الثالث",
  grades: [3],
  type: "periods3",
  subjects: [
    { key: "islamic",  name: "التربية الإسلامية",       hours: 3 },
    { key: "arabic",   name: "اللغة العربية",           hours: 6 },
    { key: "english",  name: "اللغة الإنجليزية",        hours: 3 },
    { key: "computer", name: "الحاسوب",                 hours: 1 },
    { key: "math",     name: "الرياضيات",               hours: 5 },
    { key: "science",  name: "العلوم",                  hours: 3 },
  ],
  activitySubjects: ["التربية الفنية", "التربية الموسيقية", "التربية البدنية"],
  behaviorPeriods: ["الفترة الأولى", "الفترة الثانية", "الفترة الثالثة"],
  gender: "female",
};

// ─────────────────────────────────────────────────────────────────────────────
// القالب 3: الصف الرابع والخامس والسادس (3 فترات مع دور ثاني في الامتحان النهائي)
// ─────────────────────────────────────────────────────────────────────────────
export const TEMPLATE_3: TemplateDef = {
  id: "T3",
  name: "الصف الرابع والخامس والسادس",
  grades: [4, 5, 6],
  type: "periods3_dour",
  subjects: [
    { key: "islamic",   name: "التربية الإسلامية",              hours: 3 },
    { key: "arabic",    name: "اللغة العربية",                  hours: 4 },
    { key: "writing",   name: "الكتابة (التعبير والإملاء والخط)", hours: 2 },
    { key: "english",   name: "اللغة الإنجليزية",               hours: 3 },
    { key: "computer",  name: "الحاسوب",                        hours: 1 },
    { key: "math",      name: "الرياضيات",                      hours: 5 },
    { key: "science",   name: "العلوم",                         hours: 3 },
    { key: "social",    name: "الاجتماعيات",                    hours: 2 },
  ],
  activitySubjects: ["التربية الفنية", "التربية الموسيقية", "التربية البدنية"],
  behaviorPeriods: ["الفترة الأولى", "الفترة الثانية", "الفترة الثالثة"],
  gender: "female",
};

// ─────────────────────────────────────────────────────────────────────────────
// القالب 4: الصف السابع والثامن والتاسع (نظام فصلان — أعمال + امتحان)
// ─────────────────────────────────────────────────────────────────────────────
export const TEMPLATE_4: TemplateDef = {
  id: "T4",
  name: "الصف السابع والثامن والتاسع",
  grades: [7, 8, 9],
  type: "semesters_basic",
  subjects: [
    { key: "islamic",   name: "التربية الإسلامية",              hours: 2 },
    { key: "arabic",    name: "اللغة العربية",                  hours: 4 },
    { key: "writing",   name: "الكتابة (التعبير والإملاء والخط)", hours: 2 },
    { key: "english",   name: "اللغة الإنجليزية",               hours: 4 },
    { key: "computer",  name: "الحاسوب",                        hours: 2 },
    { key: "math",      name: "الرياضيات",                      hours: 5 },
    { key: "science",   name: "العلوم",                         hours: 4 },
    { key: "history",   name: "التاريخ",                        hours: 2 },
    { key: "geography", name: "الجغرافيا",                      hours: 2 },
  ],
  activitySubjects: ["التربية الفنية", "التربية الموسيقية", "التربية البدنية"],
  behaviorPeriods: ["الفصل الأول", "الفصل الثاني"],
  gender: "female",
};

// ─────────────────────────────────────────────────────────────────────────────
// القالب 5: الأول الثانوي (فصلان — كبرى/صغرى/دور ثاني)
// ─────────────────────────────────────────────────────────────────────────────
export const TEMPLATE_5: TemplateDef = {
  id: "T5",
  name: "الأول الثانوي",
  grades: [10],
  type: "semesters_secondary",
  subjects: [
    { key: "islamic",   name: "التربية الإسلامية",  hours: 2 },
    { key: "arabic",    name: "اللغة العربية",      hours: 4 },
    { key: "english",   name: "اللغة الإنجليزية",   hours: 4 },
    { key: "it",        name: "تقنية المعلومات",    hours: 2 },
    { key: "math",      name: "الرياضيات",          hours: 5 },
    { key: "physics",   name: "الفيزياء",           hours: 3 },
    { key: "chemistry", name: "الكيمياء",           hours: 3 },
    { key: "biology",   name: "الأحياء",            hours: 3 },
    { key: "history",   name: "التاريخ",            hours: 2 },
    { key: "geography", name: "الجغرافيا",          hours: 2 },
    { key: "social",    name: "علم الاجتماع",       hours: 1 },
    { key: "free_act",  name: "النشاط الحر",        hours: 1, isActivity: true },
    { key: "pe",        name: "التربية البدنية",    hours: 1, isActivity: true },
  ],
  activitySubjects: [],
  behaviorPeriods: ["الفصل الأول", "الفصل الثاني"],
  gender: "female",
};

// ─────────────────────────────────────────────────────────────────────────────
// القالب 6: الثاني والثالث الثانوي (فصلان — مسار العلوم)
// ─────────────────────────────────────────────────────────────────────────────
export const TEMPLATE_6: TemplateDef = {
  id: "T6",
  name: "الثاني والثالث الثانوي",
  grades: [11, 12],
  type: "semesters_secondary",
  subjects: [
    { key: "islamic",   name: "التربية الإسلامية",  hours: 2 },
    { key: "arabic",    name: "اللغة العربية",      hours: 4 },
    { key: "english",   name: "اللغة الإنجليزية",   hours: 4 },
    { key: "it",        name: "تقنية المعلومات",    hours: 2 },
    { key: "math",      name: "الرياضيات",          hours: 4 },
    { key: "stats",     name: "الإحصاء",            hours: 2 },
    { key: "physics",   name: "الفيزياء",           hours: 5 },
    { key: "chemistry", name: "الكيمياء",           hours: 4 },
    { key: "biology",   name: "الأحياء",            hours: 3 },
    { key: "pe",        name: "التربية البدنية",    hours: 1, isActivity: true },
  ],
  activitySubjects: [],
  behaviorPeriods: ["الفصل الأول", "الفصل الثاني"],
  gender: "both",
};

export const ALL_TEMPLATES: TemplateDef[] = [
  TEMPLATE_1, TEMPLATE_2, TEMPLATE_3,
  TEMPLATE_4, TEMPLATE_5, TEMPLATE_6,
];

/** من الصف رقم (1-12) إلى القالب المناسب */
export function getTemplateForGrade(grade: number): TemplateDef {
  return ALL_TEMPLATES.find((t) => t.grades.includes(grade)) ?? TEMPLATE_1;
}

/** من ID النص إلى كائن القالب */
export function getTemplateById(id: string): TemplateDef {
  return ALL_TEMPLATES.find((t) => t.id === id) ?? TEMPLATE_1;
}

// ─────────────────────────────────────────────────────────────────────────────
// حساب أعمدة الدرجات حسب نوع القالب
// ─────────────────────────────────────────────────────────────────────────────

/** أقصى درجة للفترة الأولى أو الثانية (30% من عدد الحصص × 40) */
export function calcPeriodMax(hours: number, pct: number = 30) {
  return Math.round((hours * 40 * pct) / 100);
}

/** أقصى درجة للامتحان النهائي (40% من عدد الحصص × 40) */
export function calcExamMax(hours: number) {
  return Math.round(hours * 40 * 0.4);
}

/** أقصى الدرجة الكلية (عدد الحصص × 40) */
export function calcTotalMax(hours: number) {
  return hours * 40;
}

/** أدنى درجة للنجاح (50% من المجموع الكلي) */
export function calcTotalMin(hours: number) {
  return Math.round(hours * 40 * 0.5);
}

// ─────────────────────────────────────────────────────────────────────────────
// Labels للصفوف
// ─────────────────────────────────────────────────────────────────────────────
export const GRADE_LABELS: Record<number, string> = {
  1: "الصف الأول",  2: "الصف الثاني",  3: "الصف الثالث",
  4: "الصف الرابع", 5: "الصف الخامس",  6: "الصف السادس",
  7: "الصف السابع", 8: "الصف الثامن",  9: "الصف التاسع",
  10: "الأول الثانوي", 11: "الثاني الثانوي", 12: "الثالث الثانوي",
};
