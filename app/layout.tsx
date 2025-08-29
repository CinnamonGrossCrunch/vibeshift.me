import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Newsletter Widget",
  description: "Smart newsletter dashboard with Mailchimp integration",
  icons: {
    icon: [
      { url: "/OskiHub_logo.ico", sizes: "any", type: "image/x-icon" },
      { url: "/OskiHub_logo.ico", sizes: "16x16", type: "image/x-icon" },
      { url: "/OskiHub_logo.ico", sizes: "32x32", type: "image/x-icon" },
    ],
    shortcut: "/OskiHub_logo.ico",
    apple: "/OskiHub_logo.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" style={{ colorScheme: 'dark' }}>
      <body className="antialiased dark">
        {children}
      </body>
    </html>
  );
}
