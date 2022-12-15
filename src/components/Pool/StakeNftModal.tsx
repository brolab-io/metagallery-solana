import { Transition } from "@headlessui/react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { ComponentProps, useCallback, useState } from "react";
import { toast } from "react-toastify";
import useAssets from "../../hooks/useAssets";
import { stakeNft, TokenMetdata } from "../../services/nft.service";
import ListNFT from "../NFT/ListNFT";
import BoxFrame from "../__UI/BoxFrame";
import LoadingOverlay from "../__UI/LoadingOverlay";

type Props = {
  show: boolean;
  setShow: (show: boolean) => void;
  collection: string;
  callback?: () => void;
  poolId: string;
};

const StakeNftModal = ({ show, setShow, callback, collection, poolId }: Props) => {
  const { data: nfts, isLoading } = useAssets("nft", collection);
  const [isStaking, setIsStaking] = useState(false);
  const wallet = useWallet();
  const { connection } = useConnection();

  const onNFTClick: NonNullable<ComponentProps<typeof ListNFT>["onItemClicked"]> = useCallback(
    async (item) => {
      // setShow(false);
      // callback?.();
      let toastId: ReturnType<typeof toast> | null = null;
      try {
        toastId = toast.info("Staking NFT...", {
          autoClose: false,
          isLoading: true,
        });
        setIsStaking(true);
        const txid = await stakeNft(
          wallet,
          {
            stakingTokenMintAddress: item.mint,
            poolId,
          },
          connection
        );
        toast.update(toastId, {
          render: (
            <a
              target="_blank"
              href={`https://explorer.solana.com/tx/${txid}?cluster=devnet`}
              rel="noreferrer"
            >
              NFT staked successfully, View on Solana Explorer
            </a>
          ),
          type: "success",
          isLoading: false,
          autoClose: 3000,
        });
        setShow(false);
        callback?.();
      } catch (error) {
        console.warn(error);
        if (toastId) {
          toast.update(toastId, {
            type: "error",
            render: "Staking NFT failed!",
            autoClose: 3000,
            isLoading: false,
          });
        }
      } finally {
        setIsStaking(false);
      }
    },
    [callback, connection, poolId, setShow, wallet]
  );

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
        <div className="bg-[#0C1226] w-full max-w-[90vw] relative">
          <BoxFrame className="p-8">
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-white">My NFTs (Select one to stake)</div>
              <button type="button" onClick={() => setShow(false)}>
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
            <ListNFT onItemClicked={onNFTClick} nfts={nfts} isLoading={isLoading} />
          </BoxFrame>
          <LoadingOverlay isLoading={isStaking} label="Staking NFT..." />
        </div>
      </div>
    </Transition>
  );
};

export default StakeNftModal;
