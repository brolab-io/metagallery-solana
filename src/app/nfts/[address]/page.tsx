"use client";
import { Metadata } from "@metaplex-foundation/mpl-token-metadata";
import { useConnection } from "@solana/wallet-adapter-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import SellNFTButton from "../../../components/NFT/SellNFTButton";
import SellNFTModal from "../../../components/NFT/SellNFTModal";
import BoxFrame from "../../../components/__UI/BoxFrame";
import Container from "../../../components/__UI/Container";
import H1 from "../../../components/__UI/H1";
import Loading from "../../../components/__UI/Loading";
import { getMetaData, getNftMetadataFromUri, TokenMetdata } from "../../../services/nft.service";

type Props = {
  params: {
    address: string;
  };
};

const NftItemPage = ({ params: { address } }: Props) => {
  const [isShowSellModal, setIsShowSellModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [nft, setNft] = useState<TokenMetdata | null>(null);
  const [metadata, setMetadata] = useState<Awaited<
    ReturnType<typeof getNftMetadataFromUri>
  > | null>(null);
  const { connection } = useConnection();

  const getCollection = useCallback(async () => {
    const result = await getMetaData(connection, address);
    setNft(result[0]);
    console.log(result[0]);
    const metadata = await getNftMetadataFromUri(result[0].data.uri);
    setMetadata(metadata);
    setIsLoading(false);
  }, [connection, address]);

  const showSellModal = useCallback(() => {
    setIsShowSellModal(true);
  }, []);

  useEffect(() => {
    getCollection();
  }, [getCollection]);

  const SC_ADDRESS = process.env.NEXT_PUBLIC_SC_ADDRESS!;

  if (isLoading) {
    return <Loading label="Loading nft..." />;
  }

  if (!nft) {
    return null;
  }

  return (
    <>
      <SellNFTModal
        setShow={setIsShowSellModal}
        show={isShowSellModal}
        tokenMintAddress={nft.mint.toBase58()}
      />
      <Container className="grid gap-20 py-20 lg:grid-cols-3">
        <BoxFrame>
          <div className="py-[52px] px-[39px] space-y-[34px]">
            {metadata?.image ? (
              <Image
                src={`/api/imageProxy?imageUrl=${metadata?.image}`}
                alt="Gallery"
                loading="lazy"
                width={384}
                height={384}
                className="object-cover w-full aspect-square"
                quality={100}
              />
            ) : (
              <div className="w-full aspect-square"></div>
            )}
            <div>
              <H1>{metadata?.name || nft.data.name}</H1>
              <div className="flex items-center justify-between mt-3">
                <span className="text-[24px] text-[#6B7280] font-bold">Power</span>
                <span className="font-bold text-[32px] text-white">
                  {" "}
                  {nft.tokenData?.power.toNumber() || 1}
                </span>
              </div>
              <SellNFTButton onClick={showSellModal} className="w-full mt-10" nft={nft} />
            </div>
          </div>
        </BoxFrame>
        <div className="lg:col-span-2">
          <H1>On-chain DATa</H1>
          <BoxFrame className="p-16 mt-4">
            <div className="flex items-center justify-between mt-3">
              <span className="text-[24px] text-[#6B7280] font-bold">Creator</span>
              <Link
                href={`${process.env.NEXT_PUBLIC_BLOCK_EXPLORER_ADDRESS}/${nft.updateAuthority}`}
                target="_blank"
              >
                <span className="font-bold text-[32px] text-white hover:text-primary transition-colors">
                  {nft.updateAuthority.toString().slice(0, 6)}...
                  {nft.updateAuthority.toString().slice(-4)}
                </span>
              </Link>
            </div>

            <div className="flex items-center justify-between mt-3">
              <span className="text-[24px] text-[#6B7280] font-bold">Owner</span>{" "}
              <Link
                href={`${process.env.NEXT_PUBLIC_BLOCK_EXPLORER_ADDRESS}/${nft.updateAuthority}`}
                target="_blank"
              >
                <span className="font-bold text-[32px] text-white hover:text-primary transition-colors">
                  {nft.updateAuthority.toString().slice(0, 6)}...
                  {nft.updateAuthority.toString().slice(-4)}
                </span>
              </Link>
            </div>

            <div className="flex items-center justify-between mt-3">
              <span className="text-[24px] text-[#6B7280] font-bold">Contract Address</span>
              <Link
                href={`${process.env.NEXT_PUBLIC_BLOCK_EXPLORER_ADDRESS}/${SC_ADDRESS}`}
                target="_blank"
              >
                <span className="font-bold text-[32px] text-white hover:text-primary transition-colors">
                  {SC_ADDRESS.slice(0, 6)}...{SC_ADDRESS.slice(-4)}
                </span>
              </Link>
            </div>
            <div className="flex items-center justify-between mt-3">
              <span className="text-[24px] text-[#6B7280] font-bold">Token ID</span>
              <span className="font-bold text-[32px] text-white">
                {nft.mint.toString().slice(0, 6)}...{nft.mint.toString().slice(-4)}
              </span>
            </div>
            <div className="flex items-center justify-between mt-3">
              <span className="text-[24px] text-[#6B7280] font-bold">Power</span>
              <span className="font-bold text-[32px] text-white">
                {nft.tokenData?.power.toNumber() || 1}
              </span>
            </div>
            <div className="flex items-center justify-between mt-3">
              <span className="text-[24px] text-[#6B7280] font-bold">Asset Protocol</span>
              <span className="font-bold text-[32px] text-white">Solana-powered Protocol</span>
            </div>
            <div className="flex items-center justify-between mt-3">
              <span className="text-[24px] text-[#6B7280] font-bold">Asset Public chain</span>
              <span className="font-bold text-[32px] text-white">SOLANA</span>
            </div>
          </BoxFrame>
          <H1 className="mt-9">Market rules</H1>
          <BoxFrame className="p-16 mt-4 text-[#6B7280] text-[24px]">
            <p>1.NFT can be purchased in the NFT market;</p>
            <p>
              2.After NFT is listed in the trading market, operations such as transfer, auction, and
              stake mining are not allowed;
            </p>
            <p>
              3.The market will charge 3% of the seller’s revenue as a service fee, of which 50% is
              burned, 40% enters the NFT Pool, and 10% is the developer’s revenue;
            </p>
          </BoxFrame>
        </div>
      </Container>
    </>
  );
};

export default NftItemPage;
