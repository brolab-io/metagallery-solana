import { Metadata } from "@metaplex-foundation/mpl-token-metadata";
import { createContext, useContext } from "react";
import { getNftMetadataFromUri } from "../../../services/nft.service";

type ContextType = {
  collection: Metadata | null;
  metadata: Awaited<ReturnType<typeof getNftMetadataFromUri>> | null;
};

const CollectionContext = createContext<ContextType>({} as ContextType);

export const useCollectionContext = () => {
  return useContext(CollectionContext);
};

export default CollectionContext;
