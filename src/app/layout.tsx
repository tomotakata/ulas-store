import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ULAS O3 finger | 先行予約",
  description:
    "ULAS O3 fingerは、水からオゾン水を生成するコンパクトタイプのオゾン水生成器です。先行予約受付中。¥18,700（税込・送料込）",
  openGraph: {
    title: "ULAS O3 finger | 先行予約",
    description:
      "水からオゾン水を生成するコンパクトタイプのオゾン水生成器。先行予約特別価格 ¥18,700",
    type: "website",
    url: "https://store.ulas.jp",
    siteName: "ULAS Store",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ja"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
