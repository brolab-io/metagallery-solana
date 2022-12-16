"use client";
import ListCollection from "../../components/Collection/ListCollection";
import BreadCrumb from "../../components/__UI/Breadcrumb";
import Container from "../../components/__UI/Container";
import useOurCollections from "../../hooks/useOurCollections";

const breadCrumbItems = [
  {
    href: "/collections",
    label: "Collections",
  },
];

const ExplorerPage = () => {
  const { isLoading, data } = useOurCollections();

  return (
    <>
      <Container className="py-6 sm:py-8 md:py-12 lg:py-16 xl:py-20">
        <div className="flex items-center justify-between mb-[61px]">
          <BreadCrumb items={breadCrumbItems} />
        </div>
        <ListCollection
          emptyText="There are no collections yet!"
          needLogin={false}
          isExplore
          isLoading={isLoading}
          collections={data}
        />
      </Container>
    </>
  );
};

export default ExplorerPage;
