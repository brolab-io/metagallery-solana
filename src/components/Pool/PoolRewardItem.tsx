import BN from "bn.js";
import { useMemo } from "react";
import useTokenInfo from "../../hooks/useTokenInfo";
import { getPoolRewards } from "../../services/staking.service";

type Props = {
  rewardToken: Awaited<ReturnType<typeof getPoolRewards>>["tokens"][number];
};
const PoolRewardItem: React.FC<Props> = ({ rewardToken, ...props }) => {
  // const { data } = useTokenInfo(rewardToken.address);

  const tokenSymbol = "";
  // const tokenDecimals = data?.decimals || 8;
  const tokenDecimals = 8;

  const amount = useMemo(() => {
    if (!tokenDecimals) return 0;
    return rewardToken.amount.div(new BN(10).pow(new BN(tokenDecimals))).toString();
  }, [rewardToken.amount, tokenDecimals]);

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
