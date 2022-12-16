import { useConnection } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { useCallback, useEffect, useRef, useState } from "react";
import { getListingItem } from "../services/marketplace.service";

type Result = {
  isLoading: boolean;
  data: Awaited<ReturnType<typeof getListingItem>> | null;
  error: unknown;
};

const useMarketplaceItem = (tokenAddress: string) => {
  const { connection } = useConnection();
  const [result, setResult] = useState<Result>({
    isLoading: false,
    data: null,
    error: null,
  });
  const isRequesting = useRef(false);

  const fetchMarketplaceItem = useCallback(async () => {
    if (isRequesting.current || !connection) return;
    isRequesting.current = true;
    setResult({ isLoading: true, data: null, error: null });
    try {
      const data = await getListingItem(connection, new PublicKey(tokenAddress));
      setResult({ isLoading: false, data, error: null });
    } catch (error) {
      setResult({ isLoading: false, data: null, error });
    } finally {
      isRequesting.current = false;
    }
  }, [connection, tokenAddress]);

  useEffect(() => {
    fetchMarketplaceItem();
  }, [fetchMarketplaceItem]);

  return result;
};

export default useMarketplaceItem;
