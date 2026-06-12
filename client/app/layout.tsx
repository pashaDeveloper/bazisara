import type { Metadata } from "next";
import localFont from "next/font/local";
import { AnalyticsTracker } from "./components/analytics-tracker";
import { SiteFooter } from "./components/site-footer";
import { SiteHeader } from "./components/site-header";
import "./globals.css";

const vazir = localFont({
  src: [
    {
      path: "./fonts/vazir-400.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/vazir-500.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "./fonts/vazir-700.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-vazir",
  display: "swap",
});

export const metadata: Metadata = {
  title: "بازی سرا",
  description: "فروشگاه و مجله بازی سرا",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fa"
      dir="rtl"
      className={`${vazir.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AnalyticsTracker />
        <SiteHeader />
        <div className="flex-1">{children}</div>
        <SiteFooter />
      </body>
    </html>
  );
}
