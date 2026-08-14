"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  LayoutDashboard,
  Newspaper,
  StickyNote,
  LogOut,
  GraduationCap,
  Menu,
  X,
  ExternalLink,
  PlusCircle,
  ClipboardList,
} from "lucide-react";
import type { User } from "@supabase/supabase-js";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { href: "/admin", label: "الرئيسية", icon: <LayoutDashboard className="w-5 h-5" /> },
  { href: "/admin/news", label: "إدارة الأخبار", icon: <Newspaper className="w-5 h-5" /> },
  { href: "/admin/reports", label: "الصحائف والنتائج", icon: <ClipboardList className="w-5 h-5" /> },
  { href: "/admin/notes", label: "الملاحظات المهمة", icon: <StickyNote className="w-5 h-5" /> },
];

export default function AdminSidebar({ user }: { user: User }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleSignOut() {
    setLoggingOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  function isActive(href: string) {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-blue-700/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="text-white font-bold text-sm leading-tight">لوحة التحكم</div>
            <div className="text-blue-200 text-xs">ضياء المستقبل</div>
          </div>
        </div>
      </div>

      {/* Quick action */}
      <div className="p-4">
        <Link
          href="/admin/news/new"
          onClick={() => setOpen(false)}
          className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-white/15 hover:bg-white/25 text-white rounded-xl text-sm font-semibold transition border border-white/20"
        >
          <PlusCircle className="w-4 h-4" />
          إضافة خبر جديد
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 pb-4 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
              isActive(item.href)
                ? "bg-white text-blue-700 shadow-sm"
                : "text-blue-100 hover:bg-white/10 hover:text-white"
            }`}
          >
            {item.icon}
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-blue-700/30 space-y-2">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-blue-200 hover:bg-white/10 hover:text-white transition"
        >
          <ExternalLink className="w-5 h-5" />
          الموقع الرئيسي
        </a>

        <div className="px-4 py-2">
          <div className="text-xs text-blue-200 truncate">{user.email}</div>
        </div>

        <button
          onClick={handleSignOut}
          disabled={loggingOut}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm text-red-300 hover:bg-red-500/10 hover:text-red-200 transition"
        >
          <LogOut className="w-5 h-5" />
          {loggingOut ? "جارٍ الخروج..." : "تسجيل الخروج"}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div
        className="lg:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 py-3 text-white"
        style={{ background: "linear-gradient(135deg, #0D72BB, #1FA0FF)" }}
      >
        <div className="flex items-center gap-2">
          <GraduationCap className="w-6 h-6" />
          <span className="font-bold text-sm">لوحة التحكم</span>
        </div>
        <button onClick={() => setOpen(true)} className="p-2 rounded-lg bg-white/10">
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Mobile overlay */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-50"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <div
        className={`lg:hidden fixed top-0 right-0 bottom-0 w-72 z-50 transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ background: "linear-gradient(180deg, #0D72BB 0%, #0D80E0 100%)" }}
      >
        <div className="flex justify-end p-4">
          <button
            onClick={() => setOpen(false)}
            className="p-2 rounded-lg bg-white/10 text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <SidebarContent />
      </div>

      {/* Desktop sidebar */}
      <div
        className="hidden lg:flex lg:fixed lg:top-0 lg:right-0 lg:bottom-0 lg:w-72 lg:flex-col"
        style={{ background: "linear-gradient(180deg, #0D72BB 0%, #0D80E0 100%)" }}
      >
        <SidebarContent />
      </div>
    </>
  );
}
