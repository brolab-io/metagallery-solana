"use client";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useCallback, useMemo, useState } from "react";
import { toast } from "react-toastify";
import ListNFT from "../../../components/NFT/ListNFT";
import AddRewardModal from "../../../components/Pool/AddRewardModal";
import StakeNftModal from "../../../components/Pool/StakeNftModal";
import BoxFrame from "../../../components/__UI/BoxFrame";
import Button from "../../../components/__UI/Button";
import Container from "../../../components/__UI/Container";
import H1 from "../../../components/__UI/H1";
import Loading from "../../../components/__UI/Loading";
import usePool from "../../../hooks/usePool";
import useStakedNFTs from "../../../hooks/useStakedNFTs";
import { TokenMetdata } from "../../../services/nft.service";
import { withdrawNft } from "../../../services/staking.service";

type Props = {
  params: {
    poolId: string;
  };
};

const PoolPage = ({ params: { poolId } }: Props) => {
  const { data, isLoading, error, refetch: refetchPool } = usePool(poolId);
  const {
    data: stakedNFTsData,
    isLoading: isLoadingStakedNFTs,
    refetch: refetchStakedNFTs,
  } = useStakedNFTs(poolId);

  const [isShowingStakeNFTModal, setIsShowingStakeNFTModal] = useState(false);
  const [isShowingAddRewardModal, setIsShowingAddRewardModal] = useState(false);

  const { connection } = useConnection();
  const wallet = useWallet();

  const stakedNFTs = useMemo(() => {
    return stakedNFTsData.map((item) => item.mintData);
  }, [stakedNFTsData]);

  const refetchData = useCallback(() => {
    setTimeout(() => {
      refetchPool();
      refetchStakedNFTs();
    }, 1000);
  }, [refetchPool, refetchStakedNFTs]);

  const showStakeNFTModal = useCallback(() => {
    return setIsShowingStakeNFTModal(true);
  }, []);

  const showAddRewardModal = useCallback(() => {
    return setIsShowingAddRewardModal(true);
  }, []);

  const unstakeNFT = useCallback(
    async (token: TokenMetdata) => {
      const toastId = toast.info("Unstaking NFT...", {
        autoClose: false,
        isLoading: true,
      });
      try {
        const { staking } = stakedNFTsData.find((item) => item.mintData.mint === token.mint)!;
        await withdrawNft(
          wallet,
          {
            pdaAccount: staking!.pubkey.toBase58(),
          },
          connection
        );
        toast.update(toastId, {
          render: "NFT unstaked successfully!",
          type: "success",
          isLoading: false,
          autoClose: 3000,
        });
        return refetchData();
      } catch (error) {
        console.warn(error);
        toast.update(toastId, {
          render: (error as Error).message,
          type: "error",
          isLoading: false,
          autoClose: 3000,
        });
      }
    },
    [connection, stakedNFTsData, wallet, refetchData]
  );

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
      <Container className="py-6 space-y-10 sm:py-8 md:py-12 lg:py-16 xl:py-20">
        <div className="space-y-2.5">
          <H1>Pool Info</H1>
          <div className="flex items-center justify-between">
            <H1>Pool Info</H1>
            <Button sm onClick={showAddRewardModal}>
              UPDATE REWARD
            </Button>
          </div>
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
            <div className="p-6 md:p-8 lg:p-10">
              <ListNFT
                isLoading={isLoadingStakedNFTs}
                nfts={stakedNFTs}
                renderActions={(token) => (
                  <div className="flex justify-center pt-4">
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        unstakeNFT(token);
                        return false;
                      }}
                      xs
                    >
                      Unstake
                    </Button>
                  </div>
                )}
              />
            </div>
          </BoxFrame>
        </div>
      </Container>
      <StakeNftModal
        show={isShowingStakeNFTModal}
        setShow={setIsShowingStakeNFTModal}
        collection={data.collection}
        poolId={data.id}
        callback={refetchData}
      />
      <AddRewardModal
        show={isShowingAddRewardModal}
        setShow={setIsShowingAddRewardModal}
        poolId={data.id}
        callback={refetchData}
      />
    </>
  );
};

export default PoolPage;
