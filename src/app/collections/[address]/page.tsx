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
  // useEffect(() => {
  //   console.log("CollectionItemPage", router);
  //   if (router) {
  //     router.replace(`/collections/${collectionId}/nfts`);
  //   }
  // }, [collectionId, router]);
  return null;
};

export default CollectionItemPage;
