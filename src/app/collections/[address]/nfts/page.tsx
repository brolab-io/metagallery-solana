"use client";
import { Metadata } from "@metaplex-foundation/mpl-token-metadata";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { useCallback, useEffect, useState } from "react";
import ListNFT from "../../../../components/NFT/ListNFT";
import { getAssetsFromAddress } from "../../../../services/nft.service";

type Props = {
  params: {
    address: string;
  };
};

const CollectionNFts = ({ params: { address } }: Props) => {
  const { connection } = useConnection();
  const { publicKey } = useWallet();

  const [isLoading, setIsLoading] = useState(true);
  const [assets, setAssets] = useState<Metadata[]>([]);

  const getNFTs = useCallback(async () => {
    if (publicKey) {
      const assets = await getAssetsFromAddress(connection, new PublicKey(publicKey.toBase58()));
      setAssets(assets);
      setIsLoading(false);
    }
  }, [connection, publicKey]);

  useEffect(() => {
    getNFTs();
  }, [getNFTs]);
  return <ListNFT isLoading={isLoading} nfts={assets} />;
};

export default CollectionNFts;
