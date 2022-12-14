import BN from "bn.js";
import { Connection, GetProgramAccountsFilter, PublicKey } from "@solana/web3.js";
import { IWalletProvider } from "./wallet.service";
import { createPool } from "./pool/create-pool";
import { updateReward } from "./pool/update-reward";
import { sendTransaction } from "./solana.service";
import base58 from "bs58";
import { pad } from "./util.service";
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
    id: data.id,
    name: data.name,
    rewardPeriod: new BN(data.rewardPeriod),
    collection: new PublicKey(data.collection),
    poolType: 1,
  });
  return sendTransaction(connection, provider, [serializedTx]);
}

export async function getStakingPoolsFromCollection(
  connection: Connection,
  collection: PublicKey | null
) {
  const programId: PublicKey = new PublicKey(process.env.NEXT_PUBLIC_SC_ADDRESS!);
  const filters: GetProgramAccountsFilter[] = [
    {
      memcmp: {
        offset: 0,
        bytes: base58.encode(Buffer.from([100])),
      },
    },
  ];

  if (collection) {
    filters.push({
      memcmp: {
        offset: 1 + 16 + 16 + 8 + 8 + 8 + 1 + 32,
        bytes: collection.toBase58(),
      },
    });
  }

  const rawPools = await connection.getProgramAccounts(programId, {
    filters,
  });
  return rawPools.map((pool) => {
    return pool.account.data;
  });
}

export async function getStakingPoolById(connection: Connection, id: string) {
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from(pad(id, 16)), Buffer.from("pool")],
    new PublicKey(process.env.NEXT_PUBLIC_SC_ADDRESS!)
  );
  // console.log("getStakingPoolById", pda.toBase58());
  const rawPool = await connection.getAccountInfo(pda);
  if (!rawPool) {
    throw new Error("Pool not found");
  }
  return Pool.deserializeToReadable(rawPool.data);
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
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from(pad(data.poolId, 16)), Buffer.from("pool")],
    new PublicKey(process.env.NEXT_PUBLIC_SC_ADDRESS!)
  );
  const serializedTx = await updateReward(connection, pk, {
    poolPda: pda,
    amount: new BN(data.amount),
    rewardTokenMint: new PublicKey(data.rewardTokenMint),
    payrollIndex: data.payrollIndex ? new BN(data.payrollIndex) : null,
  });
  return sendTransaction(connection, provider, [serializedTx]);
}
