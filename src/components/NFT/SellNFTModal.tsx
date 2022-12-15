import { Transition } from "@headlessui/react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { listNft } from "../../services/marketplace.service";
import { buildTxnUrl } from "../../services/util.service";
import BoxFrame from "../__UI/BoxFrame";
import Button from "../__UI/Button";
import LableInput from "../__UI/LableInput";

type Props = {
  show: boolean;
  setShow: (show: boolean) => void;
  callback?: () => void;
  tokenMintAddress: string;
};

type FormValues = {
  validUntil: string;
  price: string;
  tokenMintAddress: string;
  tradeToken: string;
};

const SellNFTModal = ({ show, setShow, callback, tokenMintAddress }: Props) => {
  const { handleSubmit, register } = useForm<FormValues>({
    defaultValues: {
      tokenMintAddress,
    },
  });
  const { connection } = useConnection();
  const wallet = useWallet();
  const [isListing, setIsListing] = useState(false);
  const router = useRouter();

  const navigateToNftItemPage = useCallback(() => {
    router.push(`/marketplace/${tokenMintAddress}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tokenMintAddress]);

  const onSubmit = handleSubmit(async (values) => {
    setIsListing(true);
    let toastId = toast.info("Listing...", {
      autoClose: false,
      isLoading: true,
    });

    try {
      const tx = await listNft(wallet, values, connection);
      toast.update(toastId, {
        render: (
          <a target="_blank" href={buildTxnUrl(tx)} rel="noreferrer">
            NFT listed successfully, View on Solana Explorer
          </a>
        ),
        type: "success",
        autoClose: 3000,
        isLoading: false,
      });
      navigateToNftItemPage();
    } catch (error) {
      console.warn(error);
      toast.update(toastId, {
        render: "Failed to list NFT: " + (error as Error).message,
        type: "error",
        autoClose: 3000,
        isLoading: false,
      });
    } finally {
      setIsListing(false);
      setShow(false);
      callback?.();
    }
  });

  return (
    <Transition
      show={show}
      enter="transition-opacity duration-300"
      enterFrom="opacity-0"
      enterTo="opacity-100"
      leave="transition-opacity duration-300"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
    >
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
        <form onSubmit={onSubmit} className="bg-[#0C1226]">
          <BoxFrame className="p-8 w-[640px] max-w-[90w]">
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold text-white">List NFT</div>
              <button disabled={isListing} type="button" onClick={() => setShow(false)}>
                <svg
                  className="w-6 h-6 text-white fill-current"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  ></path>
                </svg>
              </button>
            </div>
            <div className="mt-6 space-y-6">
              <LableInput label="Trade Token" {...register("tradeToken")} />
              <LableInput label="Price" {...register("price")} />
              <LableInput label={`Valid Until`} type="date" {...register("validUntil")} />
            </div>
            <div className="mt-6">
              <Button type="submit" isLoading={isListing} className="w-full">
                List
              </Button>
            </div>
          </BoxFrame>
        </form>
      </div>
    </Transition>
  );
};

export default SellNFTModal;
