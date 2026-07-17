import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sprite Tracker",
  description: "Track your Fortnite locker — see what you have and what you're missing",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#0a0a0f] text-[#f0f0f0] antialiased">
        {children}
      </body>
    </html>
  );
}
