"use client";
import Link from "next/link";
import { getStakingPoolsFromCollection } from "../../services/pool.service";
import BoxFrame from "../__UI/BoxFrame";

type Props = {
  item: Awaited<ReturnType<typeof getStakingPoolsFromCollection>>[number];
};

const ListPoolItem = ({ item }: Props) => {
  return (
    <Link href={`/pools/${item.id}`}>
      <BoxFrame className="py-20 md:py-24 lg:py-[28px]">
        <div className="flex flex-col items-center font-bold">
          <div className="flex items-center space-x-4">
            <h2 className="text-[42px] md:text-[54px] lg:text-[64px] text-primary capitalize">
              {item.collectionData?.data.name}
            </h2>
          </div>
          <div className="flex items-center space-x-4">
            <h3 className="text-[32px] md:text-[42px] lg:text-[48px] capitalize text-white">
              {item.name}
            </h3>
          </div>
          <span className="text-[24px] md:text-[32px] lg:text-[36px] text-white">
            Total Power: {item.totalDepositedPower.toString()}
          </span>
          <span className="text-[24px] md:text-[32px] lg:text-[36px] text-[#8E8F99]">
            Reward Period: {item.rewardPeriod.toString()}
          </span>
        </div>
      </BoxFrame>
    </Link>
  );
};

export default ListPoolItem;
