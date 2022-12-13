import { useConnection } from "@solana/wallet-adapter-react";
import { BN } from "bn.js";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getPoolRewards } from "../services/staking.service";

type Result = {
  isLoading: boolean;
  data: Awaited<ReturnType<typeof getPoolRewards>> | null;
  error: unknown;
};

const usePoolRewards = (poolId: string, payrollIndex?: string) => {
  const { connection } = useConnection();
  const [result, setResult] = useState<Result>({
    isLoading: true,
    data: null,
    error: null,
  });

  const fetchPoolRewards = useCallback(async () => {
    setResult((prev) => ({ ...prev, isLoading: true }));
    try {
      const data = await getPoolRewards(connection, {
        poolId,
        payrollIndex: payrollIndex ? new BN(payrollIndex) : undefined,
      });
      setResult({ isLoading: false, data, error: null });
    } catch (error) {
      console.warn(error);
      setResult((prev) => ({ ...prev, isLoading: false, error }));
    }
  }, [connection, payrollIndex, poolId]);

  useEffect(() => {
    fetchPoolRewards();
  }, [fetchPoolRewards]);

  return useMemo(() => ({ ...result, refetch: fetchPoolRewards }), [result, fetchPoolRewards]);
};

export default usePoolRewards;
