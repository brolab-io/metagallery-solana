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
import { InitWithdrawInstruction } from "../serde/instructions/withdraw-nft";
import { getCurrentPayrollIndex } from "../util.service";

export async function withdraw(
  connection: Connection,
  creator: PublicKey,
  {
    pdaAccount,
  }: {
    pdaAccount: PublicKey;
  }
): Promise<any> {
  const NEXT_PUBLIC_SC_ADDRESS = process.env.NEXT_PUBLIC_SC_ADDRESS!;
  const programId = new PublicKey(NEXT_PUBLIC_SC_ADDRESS);
  const now = Math.floor(Date.now() / 1000);

  const accountInfo = await connection.getAccountInfo(pdaAccount);
  const eData: any = accountInfo?.data;
  const parsedData = StakingAccount.deserialize(eData);
  const poolAccount = new PublicKey(Buffer.from(parsedData.poolPdaAccount || []));
  const poolAccountInfo = await connection.getAccountInfo(poolAccount);
  const parsedPoolData = Pool.deserialize(poolAccountInfo?.data as any);
  const payrollIndex = getCurrentPayrollIndex(
    now,
    parsedPoolData.rewardPeriod.toNumber(),
    parsedPoolData.startAt.toNumber()
  );
  const [payrollPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("payroll"), Buffer.from(payrollIndex.toString()), poolAccount.toBuffer()],
    programId
  );

  const depositTokenMintAddress = new PublicKey(parsedData.stakingTokenMintAddress);
  const [stakingTokenDataPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("tokendata"), depositTokenMintAddress.toBuffer()],
    new PublicKey(NEXT_PUBLIC_SC_ADDRESS)
  );
  const withdrawAccount = new PublicKey(Buffer.from(parsedData.withdrawnAddress || []));
  const data = new InitWithdrawInstruction();
  const serializedData = data.serialize();
  const dataBuffer = Buffer.from(serializedData);
  const srcStakingTokenAssociatedAccount = await getAssociatedTokenAddress(
    depositTokenMintAddress,
    poolAccount,
    true,
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID
  );
  const dstStakingAssociatedAccount = await getAssociatedTokenAddress(
    depositTokenMintAddress,
    withdrawAccount,
    true,
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID
  );
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
        pubkey: pdaAccount,
      },
      {
        isSigner: false,
        isWritable: true,
        pubkey: poolAccount,
      },
      {
        isSigner: false,
        isWritable: true,
        pubkey: withdrawAccount,
      },
      {
        isSigner: false,
        isWritable: true,
        pubkey: depositTokenMintAddress,
      },
      {
        isSigner: false,
        isWritable: true,
        pubkey: srcStakingTokenAssociatedAccount,
      },
      {
        isSigner: false,
        isWritable: true,
        pubkey: dstStakingAssociatedAccount,
      },
      {
        isSigner: false,
        isWritable: true,
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
    programId,
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
