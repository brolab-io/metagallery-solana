"use client";
import { Metadata } from "@metaplex-foundation/mpl-token-metadata";
import { useConnection } from "@solana/wallet-adapter-react";
/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @next/next/no-img-element */
import Image from "next/image";
import { useCallback, useEffect, useState, useMemo } from "react";
import CollectionItemTabs from "../../../components/Collection/CollectionItemTabs";
import Button from "../../../components/__UI/Button";
import Container from "../../../components/__UI/Container";
import H1 from "../../../components/__UI/H1";
import Loading from "../../../components/__UI/Loading";
import { getMetaData, getNftMetadataFromUri } from "../../../services/nft.service";
import CollectionContext from "./context";

type Props = {
  params: {
    address: string;
  };
};
const CollectionLayout = ({ children, params: { address } }: Props & { children: any }) => {
  const [collection, setCollection] = useState<Metadata | null>(null);
  const [metadata, setMetadata] = useState<Awaited<
    ReturnType<typeof getNftMetadataFromUri>
  > | null>(null);
  const { connection } = useConnection();

  const getCollection = useCallback(async () => {
    const result = await getMetaData(connection, address);
    setCollection(result[0]);
    const metadata = await getNftMetadataFromUri(result[0].data.uri);
    setMetadata(metadata);
  }, [connection, address]);

  useEffect(() => {
    getCollection();
  }, [getCollection]);

  const contextValue = useMemo(
    () => ({
      collection,
      metadata,
    }),
    [collection, metadata]
  );

  if (!collection) {
    return <Loading label="Loading collection..." />;
  }

  return (
    <CollectionContext.Provider value={contextValue}>
      <div className="relative group">
        <div className="min-h-[60vh]">
          {metadata?.image ? (
            <Image
              src={`/api/imageProxy?imageUrl=${metadata?.image}`}
              alt="Gallery"
              className="object-cover w-full"
              quality={100}
              fill
            />
          ) : (
            <div className="w-full h-full"></div>
          )}
        </div>
        <div className="absolute inset-0 flex items-center justify-center group-hover:bg-[#0C1226BF] transition-colors duration-500">
          <Button
            href={`https://app.brolab.io/room/gallery-2?network=${process.env.NEXT_PUBLIC_NETWORK}&collection=${collection.mint}`}
            target="_blank"
          >
            VIEW COLLECTION IN 3D MODE
          </Button>
        </div>
        <div className="absolute -bottom-[140px] inset-x-0 pointer-events-none">
          <Container>
            <div className="flex items-end space-x-7 -mt-[140px]">
              <div className="w-[281px] h-[281px] border-2 border-primary shadow-lg bg-[#22B78F1A] p-5">
                <img src="/assets/images/fake-avatar.jpg" className="w-full h-full" alt="Avatar" />
              </div>
              <div className="flex items-center mb-8 space-x-4">
                <H1>{collection.data.name}</H1>
                <img src="/assets/icons/icon-check.svg" className="h-[26px] w-[26px]" />
              </div>
            </div>
          </Container>
        </div>
      </div>
      <Container className="py-48">
        <CollectionItemTabs owner={collection.updateAuthority} />
        {children}
      </Container>
    </CollectionContext.Provider>
  );
};

export default CollectionLayout;
