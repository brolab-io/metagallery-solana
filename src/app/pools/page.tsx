"use client";

import { useSearchParams } from "next/navigation";
import ListPool from "../../components/Pool/ListPool";
import Container from "../../components/__UI/Container";
import Loading from "../../components/__UI/Loading";
import usePools from "../../hooks/usePools";

const PoolsPage = () => {
  const params = useSearchParams();
  // console.log('params.get("collection")', params.get("collection"));
  const { data, isLoading } = usePools("NyXgPoqcioPJAmSkAvwLXuAvcfwsKbn2d1BKRroWCpJ");

  if (isLoading) {
    return <Loading label="Loading pools..." />;
  }

  if (!data.length) {
    return (
      <div className="py-40">
        <p className="text-3xl text-center text-white">No pools found!</p>
      </div>
    );
  }

  return (
    <Container className="py-6 sm:py-8 md:py-12 lg:py-16 xl:py-20">
      <ListPool />
    </Container>
  );
};

export default PoolsPage;
