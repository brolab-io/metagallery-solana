"use client";
import ListPool from "../../../../components/Pool/ListPool";
import Loading from "../../../../components/__UI/Loading";
import usePools from "../../../../hooks/usePools";

type Props = {
  params: {
    address: string;
  };
};

const PoolsPage = ({ params: { address } }: Props) => {
  const { data, isLoading } = usePools(address);

  if (isLoading) {
    return <Loading label="Loading pools..." />;
  }

  if (!data.length) {
    return (
      <div className="py-40">
        <p className="text-3xl text-center text-white">No pools found for this collection!</p>
      </div>
    );
  }

  return (
    <div>
      <ListPool collection={address} />
    </div>
  );
};

export default PoolsPage;
