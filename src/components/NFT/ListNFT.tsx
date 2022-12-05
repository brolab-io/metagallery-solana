"use client";
import { Metadata } from "@metaplex-foundation/mpl-token-metadata";
import Loading from "../__UI/Loading";
import ListNFTItem from "./ListNFTItem";

type Props = {
  isMarketplace?: boolean;
  nfts: Metadata[];
  isLoading?: boolean;
};

const ListNFT: React.FC<Props> = ({ isMarketplace, nfts, isLoading }) => {
  if (isLoading) {
    return <Loading label="Loading NFTs..." />;
  }
  if (!nfts.length) {
    return (
      <div className="py-40">
        <p className="text-3xl text-center text-white">There are no NFTs</p>
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
