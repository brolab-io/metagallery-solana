import { PublicKey } from "@solana/web3.js";
import {
  GlowWalletAdapter,
  PhantomWalletAdapter,
  SlopeWalletAdapter,
  SolflareWalletAdapter,
  TorusWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import { WalletContextState } from "@solana/wallet-adapter-react";
export type IWalletProvider =
  | {
      name: string;
      connect: Function;
      disconnect: Function;
      signTransaction: Function;
      signAllTransactions: Function;
      on: Function;
      publicKey: PublicKey;
    }
  | WalletContextState;

const wallets: any = {
  phantom: new PhantomWalletAdapter(),
  glow: new GlowWalletAdapter(),
  slope: new SlopeWalletAdapter(),
  solflare: new SolflareWalletAdapter(),
  torus: new TorusWalletAdapter(),
};
export function getProvider(providerName: string): IWalletProvider {
  const provider: any = wallets[providerName];
  if (!provider) {
    throw new Error(`wallet ${providerName} was not installed on th is browser`);
  }
  return provider;
}
export async function connect(providerName: string) {
  const provider = getProvider(providerName);
  await provider.connect();
  return provider;
}
export async function disconnect(provider: IWalletProvider) {
  await provider.disconnect();
  return provider;
}
