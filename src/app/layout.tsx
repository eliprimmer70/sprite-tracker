import type { Metadata } from "next";
import "./globals.css";
import { Oswald, Inter } from "next/font/google";

// Oswald = closest free analog to Fortnite's Burbank Big Condensed.
// Used for brand, hero, section titles, .card-title etc.
const now = Oswald({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-now",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Fortnite Tracker — Cosmetic Catalog & Shop History",
  description:
    "Browse every Fortnite cosmetic. See when an item first released, last hit the shop, watch emote showcases, and track leaks.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${now.variable} ${inter.variable}`}>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
