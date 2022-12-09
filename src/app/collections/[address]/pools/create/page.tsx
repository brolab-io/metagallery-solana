"use client";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useState, useRef, useCallback } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import BreadCrumb from "../../../../../components/__UI/Breadcrumb";
import Button from "../../../../../components/__UI/Button";
import Container from "../../../../../components/__UI/Container";
import LableInput from "../../../../../components/__UI/LableInput";
import { createStakingPool } from "../../../../../services/pool.service";
import { useCollectionContext } from "../../context";

type FormValues = {
  id: string;
  name: string;
  rewardPeriod: number;
  collection: string;
  poolType: 1;
};

type Props = {
  params: {
    address: string;
  };
};

const breadCrumbItems = [
  {
    label: "Create A Pool",
  },
];

const CreatePoolPage: React.FC<Props> = ({ params: { address } }) => {
  const { register, handleSubmit, watch } = useForm<FormValues>({
    defaultValues: {
      id: "",
      name: "",
      rewardPeriod: 60,
      collection: address,
      poolType: 1,
    },
  });
  const [isLoading, setIsLoading] = useState(false);
  const { connection } = useConnection();
  const { collection, metadata } = useCollectionContext();
  const provider = useWallet();

  const onSubmit = useCallback(
    async (data: FormValues) => {
      setIsLoading(true);

      if (!provider.publicKey) {
        toast.error("Please firstly connect your wallet");
        return;
      }

      let toastId: ReturnType<typeof toast.info> | null = null;

      try {
        const collectionName = metadata?.name || collection?.data.name;
        toastId = toast.info(
          collectionName ? `Creating a pool for ${collectionName}...` : "Creating pool...",
          {
            autoClose: false,
          }
        );

        const txid = await createStakingPool(provider, data, connection);

        toast.update(toastId, {
          render: (
            <a
              target="_blank"
              href={`https://explorer.solana.com/tx/${txid}?cluster=devnet`}
              rel="noreferrer"
            >
              Pool created successfully, View on Solana Explorer
            </a>
          ),
          type: "success",
          isLoading: false,
          autoClose: 3000,
        });
      } catch (error) {
        console.warn(error);
        if (toastId) {
          toast.update(toastId, {
            render: (error as Error).message,
            type: "error",
            isLoading: false,
            autoClose: 3000,
          });
        } else {
          toast.error((error as Error).message);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [collection?.data.name, connection, metadata?.name, provider]
  );

  return (
    <Container className="pb-6 sm:pb-8 md:pb-12 lg:pb-16 xl:pb-20">
      <BreadCrumb items={breadCrumbItems} />

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col mt-8 space-y-6 text-white md:mt-12 lg:mt-16 xl:mt-20"
      >
        <LableInput
          label="Pool indentifier *"
          placeholder="Unique identifier for the pool (e.g. cool-pool-1)"
          {...register("id", {
            required: "Id is required",
            maxLength: {
              value: 16,
              message: "Id must be less than 16 characters",
            },
          })}
        />

        <LableInput
          label="Name *"
          placeholder="Name of the Pool (e.g. My Pool)"
          {...register("name", {
            required: "Name is required",
            maxLength: {
              value: 16,
              message: "Name must be less than 16 characters",
            },
          })}
        />

        <LableInput
          label="Reward Period *"
          placeholder="Seller Fee Basis Points (from 0 to 100)"
          {...register("rewardPeriod", {
            required: "Seller Fee Basis Points is required",
            min: {
              value: 0,
              message: "Seller Fee Basis Points must be greater than 0",
            },
            valueAsNumber: true,
          })}
          type="number"
        />

        <Button className="self-start" type="submit" disabled={isLoading}>
          <span className="ml-2">{isLoading ? "Creating..." : "Create New"}</span>
        </Button>
      </form>
    </Container>
  );
};

export default CreatePoolPage;
