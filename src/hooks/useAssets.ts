import { Metadata } from "@metaplex-foundation/mpl-token-metadata";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { useCallback, useEffect, useState } from "react";
import { getAssetsFromAddress, TokenMetdata } from "../services/nft.service";

type Result = {
  isLoading: boolean;
  data: TokenMetdata[];
  error: unknown;
};

function useAssets(type: "nft", collectionAddress: string): Result;
function useAssets(type: "collection"): Result;

function useAssets(type: "nft" | "collection", collectionAddress?: string) {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [result, setResult] = useState<Result>({
    isLoading: false,
    data: [],
    error: null,
  });

  const fetchAssets = useCallback(async () => {
    if (!wallet?.publicKey) {
      return;
    }
    setResult({ isLoading: true, data: [], error: null });
    try {
      const data = await getAssetsFromAddress(connection, wallet.publicKey);
      if (type === "collection") {
        setResult({
          isLoading: false,
          data: data.filter((asset) => !!asset.collectionDetails),
          error: null,
        });
      }
      if (type === "nft") {
        setResult({
          isLoading: false,
          data: data.filter((asset) => {
            if (!!asset.collectionDetails) {
              return false;
            }
            if (!collectionAddress) {
              return true;
            }
            return asset.collection?.key.toBase58() === collectionAddress;
          }),
          error: null,
        });
      }
    } catch (error) {
      console.warn(error);
      setResult({ isLoading: false, data: [], error });
    }
  }, [collectionAddress, connection, type, wallet.publicKey]);

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  return result;
}

export default useAssets;
