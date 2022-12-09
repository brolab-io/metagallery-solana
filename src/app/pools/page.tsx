"use client";

import ListPool from "../../components/Pool/ListPool";
import Loading from "../../components/__UI/Loading";
import usePools from "../../hooks/usePools";

const PoolsPage = () => {
  const { data, isLoading } = usePools();

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
    <div>
      <ListPool />
    </div>
  );
};

export default PoolsPage;
