import { useCallback, useEffect, useState } from "react";
import { getNftMetadataFromUri } from "../services/nft.service";

type Result = {
  isLoading: boolean;
  data: Awaited<ReturnType<typeof getNftMetadataFromUri>> | null;
  error: unknown;
};

const useAssetMetadata = (uri?: string) => {
  const [result, setResult] = useState<Result>({
    isLoading: false,
    data: null,
    error: null,
  });

  const fetchAssets = useCallback(async () => {
    if (!uri) {
      return;
    }
    setResult({ isLoading: true, data: null, error: null });
    try {
      const data = await getNftMetadataFromUri(uri);
      setResult({ isLoading: false, data, error: null });
    } catch (error) {
      setResult({ isLoading: false, data: null, error });
    }
  }, [uri]);

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  return result;
};

export default useAssetMetadata;
