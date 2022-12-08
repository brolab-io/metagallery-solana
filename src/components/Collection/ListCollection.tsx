"use client";
import { Metadata } from "@metaplex-foundation/mpl-token-metadata";
import { useWallet } from "@solana/wallet-adapter-react";
import { useMemo } from "react";
import Loading from "../__UI/Loading";
import ListCollectionItem from "./ListCollectionItem";

type Props = {
  collections: Metadata[];
  isLoading?: boolean;
};

const ListCollection: React.FC<Props> = ({ collections, isLoading }) => {
  const { publicKey } = useWallet();

  const helpText = useMemo(() => {
    if (!publicKey) {
      return "Connect your wallet to see your collections!";
    }
    if (!collections.length) {
      return "You don't have any collections yet. Create one to get started!";
    }
    return "";
  }, [collections.length, publicKey]);

  if (isLoading) {
    return <Loading label="Loading your collections..." />;
  }
  if (!collections.length || !publicKey) {
    return (
      <div className="py-40">
        <p className="text-3xl text-center text-white">{helpText}</p>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 gap-8 mt-4 md:grid-cols-2 lg:grid-cols-3">
      {collections.map((collection) => (
        <ListCollectionItem key={collection.mint.toString()} item={collection}></ListCollectionItem>
      ))}
    </div>
  );
};
export default ListCollection;
