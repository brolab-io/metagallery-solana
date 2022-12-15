import { Metadata } from "@metaplex-foundation/mpl-token-metadata";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useCallback, useEffect, useState } from "react";
import { listOurCollections } from "../services/nft.service";

type Result = {
  isLoading: boolean;
  data: Metadata[];
  error: unknown;
};

function useOurCollections() {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [result, setResult] = useState<Result>({
    isLoading: true,
    data: [],
    error: null,
  });

  const fetchOurCollections = useCallback(async () => {
    setResult({ isLoading: true, data: [], error: null });
    try {
      const data = await listOurCollections(connection);
      setResult({
        isLoading: false,
        data: data,
        error: null,
      });
    } catch (error) {
      console.warn(error);
      setResult({ isLoading: false, data: [], error });
    }
  }, [connection]);

  useEffect(() => {
    fetchOurCollections();
  }, [fetchOurCollections]);

  return result;
}

export default useOurCollections;
