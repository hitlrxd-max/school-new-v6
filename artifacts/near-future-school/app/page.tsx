"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PhoneCall, GraduationCap, MapPin, CheckCircle, Lightbulb, Users, MonitorSmartphone, Target, Sparkles, BookOpen, Star, ArrowLeft, ChevronRight, ChevronLeft, Play } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useInView } from "framer-motion";
const schoolLogo = "/assets/Dشعار_المدرسة_3_1782634252188.png";
const vrCharacter = "/assets/55c68a5124916ab3b0bc6d9d6f919a73_1782825532321.jpg";
const introVideo = "/assets/VID_٢٠٢٦٠٦٣٠_٢٠٤٧١٠_1782846394478.mp4";

const galleryImages: string[] = [
  "/assets/FB_IMG_1782825293248_1782825566373.jpg",
  "/assets/FB_IMG_1782825266024_1782825572260.jpg",
  "/assets/FB_IMG_1782825193631_1782825579990.jpg",
  "/assets/FB_IMG_1782825186415_1782825591175.jpg",
  "/assets/FB_IMG_1782825170139_1782825597984.jpg",
  "/assets/FB_IMG_1782825110618_1782825605832.jpg",
  "/assets/FB_IMG_1782825088779_1782825666161.jpg",
  "/assets/FB_IMG_1782825048613_1782825674836.jpg",
  "/assets/FB_IMG_1782824999550_1782825683474.jpg",
  "/assets/FB_IMG_1782824970677_1782825691372.jpg",
  "/assets/FB_IMG_1782824946792_1782825698691.jpg",
  "/assets/FB_IMG_1782824964058_1782825706471.jpg",
  "/assets/FB_IMG_1782824924943_1782825715448.jpg",
  "/assets/FB_IMG_1782824889781_1782825724544.jpg",
  "/assets/FB_IMG_1782824818213_1782825738538.jpg",
  "/assets/FB_IMG_1782824809788_1782825750262.jpg",
  "/assets/FB_IMG_1782824704299_1782825756696.jpg",
  "/assets/FB_IMG_1782824698623_1782825762800.jpg",
  "/assets/Screenshot_٢٠٢٦-٠٦-٣٠-٢٠-٤٤-١٦-٤٨١_com.facebook.katana-edit_1782846394509.jpg",
  "/assets/Screenshot_٢٠٢٦-٠٦-٣٠-٢٠-٤٣-٤١-٠٥٨_com.facebook.katana-edit_1782846394517.jpg",
  "/assets/Screenshot_٢٠٢٦-٠٦-٣٠-٢٠-٤٣-١٩-٣٠٥_com.facebook.katana-edit_1782846394524.jpg",
  "/assets/Screenshot_٢٠٢٦-٠٦-٣٠-٢٠-٤٢-٥٣-٩٧٢_com.facebook.katana-edit_1782846394532.jpg",
  "/assets/Screenshot_٢٠٢٦-٠٦-٣٠-٢٠-٤٢-٣٦-٢١٧_com.facebook.katana-edit_1782846394540.jpg",
  "/assets/Screenshot_٢٠٢٦-٠٦-٣٠-٢٠-٤٢-١١-٩٧٢_com.facebook.katana-edit_1782846394548.jpg",
  "/assets/Screenshot_٢٠٢٦-٠٦-٣٠-٢٠-٤٠-٥٤-٧٨٤_com.facebook.katana-edit_1782846394555.jpg",
  "/assets/FB_IMG_1782844782517_1782846394564.jpg",
  "/assets/Screenshot_٢٠٢٦-٠٦-٣٠-٢٠-٣٧-٤٥-٨١٦_com.facebook.katana-edit_1782846394571.jpg",
  "/assets/Screenshot_٢٠٢٦-٠٦-٣٠-٢٠-٣٦-٢٨-٢٧٣_com.facebook.katana-edit_1782846394579.jpg",
  "/assets/Screenshot_٢٠٢٦-٠٦-٣٠-٢٠-٣٢-٠٣-١٤٨_com.facebook.katana-edit_1782846394587.jpg",
  "/assets/Screenshot_٢٠٢٦-٠٦-٣٠-٢٠-٣١-٢٢-٤٤٨_com.facebook.katana-edit_1782846394594.jpg",
];

