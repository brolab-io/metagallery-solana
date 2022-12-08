"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Button from "../__UI/Button";

type Props = {
  owner?: PublicKey | string | null;
  address: string;
};

const CollectionItemTabs = ({ owner, address }: Props) => {
  const { publicKey } = useWallet();
  const isOwner = publicKey?.toBase58() === owner?.toString();
  const pathname = usePathname();
  const collectionPath = `/collections/${address}`;

  return (
    <div className="flex items-center justify-between">
      <div className="flex space-x-8">
        <Link href={`${collectionPath}/nfts`}>
          <div
            className={clsx(
              "text-[24px] lg:text-[32px] font-bold text-white py-3",
              pathname?.includes("nfts") && "text-primary border-b-4 border-[#17EF97]"
            )}
          >
            NFTs
          </div>
        </Link>
        <Link href={`${collectionPath}/pools`}>
          <div
            className={clsx(
              "text-[24px] lg:text-[32px] font-bold text-white py-3 mb-12",
              pathname?.includes("pools") && "text-primary border-b-4 border-[#17EF97]"
            )}
          >
            Pools
          </div>
        </Link>
      </div>
      {isOwner && (
        <div className="flex space-x-4">
          <div className="mb-12">
            <Button href={`${collectionPath}/mint`}>Mint NFT</Button>
          </div>
          <div className="mb-12">
            <Button href={`${collectionPath}/pools/create`}>Create Pool</Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CollectionItemTabs;
