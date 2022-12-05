import { Metadata } from "@metaplex-foundation/mpl-token-metadata";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getNftMetadataFromUri } from "../../services/nft.service";

type Props = {
  item: Metadata;
};

const ListCollectionItem: React.FC<Props> = ({ item }) => {
  const [metadata, setMetadata] = useState<Awaited<
    ReturnType<typeof getNftMetadataFromUri>
  > | null>(null);

  useEffect(() => {
    if (item.data.uri) {
      getNftMetadataFromUri(item.data.uri).then(setMetadata);
    }
  }, [item.data.uri]);

  return (
    <Link href={`/collections/${item.mint.toString()}`}>
      <div className="bg-[#22B78F]/10 border-2 border-primary">
        {metadata?.image ? (
          <Image
            src={`/api/imageProxy?imageUrl=${metadata?.image}`}
            alt="Gallery"
            loading="lazy"
            width={530}
            height={273}
            quality={100}
            className="aspect-[530/273] object-cover"
          />
        ) : (
          <div className="aspect-[530/273] w-full"></div>
        )}
        <div className="flex w-full py-8 space-x-6 px-9">
          <Image
            className="aspect-square w-[120px] h-[120px] -mt-[80px]"
            src="/assets/images/fake-avatar.jpg"
            alt="Avatar"
            width={120}
            height={120}
          />
          <span className="text-white font-bold text-[16px] sm:text-[18px] md:text-[20px] lg:text-[22px] xl:text-[24px] truncate w-full">
            {metadata?.name || item.data.name}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default ListCollectionItem;
