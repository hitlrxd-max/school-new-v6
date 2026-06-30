import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PhoneCall, GraduationCap, MapPin, CheckCircle, Lightbulb, Users, MonitorSmartphone, Target, Sparkles, BookOpen, Star, ArrowLeft, ChevronRight, ChevronLeft } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useInView } from "framer-motion";
import schoolLogo from "@assets/Dشعار_المدرسة_3_1782634252188.png";
import vrCharacter from '@assets/55c68a5124916ab3b0bc6d9d6f919a73_1782825532321.jpg';

import img1 from '@assets/FB_IMG_1782825293248_1782825566373.jpg';
import img2 from '@assets/FB_IMG_1782825266024_1782825572260.jpg';
import img3 from '@assets/FB_IMG_1782825193631_1782825579990.jpg';
import img4 from '@assets/FB_IMG_1782825186415_1782825591175.jpg';
import img5 from '@assets/FB_IMG_1782825170139_1782825597984.jpg';
import img6 from '@assets/FB_IMG_1782825110618_1782825605832.jpg';
import img7 from '@assets/FB_IMG_1782825088779_1782825666161.jpg';
import img8 from '@assets/FB_IMG_1782825048613_1782825674836.jpg';
import img9 from '@assets/FB_IMG_1782824999550_1782825683474.jpg';
import img10 from '@assets/FB_IMG_1782824970677_1782825691372.jpg';
import img11 from '@assets/FB_IMG_1782824946792_1782825698691.jpg';
import img12 from '@assets/FB_IMG_1782824964058_1782825706471.jpg';
import img13 from '@assets/FB_IMG_1782824924943_1782825715448.jpg';
import img14 from '@assets/FB_IMG_1782824889781_1782825724544.jpg';
import img15 from '@assets/FB_IMG_1782824818213_1782825738538.jpg';
import img16 from '@assets/FB_IMG_1782824809788_1782825750262.jpg';
import img17 from '@assets/FB_IMG_1782824704299_1782825756696.jpg';
import img18 from '@assets/FB_IMG_1782824698623_1782825762800.jpg';

