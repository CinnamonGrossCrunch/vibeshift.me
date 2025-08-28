import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Newsletter Widget",
  description: "Smart newsletter dashboard with Mailchimp integration",
  icons: {
    icon: "/bear fav.ico",
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
