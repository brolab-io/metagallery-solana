import { PublicKey, TransactionInstruction, SystemProgram } from "@solana/web3.js";
import { UpdateCollectionDataInstruction } from "../../serde/instructions/update-collection-data";

export default async function updateCollectionData(
  PROGRAM_ID: PublicKey,
  {
    account,
    mint,
  }: {
    mint: PublicKey;
    account: PublicKey;
  }
) {
  const [pda] = await PublicKey.findProgramAddress(
    [Buffer.from("collectiondata"), mint.toBuffer()],
    PROGRAM_ID
  );
  const ix = new UpdateCollectionDataInstruction();
  const data = Buffer.from(ix.serialize());
  const instruction = new TransactionInstruction({
    programId: PROGRAM_ID,
    data,
    keys: [
      {
        pubkey: account,
        isSigner: true,
        isWritable: false,
      },
      {
        pubkey: mint,
        isSigner: false,
        isWritable: false,
      },
      {
        pubkey: pda,
        isSigner: false,
        isWritable: true,
      },
      {
        pubkey: SystemProgram.programId,
        isSigner: false,
        isWritable: false,
      },
    ],
  });
  return instruction;
}
