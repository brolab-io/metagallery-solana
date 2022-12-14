import { useConnection } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { useCallback, useEffect, useRef, useState } from "react";
import { getListingsForAddress } from "../services/marketplace.service";

type Result = {
  isLoading: boolean;
  data: Awaited<ReturnType<typeof getListingsForAddress>> | null;
  error: unknown;
};

const useMarketplaceItems = (walletAddress?: string) => {
  const { connection } = useConnection();
  const [result, setResult] = useState<Result>({
    isLoading: false,
    data: null,
    error: null,
  });
  const isRequesting = useRef(false);

  const fetchMarketplaceItems = useCallback(async () => {
    if (isRequesting.current || !connection) return;
    isRequesting.current = true;
    setResult({ isLoading: true, data: null, error: null });
    try {
      const data = await getListingsForAddress(
        connection,
        walletAddress ? new PublicKey(walletAddress) : undefined
      );
      setResult({ isLoading: false, data, error: null });
    } catch (error) {
      setResult({ isLoading: false, data: null, error });
    } finally {
      isRequesting.current = false;
    }
  }, [connection, walletAddress]);

  useEffect(() => {
    fetchMarketplaceItems();
  }, [fetchMarketplaceItems]);

  return result;
};

export default useMarketplaceItems;
