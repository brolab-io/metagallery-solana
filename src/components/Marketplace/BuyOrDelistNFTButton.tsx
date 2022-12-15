"use client";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { toast } from "react-toastify";
import { buyNft, delistNft, getListingsForAddress } from "../../services/marketplace.service";
import { buildTxnUrl } from "../../services/util.service";
import Button from "../__UI/Button";
import ConnectSolanaButton from "../__UI/SolanaConnectButton";

type Props = {
  nft: Awaited<ReturnType<typeof getListingsForAddress>>[number];
  className?: string;
};
const BuyOrDelistNFTButton: React.FC<Props> = ({ nft, className }) => {
  const wallet = useWallet();
  const { connection } = useConnection();
  const router = useRouter();

  const navigateToNftItemPage = useCallback(() => {
    router.push(`/nfts/${nft.mint}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nft.mint]);

  const handleDelist = useCallback(async () => {
    let toastId = toast.info("Buying NFT...", {
      autoClose: false,
    });
    try {
      const tx = await delistNft(
        wallet,
        {
          tokenMintAddress: nft.mint,
        },
        connection
      );

      toast.update(toastId, {
        render: (
          <a target="_blank" href={buildTxnUrl(tx)} rel="noreferrer">
            NFT delisted successfully, View on Solana Explorer
          </a>
        ),
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });
      navigateToNftItemPage();
    } catch (e) {
      console.error(e);
      toast.update(toastId, {
        render: "Error delist NFT: " + (e as Error).message,
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
    }
  }, [connection, navigateToNftItemPage, nft.mint, wallet]);

  const handleBuy = useCallback(async () => {
    let toastId = toast.info("Buying NFT...", {
      autoClose: false,
    });
    try {
      const tx = await buyNft(
        wallet,
        {
          tokenMintAddress: nft.mint,
          priceIndex: 1,
        },
        connection
      );

      toast.update(toastId, {
        render: (
          <a target="_blank" href={buildTxnUrl(tx)} rel="noreferrer">
            NFT bought successfully, View on Solana Explorer
          </a>
        ),
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });

      navigateToNftItemPage;
    } catch (e) {
      console.error(e);
      toast.update(toastId, {
        render: "Error buying NFT: " + (e as Error).message,
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
    }
  }, [connection, navigateToNftItemPage, nft.mint, wallet]);

  if (!wallet.publicKey) {
    return (
      <div className="flex justify-center w-full mt-10">
        <ConnectSolanaButton />
      </div>
    );
  }

  // Check is NFT owner
  if (nft.sale.seller === wallet.publicKey.toBase58()) {
    return (
      <Button onClick={handleDelist} className={className}>
        Delist NFT
      </Button>
    );
  }

  return (
    <Button onClick={handleBuy} className={className}>
      Buy NFT
    </Button>
  );
};

export default BuyOrDelistNFTButton;
