"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Button from "../__UI/Button";

type Props = {
  owner?: PublicKey | string | null;
};

const CollectionItemTabs = ({ owner }: Props) => {
  const { publicKey } = useWallet();
  const isOwner = publicKey?.toBase58() === owner?.toString();
  const pathname = usePathname();
  const segments = pathname?.split("/") || [];
  const lastSegment = segments[segments.length - 1];
  const linkWithouLastSegment = segments.slice(1, segments.length - 1).join("/");

  return (
    <div className="flex items-center justify-between">
      <div className="flex space-x-8">
        <Link href={`/${linkWithouLastSegment}/nfts`}>
          <div
            className={clsx(
              "text-[24px] lg:text-[32px] font-bold text-white py-3",
              lastSegment === "nfts" && "text-primary border-b-4 border-[#17EF97]"
            )}
          >
            NFTs
          </div>
        </Link>
        <Link href={`/${linkWithouLastSegment}/pools`}>
          <div
            className={clsx(
              "text-[24px] lg:text-[32px] font-bold text-white py-3 mb-12",
              lastSegment === "pools" && "text-primary border-b-4 border-[#17EF97]"
            )}
          >
            Pools
          </div>
        </Link>
      </div>
      {isOwner && (
        <div className="mb-12">
          <Button href={`/${linkWithouLastSegment}/mint`}>Mint NFT</Button>
        </div>
      )}
    </div>
  );
};

export default CollectionItemTabs;
