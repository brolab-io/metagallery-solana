import BN from "bn.js";
import { Connection, PublicKey } from "@solana/web3.js";
import { IWalletProvider } from "./wallet.service";
import { withdrawReward } from "./pool/withdraw-reward";
import { withdraw } from "./pool/withdraw-nft";
import { sendTransaction } from "./solana.service";
import base58 from "bs58";
import { StakingAccount } from "./serde/states/stake";
import { getMultiMetaData, getMultiTokenData, TokenMetdata } from "./nft.service";
import { PROGRAM_ID } from "@metaplex-foundation/mpl-token-metadata";
import { getCurrentPayrollIndex, pad } from "./util.service";
import { Pool } from "./serde/states/pool";
import { Payroll } from "./serde/states/payroll";
import { PayrollIndex } from "./serde/states/payrollIndex";
import { PayrollToken } from "./serde/states/payrollToken";

export async function redeem(provider: IWalletProvider, data: any = {}, connection: Connection) {
  if (!provider || !provider.publicKey) {
    throw new Error(`you must firstly connect to a wallet!`);
  }
  const pk = provider.publicKey;
  const serializedTx = await withdrawReward(connection, pk, {
    poolPda: data.poolPda ? new PublicKey(data.poolPda) : null,
    payrollIndex: data.payrollIndex ? new BN(data.payrollIndex) : null,
    stakingTokenMintAddress: new PublicKey(data.stakingTokenMintAddress),
    rewardTokenMintAddress: new PublicKey(data.rewardTokenMintAddress),
  });
  return sendTransaction(connection, provider, [serializedTx]);
}

export async function withdrawNft(
  provider: IWalletProvider,
  data: any = {},
  connection: Connection
) {
  if (!provider || !provider.publicKey) {
    throw new Error(`you must firstly connect to a wallet!`);
  }
  const pk = provider.publicKey;
  const serializedTx = await withdraw(connection, pk, {
    pdaAccount: new PublicKey(data.pdaAccount),
  });
  return sendTransaction(connection, provider, [serializedTx]);
}

type Tokens = {
  address: string;
  amount: BN;
};

export async function getPoolRewards(
  connection: Connection,
  {
    poolId,
    payrollIndex,
  }: {
    poolId: string;
    payrollIndex?: BN;
  }
) {
  const results: {
    claimableAfter: number;
    tokens: Tokens[];
  } = {
    claimableAfter: 0,
    tokens: [],
  };

  const [poolPda] = PublicKey.findProgramAddressSync(
    [Buffer.from(pad(poolId, 16)), Buffer.from("pool")],
    new PublicKey(process.env.NEXT_PUBLIC_SC_ADDRESS!)
  );

  const poolPdaInfo = await connection.getAccountInfo(poolPda);
  const parsedPoolData = Pool.deserialize(poolPdaInfo?.data as Buffer);
  const rewardPeriod = parsedPoolData.rewardPeriod.toNumber();
  const startAt = parsedPoolData.startAt.toNumber();

  const programId = new PublicKey(process.env.NEXT_PUBLIC_SC_ADDRESS!);
  const currentPayrollIndex = getCurrentPayrollIndex(
    Math.floor(Date.now() / 1000),
    rewardPeriod,
    startAt
  );
  const validPayrollIndex = payrollIndex ? payrollIndex : new BN(currentPayrollIndex);

  const [payrollPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("payroll"), Buffer.from(validPayrollIndex.toString()), poolPda.toBuffer()],
    programId
  );
  const payrollPdaInfo = await connection.getAccountInfo(payrollPda);
  if (!payrollPdaInfo) {
    console.log("getPoolRewards", "payrollPdaInfo", "not found");
    return results;
  }
  const payrollData = Payroll.deserialize(payrollPdaInfo.data);
  const numberOfRewardToken = payrollData.numberOfRewardTokens.toNumber();
  results.claimableAfter = payrollData.claimableAfter.toNumber();

  const payrollIndexData = await connection.getMultipleAccountsInfo(
    new Array(numberOfRewardToken).fill(0).map((_, i) => {
      return PublicKey.findProgramAddressSync(
        [Buffer.from("payrollindex"), Buffer.from(new BN(i + 1).toString()), payrollPda.toBuffer()],
        programId
      )[0];
    })
  );

  const payrollIndexs = payrollIndexData.map((item) =>
    PayrollIndex.deserializeToReadable(item?.data as Buffer)
  );

  const payrollTokenPdas = payrollIndexs.map(
    (payrollIndex) =>
      PublicKey.findProgramAddressSync(
        [
          Buffer.from("payrolltoken"),
          Buffer.from(validPayrollIndex.toString()),
          new PublicKey(payrollIndex.rewardTokenMintAccount).toBuffer(),
          payrollPda.toBuffer(),
        ],
        programId
      )[0]
  );
  const payrollTokenPdaInfo = await connection.getMultipleAccountsInfo(payrollTokenPdas);
  const payrollTokenData = payrollTokenPdaInfo.map((item) => {
    return PayrollToken.deserializeToReadable(item?.data as Buffer);
  });
  results.tokens = payrollTokenData.map((item) => {
    return {
      address: item.rewardTokenMintAccount,
      amount: item.totalRewardAmount,
    };
  });
  return results;
}

