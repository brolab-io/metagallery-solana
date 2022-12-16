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
import { SaleItem } from "../serde/states/sale-item";
import { DelistIns } from "../serde/instructions/delist";

export async function delist(
  connection: Connection,
  creator: PublicKey,
  {
    salePda,
  }: {
    salePda: PublicKey;
  }
) {
  const NEXT_PUBLIC_MK_ADDRESS = process.env.NEXT_PUBLIC_MK_ADDRESS!;
  const programId = new PublicKey(NEXT_PUBLIC_MK_ADDRESS);
  const saleAccountInfo = await connection.getAccountInfo(salePda);
  const saleData = SaleItem.deserialize(saleAccountInfo?.data as Buffer);
  const token = new PublicKey(saleData.token);
  const srcNftAta = await getAssociatedTokenAddress(
    token,
    salePda,
    true,
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID
  );
  const dstNftAta = await getAssociatedTokenAddress(
    token,
    creator,
    true,
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID
  );

  const delistIx = new DelistIns();
  const serializedData = delistIx.serialize();
  const dataBuffer = Buffer.from(serializedData);
  console.log(salePda.toBase58());
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
        pubkey: salePda,
      },
      {
        isSigner: false,
        isWritable: false,
        pubkey: token,
      },
      {
        isSigner: false,
        isWritable: true,
        pubkey: srcNftAta,
      },
      {
        isSigner: false,
        isWritable: true,
        pubkey: dstNftAta,
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