function AnimatedCounter({ value, suffix = "", duration = 1.5 }: { value: number; suffix?: string; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (inView) {
      let start = 0;
      const increment = value / (duration * 60);
      const timer = setInterval(() => {
        start += increment;
        if (start >= value) {
          setCount(value);
          clearInterval(timer);
        } else {
          setCount(Math.floor(start));
        }
      }, 1000 / 60);
      return () => clearInterval(timer);
    }
  }, [inView, value, duration]);

  return <span ref={ref}>{count}{suffix}</span>;
}

function Icon3D({ Icon, colorFrom, colorTo }: { Icon: React.ElementType; colorFrom: string; colorTo: string }) {
  return (
    <div className="relative w-20 h-20 mx-auto mb-6">
      <div className="absolute inset-0 rounded-2xl translate-x-2 translate-y-2 opacity-40" style={{ background: colorTo }} />
      <div className="absolute inset-0 rounded-2xl translate-x-1 translate-y-1 opacity-60" style={{ background: `linear-gradient(135deg, ${colorFrom}, ${colorTo})` }} />
      <div className="absolute inset-0 rounded-2xl flex items-center justify-center border border-white/30" style={{ background: `linear-gradient(135deg, ${colorFrom}DD, ${colorTo}BB)`, boxShadow: `0 8px 32px ${colorFrom}55, inset 0 1px 0 rgba(255,255,255,0.4)` }}>
        <Icon className="w-9 h-9 text-white drop-shadow-lg" style={{ filter: "drop-shadow(0 3px 6px rgba(0,0,0,0.35))" }} />
      </div>
    </div>
  );
}

