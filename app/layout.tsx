import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { Urbanist } from "next/font/google";
import { PerformanceProvider } from "./components/PerformanceProvider";
import "./globals.css";

const urbanist = Urbanist({
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-urbanist',
});

export const metadata: Metadata = {
  title: "OskiHub",
  description: "EWMBA Student Hub & Schedule Aggregator",
  icons: {
    icon: [
      { url: "/OskiHub.ico", sizes: "any", type: "image/x-icon" },
      { url: "/OskiHub.ico", sizes: "16x16", type: "image/x-icon" },
      { url: "/OskiHub.ico", sizes: "32x32", type: "image/x-icon" },
    ],
    shortcut: "/OskiHub.ico",
    apple: "/OskiHub.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`dark ${urbanist.variable}`}
      style={{ colorScheme: 'dark' }}
      suppressHydrationWarning
      data-theme="dark"
    >
      <head>
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Force dark mode immediately before render
              (function() {
                document.documentElement.classList.add('dark');
                document.documentElement.setAttribute('data-theme', 'dark');
                document.documentElement.style.colorScheme = 'dark';
              })();
            `,
          }}
        />
      </head>
      <body className={`antialiased dark ${urbanist.className}`} style={{ colorScheme: 'dark' }}>
        <PerformanceProvider>
          {children}
        </PerformanceProvider>
        <Analytics />
      </body>
    </html>
  );
}
