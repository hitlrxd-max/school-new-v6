import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import AdminSidebar from "./components/AdminSidebar";
import AdminSessionGuard from "./components/AdminSessionGuard";

export const metadata = {
  title: "لوحة التحكم — مدرسة ضياء المستقبل",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") ?? "";

  // Login page: no auth check, no sidebar
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  // All other admin pages: require auth
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen bg-gray-50 print:bg-white" dir="rtl">
      <AdminSessionGuard />
      <div className="print:hidden">
        <AdminSidebar user={user} />
      </div>
      <div className="lg:mr-72 print:mr-0 min-h-screen">
        <div className="p-4 lg:p-8 pt-20 lg:pt-8 print:p-0 print:pt-0">{children}</div>
      </div>
    </div>
  );
}
