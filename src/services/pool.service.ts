import BN from "bn.js";
import { Connection, PublicKey } from "@solana/web3.js";
import { IWalletProvider } from "./wallet.service";
import { createPool } from "./pool/create-pool";
import { updateReward } from "./pool/update-reward";
import { sendTransaction } from "./solana.service";

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
    collection: new PublicKey(data.collection),
    poolType: 1,
  });
  return sendTransaction(connection, provider, [serializedTx]);
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
    rewardTokenMint: new PublicKey(data.rewardTokenMint),
    payrollIndex: data.payrollIndex ? new BN(data.payrollIndex) : null,
  });
  return sendTransaction(connection, provider, [serializedTx]);
}
