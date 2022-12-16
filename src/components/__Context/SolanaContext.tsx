"use client";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { useMemo } from "react";
import {
  PhantomWalletAdapter,
  Coin98WalletAdapter,
  BraveWalletAdapter,
  SolflareWalletAdapter,
  GlowWalletAdapter,
  SolletExtensionWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";

const SolanaContextProvider = ({ children }: any) => {
  // You can also provide a custom RPC endpoint.
  // const endpoint = useMemo(() => clusterApiUrl(network), [network]);
  const endpoint = process.env.NEXT_PUBLIC_SOLANA_ENDPOINT!;

  const wallets = useMemo(
    () => [
      /**
       * Wallets that implement either of these standards will be available automatically.
       *
       *   - Solana Mobile Stack Mobile Wallet Adapter Protocol
       *     (https://github.com/solana-mobile/mobile-wallet-adapter)
       *   - Solana Wallet Standard
       *     (https://github.com/solana-labs/wallet-standard)
       *
       * If you wish to support a wallet that supports neither of those standards,
       * instantiate its legacy wallet adapter here. Common legacy adapters can be found
       * in the npm package `@solana/wallet-adapter-wallets`.
       */
      new PhantomWalletAdapter(),
      new Coin98WalletAdapter(),
      new BraveWalletAdapter(),
      new SolflareWalletAdapter(),
      new GlowWalletAdapter(),
      new SolletExtensionWalletAdapter(),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider autoConnect wallets={wallets}>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

export default SolanaContextProvider;
