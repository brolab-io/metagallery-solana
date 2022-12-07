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
import { getCurrentPayrollIndex } from "../util.service";
import { UpdateRewarderInstruction } from "../serde/instructions/update-reward";
export async function updateReward(
  connection: Connection,
  creator: PublicKey,
  {
    poolPda,
    amount,
    payrollIndex,
  }: {
    amount: BN;
    payrollIndex: BN | null;
    poolPda: PublicKey;
  }
): Promise<any> {
  const NEXT_PUBLIC_SC_ADDRESS = process.env.NEXT_PUBLIC_SC_ADDRESS!;
  console.log({
    poolPda: poolPda.toBase58(),
    amount: amount.toNumber(),
    payrollIndex: payrollIndex?.toNumber(),
  });
  const programId = new PublicKey(NEXT_PUBLIC_SC_ADDRESS);
  // const [poolPda] = await PublicKey.findProgramAddress([
  //   Buffer.from('pool'),
  //   payer.publicKey.toBuffer()
  // ], PROGRAM_ID);

  const poolPdaInfo = await connection.getAccountInfo(poolPda);
  const parsedPoolData = Pool.deserialize(poolPdaInfo?.data as Buffer);
  const currentPayrollIndex = getCurrentPayrollIndex(
    Math.floor(Date.now() / 1000),
    parsedPoolData.rewardPeriod.toNumber(),
    parsedPoolData.startAt.toNumber()
  );

  const validPayrollIndex = payrollIndex ? payrollIndex : new BN(currentPayrollIndex);
  console.log(validPayrollIndex.toNumber());
  const [payrollPda] = await PublicKey.findProgramAddress(
    [Buffer.from("payroll"), Buffer.from(validPayrollIndex.toString()), poolPda.toBuffer()],
    programId
  );
  const [rewardPda] = await PublicKey.findProgramAddress(
    [Buffer.from("rewarder"), payrollPda.toBuffer(), poolPda.toBuffer()],
    programId
  );
  const initStakingIx = new UpdateRewarderInstruction({
    payrollIndex: validPayrollIndex,
    amount,
  });
  const serializedData = initStakingIx.serialize();
  const dataBuffer = Buffer.from(serializedData);
  const rewardTokenPubKey = new PublicKey(parsedPoolData.rewardTokenMintAddress);
  const dstTokenAssociatedAccount = await getAssociatedTokenAddress(
    rewardTokenPubKey,
    rewardPda,
    true,
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID
  );
  const srcTokenAssociatedAccount = await getAssociatedTokenAddress(
    rewardTokenPubKey,
    creator,
    true,
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID
  );
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
        pubkey: poolPda,
      },
      {
        isSigner: false,
        isWritable: true,
        pubkey: rewardPda,
      },
      {
        isSigner: false,
        isWritable: true,
        pubkey: rewardTokenPubKey,
      },
      {
        isSigner: false,
        isWritable: true,
        pubkey: srcTokenAssociatedAccount,
      },
      {
        isSigner: false,
        isWritable: true,
        pubkey: dstTokenAssociatedAccount,
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
    programId: programId,
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
