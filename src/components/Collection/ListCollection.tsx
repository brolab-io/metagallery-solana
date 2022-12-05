"use client";
import Image from "next/image";
import Link from "next/link";
import { Metadata } from "@metaplex-foundation/mpl-token-metadata";

type Props = {
  collections: Metadata[];
};

const ListCollection: React.FC<Props> = ({ collections }) => {
  return (
    <div className="grid grid-cols-1 gap-8 mt-4 md:grid-cols-2 lg:grid-cols-3">
      {collections.map((collection) => (
        <Link key={collection.mint.toString()} href={`/collections/${collection.mint.toString()}`}>
          <div className="bg-[#22B78F]/10 border-2 border-primary">
            <Image
              src={"https://picsum.photos/530/273"}
              alt="Gallery"
              width={530}
              height={273}
              className="aspect-[530/273] object-cover"
            />
            <div className="flex py-8 space-x-6 px-9">
              <Image
                className="aspect-square w-[120px] h-[120px] -mt-[80px]"
                src="/assets/images/fake-avatar.jpg"
                alt="Avatar"
                width={120}
                height={120}
              />
              <span className="text-white font-bold text-[16px] sm:text-[18px] md:text-[20px] lg:text-[22px] xl:text-[24px]">
                {collection.data.name}
              </span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};
export default ListCollection;
