import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["500", "700", "800"], // Medium, Bold, ExtraBold
});

export const metadata: Metadata = {
  title: {
    default: "Recv. AI - Free ATS-Friendly CV Builder & Cover Letter Generator",
    template: "%s | Recv. AI"
  },
  description: "Create professional, ATS-optimized resumes and AI-tailored cover letters in minutes. Free to use, multiple templates, and instant PDF download.",
  keywords: ["CV Builder", "Resume Builder", "AI Cover Letter", "ATS Friendly", "Free Resume Templates", "Job Application Tool", "CV Maker", "Review CV"],
  authors: [{ name: "Recv. AI Team" }],
  creator: "Recv. AI",
  publisher: "Recv. AI",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://recv-ai.me'),
  openGraph: {
    title: "Recv. AI - Free ATS-Friendly CV Builder",
    description: "Build your professional CV and generate tailored cover letters with AI. Free, fast, and ATS-optimized.",
    type: "website",
    locale: "en_US",
    siteName: "Recv. AI",
    images: ['/og-image.png'],
  },
  twitter: {
    card: "summary_large_image",
    title: "Recv. AI - Free ATS-Friendly CV Builder",
    description: "Build your professional CV and generate tailored cover letters with AI.",
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

import { LanguageProvider } from '@/contexts/LanguageContext';
import SupportButton from '@/components/SupportButton';

import LenisProvider from '@/components/LenisProvider';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        suppressHydrationWarning={true}
        className={`${plusJakartaSans.variable} font-sans antialiased`}
      >
        <LanguageProvider>
          <LenisProvider>
            {children}
            <SupportButton />
          </LenisProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}