export async function getStakedNftForPool(
  connection: Connection,
  userPublicKey: PublicKey,
  poolId: string
) {
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from(pad(poolId, 16)), Buffer.from("pool")],
    new PublicKey(process.env.NEXT_PUBLIC_SC_ADDRESS!)
  );
  console.log("getStakedNftForPool", pda.toBase58());
  const programId = new PublicKey(process.env.NEXT_PUBLIC_SC_ADDRESS!);

  return await getStakingsForAddress(connection, userPublicKey, programId, pda);
}

export async function getStakingsForAddress(
  connection: Connection,
  address: PublicKey,
  programId: PublicKey = PROGRAM_ID,
  poolPda: PublicKey
) {
  const assets = await connection.getProgramAccounts(programId, {
    filters: [
      {
        memcmp: {
          offset: 137,
          bytes: address.toBase58(),
        },
      },
      {
        memcmp: {
          offset: 1 + 8 + 8 + 8 + 8 + 8,
          bytes: poolPda.toBase58(),
        },
      },
      {
        memcmp: {
          offset: 0,
          bytes: base58.encode(Buffer.from([101])),
        },
      },
      {
        memcmp: {
          offset: 17,
          bytes: base58.encode(Buffer.from([0])),
        },
      },
    ],
  });
  const mintPubkeys: any = [];
  const stakingData = assets
    .map((a) => {
      try {
        const data = StakingAccount.deserializeToReadable(a.account.data as Buffer);
        if (!data) {
          throw new Error(`Invalid mint data, ignore`);
        }
        const mintPubkey = data.stakingTokenMintAddress;
        mintPubkeys.push(mintPubkey);
        return a;
      } catch (error) {
        // console.log(error);
        return null;
      }
    })
    .filter((data) => data);
  const chunks = mintPubkeys.reduce((result: any, m: any, index: number) => {
    const base = Math.floor(index / 100);
    result[base] = result[base] || [];
    result[base].push(m);
    return result;
  }, []);
  const mintData = await Promise.all(chunks.map((m: any) => getMultiMetaData(connection, m)));
  const tokenData = await Promise.all(chunks.map((m: any) => getMultiTokenData(connection, m)));
  const flattenedMintDatas = mintData.reduce((result, m) => result.concat(m), []);
  const flattenedTokenDatas = tokenData.reduce((result, m) => result.concat(m), []);
  return stakingData.map((s, i) => ({
    staking: s,
    mintData: {
      ...flattenedMintDatas[i][0],
      tokenData: flattenedTokenDatas[i],
    } as TokenMetdata,
  }));
}
