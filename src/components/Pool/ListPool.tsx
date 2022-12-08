import usePools from "../../hooks/usePools";
import Loading from "../__UI/Loading";
import ListPoolItem from "./ListPoolItem";

type Props = {
  collection: string;
};

const ListPool = ({ collection }: Props) => {
  const { data, isLoading } = usePools(collection);

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
    <div className="grid gap-4 lg:grid-cols-2 lg:gap-6 xl:gap-8">
      {data.map((pool) => (
        <ListPoolItem key={pool.name} item={pool} />
      ))}
    </div>
  );
};

export default ListPool;
