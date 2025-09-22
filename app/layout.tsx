import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { Urbanist } from "next/font/google";
import "./globals.css";

const urbanist = Urbanist({
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-urbanist',
});

export const metadata: Metadata = {
  title: "Newsletter Widget",
  description: "Smart newsletter dashboard with Mailchimp integration",
  icons: {
    icon: [
      { url: "/cloudclaw.ico", sizes: "any", type: "image/x-icon" },
      { url: "/cloudclaw.ico", sizes: "16x16", type: "image/x-icon" },
      { url: "/cloudclaw.ico", sizes: "32x32", type: "image/x-icon" },
    ],
    shortcut: "/cloudclaw.ico",
    apple: "/cloudclaw.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`dark ${urbanist.variable}`} style={{ colorScheme: 'dark' }}>
      <head>
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
      </head>
      <body className={`antialiased dark ${urbanist.className}`}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
