"use client";
import ListNFT from "../../../../components/NFT/ListNFT";
import useAssets from "../../../../hooks/useAssets";

type Props = {
  params: {
    address: string;
  };
};

const CollectionNFts = ({ params: { address } }: Props) => {
  const { data, isLoading } = useAssets("nft", address);

  console.log(data);

  return <ListNFT isLoading={isLoading} nfts={data} />;
};

export default CollectionNFts;
