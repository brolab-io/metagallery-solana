"use client";
import { Metadata } from "@metaplex-foundation/mpl-token-metadata";
import { useWallet } from "@solana/wallet-adapter-react";
import Button from "../__UI/Button";
import ConnectSolanaButton from "../__UI/SolanaConnectButton";

type Props = {
  nft: Metadata;
  className?: string;
  onClick?: () => void;
};
const SellNFTButton: React.FC<Props> = ({ nft, className, onClick }) => {
  const wallet = useWallet();

  if (!wallet.publicKey) {
    return (
      <div className="flex justify-center w-full mt-10">
        <ConnectSolanaButton />
      </div>
    );
  }

  // Check is NFT owner
  if (nft.updateAuthority.equals(wallet.publicKey)) {
    return (
      <Button onClick={onClick} className={className}>
        List NFT
      </Button>
    );
  }

  return null;
};

export default SellNFTButton;
