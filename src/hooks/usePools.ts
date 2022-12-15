import { useConnection } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { useCallback, useEffect, useRef, useState } from "react";
import { getStakingPoolsFromCollection } from "../services/pool.service";

type Result = {
  isLoading: boolean;
  data: Awaited<ReturnType<typeof getStakingPoolsFromCollection>>;
  error: unknown;
};

const usePools = (collectionAddress?: string | null, requireCollection?: boolean) => {
  const { connection } = useConnection();
  const [result, setResult] = useState<Result>({
    isLoading: true,
    data: [],
    error: null,
  });
  const isRequesting = useRef(false);

  const fetchPools = useCallback(async () => {
    if (isRequesting.current || !connection) return;
    if (requireCollection && !collectionAddress) return;
    isRequesting.current = true;
    setResult({ isLoading: true, data: [], error: null });
    try {
      const data = await getStakingPoolsFromCollection(
        connection,
        collectionAddress ? new PublicKey(collectionAddress) : null
      );
      console.log(
        `Fetched pools for collection ${collectionAddress}, requireCollection: ${requireCollection}`,
        data
      );

      setResult({ isLoading: false, data, error: null });
    } catch (error) {
      console.warn(error);
      setResult({ isLoading: false, data: [], error });
    } finally {
      isRequesting.current = false;
    }
  }, [collectionAddress, connection, requireCollection]);

  useEffect(() => {
    if (typeof window !== undefined) {
      fetchPools();
    }
  }, [fetchPools]);

  return result;
};

export default usePools;
