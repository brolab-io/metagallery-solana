import BN from "bn.js";
import {
  Connection,
  PublicKey,
  SystemProgram,
  TransactionInstruction,
  Transaction,
} from "@solana/web3.js";
import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
} from "@solana/spl-token";
import { Pool } from "../serde/states/pool";
import { StakingAccount } from "../serde/states/stake";
import { InitRedeemInstruction } from "../serde/instructions/withdraw-reward";
import { getCurrentPayrollIndex } from "../util.service";
export async function withdrawReward(
  connection: Connection,
  creator: PublicKey,
  {
    poolPda,
    stakingTokenMintAddress,
    rewardTokenMintAddress,
    payrollIndex,
  }: {
    payrollIndex: BN | null;
    stakingTokenMintAddress: PublicKey;
    rewardTokenMintAddress: PublicKey;
    poolPda: PublicKey | null;
  }
) {
  const NEXT_PUBLIC_SC_ADDRESS = process.env.NEXT_PUBLIC_SC_ADDRESS!;
  const NEXT_PUBLIC_STAKING_POOL = process.env.NEXT_PUBLIC_STAKING_POOL!;
  const programId = new PublicKey(NEXT_PUBLIC_SC_ADDRESS);
  const newPoolPda = poolPda || new PublicKey(NEXT_PUBLIC_STAKING_POOL);
  const [stakingPda] = await PublicKey.findProgramAddress(
    [
      Buffer.from("staking"),
      stakingTokenMintAddress.toBuffer(),
      creator.toBuffer(),
      newPoolPda.toBuffer(),
    ],
    programId
  );

  const [poolAccountInfo, stakingAccountInfo] = await connection.getMultipleAccountsInfo([
    newPoolPda,
    stakingPda,
  ]);
  const poolData = Pool.deserialize(poolAccountInfo?.data as Buffer);
  console.log(poolData.rewardPeriod.toNumber());
  const now = Math.floor(Date.now() / 1000);
  const newPayrollIndex =
    payrollIndex ||
    new BN(
      getCurrentPayrollIndex(now, poolData.rewardPeriod.toNumber(), poolData.startAt.toNumber()) - 1
    );
  // const newPayrollIndex = new BN(4416);

  console.log({
    payrollIndex: newPayrollIndex.toNumber(),
    stakingTokenMintAddress: stakingTokenMintAddress.toBase58(),
    poolPda: newPoolPda.toBase58(),
  });
  const stakingData = StakingAccount.deserialize(stakingAccountInfo?.data as Buffer);
  const dstAccount = new PublicKey(stakingData.withdrawnAddress);
  // payroll: 392
  // token: 988Hp2QxjbcZu3vgy78CRsNhxnS46YG4nubbYeePgoxa

  const [payrollPda] = await PublicKey.findProgramAddress(
    [Buffer.from("payroll"), Buffer.from(newPayrollIndex.toString()), newPoolPda.toBuffer()],
    programId
  );

  const [payrollTokenPda] = await PublicKey.findProgramAddress(
    [
      Buffer.from("payrolltoken"),
      Buffer.from(newPayrollIndex.toString()),
      rewardTokenMintAddress.toBuffer(),
      payrollPda.toBuffer(),
    ],
    programId
  );

  const [stakingPayrollPda] = await PublicKey.findProgramAddress(
    [
      Buffer.from("stakingpayroll"),
      Buffer.from(newPayrollIndex.toString()),
      newPoolPda.toBuffer(),
      stakingPda.toBuffer(),
    ],
    programId
  );

  const dstRewardAta = await getAssociatedTokenAddress(
    rewardTokenMintAddress,
    dstAccount,
    true,
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID
  );
  const srcRewardAta = await getAssociatedTokenAddress(
    rewardTokenMintAddress,
    new PublicKey(payrollPda),
    true,
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID
  );
  const redeemIx = new InitRedeemInstruction({
    poolPda: newPoolPda.toBuffer(),
    payrollIndex: newPayrollIndex,
  });
  const serializedData = redeemIx.serialize();
  const dataBuffer = Buffer.from(serializedData);
  // console.log(testPub.toBuffer());
  const instruction = new TransactionInstruction({
    keys: [
      {
        pubkey: creator,
        isSigner: true,
        isWritable: true,
      },
      {
        isSigner: false,
        isWritable: true,
        pubkey: stakingPda,
      },
      {
        isSigner: false,
        isWritable: true,
        pubkey: newPoolPda,
      },
      {
        isSigner: false,
        isWritable: true,
        pubkey: dstAccount,
      },
      {
        isSigner: false,
        isWritable: true,
        pubkey: stakingPayrollPda,
      },
      {
        isSigner: false,
        isWritable: false,
        pubkey: rewardTokenMintAddress,
      },
      {
        isSigner: false,
        isWritable: true,
        pubkey: srcRewardAta,
      },
      {
        isSigner: false,
        isWritable: true,
        pubkey: dstRewardAta,
      },
      {
        isSigner: false,
        isWritable: true,
        pubkey: payrollPda,
      },
      {
        isSigner: false,
        isWritable: true,
        pubkey: payrollTokenPda,
      },
      {
        isSigner: false,
        isWritable: false,
        pubkey: TOKEN_PROGRAM_ID,
      },
      {
        isSigner: false,
        isWritable: false,
        pubkey: SystemProgram.programId,
      },
      {
        isSigner: false,
        isWritable: false,
        pubkey: ASSOCIATED_TOKEN_PROGRAM_ID,
      },
    ],
    programId: new PublicKey(NEXT_PUBLIC_SC_ADDRESS),
    data: dataBuffer,
  });
  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash({
    commitment: "finalized",
  });
  const tx = new Transaction({
    feePayer: creator,
    blockhash,
    lastValidBlockHeight,
  }).add(instruction);
  return tx.serialize({
    verifySignatures: false,
    requireAllSignatures: false,
  });
}
