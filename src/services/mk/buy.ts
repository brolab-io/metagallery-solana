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
import { BuyIns } from "../serde/instructions/buy";
import { PriceItem } from "../serde/states/price-item";
import { SaleItem } from "../serde/states/sale-item";

export async function buy(
  connection: Connection,
  creator: PublicKey,
  {
    salePda,
    priceIndex,
  }: {
    salePda: PublicKey;
    priceIndex: number;
  }
) {
  const NEXT_PUBLIC_MK_ADDRESS = process.env.NEXT_PUBLIC_MK_ADDRESS!;
  const programId = new PublicKey(NEXT_PUBLIC_MK_ADDRESS);
  const saleAccountInfo = await connection.getAccountInfo(salePda);
  const saleData = SaleItem.deserialize(saleAccountInfo?.data as Buffer);
  const token = new PublicKey(saleData.token);
  const salerWallet = new PublicKey(saleData.seller);
  const [pricePda] = PublicKey.findProgramAddressSync(
    [Buffer.from("priceitem"), Buffer.from(priceIndex.toString()), salePda.toBuffer()],
    new PublicKey(programId)
  );
  const priceAccountInfo = await connection.getAccountInfo(pricePda);
  const priceData = PriceItem.deserialize(priceAccountInfo?.data as Buffer);
  let tradeToken = new PublicKey(priceData.tradeToken);
  const srcTradeAta = await getAssociatedTokenAddress(
    tradeToken,
    creator,
    true,
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID
  );
  const dstTradeAta = await getAssociatedTokenAddress(
    tradeToken,
    salerWallet,
    true,
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID
  );
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

  const initPoolIx = new BuyIns();
  const serializedData = initPoolIx.serialize();
  const dataBuffer = Buffer.from(serializedData);
  console.log(dstTradeAta.toBase58());
  console.log(salePda.toBase58());
  console.log(tradeToken.toBase58());
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
        pubkey: salerWallet,
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
        isWritable: true,
        pubkey: tradeToken,
      },
      {
        isSigner: false,
        isWritable: true,
        pubkey: srcTradeAta,
      },
      {
        isSigner: false,
        isWritable: true,
        pubkey: dstTradeAta,
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
