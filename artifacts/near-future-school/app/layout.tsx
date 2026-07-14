import type { Metadata } from "next";
import { Cairo, Tajawal } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

const cairo = Cairo({
  subsets: ["arabic"],
  variable: "--font-cairo",
  display: "swap",
});

const tajawal = Tajawal({
  subsets: ["arabic"],
  weight: ["400", "500", "700", "800"],
  variable: "--font-tajawal",
  display: "swap",
});

export const metadata: Metadata = {
  title: "مدرسة ضياء المستقبل",
  description:
    "نحو جيل مبدع، متفوق، وقائد للمستقبل. حيث يبدأ طريق التميز والنجاح لأبنائكم.",
  robots: "index, follow",
  openGraph: {
    title: "مدرسة ضياء المستقبل",
    description: "نحو جيل مبدع، متفوق، وقائد للمستقبل.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "مدرسة ضياء المستقبل",
    description: "نحو جيل مبدع، متفوق، وقائد للمستقبل.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${cairo.variable} ${tajawal.variable}`}
    >
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
