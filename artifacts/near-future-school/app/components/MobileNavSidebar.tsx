"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  Home,
  Newspaper,
  GraduationCap,
  Phone,
  Info,
  Eye,
} from "lucide-react";

const navLinks = [
  { href: "/",         label: "الرئيسية",       icon: Home },
  { href: "/#about",   label: "من نحن",          icon: Info },
  { href: "/#vision",  label: "الرؤية والرسالة", icon: Eye },
  { href: "/news",     label: "الأخبار",         icon: Newspaper },
  { href: "/results",  label: "النتائج",         icon: GraduationCap },
  { href: "/#contact", label: "تواصل معنا",      icon: Phone },
];

export default function MobileNavSidebar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const scrollY = useRef(0);

  /* Close on route change */
  useEffect(() => { setOpen(false); }, [pathname]);

  /* Lock body scroll — iOS-safe technique */
  useEffect(() => {
    if (open) {
      scrollY.current = window.scrollY;
      document.body.style.position   = "fixed";
      document.body.style.top        = `-${scrollY.current}px`;
      document.body.style.width      = "100%";
      document.body.style.overflowY  = "scroll"; // keep scrollbar width
    } else {
      document.body.style.position  = "";
      document.body.style.top       = "";
      document.body.style.width     = "";
      document.body.style.overflowY = "";
      window.scrollTo(0, scrollY.current);
    }
    return () => {
      document.body.style.position  = "";
      document.body.style.top       = "";
      document.body.style.width     = "";
      document.body.style.overflowY = "";
    };
  }, [open]);

  const isActive = (href: string) => {
    const base = href.split("#")[0];
    if (base === "/") return pathname === "/";
    return pathname.startsWith(base);
  };

  return (
    <>
      {/* ── Hamburger button ─────────────────────────── */}
      <button
        onClick={() => setOpen(true)}
        aria-label="فتح القائمة"
        className="md:hidden flex items-center justify-center w-10 h-10 rounded-xl text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* ── Backdrop ─────────────────────────────────── */}
      <div
        onClick={() => setOpen(false)}
        aria-hidden="true"
        className={`fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm md:hidden transition-opacity duration-300 ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* ── Sidebar drawer (slides from right / RTL) ── */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="القائمة الجانبية"
        className={`fixed top-0 right-0 z-[70] h-full w-72 bg-white shadow-2xl flex flex-col md:hidden
                    transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]
                    ${open ? "translate-x-0" : "translate-x-full"}`}
        dir="rtl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100
                        bg-gradient-to-l from-blue-50 to-white shrink-0">
          <div className="flex items-center gap-2">
            <img
              src="/assets/school-logo-1782634252188.png"
              alt="شعار المدرسة"
              className="w-8 h-8 object-contain"
              style={{ mixBlendMode: "multiply" }}
            />
            <span className="font-bold text-blue-700 text-base">ضياء المستقبل</span>
          </div>
          <button
            onClick={() => setOpen(false)}
            aria-label="إغلاق القائمة"
            className="w-9 h-9 flex items-center justify-center rounded-xl text-gray-400
                       hover:bg-gray-100 hover:text-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navLinks.map((link) => {
            const active = isActive(link.href);
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-semibold
                            transition-all active:scale-[0.97] ${
                  active
                    ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                    : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                }`}
              >
                <Icon className="w-5 h-5 shrink-0" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-gray-100 text-center shrink-0">
          <p className="text-xs text-gray-400">مدرسة ضياء المستقبل</p>
        </div>
      </div>
    </>
  );
}
