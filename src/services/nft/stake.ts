import BN from "bn.js";
import {
  Connection,
  PublicKey,
  SystemProgram,
  TransactionInstruction,
  Transaction,
} from "@solana/web3.js";
import { StakeIns } from "../serde/instructions/stake";
import { getCurrentPayrollIndex } from "../util.service";
import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
} from "@solana/spl-token";
import { Pool } from "../serde/states/pool";
export async function stakeAsset(
  connection: Connection,
  creator: PublicKey,
  {
    stakingTokenMintAddress,
    poolPda = new PublicKey(process.env.NEXT_PUBLIC_STAKING_POOL || ""),
  }: {
    stakingTokenMintAddress: PublicKey;
    poolPda?: PublicKey;
  }
) {
  const { NEXT_PUBLIC_SC_ADDRESS = "" } = process.env;
  const now = Math.floor(Date.now() / 1000);
  const poolAccountInfo = await connection.getAccountInfo(poolPda);
  const parsedPoolData = Pool.deserialize(poolAccountInfo?.data as Buffer);
  const currentPayrollIndex = getCurrentPayrollIndex(
    now,
    parsedPoolData.rewardPeriod.toNumber(),
    parsedPoolData.startAt.toNumber()
  );
  const [payrollPda] = await PublicKey.findProgramAddress(
    [Buffer.from("payroll"), Buffer.from(currentPayrollIndex.toString()), poolPda.toBuffer()],
    new PublicKey(NEXT_PUBLIC_SC_ADDRESS)
  );
  const [stakingTokenDataPda] = await PublicKey.findProgramAddress(
    [Buffer.from("tokendata"), stakingTokenMintAddress.toBuffer()],
    new PublicKey(NEXT_PUBLIC_SC_ADDRESS)
  );
  const tokenDataInfo = await connection.getAccountInfo(stakingTokenDataPda);
  // const parsedTokenDataInfo = Pool.deserialize(tokenDataInfo?.data as Buffer);
  const [pda] = await PublicKey.findProgramAddress(
    [
      Buffer.from("staking"),
      stakingTokenMintAddress.toBuffer(),
      creator.toBuffer(),
      poolPda.toBuffer(),
    ],
    new PublicKey(NEXT_PUBLIC_SC_ADDRESS)
  );
  const srcAta = await getAssociatedTokenAddress(
    stakingTokenMintAddress,
    creator,
    true,
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID
  );
  const dstAta = await getAssociatedTokenAddress(
    stakingTokenMintAddress,
    poolPda,
    true,
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID
  );
  const initPoolIx = new StakeIns();
  const serializedData = initPoolIx.serialize();
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
        pubkey: pda,
      },
      {
        isSigner: false,
        isWritable: true,
        pubkey: poolPda,
      },
      {
        isSigner: false,
        isWritable: false,
        pubkey: stakingTokenMintAddress,
      },
      {
        isSigner: false,
        isWritable: true,
        pubkey: srcAta,
      },
      {
        isSigner: false,
        isWritable: true,
        pubkey: dstAta,
      },
      {
        isSigner: false,
        isWritable: false,
        pubkey: stakingTokenDataPda,
      },
      {
        isSigner: false,
        isWritable: true,
        pubkey: payrollPda,
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
