import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Newsletter Widget",
  description: "Smart newsletter dashboard with Mailchimp integration",
  icons: {
    icon: [
      { url: "/bear fav.ico", sizes: "any", type: "image/x-icon" },
      { url: "/bear fav.ico", sizes: "16x16", type: "image/x-icon" },
      { url: "/bear fav.ico", sizes: "32x32", type: "image/x-icon" },
    ],
    shortcut: "/bear fav.ico",
    apple: "/bear fav.ico",
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
