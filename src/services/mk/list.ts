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
import { PROGRAM_ID as MP_PROGRAM_ID } from "@metaplex-foundation/mpl-token-metadata";
import { ListIns } from "../serde/instructions/list";

export async function list(
  connection: Connection,
  creator: PublicKey,
  {
    tokenMintAddress,
    validUntil,
    price,
    tradeToken,
  }: {
    tokenMintAddress: PublicKey;
    validUntil: Date;
    price: BN;
    tradeToken: PublicKey;
  }
) {
  const NEXT_PUBLIC_MK_ADDRESS = process.env.NEXT_PUBLIC_MK_ADDRESS!;
  const programId = new PublicKey(NEXT_PUBLIC_MK_ADDRESS);
  const [salePda] = PublicKey.findProgramAddressSync(
    [Buffer.from("saleitem"), tokenMintAddress.toBuffer()],
    new PublicKey(programId)
  );
  const [pricePda] = PublicKey.findProgramAddressSync(
    [Buffer.from("priceitem"), Buffer.from("1"), salePda.toBuffer()],
    new PublicKey(programId)
  );

  const [metadataPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from("metadata"), MP_PROGRAM_ID.toBuffer(), tokenMintAddress.toBuffer()],
    MP_PROGRAM_ID
  );

  const srcAta = await getAssociatedTokenAddress(
    tokenMintAddress,
    creator,
    true,
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID
  );
  const dstAta = await getAssociatedTokenAddress(
    tokenMintAddress,
    salePda,
    true,
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID
  );
  const initPoolIx = new ListIns({
    validUntil: new BN(Math.floor(validUntil.valueOf() / 1000)),
    price,
    wallet: creator.toBuffer(),
    tradeToken: tradeToken.toBuffer(),
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
        pubkey: salePda,
      },
      {
        isSigner: false,
        isWritable: true,
        pubkey: pricePda,
      },
      {
        isSigner: false,
        isWritable: false,
        pubkey: tokenMintAddress,
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
        isWritable: true,
        pubkey: metadataPDA,
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
