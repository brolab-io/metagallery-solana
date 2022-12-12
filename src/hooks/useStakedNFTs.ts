import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { TReadablePool } from "../services/serde/states/pool";
import { getStakedNftForPool } from "../services/staking.service";

type Result = {
  isLoading: boolean;
  data: Awaited<ReturnType<typeof getStakedNftForPool>>;
  error: unknown;
};

const useStakedNFTs = (poolId: string) => {
  const { connection } = useConnection();
  const [result, setResult] = useState<Result>({
    isLoading: false,
    data: [],
    error: null,
  });
  const { publicKey } = useWallet();

  const fetchStakedNFTs = useCallback(async () => {
    if (!publicKey) {
      return;
    }
    setResult((prev) => ({ ...prev, isLoading: true }));
    try {
      const data = await getStakedNftForPool(connection, publicKey, poolId);
      console.log(`fetchStakedNFTs for ${poolId}`, data);
      setResult({ isLoading: false, data, error: null });
    } catch (error) {
      console.warn(error);
      setResult((prev) => ({ ...prev, isLoading: false, error }));
    }
  }, [publicKey, poolId, connection]);

  useEffect(() => {
    fetchStakedNFTs();
  }, [fetchStakedNFTs]);

  return useMemo(() => ({ ...result, refetch: fetchStakedNFTs }), [result, fetchStakedNFTs]);
};

export default useStakedNFTs;
