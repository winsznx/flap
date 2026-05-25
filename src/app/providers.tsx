"use client";

import { useState } from "react";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { wagmiConfig } from "@/lib/wagmi";
import { MiniPayBoot } from "@/components/MiniPayBoot";
import { ChainProvider } from "@/chain/ChainProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(
    () => new QueryClient({ defaultOptions: { queries: { staleTime: 30_000 } } }),
  );
  return (
    <ChainProvider>
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={client}>
          <MiniPayBoot />
          {children}
        </QueryClientProvider>
      </WagmiProvider>
    </ChainProvider>
  );
}
