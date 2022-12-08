import BN from "bn.js";
import { Connection, PublicKey } from "@solana/web3.js";
import { IWalletProvider } from "./wallet.service";
import { createPool } from "./pool/create-pool";
import { updateReward } from "./pool/update-reward";
import { sendTransaction } from "./solana.service";
import base58 from "bs58";

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
    rewardPeriod: new BN(data.rewardPeriod),
    collection: new PublicKey(data.collection),
    poolType: 1,
  });
  return sendTransaction(connection, provider, [serializedTx]);
}

export async function getStakingPoolsFromCollection(
  connection: Connection,
  programId: PublicKey = new PublicKey(process.env.NEXT_PUBLIC_SC_ADDRESS!),
  collection: PublicKey
) {
  console.log("getStakingPools", collection.toBase58());
  const rawPools = await connection.getProgramAccounts(programId, {
    filters: [
      {
        memcmp: {
          offset: 0,
          bytes: base58.encode(Buffer.from([100])),
        },
      },
      {
        memcmp: {
          offset: 1 + 16 + 8 + 8 + 8 + 1 + 32,
          bytes: collection.toBase58(),
        },
      },
    ],
  });
  return rawPools.map((pool) => {
    return pool.account.data;
  });
}

export async function getStakingPoolByName(connection: Connection, name: string) {}

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
