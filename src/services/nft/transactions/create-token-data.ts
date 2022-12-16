import { PublicKey, TransactionInstruction, SystemProgram } from "@solana/web3.js";
import BN from "bn.js";
import { UpdateTokenDataInstruction } from "../../serde/instructions/update-token-data";

export default async function updateTokenData(
  PROGRAM_ID: PublicKey,
  {
    account,
    power,
    mint,
  }: {
    power: BN;
    mint: PublicKey;
    account: PublicKey;
  }
) {
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from("tokendata"), mint.toBuffer()],
    PROGRAM_ID
  );
  const ix = new UpdateTokenDataInstruction({
    power,
  });
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
