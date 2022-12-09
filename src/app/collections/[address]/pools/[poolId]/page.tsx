"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import StakeNftModal from "../../../../../components/Pool/StakeNftModal";
import BoxFrame from "../../../../../components/__UI/BoxFrame";
import Button from "../../../../../components/__UI/Button";
import H1 from "../../../../../components/__UI/H1";
import Loading from "../../../../../components/__UI/Loading";
import usePool from "../../../../../hooks/usePool";

type Props = {
  params: {
    poolId: string;
    address: string;
  };
};

const PoolPage = ({ params: { poolId, address: collectionAddress } }: Props) => {
  const { data, isLoading, error } = usePool(poolId);
  const [isShowingStakeNFTModal, setIsShowingStakeNFTModal] = useState(false);

  const showStakeNFTModal = useCallback(() => {
    return setIsShowingStakeNFTModal(true);
  }, []);

  useEffect(() => {
    if (data) {
      console.log("Fetched pool data: ", data);
    }
  }, [data]);

  if (isLoading) {
    return <Loading label="Loading pool..." />;
  }
  if (error) {
    return (
      <div className="py-40">
        <p className="text-3xl text-center text-red-500">{(error as Error).message}</p>
      </div>
    );
  }
  if (!data) {
    return (
      <div className="py-40">
        <p className="text-3xl text-center text-white">No pool found!</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-10">
        <div className="space-y-2.5">
          <H1>Pool Info</H1>
          <BoxFrame>
            <div className="py-16 md:py-20 lg:py-30">
              <div className="flex flex-col items-center font-bold">
                <div className="flex items-center space-x-4">
                  <h2 className="text-[48px] md:text-[60px] lg:text-[72px] text-white">
                    {data.name}
                  </h2>
                </div>
                <span className="text-[28px] md:text-[36px] lg:text-[42px] text-white">
                  Total Power: {data.totalDepositedPower.toString()}
                </span>
                <span className="text-[28px] md:text-[36px] lg:text-[42px] text-[#8E8F99]">
                  Reward Period: {data.rewardPeriod.toString()}
                </span>
              </div>
            </div>
          </BoxFrame>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <H1>Staked NFTs</H1>
            <Button sm onClick={showStakeNFTModal}>
              STAKE
            </Button>
          </div>
          <BoxFrame>
            <div className="py-16 md:py-20 lg:py-30">
              <p className="text-3xl text-center text-white">
                Stake your NFTs here to earn rewards!
              </p>
            </div>
          </BoxFrame>
        </div>
      </div>
      <StakeNftModal
        collectionAddress={collectionAddress}
        show={isShowingStakeNFTModal}
        setShow={setIsShowingStakeNFTModal}
        poolId={poolId}
      />
    </>
  );
};

export default PoolPage;
