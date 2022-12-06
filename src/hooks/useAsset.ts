import { Metadata } from "@metaplex-foundation/mpl-token-metadata";
import { useConnection } from "@solana/wallet-adapter-react";
import { useCallback, useEffect, useState } from "react";
import { getMetaData } from "../services/nft.service";

type Result = {
  isLoading: boolean;
  data: Metadata | null;
  error: unknown;
};

const useAsset = (tokenAddress: string) => {
  const { connection } = useConnection();
  const [result, setResult] = useState<Result>({
    isLoading: false,
    data: null,
    error: null,
  });

  const fetchAssets = useCallback(async () => {
    setResult({ isLoading: true, data: null, error: null });
    try {
      const data = await getMetaData(connection, tokenAddress);
      setResult({ isLoading: false, data: data[0], error: null });
    } catch (error) {
      setResult({ isLoading: false, data: null, error });
    }
  }, [connection, tokenAddress]);

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  return result;
};

export default useAsset;
