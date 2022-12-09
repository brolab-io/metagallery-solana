import { Transition } from "@headlessui/react";
import { useCallback } from "react";
import useAssets from "../../hooks/useAssets";
import ListNFT from "../NFT/ListNFT";
import BoxFrame from "../__UI/BoxFrame";

type Props = {
  show: boolean;
  setShow: (show: boolean) => void;
  poolId: string;
  collectionAddress: string;
  callback?: () => void;
};

const StakeNftModal = ({ show, setShow, callback, collectionAddress }: Props) => {
  const { data: nfts, isLoading } = useAssets("nft", collectionAddress);

  const onNFTClick = useCallback(() => {}, []);

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
        <div className="bg-[#0C1226] w-full max-w-[90vw]">
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
            <ListNFT nfts={nfts} isLoading={isLoading} />
          </BoxFrame>
        </div>
      </div>
    </Transition>
  );
};

export default StakeNftModal;
