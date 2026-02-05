// pages/_app.tsx
import type { AppProps } from "next/app";
import { ChakraProvider, ColorModeScript } from "@chakra-ui/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiConfig, createConfig, http } from "wagmi";
import { useEffect, useState } from "react";
import { mainnet } from "wagmi/chains";
import { injected } from "wagmi/connectors";
import theme from "../components/theme/theme";

// 🧩 Wagmi
const wagmiConfig = createConfig({
  chains: [mainnet],
  connectors: [injected()],
  transports: {
    [mainnet.id]: http(),
  },
  ssr: false,
});

// 🧩 React Query
const queryClient = new QueryClient();

export default function App({ Component, pageProps }: AppProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      <ColorModeScript initialColorMode={theme.config.initialColorMode} />
      <ChakraProvider theme={theme}>
        <QueryClientProvider client={queryClient}>
          <WagmiConfig config={wagmiConfig}>
            {/* 🛡️ Ne rend les composants que si le client est monté */}
            {mounted && <Component {...pageProps} />}
          </WagmiConfig>
        </QueryClientProvider>
      </ChakraProvider>
    </>
  );
}
