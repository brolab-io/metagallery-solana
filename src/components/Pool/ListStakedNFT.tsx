"use client";
import { useWallet } from "@solana/wallet-adapter-react";
import { useMemo } from "react";
import { TokenMetdata } from "../../services/nft.service";
import Loading from "../__UI/Loading";
import ListStakedNFTItem from "./ListStakedNFTItem";

type Props = {
  nfts: TokenMetdata[];
  isLoading?: boolean;
  onItemClicked?: (item: TokenMetdata) => void;
  renderActions?: (item: TokenMetdata) => JSX.Element;
  poolId: string;
};

const ListStakedNFT: React.FC<Props> = ({ nfts, isLoading, onItemClicked, renderActions }) => {
  const { publicKey } = useWallet();

  const helpText = useMemo(() => {
    if (!publicKey) {
      return "Connect your wallet to see your NFTS!";
    }
    if (!nfts.length) {
      return "You don't have any NFTs on this collection yet!";
    }
    return "";
  }, [nfts.length, publicKey]);

  if (!nfts.length && isLoading) {
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
        <ListStakedNFTItem
          key={nft.mint.toString()}
          onItemClicked={onItemClicked}
          item={nft}
          renderActions={renderActions}
        />
      ))}
    </div>
  );
};

export default ListStakedNFT;