const galleryImages = [img1, img2, img3, img4, img5, img6, img7, img8, img9, img10, img11, img12, img13, img14, img15, img16, img17, img18];

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
      {/* 1. Navbar */}
      <nav className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-md border-b border-border shadow-sm">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={schoolLogo} alt="شعار مدرسة ضياء المستقبل" className="h-14 w-auto object-contain drop-shadow-sm" />
            <span className="font-display font-bold text-2xl text-[#0006B4]">ضياء المستقبل</span>
          </div>
          <div className="hidden md:flex items-center gap-6 font-medium text-[#1A1A1A]">
            <a href="#hero" className="hover:text-primary transition-colors">الرئيسية</a>
            <a href="#about" className="hover:text-primary transition-colors">من نحن</a>
            <a href="#vision" className="hover:text-primary transition-colors">الرؤية والرسالة</a>
            <a href="#features" className="hover:text-primary transition-colors">ما يميزنا</a>
            <a href="#branches" className="hover:text-primary transition-colors">فروعنا</a>
          </div>
          <Button asChild className="bg-primary hover:bg-primary/90 text-white rounded-full px-6 shadow-md shadow-primary/20 transition-all hover:shadow-lg hover:-translate-y-0.5">
            <a href="#contact">تواصل معنا</a>
          </Button>
        </div>
      </nav>

      {/* 2. Hero */}
      <section id="hero" className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-[#0006B4]/5">
        <div className="absolute inset-0 bg-gradient-to-br from-[#93FAFF]/10 via-[#93FAFF]/5 to-[#0069FF]/10" />
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#93FAFF]/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#93FAFF]/10 rounded-full blur-[80px] translate-y-1/3 -translate-x-1/3" />
        
        <div className="container relative z-10 px-4 py-20 mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-right"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-sm border border-[#0069FF]/20 text-[#0069FF] font-semibold text-sm mb-6">
              <Sparkles className="w-4 h-4" />
              <span>نفتح أبواب التفوق</span>
            </div>
            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6 text-[#1A1A1A]">
              نحو جيل <span className="text-primary">مبدع</span>، <br/>متفوق، وقائد <span className="text-[#93FAFF]">للمستقبل</span>.
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-lg leading-relaxed font-medium">
              مدرسة ضياء المستقبل ليست مجرد مدرسة، بل هي بيئة متكاملة تكتشف إمكانيات أبنائكم وتبني شخصياتهم وتعدهم لغدٍ مشرق.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" className="bg-[#0006B4] hover:bg-[#0006B4]/90 text-white rounded-full text-lg h-14 px-8 shadow-lg shadow-[#0006B4]/20" asChild>
                <a href="#about">اكتشف مدرستنا <ArrowLeft className="w-5 h-5 mr-2" /></a>
              </Button>
              <Button size="lg" variant="outline" className="rounded-full text-lg h-14 px-8 border-2 hover:bg-gray-50 text-[#0006B4]" asChild>
                <Link href="/register">سجل ابنك الآن</Link>
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="relative h-full flex flex-col items-center justify-center"
          >
            <div className="relative w-full max-w-md aspect-[3/4] flex items-end justify-center">
               <motion.img 
                 src={vrCharacter} 
                 alt="شخصية افتراضية" 
                 animate={{ y: [0, -15, 0] }} 
                 transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                 className="relative z-10 w-full h-auto object-contain drop-shadow-2xl rounded-3xl"
               />
               
               <motion.div 
                 animate={{ y: [0, -10, 0] }} 
                 transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }}
                 className="absolute top-0 right-0 lg:-right-10 bg-white/80 backdrop-blur-xl p-4 rounded-full shadow-2xl z-20 border border-white"
               >
                 <img src={schoolLogo} alt="شعار المدرسة" className="w-24 h-24 object-contain" />
               </motion.div>

              {/* Floating badges */}
              <motion.div 
                animate={{ y: [0, -10, 0] }} 
                transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut", delay: 0.5 }}
                className="absolute top-1/4 -left-4 lg:-left-12 bg-white p-4 rounded-2xl shadow-xl flex items-center gap-3 border border-gray-100 z-20"
              >
                <div className="w-10 h-10 rounded-full bg-[#0069FF]/10 flex items-center justify-center text-[#0069FF]">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div className="font-bold text-sm text-[#0006B4]">كادر متميز</div>
              </motion.div>

              <motion.div 
                animate={{ y: [0, 15, 0] }} 
                transition={{ repeat: Infinity, duration: 5.5, ease: "easeInOut", delay: 1.5 }}
                className="absolute bottom-1/4 -right-4 lg:-right-8 bg-white p-4 rounded-2xl shadow-xl flex items-center gap-3 border border-gray-100 z-20"
              >
                <div className="w-10 h-10 rounded-full bg-[#0069FF]/10 flex items-center justify-center text-[#0069FF]">
                  <Lightbulb className="w-6 h-6" />
                </div>
                <div className="font-bold text-sm text-[#0006B4]">بيئة محفزة</div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* NEW Stats Section */}
      <section className="py-16 bg-[#0006B4] text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: 600, suffix: '+', label: 'طالب وطالبة', icon: GraduationCap },
              { value: 100, suffix: '+', label: 'عضو هيئة تدريس', icon: Users },
              { value: 4, suffix: '+', label: 'فروع', icon: MapPin },
              { value: 1900, suffix: '+', label: 'خريج متميز', icon: Star }
            ].map((stat, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex flex-col items-center"
              >
                <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mb-4">
                  <stat.icon className="w-8 h-8 text-[#93FAFF]" />
                </div>
                <div className="text-4xl md:text-5xl font-display font-bold mb-2">
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-[#93FAFF] font-medium text-lg">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. About */}
      <section id="about" className="py-24 bg-white relative">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-12"
            >
              <h2 className="font-display text-4xl font-bold text-[#0006B4] mb-6">من نحن؟</h2>
              <div className="w-24 h-1.5 bg-primary mx-auto rounded-full mb-8" />
              <p className="text-xl text-gray-600 leading-relaxed">
                تأسست مدرسة ضياء المستقبل لتكون منارة تعليمية رائدة تجمع بين الأصالة والمعاصرة. نحن نؤمن بأن التعليم ليس مجرد تلقين للمعلومات، بل هو رحلة متكاملة لاكتشاف المواهب وبناء الشخصية. ندمج القيم التربوية الراسخة مع أحدث المناهج التعليمية لنقدم تجربة تثري عقل الطالب وتنمي قدراته.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 4. Vision & Mission */}
      <section id="vision" className="py-24 bg-[#F8FAFC]">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Card className="h-full border-none shadow-xl shadow-[#93FAFF]/5 hover:shadow-2xl transition-all duration-300 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#93FAFF]/10 rounded-bl-full -z-0 transition-transform group-hover:scale-110" />
                <CardContent className="p-10 relative z-10">
                  <div className="w-16 h-16 bg-[#93FAFF]/10 rounded-2xl flex items-center justify-center mb-6">
                    <Target className="w-8 h-8 text-[#93FAFF]" />
                  </div>
                  <h3 className="font-display text-3xl font-bold text-[#1A1A1A] mb-4">رؤيتنا</h3>
                  <p className="text-lg text-gray-600 leading-relaxed font-medium">
                    أن نكون الخيار الأول لأولياء الأمور الباحثين عن جودة التعليم المبني على الابتكار، وأن نُخرّج أجيالاً قادرة على صنع الفارق في مجتمعاتها.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <Card className="h-full border-none shadow-xl shadow-[#0069FF]/5 hover:shadow-2xl transition-all duration-300 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#0069FF]/10 rounded-bl-full -z-0 transition-transform group-hover:scale-110" />
                <CardContent className="p-10 relative z-10">
                  <div className="w-16 h-16 bg-[#0069FF]/10 rounded-2xl flex items-center justify-center mb-6">
                    <Star className="w-8 h-8 text-[#0069FF]" />
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

      {/* 5. Differentiators */}
      <section id="features" className="py-24 bg-white relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl font-bold text-[#0006B4] mb-4">ما الذي يميزنا؟</h2>
            <div className="w-24 h-1.5 bg-[#0069FF] mx-auto rounded-full mb-6" />
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">صممنا بيئتنا التعليمية بعناية فائقة لتلبي احتياجات العصر وتتجاوز التوقعات.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: BookOpen, title: "فصول دراسية متطورة", desc: "مجهزة بأحدث التقنيات لضمان تفاعل الطالب واستيعابه.", color: "#93FAFF" },
              { icon: Users, title: "كادر أكاديمي نخبوي", desc: "نخبة من المعلمين المتميزين ذوي الكفاءة العالية والشغف بالتعليم.", color: "#0069FF" },
              { icon: GraduationCap, title: "تأسيس قوي", desc: "تركيز مكثف على اللغات (العربية والإنجليزية) والرياضيات.", color: "#93FAFF" },
              { icon: MonitorSmartphone, title: "تحول رقمي", desc: "نظام دفع إلكتروني وسهولة في متابعة تقدم الطالب عبر التطبيقات.", color: "#0069FF" },
              { icon: CheckCircle, title: "شراكة حقيقية", desc: "تواصل مستمر وبناء مع أولياء الأمور لضمان تكامل الدور التربوي.", color: "#0006B4" }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="border border-gray-100 shadow-md hover:shadow-xl transition-shadow h-full">
                  <CardContent className="p-8">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6" style={{ backgroundColor: `${feature.color}15`, color: feature.color }}>
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

      {/* 6. Values */}
      <section className="py-24 bg-gradient-to-br from-[#0006B4] to-[#0069FF] text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl font-bold mb-4">قيمنــــا</h2>
            <div className="w-24 h-1.5 bg-white/30 mx-auto rounded-full" />
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="p-6">
              <div className="w-20 h-20 mx-auto bg-white/10 rounded-full flex items-center justify-center mb-6 backdrop-blur-sm border border-white/20">
                <Sparkles className="w-10 h-10" />
              </div>
              <h4 className="text-2xl font-bold mb-3">الأمان والرعاية</h4>
              <p className="text-white/80">بيئة تحتضن الطالب كأنه في بيته.</p>
            </motion.div>
            
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="p-6">
              <div className="w-20 h-20 mx-auto bg-white/10 rounded-full flex items-center justify-center mb-6 backdrop-blur-sm border border-white/20">
                <Star className="w-10 h-10" />
              </div>
              <h4 className="text-2xl font-bold mb-3">التميز والجودة</h4>
              <p className="text-white/80">لا نرضى بغير القمة في كل ما نقدمه.</p>
            </motion.div>

            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.4 }} className="p-6">
              <div className="w-20 h-20 mx-auto bg-white/10 rounded-full flex items-center justify-center mb-6 backdrop-blur-sm border border-white/20">
                <Target className="w-10 h-10" />
              </div>
              <h4 className="text-2xl font-bold mb-3">التحفيز المستمر</h4>
              <p className="text-white/80">تكريم المتفوقين ودعم الطموحين باستمرار.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* NEW 3D Gallery Section */}
      <section className="py-24 bg-[#0006B4] overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl font-bold text-white mb-4">معرض الصور والأنشطة</h2>
            <div className="w-24 h-1.5 bg-[#93FAFF] mx-auto rounded-full mb-6" />
            <p className="text-xl text-[#93FAFF]">لمحات من أنشطتنا المدرسية المتميزة</p>
          </div>

          <div className="relative w-full max-w-6xl mx-auto h-[400px] flex items-center justify-center" style={{ perspective: '1200px' }}>
            <AnimatePresence initial={false} mode="popLayout">
              {[-2, -1, 0, 1, 2].map((offset) => {
                const index = (currentIndex + offset + galleryImages.length) % galleryImages.length;
                const isCenter = offset === 0;
                
                return (
                  <motion.div
                    key={`${index}-${offset}`}
                    className="absolute top-0 bottom-0 flex items-center justify-center"
                    initial={{ 
                      x: `${offset * 50}%`,
                      rotateY: offset * -25,
                      scale: 1 - Math.abs(offset) * 0.15,
                      opacity: 0,
                      zIndex: 5 - Math.abs(offset)
                    }}
                    animate={{ 
                      x: `${offset * 60}%`,
                      rotateY: offset * -35,
                      scale: isCenter ? 1 : 1 - Math.abs(offset) * 0.2,
                      opacity: Math.abs(offset) > 2 ? 0 : 1 - Math.abs(offset) * 0.15,
                      zIndex: 5 - Math.abs(offset)
                    }}
                    exit={{ 
                      opacity: 0,
                      scale: 0.5,
                      transition: { duration: 0.2 }
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  >
                    <div 
                      className={`relative rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 ${
                        isCenter ? 'w-[300px] md:w-[400px] h-[300px] md:h-[400px] ring-4 ring-[#93FAFF]' : 'w-[200px] md:w-[300px] h-[200px] md:h-[300px]'
                      }`}
                    >
                      <div className="absolute inset-0 bg-black/20" />
                      <img 
                        src={galleryImages[index]} 
                        alt="نشاط مدرسي" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {/* Navigation Arrows */}
            <button 
              onClick={prevSlide}
              className="absolute left-4 z-20 w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button 
              onClick={nextSlide}
              className="absolute right-4 z-20 w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-colors"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>
      </section>

      {/* 7. Branches */}
      <section id="branches" className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl font-bold text-[#0006B4] mb-4">فروعنا</h2>
            <div className="w-24 h-1.5 bg-[#93FAFF] mx-auto rounded-full mb-6" />
            <p className="text-xl text-gray-600">نسعد باستقبالكم في فروعنا المختلفة.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                region: "المنطقة الجنوبية",
                name: "فرع تامزاوة الشاطئ",
                phone: "0915755363",
                facebook: "https://www.facebook.com/profile.php?id=61567008954540&locale=ar_AR",
                map: "https://maps.app.goo.gl/99GDq4LZg8gmowc37",
                color: "from-[#93FAFF] to-[#0006B4]",
                accent: "#93FAFF",
              },
              {
                region: "المنطقة الغربية",
                name: "فرع طرابلس – طريق المطار",
                phone: "0913081358",
                facebook: "https://www.facebook.com/1nearfuture?locale=ar_AR",
                map: "https://maps.app.goo.gl/qcv7uxe1dK54WaSKA",
                color: "from-[#93FAFF] to-[#0069FF]",
                accent: "#93FAFF",
              },
              {
                region: "المنطقة الغربية",
                name: "فرع طرابلس – السدرة",
                phone: "0915463080",
                facebook: "https://www.facebook.com/profile.php?id=61580399701160&locale=ar_AR",
                map: "https://maps.app.goo.gl/Zp4moTSkDDokfhD86",
                color: "from-[#0069FF] to-[#93FAFF]",
                accent: "#0069FF",
              },
            ].map((branch, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="overflow-hidden border-none shadow-lg group hover:shadow-xl transition-all h-full">
                  <div className={`h-2 bg-gradient-to-r ${branch.color}`} />
                  <CardContent className="p-8 flex flex-col gap-5 h-full">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0" style={{ background: branch.accent + "18" }}>
                        <MapPin className="w-6 h-6" style={{ color: branch.accent }} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-400 mb-0.5">{branch.region}</p>
                        <h4 className="font-bold text-xl text-[#1A1A1A] leading-snug">{branch.name}</h4>
                      </div>
                    </div>

                    <a href={`tel:${branch.phone}`} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group/phone">
                      <div className="flex items-center gap-3">
                        <PhoneCall className="w-5 h-5" style={{ color: branch.accent }} />
                        <span className="font-bold text-lg" dir="ltr">{branch.phone}</span>
                      </div>
                      <span className="text-sm font-bold opacity-0 group-hover/phone:opacity-100 transition-opacity" style={{ color: branch.accent }}>اتصل الآن</span>
                    </a>

                    <div className="flex gap-3 mt-auto">
                      <a
                        href={branch.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border border-[#1877F2]/20 bg-[#1877F2]/5 hover:bg-[#1877F2]/10 transition-colors text-[#1877F2] font-semibold text-sm"
                      >
                        <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                        </svg>
                        فيسبوك
                      </a>
                      <a
                        href={branch.map}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border border-[#EA4335]/20 bg-[#EA4335]/5 hover:bg-[#EA4335]/10 transition-colors text-[#EA4335] font-semibold text-sm"
                      >
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

      {/* 8. CTA */}
      <section id="contact" className="py-20 bg-[#F8FAFC]">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="font-display text-4xl font-bold text-[#1A1A1A] mb-6">تواصلوا معنا</h2>
            <p className="text-xl text-gray-600 mb-10 leading-relaxed">
              نحن هنا للإجابة على جميع استفساراتكم. اختاروا الفرع الأقرب إليكم وسنسعد بتواصلكم معنا لتأمين مستقبل مشرق لأبنائكم.
            </p>
            <div className="flex flex-wrap justify-center gap-6">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-white rounded-full h-14 px-8 text-lg font-bold shadow-lg" asChild>
                <a href="#branches">أرقام الفروع</a>
              </Button>
              <Button size="lg" className="bg-[#25D366] hover:bg-[#1ebe5d] text-white rounded-full h-14 px-8 text-lg font-bold shadow-lg flex items-center gap-3" asChild>
                <a href="https://iwtsp.com/201288361039" target="_blank" rel="noopener noreferrer">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 shrink-0">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.121 1.531 5.856L.057 23.882a.5.5 0 0 0 .611.611l6.056-1.474A11.944 11.944 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.907 0-3.686-.527-5.205-1.441l-.373-.223-3.865.94.96-3.841-.243-.386A9.944 9.944 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
                  </svg>
                  واتساب خدمة العملاء والدعم الفني
                </a>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 9. Footer */}
      <footer className="bg-white border-t border-gray-100 pt-16 pb-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-center text-center">
            <img src={schoolLogo} alt="شعار مدرسة ضياء المستقبل" className="h-20 w-auto object-contain mb-6 grayscale hover:grayscale-0 transition-all duration-500 opacity-80 hover:opacity-100" />
            <h3 className="font-display text-2xl font-bold text-[#0006B4] mb-3">مدرسة ضياء المستقبل</h3>
            <p className="text-gray-500 font-medium mb-8">حيث يبدأ طريق التميز والنجاح لأبنائكم.</p>
            
            <div className="w-full h-px bg-gray-100 mb-8" />
            
            <p className="text-sm text-gray-400">
              جميع الحقوق محفوظة © {new Date().getFullYear()} مدرسة ضياء المستقبل
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
