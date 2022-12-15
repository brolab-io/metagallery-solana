"use client";
import { Metadata } from "@metaplex-foundation/mpl-token-metadata";
import { useWallet } from "@solana/wallet-adapter-react";
import { useCallback } from "react";
import { getListingsForAddress } from "../../services/marketplace.service";
import Button from "../__UI/Button";
import ConnectSolanaButton from "../__UI/SolanaConnectButton";

type Props = {
  nft: Awaited<ReturnType<typeof getListingsForAddress>>[number];
  className?: string;
};
const BuyOrDelistNFTButton: React.FC<Props> = ({ nft, className }) => {
  const wallet = useWallet();

  const delist = useCallback(() => {}, []);

  const buy = useCallback(() => {}, []);

  if (!wallet.publicKey) {
    return (
      <div className="flex justify-center w-full mt-10">
        <ConnectSolanaButton />
      </div>
    );
  }

  // Check is NFT owner
  if (nft.sale.seller === wallet.publicKey.toBase58()) {
    return (
      <Button onClick={delist} className={className}>
        Delist NFT
      </Button>
    );
  }

  return (
    <Button onClick={buy} className={className}>
      Buy NFT
    </Button>
  );
};

export default BuyOrDelistNFTButton;