export default function Home() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % galleryImages.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % galleryImages.length);
  const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);

  return (
    <div className="flex flex-col min-h-screen font-sans bg-background text-foreground" dir="rtl">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-md border-b border-border shadow-sm">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={schoolLogo} alt="شعار مدرسة ضياء المستقبل" className="h-14 w-auto object-contain drop-shadow-sm" />
            <span className="font-display font-bold text-2xl text-[#1FA0FF]">ضياء المستقبل</span>
          </div>
          <div className="hidden md:flex items-center gap-6 font-medium text-[#1A1A1A]">
            <a href="#hero" className="hover:text-[#1FA0FF] transition-colors">الرئيسية</a>
            <a href="#about" className="hover:text-[#1FA0FF] transition-colors">من نحن</a>
            <a href="#vision" className="hover:text-[#1FA0FF] transition-colors">الرؤية والرسالة</a>
            <a href="#features" className="hover:text-[#1FA0FF] transition-colors">ما يميزنا</a>
            <a href="#branches" className="hover:text-[#1FA0FF] transition-colors">فروعنا</a>
          </div>
          <Button asChild className="text-white rounded-full px-6 shadow-md transition-all hover:shadow-lg hover:-translate-y-0.5" style={{ background: "linear-gradient(135deg, #1FA0FF, #12DAFB)" }}>
            <a href="#contact">تواصل معنا</a>
          </Button>
        </div>
      </nav>

      {/* Hero */}
      <section id="hero" className="relative min-h-[90vh] flex items-center justify-center overflow-hidden" style={{ background: "linear-gradient(135deg, #f0f9ff 0%, #e0f7fa 50%, #f0fff4 100%)" }}>
        <div className="absolute top-0 right-0 w-[800px] h-[800px] rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3" style={{ background: "#12DAFB22" }} />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] rounded-full blur-[100px] translate-y-1/3 -translate-x-1/3" style={{ background: "#A7FDCC33" }} />

        <div className="container relative z-10 px-4 py-20 mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: "easeOut" }} className="text-right">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-sm border border-[#1FA0FF]/20 text-[#1FA0FF] font-semibold text-sm mb-6">
              <Sparkles className="w-4 h-4" />
              <span>نفتح أبواب التفوق</span>
            </div>
            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6 text-[#1A1A1A]">
              نحو جيل <span style={{ color: "#1FA0FF" }}>مبدع</span>، <br />متفوق، وقائد <span style={{ color: "#12DAFB" }}>للمستقبل</span>.
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-lg leading-relaxed font-medium">
              مدرسة ضياء المستقبل ليست مجرد مدرسة، بل هي بيئة متكاملة تكتشف إمكانيات أبنائكم وتبني شخصياتهم وتعدهم لغدٍ مشرق.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" className="text-white rounded-full text-lg h-16 px-10 shadow-xl font-bold transition-all hover:-translate-y-1 hover:shadow-2xl" style={{ background: "linear-gradient(135deg, #1FA0FF, #12DAFB)" }} asChild>
                <a href="#about">اكتشف مدرستنا <ArrowLeft className="w-5 h-5 mr-2" /></a>
              </Button>
              <Button size="lg" className="rounded-full text-lg h-16 px-10 text-white font-bold shadow-xl border-0 transition-all hover:-translate-y-1 hover:shadow-2xl" style={{ background: "linear-gradient(135deg, #A7FDCC, #12DAFB)", color: "#0D72AA" }} asChild>
                <Link href="/register">
                  <span className="text-[#0D72AA] font-bold text-lg">✦ سجل ابنك الآن</span>
                </Link>
              </Button>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }} className="relative h-full flex flex-col items-center justify-center">
            <div className="relative w-full max-w-md aspect-[3/4] flex items-end justify-center">
              <motion.img
                src={vrCharacter}
                alt="شخصية افتراضية"
                animate={{ y: [0, -15, 0] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                className="relative z-10 w-full h-auto object-contain drop-shadow-2xl rounded-3xl"
              />
              <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }} className="absolute top-0 right-0 lg:-right-10 bg-white/80 backdrop-blur-xl p-4 rounded-full shadow-2xl z-20 border border-white">
                <img src={schoolLogo} alt="شعار المدرسة" className="w-24 h-24 object-contain" />
              </motion.div>
              <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut", delay: 0.5 }} className="absolute top-1/4 -left-4 lg:-left-12 bg-white p-4 rounded-2xl shadow-xl flex items-center gap-3 border border-gray-100 z-20">
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "#1FA0FF22" }}>
                  <GraduationCap className="w-6 h-6" style={{ color: "#1FA0FF" }} />
                </div>
                <div className="font-bold text-sm text-[#1FA0FF]">كادر متميز</div>
              </motion.div>
              <motion.div animate={{ y: [0, 15, 0] }} transition={{ repeat: Infinity, duration: 5.5, ease: "easeInOut", delay: 1.5 }} className="absolute bottom-1/4 -right-4 lg:-right-8 bg-white p-4 rounded-2xl shadow-xl flex items-center gap-3 border border-gray-100 z-20">
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "#12DAFB22" }}>
                  <Lightbulb className="w-6 h-6" style={{ color: "#12DAFB" }} />
                </div>
                <div className="font-bold text-sm text-[#1FA0FF]">بيئة محفزة</div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 text-white" style={{ background: "linear-gradient(135deg, #1FA0FF 0%, #12DAFB 60%, #A7FDCC 100%)" }}>
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 text-center">
            {[
              { value: 1678, suffix: "+", label: "طالب وطالبة", icon: GraduationCap, from: "#1FA0FF", to: "#0D80E0" },
              { value: 158, suffix: "+", label: "عضو هيئة تدريس", icon: Users, from: "#12DAFB", to: "#0AABCC" },
              { value: 4, suffix: "+", label: "فروع", icon: MapPin, from: "#A7FDCC", to: "#6FE8A0" },
              { value: 1900, suffix: "+", label: "خريج متميز", icon: Star, from: "#1FA0FF", to: "#12DAFB" },
            ].map((stat, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="flex flex-col items-center">
                <Icon3D Icon={stat.icon} colorFrom={stat.from} colorTo={stat.to} />
                <div className="text-4xl md:text-5xl font-display font-bold mb-2 drop-shadow-md">
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                </div>
                <div className="font-semibold text-lg text-white/90">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Intro Video */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <h2 className="font-display text-4xl font-bold mb-4" style={{ color: "#1FA0FF" }}>تعرّف على مدرستنا</h2>
              <div className="w-24 h-1.5 mx-auto rounded-full mb-6" style={{ background: "linear-gradient(90deg, #1FA0FF, #12DAFB, #A7FDCC)" }} />
              <p className="text-xl text-gray-600">شاهد الفيديو التعريفي لمدرسة ضياء المستقبل</p>
            </motion.div>
          </div>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="max-w-3xl mx-auto">
            <div className="rounded-3xl overflow-hidden shadow-2xl ring-4 ring-[#1FA0FF]/20 relative">
              <div className="absolute inset-0 z-0 rounded-3xl" style={{ background: "linear-gradient(135deg, #1FA0FF22, #A7FDCC22)" }} />
              <video src={introVideo} controls className="w-full relative z-10" playsInline preload="metadata">
                متصفحك لا يدعم تشغيل الفيديو.
              </video>
            </div>
            <div className="flex justify-center mt-6">
              <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-white font-semibold text-sm shadow-lg" style={{ background: "linear-gradient(135deg, #1FA0FF, #12DAFB)" }}>
                <Play className="w-4 h-4 fill-current" />
                <span>الفيديو التعريفي للمدرسة</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="py-24 relative" style={{ background: "#F0FAFF" }}>
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-12">
              <h2 className="font-display text-4xl font-bold mb-6" style={{ color: "#1FA0FF" }}>من نحن؟</h2>
              <div className="w-24 h-1.5 mx-auto rounded-full mb-8" style={{ background: "linear-gradient(90deg, #1FA0FF, #12DAFB)" }} />
              <p className="text-xl text-gray-600 leading-relaxed">
                تأسست مدرسة ضياء المستقبل لتكون منارة تعليمية رائدة تجمع بين الأصالة والمعاصرة. نحن نؤمن بأن التعليم ليس مجرد تلقين للمعلومات، بل هو رحلة متكاملة لاكتشاف المواهب وبناء الشخصية. ندمج القيم التربوية الراسخة مع أحدث المناهج التعليمية لنقدم تجربة تثري عقل الطالب وتنمي قدراته.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section id="vision" className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12">
            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <Card className="h-full border-none shadow-xl hover:shadow-2xl transition-all duration-300 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 rounded-bl-full -z-0 transition-transform group-hover:scale-110" style={{ background: "#12DAFB18" }} />
                <CardContent className="p-10 relative z-10">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6" style={{ background: "#12DAFB18" }}>
                    <Target className="w-8 h-8" style={{ color: "#12DAFB" }} />
                  </div>
                  <h3 className="font-display text-3xl font-bold text-[#1A1A1A] mb-4">رؤيتنا</h3>
                  <p className="text-lg text-gray-600 leading-relaxed font-medium">
                    أن نكون الخيار الأول لأولياء الأمور الباحثين عن جودة التعليم المبني على الابتكار، وأن نُخرّج أجيالاً قادرة على صنع الفارق في مجتمعاتها.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}>
              <Card className="h-full border-none shadow-xl hover:shadow-2xl transition-all duration-300 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 rounded-bl-full -z-0 transition-transform group-hover:scale-110" style={{ background: "#1FA0FF18" }} />
                <CardContent className="p-10 relative z-10">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6" style={{ background: "#1FA0FF18" }}>
                    <Star className="w-8 h-8" style={{ color: "#1FA0FF" }} />
                  </div>
                  <h3 className="font-display text-3xl font-bold text-[#1A1A1A] mb-4">رسالتنا</h3>
                  <p className="text-lg text-gray-600 leading-relaxed font-medium">
                    تقديم خدمات تعليمية وتربوية متميزة من خلال بيئة آمنة ومحفزة، وكادر مؤهل، وشراكة فاعلة مع المجتمع، مع توظيف التقنية لتعزيز مهارات التعلم الذاتي.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Differentiators */}
      <section id="features" className="py-24 relative overflow-hidden" style={{ background: "#F8FDFF" }}>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl font-bold mb-4" style={{ color: "#1FA0FF" }}>ما الذي يميزنا؟</h2>
            <div className="w-24 h-1.5 mx-auto rounded-full mb-6" style={{ background: "linear-gradient(90deg, #1FA0FF, #12DAFB)" }} />
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">صممنا بيئتنا التعليمية بعناية فائقة لتلبي احتياجات العصر وتتجاوز التوقعات.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: BookOpen, title: "فصول دراسية متطورة", desc: "مجهزة بأحدث التقنيات لضمان تفاعل الطالب واستيعابه.", color: "#12DAFB" },
              { icon: Users, title: "كادر أكاديمي نخبوي", desc: "نخبة من المعلمين المتميزين ذوي الكفاءة العالية والشغف بالتعليم.", color: "#1FA0FF" },
              { icon: GraduationCap, title: "تأسيس قوي", desc: "تركيز مكثف على اللغات (العربية والإنجليزية) والرياضيات.", color: "#A7FDCC" },
              { icon: MonitorSmartphone, title: "تحول رقمي", desc: "نظام دفع إلكتروني وسهولة في متابعة تقدم الطالب عبر التطبيقات.", color: "#1FA0FF" },
              { icon: CheckCircle, title: "شراكة حقيقية", desc: "تواصل مستمر وبناء مع أولياء الأمور لضمان تكامل الدور التربوي.", color: "#12DAFB" },
            ].map((feature, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <Card className="border border-gray-100 shadow-md hover:shadow-xl transition-shadow h-full">
                  <CardContent className="p-8">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6" style={{ backgroundColor: `${feature.color}22`, color: feature.color }}>
                      <feature.icon className="w-7 h-7" />
                    </div>
                    <h4 className="font-bold text-xl mb-3 text-[#1A1A1A]">{feature.title}</h4>
                    <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 text-white" style={{ background: "linear-gradient(135deg, #1FA0FF 0%, #12DAFB 50%, #A7FDCC 100%)" }}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl font-bold mb-4">قيمنــــا</h2>
            <div className="w-24 h-1.5 bg-white/30 mx-auto rounded-full" />
          </div>
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="p-6">
              <div className="w-20 h-20 mx-auto bg-white/20 rounded-full flex items-center justify-center mb-6 backdrop-blur-sm border border-white/30 shadow-xl">
                <Sparkles className="w-10 h-10" />
              </div>
              <h4 className="text-2xl font-bold mb-3">الأمان والرعاية</h4>
              <p className="text-white/80">بيئة تحتضن الطالب كأنه في بيته.</p>
            </motion.div>
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="p-6">
              <div className="w-20 h-20 mx-auto bg-white/20 rounded-full flex items-center justify-center mb-6 backdrop-blur-sm border border-white/30 shadow-xl">
                <Star className="w-10 h-10" />
              </div>
              <h4 className="text-2xl font-bold mb-3">التميز والجودة</h4>
              <p className="text-white/80">لا نرضى بغير القمة في كل ما نقدمه.</p>
            </motion.div>
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.4 }} className="p-6">
              <div className="w-20 h-20 mx-auto bg-white/20 rounded-full flex items-center justify-center mb-6 backdrop-blur-sm border border-white/30 shadow-xl">
                <Target className="w-10 h-10" />
              </div>
              <h4 className="text-2xl font-bold mb-3">التحفيز المستمر</h4>
              <p className="text-white/80">تكريم المتفوقين ودعم الطموحين باستمرار.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="py-24 overflow-hidden" style={{ background: "linear-gradient(180deg, #1FA0FF 0%, #0D72BB 100%)" }}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl font-bold text-white mb-4">معرض الصور والأنشطة</h2>
            <div className="w-24 h-1.5 mx-auto rounded-full mb-6" style={{ background: "#A7FDCC" }} />
            <p className="text-xl" style={{ color: "#A7FDCC" }}>لمحات من أنشطتنا المدرسية المتميزة</p>
          </div>
          <div className="relative w-full max-w-6xl mx-auto h-[400px] flex items-center justify-center" style={{ perspective: "1200px" }}>
            <AnimatePresence initial={false} mode="popLayout">
              {[-2, -1, 0, 1, 2].map((offset) => {
                const index = (currentIndex + offset + galleryImages.length) % galleryImages.length;
                const isCenter = offset === 0;
                return (
                  <motion.div
                    key={`${index}-${offset}`}
                    className="absolute top-0 bottom-0 flex items-center justify-center"
                    initial={{ x: `${offset * 50}%`, rotateY: offset * -25, scale: 1 - Math.abs(offset) * 0.15, opacity: 0, zIndex: 5 - Math.abs(offset) }}
                    animate={{ x: `${offset * 60}%`, rotateY: offset * -35, scale: isCenter ? 1 : 1 - Math.abs(offset) * 0.2, opacity: Math.abs(offset) > 2 ? 0 : 1 - Math.abs(offset) * 0.15, zIndex: 5 - Math.abs(offset) }}
                    exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  >
                    <div className={`relative rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 ${isCenter ? "w-[300px] md:w-[400px] h-[300px] md:h-[400px]" : "w-[200px] md:w-[300px] h-[200px] md:h-[300px]"}`} style={isCenter ? { boxShadow: "0 0 0 4px #A7FDCC" } : {}}>
                      <div className="absolute inset-0 bg-black/20" />
                      <img src={galleryImages[index]} alt="نشاط مدرسي" className="w-full h-full object-cover" />
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
            <button onClick={prevSlide} className="absolute left-4 z-20 w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-colors">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button onClick={nextSlide} className="absolute right-4 z-20 w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-colors">
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
          <div className="flex justify-center gap-2 mt-8">
            {galleryImages.map((_, i) => (
              <button key={i} onClick={() => setCurrentIndex(i)} className="rounded-full transition-all" style={{ width: i === currentIndex ? "24px" : "8px", height: "8px", background: i === currentIndex ? "#A7FDCC" : "rgba(255,255,255,0.4)" }} />
            ))}
          </div>
        </div>
      </section>

      {/* Branches */}
      <section id="branches" className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl font-bold mb-4" style={{ color: "#1FA0FF" }}>فروعنا</h2>
            <div className="w-24 h-1.5 mx-auto rounded-full mb-6" style={{ background: "linear-gradient(90deg, #1FA0FF, #A7FDCC)" }} />
            <p className="text-xl text-gray-600">نسعد باستقبالكم في فروعنا المختلفة.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { region: "المنطقة الجنوبية", name: "فرع تامزاوة الشاطئ", phone: "0915755363", facebook: "https://www.facebook.com/profile.php?id=61567008954540&locale=ar_AR", map: "https://maps.app.goo.gl/99GDq4LZg8gmowc37", gradFrom: "#1FA0FF", gradTo: "#12DAFB" },
              { region: "المنطقة الغربية", name: "فرع طرابلس – طريق المطار", phone: "0913081358", facebook: "https://www.facebook.com/1nearfuture?locale=ar_AR", map: "https://maps.app.goo.gl/qcv7uxe1dK54WaSKA", gradFrom: "#12DAFB", gradTo: "#A7FDCC" },
              { region: "المنطقة الغربية", name: "فرع طرابلس – السدرة", phone: "0915463080", facebook: "https://www.facebook.com/profile.php?id=61580399701160&locale=ar_AR", map: "https://maps.app.goo.gl/Zp4moTSkDDokfhD86", gradFrom: "#A7FDCC", gradTo: "#1FA0FF" },
            ].map((branch, i) => (
              <motion.div key={i} initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <Card className="overflow-hidden border-none shadow-lg group hover:shadow-xl transition-all h-full">
                  <div className="h-2" style={{ background: `linear-gradient(90deg, ${branch.gradFrom}, ${branch.gradTo})` }} />
                  <CardContent className="p-8 flex flex-col gap-5 h-full">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0" style={{ background: `${branch.gradFrom}22` }}>
                        <MapPin className="w-6 h-6" style={{ color: branch.gradFrom }} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-400 mb-0.5">{branch.region}</p>
                        <h4 className="font-bold text-xl text-[#1A1A1A] leading-snug">{branch.name}</h4>
                      </div>
                    </div>
                    <a href={`tel:${branch.phone}`} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group/phone">
                      <div className="flex items-center gap-3">
                        <PhoneCall className="w-5 h-5" style={{ color: branch.gradFrom }} />
                        <span className="font-bold text-lg" dir="ltr">{branch.phone}</span>
                      </div>
                      <span className="text-sm font-bold opacity-0 group-hover/phone:opacity-100 transition-opacity" style={{ color: branch.gradFrom }}>اتصل الآن</span>
                    </a>
                    <div className="flex gap-3 mt-auto">
                      <a href={branch.facebook} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border border-[#1877F2]/20 bg-[#1877F2]/5 hover:bg-[#1877F2]/10 transition-colors text-[#1877F2] font-semibold text-sm">
                        <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                        </svg>
                        فيسبوك
                      </a>
                      <a href={branch.map} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border border-[#EA4335]/20 bg-[#EA4335]/5 hover:bg-[#EA4335]/10 transition-colors text-[#EA4335] font-semibold text-sm">
                        <MapPin className="w-4 h-4 shrink-0" />
                        الموقع
                      </a>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="contact" className="py-20" style={{ background: "#F0FAFF" }}>
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="font-display text-4xl font-bold text-[#1A1A1A] mb-6">تواصلوا معنا</h2>
            <p className="text-xl text-gray-600 mb-10 leading-relaxed">
              نحن هنا للإجابة على جميع استفساراتكم. اختاروا الفرع الأقرب إليكم وسنسعد بتواصلكم معنا لتأمين مستقبل مشرق لأبنائكم.
            </p>
            <div className="flex flex-wrap justify-center gap-6">
              <Button size="lg" className="text-white rounded-full h-14 px-8 text-lg font-bold shadow-lg" style={{ background: "linear-gradient(135deg, #1FA0FF, #12DAFB)" }} asChild>
                <a href="#branches">أرقام الفروع</a>
              </Button>
              <Button size="lg" className="bg-[#25D366] hover:bg-[#1ebe5d] text-white rounded-full h-14 px-8 text-lg font-bold shadow-lg flex items-center gap-3" asChild>
                <a href="https://iwtsp.com/201288361039" target="_blank" rel="noopener noreferrer">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 shrink-0">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zm-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884zm8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  تواصل واتساب
                </a>
              </Button>
              <Button size="lg" className="text-white rounded-full h-14 px-8 text-lg font-bold shadow-lg" style={{ background: "linear-gradient(135deg, #A7FDCC, #12DAFB)", color: "#0A5080" }} asChild>
                <Link href="/register">
                  <span className="text-[#0A5080] font-bold">✦ سجل ابنك الآن</span>
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-white py-12" style={{ background: "linear-gradient(135deg, #1FA0FF 0%, #0D72BB 100%)" }}>
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center mb-6">
            <img src={schoolLogo} alt="شعار المدرسة" className="h-16 w-auto object-contain drop-shadow-lg" />
          </div>
          <h3 className="font-display text-2xl font-bold mb-2">مدرسة ضياء المستقبل</h3>
          <p className="text-white/70 mb-6">نحو جيل مبدع، متفوق، وقائد للمستقبل.</p>
          <div className="h-px bg-white/20 mb-6" />
          <p className="text-white/50 text-sm">© {new Date().getFullYear()} مدرسة ضياء المستقبل — جميع الحقوق محفوظة</p>
        </div>
      </footer>
    </div>
  );
}
