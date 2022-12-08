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
import { Payroll } from "../serde/states/payroll";
export async function updateReward(
  connection: Connection,
  creator: PublicKey,
  {
    poolPda,
    amount,
    payrollIndex,
    rewardTokenMint,
  }: {
    amount: BN;
    payrollIndex: BN | null;
    poolPda: PublicKey;
    rewardTokenMint: PublicKey;
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
  const payrollPdaInfo = await connection.getAccountInfo(payrollPda);
  let numberOfRewardTokens = new BN(1);
  if (payrollPdaInfo && payrollPdaInfo.data && payrollPdaInfo.data.length) {
    const parsedPayrollData = Payroll.deserialize(payrollPdaInfo?.data as Buffer);
    numberOfRewardTokens = parsedPayrollData.numberOfRewardTokens.add(new BN(1));
  }

  const [payrollTokenPda] = await PublicKey.findProgramAddress(
    [
      Buffer.from("payrolltoken"),
      Buffer.from(validPayrollIndex.toString()),
      rewardTokenMint.toBuffer(),
      payrollPda.toBuffer(),
    ],
    programId
  );
  const [payrollIndexPda] = await PublicKey.findProgramAddress(
    [
      Buffer.from("payrollindex"),
      Buffer.from(numberOfRewardTokens.toString()),
      payrollPda.toBuffer(),
    ],
    programId
  );
  const initStakingIx = new UpdateRewarderInstruction({
    payrollIndex: validPayrollIndex,
    amount,
  });
  const serializedData = initStakingIx.serialize();
  const dataBuffer = Buffer.from(serializedData);
  const dstTokenAssociatedAccount = await getAssociatedTokenAddress(
    rewardTokenMint,
    payrollPda,
    true,
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID
  );
  const srcTokenAssociatedAccount = await getAssociatedTokenAddress(
    rewardTokenMint,
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
        pubkey: rewardTokenMint,
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
        pubkey: payrollTokenPda,
      },
      {
        isSigner: false,
        isWritable: true,
        pubkey: payrollIndexPda,
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
