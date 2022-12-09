import { useConnection } from "@solana/wallet-adapter-react";
import { useCallback, useEffect, useState } from "react";
import { getStakingPoolById } from "../services/pool.service";
import { TReadablePool } from "../services/serde/states/pool";

type Result = {
  isLoading: boolean;
  data: TReadablePool | null;
  error: unknown;
};

const usePool = (poolId: string) => {
  const { connection } = useConnection();
  const [result, setResult] = useState<Result>({
    isLoading: false,
    data: null,
    error: null,
  });

  const fetchPool = useCallback(async () => {
    setResult({ isLoading: true, data: null, error: null });
    try {
      const data = await getStakingPoolById(connection, poolId);
      setResult({ isLoading: false, data, error: null });
    } catch (error) {
      console.warn(error);
      setResult({ isLoading: false, data: null, error });
    }
  }, [connection, poolId]);

  useEffect(() => {
    fetchPool();
  }, [fetchPool]);

  return result;
};

export default usePool;
