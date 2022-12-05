"use client";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import ListCollection from "../../components/Collection/ListCollection";
import BreadCrumb from "../../components/__UI/Breadcrumb";
import Button from "../../components/__UI/Button";
import Container from "../../components/__UI/Container";
import usePromise from "../hooks/usePromise";
import { getAssetsFromAddress } from "../services/nft.service";

const breadCrumbItems = [
  {
    href: "/collections",
    label: "Collections",
  },
];

const CollectionsPage = () => {
  const { connection } = useConnection();
  const { wallet } = useWallet();

  const { data, error, isLoading } = usePromise(
    getAssetsFromAddress(connection, new PublicKey("oziP8qtDFEeoJHPNQW6zJHADdRf5VJMmozmEoXYyG1T")),
    []
  );
  console.log(isLoading, data, error);

  return (
    <>
      <Container className="py-6 sm:py-8 md:py-12 lg:py-16 xl:py-20">
        <div className="flex items-center justify-between mb-[61px]">
          <BreadCrumb items={breadCrumbItems} />
          <Button href="/collections/mint">Create New</Button>
        </div>
        <ListCollection collections={data} />
      </Container>
    </>
  );
};

export default CollectionsPage;
