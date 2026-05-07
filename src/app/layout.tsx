import type { Metadata } from "next";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/700.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Flap — Tap to fly, stake cUSD",
  description:
    "A flappy-shaped arcade game on Celo. Stake cUSD, beat the threshold, climb the daily bounty pot.",
  openGraph: {
    title: "Flap — Tap to fly, stake cUSD",
    description: "Flappy bird meets stablecoins. Play on Celo.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
