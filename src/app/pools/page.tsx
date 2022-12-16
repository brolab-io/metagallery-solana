"use client";

import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import ListPool from "../../components/Pool/ListPool";
import Container from "../../components/__UI/Container";

const PoolsPage = () => {
  const params = useSearchParams();
  const collection = useMemo(() => params.get("collection"), [params]);

  return (
    <Container className="py-6 sm:py-8 md:py-12 lg:py-16 xl:py-20">
      <ListPool collection={collection || undefined} emptyText="There are no pools yet!" />
    </Container>
  );
};

export default PoolsPage;
