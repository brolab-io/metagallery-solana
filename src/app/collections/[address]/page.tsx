"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

type Props = {
  params: {
    address: string;
  };
};

const CollectionItemPage = ({ params: { address } }: Props) => {
  const router = useRouter();
  useEffect(() => {
    if (router) {
      router.replace(`/collections/${address}/nfts`);
    }
  }, [address, router]);
  return null;
};

export default CollectionItemPage;
