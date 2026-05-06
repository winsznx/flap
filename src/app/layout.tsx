import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Flap — Tap to Fly, Earn cUSD",
  description:
    "A flappy bird game on Celo. Tap to fly, dodge pipes, collect coins, and earn stablecoins. Built for MiniPay.",
  openGraph: {
    title: "Flap — Tap to Fly, Earn cUSD",
    description: "Flappy bird meets stablecoins. Play on MiniPay.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
