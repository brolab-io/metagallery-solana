import BN from "bn.js";
import { Connection, PublicKey } from "@solana/web3.js";
import { IWalletProvider } from "./wallet.service";
import { createPool } from "./pool/create-pool";
import { updateReward } from "./pool/update-reward";
import { sendTransaction } from "./solana.service";
import { Pool } from "./serde/states/pool";

export async function createStakingPool(
  provider: IWalletProvider,
  data: any = {},
  connection: Connection
) {
  if (!provider || !provider.publicKey) {
    throw new Error(`you must firstly connect to a wallet!`);
  }
  const pk = provider.publicKey;
  const serializedTx = await createPool(connection, pk, {
    name: data.name,
    rewardPeriod: new BN(100),
    rewardTokenMintAddress: new PublicKey(data.rewardTokenMintAddress),
    collection: new PublicKey(data.collection),
    poolType: 1,
  });
  return sendTransaction(connection, provider, [serializedTx]);
}

// Read pool data from PDA address
export async function getPoolsFromAddress(connection: Connection) {
  // Get all pools from PDA address, no need to filter by pool type
  // Fisrt, find pda address
  const NEXT_PUBLIC_STAKING_POOL = process.env.NEXT_PUBLIC_STAKING_POOL!;
  const accountInfo = await connection.getAccountInfo(new PublicKey(NEXT_PUBLIC_STAKING_POOL));
  console.log(accountInfo);
  if (!accountInfo) {
    throw new Error("no account info");
  }
  const data = accountInfo.data;
  console.log(Pool.deserialize(data));
}

export async function updateStakingReward(
  provider: IWalletProvider,
  data: any = {},
  connection: Connection
) {
  if (!provider || !provider.publicKey) {
    throw new Error(`you must firstly connect to a wallet!`);
  }
  const pk = provider.publicKey;
  const serializedTx = await updateReward(connection, pk, {
    poolPda: new PublicKey(data.poolPda),
    amount: new BN(data.amount),
    payrollIndex: data.payrollIndex ? new BN(data.payrollIndex) : null,
  });
  return sendTransaction(connection, provider, [serializedTx]);
}
