"use client";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useRouter } from "next/navigation";
import { useCallback, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import BoxFrame from "../../../../components/__UI/BoxFrame";
import BreadCrumb from "../../../../components/__UI/Breadcrumb";
import Button from "../../../../components/__UI/Button";
import Container from "../../../../components/__UI/Container";
import CreatorShare from "../../../../components/__UI/CreatorShare";
import LableInput from "../../../../components/__UI/LableInput";
import { uploadMetadata } from "../../../../services/ipfs/upload";
import { mint } from "../../../../services/nft.service";
import { buildMetadata } from "../../../../services/util.service";
import { useCollectionContext } from "../context";

type CreatorShare = {
  creator: string;
  share: number;
};

type FormValues = {
  name: string;
  symbol: string;
  uri: string;
  collection: string;
  sellerFeeBasisPoints: number;
  creators: CreatorShare[];
  isMasterEdition: boolean;
  maxSupply: number;
  tokenPower: number;
  files: FileList;
};

const breadCrumbItems = [
  {
    label: "Create An Nft",
  },
];

type Props = {
  params: {
    address: string;
  };
};

const MintNftPage = ({ params: { address } }: Props) => {
  const [creators, setCreators] = useState<CreatorShare[]>([]);
  const { register, handleSubmit, watch } = useForm<FormValues>({
    defaultValues: {
      uri: "https://nftbigrich.s3.amazonaws.com/hoa/test_nft.json",
      sellerFeeBasisPoints: 0,
      creators: [],
      isMasterEdition: true,
      maxSupply: 1,
      tokenPower: 1,
      collection: address,
    },
  });
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>();
  const { connection } = useConnection();
  const { collection, metadata } = useCollectionContext();
  const provider = useWallet();

  const checkCreatorShare = (creators: CreatorShare[]): boolean => {
    return !creators || !creators.length || creators.reduce((s, i) => s + i.share, 0) === 100;
  };

  const selectFile = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const onSubmit = useCallback(
    async (data: FormValues) => {
      setIsLoading(true);

      if (!provider.publicKey) {
        toast.error("Please firstly connect your wallet");
        return;
      }

      let toastId: ReturnType<typeof toast.info> | null = null;

      try {
        const checkShare: boolean = checkCreatorShare(creators);
        if (!checkShare) {
          throw new Error(`Creators, if set, must have 100 shares in total`);
        }

        const collectionName = metadata?.name || collection?.data.name;
        toastId = toast.info(
          collectionName
            ? `Minting ${collectionName} NFT, please wait...`
            : "Minting NFT, please wait...",
          {
            autoClose: false,
          }
        );

        const _metadata = buildMetadata({
          name: data.name,
          symbol: data.symbol,
          fileType: data.files[0].type,
          description: `NFT for BigRich`,
          seller_fee_basis_points: data.sellerFeeBasisPoints,
          creators: data.creators,
        });

        const url = await uploadMetadata(data.files[0], _metadata);
        data.uri = url;

        const txid = await mint("masteredition", provider, [data], connection);

        toast.update(toastId, {
          render: (
            <a
              target="_blank"
              href={`https://explorer.solana.com/tx/${txid}?cluster=devnet`}
              rel="noreferrer"
            >
              NFT minted successfully, View on Solana Explorer
            </a>
          ),
          type: "success",
          isLoading: false,
          autoClose: 3000,
        });
        // router.push(`/nfts/${address}`);
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
    [collection?.data.name, connection, creators, metadata?.name, provider]
  );

  const { ref: fileRef, ...fields } = register("files");

  const files = watch("files");

  return (
    <Container className="pb-6 sm:pb-8 md:pb-12 lg:pb-16 xl:pb-20">
      <BreadCrumb items={breadCrumbItems} />

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col space-y-6 text-white">
        <b className="text-[24px] mt-[29px] lg:mt-[58px]">Import Image, Video or Audio *</b>
        <span className="text-[24px] font-light">
          File types supported: JPG, PNG, GIF, SVG, MP3, WAV, MP4. Max size: 50 MB
        </span>
        <BoxFrame className="flex justify-center py-[164px] relative overflow-hidden">
          {files && files.length > 0 && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              alt="SelectedFile"
              src={URL.createObjectURL(files[0])}
              className="absolute inset-y-0 object-contain -translate-x-1/2 left-1/2"
            />
          )}
          <div className="absolute -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2">
            <Button onClick={selectFile}>Upload File</Button>
          </div>
        </BoxFrame>
        <input
          type="file"
          ref={(ref) => {
            fileRef(ref);
            fileInputRef.current = ref || undefined;
          }}
          {...fields}
          accept="image/*,video/*,audio/*"
          className="hidden"
        />

        <LableInput
          label="Name *"
          placeholder="Name of the nft (e.g. My NFT)"
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
          placeholder="Symbol of the nft (e.g. NFT)"
          {...register("symbol", {
            required: "Symbol is required",
            maxLength: {
              value: 10,
              message: "Name must be less than 10 characters",
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
          label="Max Supply *"
          type="number"
          placeholder="Input total supply"
          {...register("maxSupply", {
            min: {
              value: 0,
              message: "Total supply must be equal or greater than 0",
            },
            max: {
              value: 1000000,
              message: "Total supply must be equal or less than 1000000",
            },
            valueAsNumber: true,
          })}
        />

        <LableInput
          label="Token Power"
          type="number"
          placeholder="Input token power"
          {...register("tokenPower", {
            min: {
              value: 0,
              message: "Token power must be equal or greater than 0",
            },
            max: {
              value: 1000000,
              message: "Token power must be equal or less than 1000000",
            },
            valueAsNumber: true,
          })}
        />

        <CreatorShare creators={creators} setCreators={setCreators} />

        <Button className="self-start" type="submit" disabled={isLoading}>
          <span className="ml-2">{isLoading ? "Creating..." : "Create New"}</span>
        </Button>
      </form>
    </Container>
  );
};

export default MintNftPage;
