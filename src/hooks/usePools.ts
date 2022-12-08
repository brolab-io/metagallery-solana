import { useConnection } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { useCallback, useEffect, useState } from "react";
import { getStakingPoolsFromCollection } from "../services/pool.service";
import { Pool, TReadablePool } from "../services/serde/states/pool";

type Result = {
  isLoading: boolean;
  data: TReadablePool[];
  error: unknown;
};

const usePools = (collectionAddress: string) => {
  const { connection } = useConnection();
  const [result, setResult] = useState<Result>({
    isLoading: false,
    data: [],
    error: null,
  });

  const fetchPools = useCallback(async () => {
    setResult({ isLoading: true, data: [], error: null });
    try {
      const data = await getStakingPoolsFromCollection(
        connection,
        undefined,
        new PublicKey(collectionAddress)
      );
      const readablePools = data.map(Pool.deserializeToReadable);
      setResult({ isLoading: false, data: readablePools, error: null });
    } catch (error) {
      console.warn(error);
      setResult({ isLoading: false, data: [], error });
    }
  }, [collectionAddress, connection]);

  useEffect(() => {
    fetchPools();
  }, [fetchPools]);

  return result;
};

export default usePools;
