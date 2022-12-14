import { BN } from "bn.js";
import Image from "next/image";
import Link from "next/link";
import { PropsWithChildren } from "react";
import useAssetMetadata from "../../hooks/useAssetMetadata";
import { getListingsForAddress } from "../../services/marketplace.service";
import { TokenMetdata } from "../../services/nft.service";

type NFTData = TokenMetdata | Awaited<ReturnType<typeof getListingsForAddress>>[number];

type Props = {
  isMarketplace?: boolean;
  item: NFTData;
  onItemClicked?: (item: NFTData) => void;
  renderActions?: (item: NFTData) => JSX.Element;
};

const NFTItemWrapper: React.FC<PropsWithChildren<Props>> = ({
  item,
  children,
  onItemClicked,
  isMarketplace,
}) => {
  if (onItemClicked) {
    return (
      <div
        className="bg-[#22B78F]/10 border-2 border-primary p-5 space-y-5 w-full cursor-pointer hover:brightness-125"
        onClick={() => onItemClicked(item)}
      >
        {children}
      </div>
    );
  }
  return (
    <Link
      href={
        isMarketplace ? `/marketplace/${item.mint.toString()}` : `/nfts/${item.mint.toString()}`
      }
    >
      <div className="bg-[#22B78F]/10 border-2 border-primary p-4 space-y-3 w-full">{children}</div>
    </Link>
  );
};

const ListNFTItem: React.FC<Props> = ({ isMarketplace, item, onItemClicked, renderActions }) => {
  const { data: metadata } = useAssetMetadata(item.data.uri);

  return (
    <NFTItemWrapper item={item} onItemClicked={onItemClicked} isMarketplace={isMarketplace}>
      <div className="aspect-square bg-gray-500/20">
        {metadata?.image ? (
          <Image
            src={`/api/imageProxy?imageUrl=${metadata?.image}`}
            alt="Gallery"
            loading="lazy"
            width={290}
            height={290}
            quality={100}
            className="object-cover aspect-square"
          />
        ) : (
          <div className="w-full aspect-square"></div>
        )}
      </div>
      <div className="w-full truncate text-white font-bold text-[16px] sm:text-[17px] md:text-[18px] lg:text-[19px] xl:text-[20px]">
        {metadata?.name || ""}
        <p className="text-[12px] md:text-[14px] lg:text-[16px] text-[#bbbbbb]">
          {metadata?.description || ""}
        </p>
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[15px] text-[#6B7280] font-bold">Power</span>
          <span className="text-white font-bold text-[20px]">
            {item.tokenData?.power.toString() || 1}
          </span>
        </div>

        {"price" in item && (
          <div className="flex items-center justify-between">
            <span className="text-[15px] text-[#6B7280] font-bold">Sale price</span>
            <span className="text-white font-bold text-[20px]">
              {item.price.price.div(new BN(10).pow(new BN(8))).toString()} BRO
            </span>
          </div>
        )}

        {renderActions?.(item)}
      </div>
    </NFTItemWrapper>
  );
};

export default ListNFTItem;
