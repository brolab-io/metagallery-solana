"use client";
import { useMemo } from "react";
import ListNFT from "../../components/NFT/ListNFT";
import Container from "../../components/__UI/Container";
import useMarketplaceItems from "../../hooks/useMarketplaceItems";

const MarketplacePage = () => {
  const { data, isLoading, error } = useMarketplaceItems();

  return (
    <Container>
      <ListNFT nfts={data || []} isMarketplace isLoading={isLoading} />
    </Container>
  );
};

export default MarketplacePage;
