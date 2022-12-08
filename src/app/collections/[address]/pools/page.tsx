"use client";
import usePools from "../../../../hooks/usePools";

type Props = {
  params: {
    address: string;
  };
};

const PoolsPage = ({ params: { address } }: Props) => {
  const { data, isLoading, error } = usePools(address);
  console.log(isLoading, data, error);
  return null;
};

export default PoolsPage;
