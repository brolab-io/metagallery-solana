"use client";
import ListCollection from "../../components/Collection/ListCollection";
import BreadCrumb from "../../components/__UI/Breadcrumb";
import Button from "../../components/__UI/Button";
import Container from "../../components/__UI/Container";
import useAssets from "../../hooks/useAssets";

const breadCrumbItems = [
  {
    href: "/collections",
    label: "Collections",
  },
];

const CollectionsPage = () => {
  const { isLoading, data } = useAssets("collection");

  return (
    <>
      <Container className="py-6 sm:py-8 md:py-12 lg:py-16 xl:py-20">
        <div className="flex items-center justify-between mb-[61px]">
          <BreadCrumb items={breadCrumbItems} />
          <Button href="/collections/mint">Create New</Button>
        </div>
        <ListCollection
          emptyText="You don't have any collections yet. Create one to get started!"
          isLoading={isLoading}
          collections={data}
        />
      </Container>
    </>
  );
};

export default CollectionsPage;
