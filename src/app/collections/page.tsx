"use client";
import { Metadata } from "@metaplex-foundation/mpl-token-metadata";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { useCallback, useEffect, useState } from "react";
import ListCollection from "../../components/Collection/ListCollection";
import BreadCrumb from "../../components/__UI/Breadcrumb";
import Button from "../../components/__UI/Button";
import Container from "../../components/__UI/Container";
import { getAssetsFromAddress } from "../../services/nft.service";

const breadCrumbItems = [
  {
    href: "/collections",
    label: "Collections",
  },
];

const CollectionsPage = () => {
  const { connection } = useConnection();
  const { publicKey } = useWallet();

  const [isLoading, setIsLoading] = useState(true);
  const [assets, setAssets] = useState<Metadata[]>([]);

  const getCollections = useCallback(async () => {
    if (publicKey) {
      const assets = await getAssetsFromAddress(connection, new PublicKey(publicKey.toBase58()));
      setAssets(assets.filter((asset) => "collectionDetails" in asset && asset.collectionDetails));
      setIsLoading(false);
    }
  }, [connection, publicKey]);

  useEffect(() => {
    getCollections();
  }, [getCollections]);

  return (
    <>
      <Container className="py-6 sm:py-8 md:py-12 lg:py-16 xl:py-20">
        <div className="flex items-center justify-between mb-[61px]">
          <BreadCrumb items={breadCrumbItems} />
          <Button href="/collections/mint">Create New</Button>
        </div>
        <ListCollection isLoading={isLoading} collections={assets} />
      </Container>
    </>
  );
};

export default CollectionsPage;
