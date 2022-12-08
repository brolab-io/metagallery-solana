import Image from "next/image";
import Link from "next/link";
import useAssetMetadata from "../../hooks/useAssetMetadata";
import { TokenMetdata } from "../../services/nft.service";

type Props = {
  isMarketplace?: boolean;
  item: TokenMetdata;
};

const ListNFTItem = ({ isMarketplace, item }: Props) => {
  const { data: metadata } = useAssetMetadata(item.data.uri);

  return (
    <Link
      key={item.mint.toString()}
      href={
        isMarketplace && "marketId" in item
          ? `/marketplace/${item.mint.toString()}`
          : `/nfts/${item.mint.toString()}`
      }
    >
      <div className="bg-[#22B78F]/10 border-2 border-primary p-5 space-y-5 w-full">
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
          {metadata?.name || item.data.name}
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[15px] text-[#6B7280] font-bold">Power</span>
            <span className="text-white font-bold text-[20px]">
              {"power" in item.tokenData && item.tokenData.power.toString()}
            </span>
          </div>
          {/* {"marketPrice" in item && (
              <div className="flex items-center justify-between">
                <span className="text-[15px] text-[#6B7280] font-bold">Sale price</span>
                <span className="text-white font-bold text-[20px]">{nft.marketPrice} SOL</span>
              </div>
            )} */}
        </div>
      </div>
    </Link>
  );
};

export default ListNFTItem;
