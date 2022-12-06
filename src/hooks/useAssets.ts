import { Metadata } from "@metaplex-foundation/mpl-token-metadata";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useCallback, useEffect, useState } from "react";
import { getAssetsFromAddress } from "../services/nft.service";

type Result = {
  isLoading: boolean;
  data: Metadata[];
  error: unknown;
};

const useAssets = (type: "collection" | "nft") => {
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
          data: data.filter((asset) => !asset.collectionDetails),
          error: null,
        });
      }
    } catch (error) {
      console.warn(error);
      setResult({ isLoading: false, data: [], error });
    }
  }, [connection, type, wallet.publicKey]);

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  return result;
};

export default useAssets;
