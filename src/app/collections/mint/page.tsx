"use client";

import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import BreadCrumb from "../../../components/__UI/Breadcrumb";
import Button from "../../../components/__UI/Button";
import Container from "../../../components/__UI/Container";
import LableInput from "../../../components/__UI/LableInput";
import { checkCollection, mint } from "../../services/nft.service";
import { toast } from "react-toastify";

type CreatorShare = {
  creator: string;
  share: number;
};

type FormValues = {
  name: string;
  symbol: string;
  uri: string;
  sellerFeeBasisPoints: number;
  collection: string;
  size: number;
  files: FileList;
  creators: CreatorShare[];
  isMasterCollection: boolean;
};

const breadCrumbItems = [
  {
    href: "/collections",
    label: "Collections",
  },
  {
    label: "Mint Collection",
  },
];

const MintCollectionPage: React.FC = () => {
  // ### FORM
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit } = useForm<FormValues>({
    defaultValues: {
      collection: "",
      name: "Collection X",
      uri: "https://nftbigrich.s3.amazonaws.com/hoa/test_nft.json",
      symbol: "COLX",
      sellerFeeBasisPoints: 0,
      size: 1,
      isMasterCollection: true,
      creators: [],
    },
  });

  const { connection } = useConnection();
  const provider = useWallet();

  const onSubmit = useCallback(
    async (data: FormValues) => {
      try {
        const isCollection =
          !data.collection || (await checkCollection(connection, data.collection));

        if (!isCollection) {
          toast.error("Collection is not valid");
          return;
        }
        const txid = await mint("collection", provider, [data], connection);
        toast.success("Mint success");
        console.log(txid);
      } catch (error) {
        console.log(error);
        toast.error((error as Error).message);
      }
    },
    [connection, provider]
  );

  return (
    <Container className="py-6 sm:py-8 md:py-12 lg:py-16 xl:py-20">
      <BreadCrumb items={breadCrumbItems} />
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col space-y-6 text-white">
        <LableInput
          label="Name *"
          placeholder="Name of the collection (e.g. My Collection)"
          {...register("name", {
            required: "Name is required",
            maxLength: {
              value: 32,
              message: "Name must be less than 32 characters",
            },
          })}
        />

        <LableInput
          label="Symbol *"
          placeholder="Symbol of the collection (e.g. MYCOL)"
          {...register("symbol", {
            required: "Symbol is required",
            maxLength: {
              value: 10,
              message: "Name must be less than 10 characters",
            },
          })}
        />

        <LableInput
          label="URI *"
          placeholder="URI of the collection"
          {...register("uri", {
            maxLength: {
              value: 200,
              message: "URI must be less than 200 characters",
            },
          })}
        />

        <LableInput
          label="Seller Fee Basis Points *"
          placeholder="Seller Fee Basis Points (from 0 to 100)"
          {...register("sellerFeeBasisPoints", {
            required: "Seller Fee Basis Points is required",
            min: {
              value: 0,
              message: "Seller Fee Basis Points must be greater than 0",
            },
            max: {
              value: 100,
              message: "Seller Fee Basis Points must be less than 100",
            },
            valueAsNumber: true,
          })}
          type="number"
        />

        <LableInput
          label="Collection address *"
          placeholder="Collection address"
          {...register("collection", {})}
        />

        <LableInput
          label="Collection size *"
          placeholder="Collection size, greater than 1"
          {...register("size", {
            required: "Collection size is required",
            min: {
              value: 1,
              message: "Collection size must be greater than 1",
            },
            valueAsNumber: true,
          })}
          type="number"
        />

        <Button className="self-start" type="submit" disabled={isLoading}>
          <span className="ml-2">{isLoading ? "Minting..." : "Mint"}</span>
        </Button>
      </form>
    </Container>
  );
};

export default MintCollectionPage;
