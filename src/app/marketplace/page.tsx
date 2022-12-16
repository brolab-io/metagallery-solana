"use client";
import ListNFT from "../../components/NFT/ListNFT";
import BreadCrumb from "../../components/__UI/Breadcrumb";
import Container from "../../components/__UI/Container";
import useMarketplaceItems from "../../hooks/useMarketplaceItems";

const breadCrumbItems = [
  {
    label: "Marketplace",
  },
];

const MarketplacePage = () => {
  const { data, isLoading, error } = useMarketplaceItems();

  return (
    <Container className="py-6 sm:py-8 md:py-12 lg:py-16 xl:py-20">
      <BreadCrumb items={breadCrumbItems} />
      <ListNFT
        emptyText="There are no NFTs for sale yet!"
        nfts={data || []}
        isMarketplace
        isLoading={isLoading}
      />
    </Container>
  );
};

export default MarketplacePage;
