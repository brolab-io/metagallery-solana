"use client";
import { useWallet } from "@solana/wallet-adapter-react";
import { useMemo } from "react";
import { TokenMetdata } from "../../services/nft.service";
import Loading from "../__UI/Loading";
import ListNFTItem from "./ListNFTItem";

type Props = {
  isMarketplace?: boolean;
  nfts: TokenMetdata[];
  isLoading?: boolean;
};

const ListNFT: React.FC<Props> = ({ isMarketplace, nfts, isLoading }) => {
  const { publicKey } = useWallet();

  const helpText = useMemo(() => {
    if (!publicKey) {
      return "Connect your wallet to see your collections!";
    }
    if (!nfts.length) {
      return "You don't have any NFTs on this collection yet!";
    }
    return "";
  }, [nfts.length, publicKey]);

  if (isLoading) {
    return <Loading label="Loading NFTs..." />;
  }

  if (!nfts.length || !publicKey) {
    return (
      <div className="py-40">
        <p className="text-3xl text-center text-white">{helpText}</p>
      </div>
    );
  }
  return (
    <div className="grid gap-8 mt-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {nfts.map((nft) => (
        <ListNFTItem key={nft.mint.toString()} isMarketplace={isMarketplace} item={nft} />
      ))}
    </div>
  );
};

export default ListNFT;
