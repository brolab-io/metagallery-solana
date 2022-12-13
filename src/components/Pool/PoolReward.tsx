import { getPoolRewards } from "../../services/staking.service";
import PoolRewardItem from "./PoolRewardItem";

type Props = {
  poolRewardData: Awaited<ReturnType<typeof getPoolRewards>> | null;
  isLoading: boolean;
};

const PoolReward: React.FC<Props> = ({ poolRewardData: pollRewardData, isLoading }) => {
  if (isLoading) {
    return (
      <div className="text-center">
        <p className="text-2xl text-white">Loading Pool Rewards...</p>
      </div>
    );
  }
  if (!pollRewardData?.tokens.length) {
    return (
      <div className="text-center">
        <p className="text-2xl text-white">There are no rewards for this pool yet!</p>
      </div>
    );
  }
  return (
    <div className="px-6 md:px-8 lg:px-10">
      {pollRewardData.tokens.map((token) => (
        <PoolRewardItem rewardToken={token} key={token.address} />
      ))}
    </div>
  );
};

export default PoolReward;
