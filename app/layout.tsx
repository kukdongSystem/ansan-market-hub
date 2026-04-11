import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { DataProvider } from "@/context/DataContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "안산유통상가 검색 플랫폼 '이거어디?' | 공식 통합 마켓 허브",
    template: "%s | 이거어디? 안산유통단지"
  },
  description: "안산유통상가의 모든 상점을 한눈에! 공구, 전기, 배관, 잡화 등 단지 내 1만여 상점을 쉽고 빠르게 검색하고 위치를 확인하세요.",
  keywords: ["안산유통상가", "안산유통단지", "이거어디", "공구상가", "유통단지 검색", "안산 마켓허브", "안산 공구", "기계 부품 검색"],
  authors: [{ name: "Kukdong System" }],
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: "https://ansan-market-hub.vercel.app",
    title: "안산유통상가 통합 검색 플랫폼 '이거어디?'",
    description: "공구부터 기계 부품까지, 안산유통상가의 모든 정보를 실시간으로 확인하세요.",
    siteName: "이거어디?",
    images: [
      {
        url: "/images/logo.png",
        width: 1200,
        height: 630,
        alt: "안산유통상가 이거어디 로고"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "안산유통상가 통합 검색 플랫폼 '이거어디?'",
    description: "내 손안의 안산유통상가, 위치와 상점 정보를 한 번에!",
  },
  verification: {
    other: {
      'naver-site-verification': '35e95d4bc94fb8e28b1c6c3e5e0c60c9b2ef4de6',
      'google-site-verification': 'PB7bHtg4899qkT-Y0p_92Y-W9F',
    },
  },
  robots: "index, follow",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
          <DataProvider>
            {children}
          </DataProvider>
      </body>
    </html>
  );
}
