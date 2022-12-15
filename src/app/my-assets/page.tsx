"use client";
import ListNFT from "../../components/NFT/ListNFT";
import BreadCrumb from "../../components/__UI/Breadcrumb";
import Container from "../../components/__UI/Container";
import useOurNFTs from "../../hooks/useOurNFTs";

const breadCrumbItems = [
  {
    label: "My NFTs",
  },
];

const MyAssetsPage = () => {
  const { isLoading, data } = useOurNFTs();

  return (
    <>
      <Container className="py-6 sm:py-8 md:py-12 lg:py-16 xl:py-20">
        <div className="flex items-center justify-between mb-[61px]">
          <BreadCrumb items={breadCrumbItems} />
        </div>
        <ListNFT isLoading={isLoading} nfts={data} />
      </Container>
    </>
  );
};

export default MyAssetsPage;
