"use client";

import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useState, useCallback, useRef } from "react";
import { useForm } from "react-hook-form";
import BreadCrumb from "../../../components/__UI/Breadcrumb";
import Button from "../../../components/__UI/Button";
import Container from "../../../components/__UI/Container";
import LableInput from "../../../components/__UI/LableInput";
import { checkCollection, mint } from "../../../services/nft.service";
import { toast } from "react-toastify";
import BoxFrame from "../../../components/__UI/BoxFrame";
import { uploadMetadata, uploadMetadataUsingMetaplex } from "../../../services/ipfs/upload";
import { buildMetadata } from "../../../services/util.service";
import CreatorShare from "../../../components/__UI/CreatorShare";

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
  const [creators, setCreators] = useState<CreatorShare[]>([]);

  // ### FORM
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      collection: "",
      name: "",
      uri: "",
      symbol: "",
      sellerFeeBasisPoints: 0,
      size: 1,
      isMasterCollection: true,
      creators: [],
    },
  });

  const { connection } = useConnection();
  const provider = useWallet();
  const fileInputRef = useRef<HTMLInputElement>();

  const selectFile = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const checkCreatorShare = (creators: CreatorShare[]): boolean => {
    return !creators || !creators.length || creators.reduce((s, i) => s + i.share, 0) === 100;
  };

  const onSubmit = useCallback(
    async (data: FormValues) => {
      setIsLoading(true);

      if (!provider.publicKey) {
        toast.error("Please firstly connect your wallet");
        return;
      }

      let toastId: ReturnType<typeof toast.info> | null = null;

      try {
        const isCollection =
          !data.collection || (await checkCollection(connection, data.collection));

        if (!isCollection) {
          toast.error("Collection is not valid");
          return;
        }

        const checkShare: boolean = checkCreatorShare(creators);
        if (!checkShare) {
          throw new Error(`Creators, if set, must have 100 shares in total`);
        }

        if (!data.files.length) {
          toast.error("Please select a file to upload");
          return;
        }

        toastId = toast.info("Uploading metadata, please wait...", {
          autoClose: false,
          isLoading: true,
        });

        const metadata = buildMetadata({
          name: data.name,
          symbol: data.symbol,
          fileType: data.files[0].type,
          description: `Collection of Metagallery`,
          seller_fee_basis_points: data.sellerFeeBasisPoints,
          creators,
        });

        data.uri = await uploadMetadataUsingMetaplex(connection, provider, data.files, metadata);

        toast.update(toastId, {
          render: "Minting collection, please wait...",
        });

        const txid = await mint("collection", provider, [data], connection);
        toast.update(toastId, {
          render: (
            <a
              target="_blank"
              href={`https://explorer.solana.com/tx/${txid}?cluster=devnet`}
              rel="noreferrer"
            >
              Collection minted successfully, View on Solana Explorer
            </a>
          ),
          type: "success",
          isLoading: false,
          autoClose: 3000,
        });
        console.log(txid);
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
    [connection, provider, creators]
  );

  const { ref: fileRef, ...fields } = register("files");

  const files = watch("files");

  return (
    <Container className="py-6 sm:py-8 md:py-12 lg:py-16 xl:py-20">
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
            <Button type="button" onClick={selectFile}>
              Upload File
            </Button>
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
          placeholder="Name of the collection (e.g. My Collection)"
          {...register("name", {
            required: "Name is required",
            maxLength: {
              value: 32,
              message: "Name must be less than 32 characters",
            },
          })}
          error={errors.name?.message}
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
          error={errors.symbol?.message}
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
          error={errors.sellerFeeBasisPoints?.message}
        />

        <LableInput
          label="Collection address"
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
          error={errors.size?.message}
        />

        <CreatorShare creators={creators} setCreators={setCreators} />

        <Button className="self-start" type="submit" disabled={isLoading}>
          <span className="ml-2">{isLoading ? "Minting..." : "Mint"}</span>
        </Button>
      </form>
    </Container>
  );
};

export default MintCollectionPage;
