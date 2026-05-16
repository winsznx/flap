import type { Metadata, Viewport } from "next";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/700.css";
import "./globals.css";
import { Providers } from "./providers";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://flap.timjosh507.workers.dev";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  manifest: "/manifest.json",
  applicationName: "Flap",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "Flap" },
  title: "Flap — Tap to fly, stake cUSD",
  description:
    "A flappy-shaped arcade game on Celo. Stake cUSD, beat the threshold, climb the daily bounty pot.",
  openGraph: {
    type: "website",
    siteName: "Flap",
    title: "Flap — Tap to fly, stake cUSD",
    description: "Flappy bird meets stablecoins. Play on Celo.",
    url: "/",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Flap — Sats-back arcade" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Flap — Tap to fly, stake cUSD",
    description: "Flappy bird meets stablecoins. Play on Celo.",
    images: ["/og.png"],
  },
  other: {
    "talentapp:project_verification":
      "ae69a9a6b65f4853fc649f964f897ee6f57bf032c6c41a4efdd4804f4c772c066bd1f7afc34a67fada68dae0492230708816da74f74db2067d259b7bdb440373",
  },
};

export const viewport: Viewport = {
  themeColor: "#E7C59A",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
