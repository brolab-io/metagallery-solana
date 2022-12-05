"use client";
import { Metadata } from "@metaplex-foundation/mpl-token-metadata";
import Loading from "../__UI/Loading";
import ListCollectionItem from "./ListCollectionItem";

type Props = {
  collections: Metadata[];
  isLoading?: boolean;
};

const ListCollection: React.FC<Props> = ({ collections, isLoading }) => {
  if (isLoading) {
    return <Loading label="Loading collections..." />;
  }
  if (!collections.length) {
    return (
      <div className="py-40">
        <p className="text-3xl text-center text-white">There are no collections</p>
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
