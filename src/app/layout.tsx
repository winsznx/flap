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
  other: {
    "talentapp:project_verification":
      "ae69a9a6b65f4853fc649f964f897ee6f57bf032c6c41a4efdd4804f4c772c066bd1f7afc34a67fada68dae0492230708816da74f74db2067d259b7bdb440373",
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
