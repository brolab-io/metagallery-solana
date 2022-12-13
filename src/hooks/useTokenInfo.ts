import { MintLayout, RawMint } from "@solana/spl-token";
import { useConnection } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { useCallback, useEffect, useMemo, useState } from "react";

type Result = {
  isLoading: boolean;
  data: RawMint | null;
  error: unknown;
};

const useTokenInfo = (tokenAddress: string) => {
  const { connection } = useConnection();
  const [result, setResult] = useState<Result>({
    isLoading: true,
    data: null,
    error: null,
  });

  const fetchTokenInfo = useCallback(async () => {
    setResult((prev) => ({ ...prev, isLoading: true }));
    try {
      // Get token symbol, name, decimals from token account
      const tokenAccount = await connection.getAccountInfo(new PublicKey(tokenAddress));
      // Deserialize token account
      console.log(tokenAddress);
      const tokenAccountData = MintLayout.decode(tokenAccount!.data);
      console.log(tokenAccountData);

      setResult({ isLoading: false, data: tokenAccountData, error: null });
    } catch (error) {
      console.warn(error);
      setResult((prev) => ({ ...prev, isLoading: false, error }));
    }
  }, [connection, tokenAddress]);

  useEffect(() => {
    fetchTokenInfo();
  }, [fetchTokenInfo]);

  return useMemo(() => ({ ...result, refetch: fetchTokenInfo }), [result, fetchTokenInfo]);
};

export default useTokenInfo;
