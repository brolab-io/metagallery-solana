import { BN } from "bn.js";
import useTokenInfo from "../../hooks/useTokenInfo";
import { getPoolRewards } from "../../services/staking.service";

type Props = {
  rewardToken: Awaited<ReturnType<typeof getPoolRewards>>["tokens"][number];
};

const PoolRewardItem: React.FC<Props> = ({ rewardToken }) => {
  const { data } = useTokenInfo(rewardToken.address);

  const tokenSymbol = "";
  const tokenDecimals = data?.decimals;
  const amount = tokenDecimals
    ? rewardToken.amount.div(new BN(10).pow(new BN(tokenDecimals))).toString()
    : 0;
  return (
    <div className="flex gap-4 text-3xl text-white">
      <div>
        {rewardToken.address.slice(0, 8)}...{rewardToken.address.slice(-8)}
      </div>
      {tokenDecimals ? (
        <div>
          {amount} {tokenSymbol}
        </div>
      ) : (
        <div>Loading...</div>
      )}
    </div>
  );
};

export default PoolRewardItem;
