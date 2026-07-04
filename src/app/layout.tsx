import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers/Providers";
import { VisitorTracker } from "@/components/analytics/VisitorTracker";
import { SplashScreen } from "@/components/SplashScreen";

// Inter carries the brand voice (ss03 enabled site-wide via globals.css).
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: "NextHireAI — AI Resume & Cover Letter Builder",
    template: "%s · NextHireAI",
  },
  description:
    "Build an ATS-ready resume and tailored cover letters with AI. Get your ATS score, fix missing keywords, and download in PDF or DOCX.",
  keywords: [
    "AI resume builder",
    "ATS resume checker",
    "cover letter generator",
    "resume templates",
    "NextHireAI",
  ],
  openGraph: {
    title: "NextHireAI — AI Resume & Cover Letter Builder",
    description:
      "Build an ATS-ready resume and tailored cover letters with AI. Beat the ATS and get hired faster.",
    url: APP_URL,
    siteName: "NextHireAI",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "NextHireAI — AI Resume & Cover Letter Builder",
    description: "Build an ATS-ready resume and cover letters with AI.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#07080a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrains.variable}`}>
      <body>
        <SplashScreen />
        <Providers>
          <VisitorTracker />
          {children}
        </Providers>
      </body>
    </html>
  );
}
