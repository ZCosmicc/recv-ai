import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Geist_Mono, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["500", "700", "800"], // Medium, Bold, ExtraBold
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Recv. AI - Free ATS-Friendly CV Builder & Cover Letter Generator",
    template: "%s | Recv. AI"
  },
  description: "Create professional, ATS-optimized resumes and AI-tailored cover letters in minutes. Free, fast, and multi-language.",
  keywords: ["AI CV Maker", "CV Online", "Web CV Online", "CV Maker", "CV Builder", "ATS Friendly", "Free Resume Templates"],
  alternates: {
    canonical: 'https://recv-ai.me',
    languages: {
      'en-US': '/en',
      'id-ID': '/id',
    },
  },
  authors: [{ name: "Recv. AI Team" }],
  creator: "Recv. AI",
  publisher: "Recv. AI",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://recv-ai.me'),
  icons: {
    icon: [
      { url: '/icon.png', sizes: '32x32' },
      { url: '/icon.png', sizes: '192x192' },
      { url: '/icon.png', sizes: '512x512' },
    ],
    shortcut: '/icon.png',
    apple: '/apple-icon.png',
  },
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
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "Recv. AI",
              "operatingSystem": "All",
              "applicationCategory": "BusinessApplication",
              "description": "Professional ATS-friendly CV builder and AI-tailored cover letter generator.",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "IDR"
              }
            })
          }}
        />
      </head>
      <body
        suppressHydrationWarning={true}
        className={`${plusJakartaSans.variable} ${geistMono.variable} ${jetbrainsMono.variable} font-sans antialiased`}
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

