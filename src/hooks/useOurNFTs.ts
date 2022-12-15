import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useCallback, useEffect, useState } from "react";
import { listOurNftsFromAddress, TokenMetdata } from "../services/nft.service";

type Result = {
  isLoading: boolean;
  data: TokenMetdata[];
  error: unknown;
};

function useOurNFTs() {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [result, setResult] = useState<Result>({
    isLoading: true,
    data: [],
    error: null,
  });

  const fetchOurNFTs = useCallback(async () => {
    if (!wallet?.publicKey) {
      return;
    }
    setResult({ isLoading: true, data: [], error: null });
    try {
      const data = await listOurNftsFromAddress(connection, wallet.publicKey);
      setResult({
        isLoading: false,
        data: data,
        error: null,
      });
    } catch (error) {
      console.warn(error);
      setResult({ isLoading: false, data: [], error });
    }
  }, [connection, , wallet.publicKey]);

  useEffect(() => {
    fetchOurNFTs();
  }, [fetchOurNFTs]);

  return result;
}

export default useOurNFTs;
