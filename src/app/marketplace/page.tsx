"use client";
import useMarketplaceItems from "../../hooks/useMarketplaceItems";

const MarketplacePage = () => {
  const { data, isLoading, error } = useMarketplaceItems();

  console.log(isLoading, data, error);
  return null;
};

export default MarketplacePage;
