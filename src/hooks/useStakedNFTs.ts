import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  const isRequesting = useRef(false);

  const fetchStakedNFTs = useCallback(async () => {
    if (!publicKey || isRequesting.current) {
      return;
    }
    isRequesting.current = true;
    setResult((prev) => ({ ...prev, isLoading: true }));
    try {
      const data = await getStakedNftForPool(connection, publicKey, poolId);
      // console.log(`fetchStakedNFTs for ${poolId}`, data);
      setResult({ isLoading: false, data, error: null });
    } catch (error) {
      console.warn(error);
      setResult((prev) => ({ ...prev, isLoading: false, error }));
    }
    isRequesting.current = false;
  }, [publicKey, poolId, connection]);

  useEffect(() => {
    fetchStakedNFTs();
  }, [fetchStakedNFTs]);

  return useMemo(() => ({ ...result, refetch: fetchStakedNFTs }), [result, fetchStakedNFTs]);
};

export default useStakedNFTs;
