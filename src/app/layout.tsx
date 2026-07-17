import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sprite Tracker — Fortnite Item Shop Tracker",
  description: "Track what's in the Fortnite item shop — mark items you own and want",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen bg-[#0a0a0f] text-[#f0f0f0] antialiased" style={{ fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
