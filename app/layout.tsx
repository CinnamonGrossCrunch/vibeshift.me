import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://vibeshift.me"),
  title: "VibeShift — The Cognitive Operating System for Deep Work",
  description:
    "VibeShift combines multimodal sensing and adaptive AI to understand your cognitive state and shape the conditions for peak performance in real time.",
  keywords: [
    "focus",
    "deep work",
    "cognitive performance",
    "neurotechnology",
    "adaptive AI",
    "flow state",
    "productivity",
    "wearable",
    "ambient intelligence",
  ],
  authors: [{ name: "VibeShift" }],
  openGraph: {
    title: "VibeShift — The Cognitive Operating System for Deep Work",
    description:
      "Multimodal intelligence that senses your cognitive state, understands your patterns, and actively shapes the conditions for peak performance.",
    url: "https://vibeshift.me",
    siteName: "VibeShift",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "VibeShift — The Cognitive Operating System for Deep Work",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "VibeShift — The Cognitive Operating System for Deep Work",
    description:
      "Multimodal intelligence that senses your cognitive state, understands your patterns, and actively shapes the conditions for peak performance.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} antialiased`}>
      <body className="font-sans">{children}</body>
    </html>
  );
}
