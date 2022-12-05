import BN from "bn.js";
import {
  Connection,
  PublicKey,
  SystemProgram,
  TransactionInstruction,
  Transaction,
} from "@solana/web3.js";
import { CreatePoolIns } from "../serde/instructions/create-pool";
import { pad } from "../util.service";
import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
} from "@solana/spl-token";
export async function createPool(
  connection: Connection,
  creator: PublicKey,
  {
    name,
    rewardPeriod,
    rewardTokenMintAddress,
    collection,
    poolType,
  }: {
    name: string;
    rewardPeriod: BN;
    rewardTokenMintAddress: PublicKey;
    collection: PublicKey;
    poolType: number;
  }
) {
  const { NEXT_PUBLIC_SC_ADDRESS = "" } = process.env;
  console.log({
    name,
    rewardPeriod,
    rewardTokenMintAddress: rewardTokenMintAddress.toBase58(),
    collection: collection.toBase58(),
    poolType,
  });
  const newName = pad(name, 16);
  const [pda] = await PublicKey.findProgramAddress(
    [Buffer.from(newName), Buffer.from("pool"), creator.toBuffer()],
    new PublicKey(NEXT_PUBLIC_SC_ADDRESS)
  );
  const rewardAta = await getAssociatedTokenAddress(
    rewardTokenMintAddress,
    pda,
    true,
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID
  );
  const initPoolIx = new CreatePoolIns({
    name: Buffer.from(newName),
    rewardPeriod,
    startAt: new BN(Date.now() / 1000),
    creator: creator.toBuffer(),
    collection: collection.toBuffer(),
    poolType,
  });
  const serializedData = initPoolIx.serialize();
  const dataBuffer = Buffer.from(serializedData);
  // console.log(testPub.toBuffer());
  console.log(pda.toBase58());
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
        isWritable: false,
        pubkey: rewardTokenMintAddress,
      },
      {
        isSigner: false,
        isWritable: true,
        pubkey: rewardAta,
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
