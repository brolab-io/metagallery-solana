import { useConnection } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { useCallback, useEffect, useRef, useState } from "react";
import { getStakingPoolsFromCollection } from "../services/pool.service";
import { Pool, TReadablePool } from "../services/serde/states/pool";

type Result = {
  isLoading: boolean;
  data: TReadablePool[];
  error: unknown;
};

const usePools = (collectionAddress?: string | null) => {
  const { connection } = useConnection();
  const [result, setResult] = useState<Result>({
    isLoading: false,
    data: [],
    error: null,
  });
  const isRequesting = useRef(false);

  const fetchPools = useCallback(async () => {
    if (isRequesting.current || !connection) return;
    isRequesting.current = true;
    setResult({ isLoading: true, data: [], error: null });
    try {
      const data = await getStakingPoolsFromCollection(
        connection,
        collectionAddress ? new PublicKey(collectionAddress) : null
      );
      const readablePools = data.map(Pool.deserializeToReadable);
      setResult({ isLoading: false, data: readablePools, error: null });
    } catch (error) {
      console.warn(error);
      setResult({ isLoading: false, data: [], error });
    } finally {
      isRequesting.current = false;
    }
  }, [collectionAddress, connection]);

  useEffect(() => {
    fetchPools();
  }, [fetchPools]);

  return result;
};

export default usePools;
