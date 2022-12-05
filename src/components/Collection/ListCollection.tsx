"use client";
import { Metadata } from "@metaplex-foundation/mpl-token-metadata";
import ListCollectionItem from "./ListCollectionItem";

type Props = {
  collections: Metadata[];
};

const ListCollection: React.FC<Props> = ({ collections }) => {
  return (
    <div className="grid grid-cols-1 gap-8 mt-4 md:grid-cols-2 lg:grid-cols-3">
      {collections.map((collection) => (
        <ListCollectionItem key={collection.mint.toString()} item={collection}></ListCollectionItem>
      ))}
    </div>
  );
};
export default ListCollection;
