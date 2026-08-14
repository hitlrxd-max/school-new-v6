"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";

/**
 * #25 — تسجيل خروج تلقائي عند انتهاء الجلسة
 * يراقب حالة مصادقة Supabase في الخلفية؛ إذا انتهت الجلسة أو تمّ
 * تسجيل الخروج من أي مكان يعيد التوجيه فوراً إلى صفحة الدخول.
 */
export default function AdminSessionGuard() {
  const router = useRouter();

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || (!session && event !== "INITIAL_SESSION")) {
        router.replace("/admin/login");
      }
    });

    // فحص دوري كل 5 دقائق
    const interval = setInterval(async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace("/admin/login");
      }
    }, 5 * 60 * 1000);

    return () => {
      subscription.unsubscribe();
      clearInterval(interval);
    };
  }, [router]);

  return null;
}
