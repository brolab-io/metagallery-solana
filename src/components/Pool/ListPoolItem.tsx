"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { TReadablePool } from "../../services/serde/states/pool";
import BoxFrame from "../__UI/BoxFrame";
type Props = {
  item: TReadablePool;
};

const ListPoolItem = ({ item }: Props) => {
  const pathname = usePathname();
  return (
    <Link href={`${pathname}/${item.id}`}>
      <BoxFrame className="py-20 md:py-24 lg:py-[28px]">
        <div className="flex flex-col items-center font-bold">
          <div className="flex items-center space-x-4">
            <h2 className="text-[48px] md:text-[60px] lg:text-[72px] text-white">{item.name}</h2>
          </div>
          <span className="text-[28px] md:text-[36px] lg:text-[42px] text-white">
            Total Power: {item.totalDepositedPower.toString()}
          </span>
          <span className="text-[28px] md:text-[36px] lg:text-[42px] text-[#8E8F99]">
            Reward Period: {item.rewardPeriod.toString()}
          </span>
        </div>
      </BoxFrame>
    </Link>
  );
};

export default ListPoolItem;
