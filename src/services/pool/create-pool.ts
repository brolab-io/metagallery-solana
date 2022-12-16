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
import { ASSOCIATED_TOKEN_PROGRAM_ID } from "@solana/spl-token";

export async function createPool(
  connection: Connection,
  creator: PublicKey,
  {
    id,
    name,
    rewardPeriod,
    collection,
    poolType,
  }: {
    id: string;
    name: string;
    rewardPeriod: BN;
    collection: PublicKey;
    poolType: number;
  }
) {
  const NEXT_PUBLIC_SC_ADDRESS = process.env.NEXT_PUBLIC_SC_ADDRESS!;
  console.log({
    id,
    name,
    rewardPeriod,
    collection: collection.toBase58(),
    poolType,
  });
  const newId = pad(id, 16);
  const newName = pad(name, 16);

  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from(newId), Buffer.from("pool")],
    new PublicKey(NEXT_PUBLIC_SC_ADDRESS)
  );

  const initPoolIx = new CreatePoolIns({
    id: Buffer.from(newId),
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
