import { useConnection } from "@solana/wallet-adapter-react";
import { useCallback, useEffect, useState } from "react";
import { getPoolsFromAddress } from "../services/pool.service";

type Result = {
  isLoading: boolean;
  data: any | null;
  error: unknown;
};

const usePools = () => {
  const { connection } = useConnection();
  const [result, setResult] = useState<Result>({
    isLoading: false,
    data: null,
    error: null,
  });

  const fetchPools = useCallback(async () => {
    setResult({ isLoading: true, data: null, error: null });
    try {
      const data = await getPoolsFromAddress(connection);
      // setResult({ isLoading: false, data: data[0], error: null });
    } catch (error) {
      setResult({ isLoading: false, data: null, error });
    }
  }, [connection]);

  useEffect(() => {
    fetchPools();
  }, [fetchPools]);

  return result;
};

export default usePools;
