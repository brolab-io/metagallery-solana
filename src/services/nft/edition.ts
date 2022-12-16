import BN from "bn.js";
import { PublicKey, Connection, Transaction } from "@solana/web3.js";
import {
  createMintNewEditionFromMasterEditionViaTokenInstruction,
  PROGRAM_ADDRESS,
  MasterEditionV2,
} from "@metaplex-foundation/mpl-token-metadata";
import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
} from "@solana/spl-token";
import { createSplToken } from "./transactions/common";
export async function mintEditionFromMaster({
  connection,
  address,
  masterEdition,
  editionIndex = 1,
}: {
  connection: Connection;
  address: string;
  masterEdition: string;
  editionIndex: number;
}) {
  console.log({
    connection,
    address,
    masterEdition,
  });
  const walletAddress = new PublicKey(address);
  const { mint, createAccount, createInitializeMint, createAta, mintTo } = await createSplToken(
    connection,
    walletAddress
  );
  const masterPublicMint = new PublicKey(masterEdition);
  // const metadataPDA = await Metadata.getPDA(connection, mint.publicKey);
  const programPubkey = new PublicKey(PROGRAM_ADDRESS);
  const [metadataPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from("metadata", "utf-8"), programPubkey.toBuffer(), mint.publicKey.toBuffer()],
    programPubkey
  );
  // const editionPDA = await MasterEdition.getPDA(mint.publicKey);
  const [editionPDA] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("metadata", "utf-8"),
      programPubkey.toBuffer(),
      mint.publicKey.toBuffer(),
      Buffer.from("edition", "utf-8"),
    ],
    programPubkey
  );
  const [originalEditionPDA] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("metadata", "utf-8"),
      programPubkey.toBuffer(),
      masterPublicMint.toBuffer(),
      Buffer.from("edition", "utf-8"),
    ],
    programPubkey
  );
  const [originalMetadataPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from("metadata", "utf-8"), programPubkey.toBuffer(), masterPublicMint.toBuffer()],
    programPubkey
  );
  const tokenAccount = await getAssociatedTokenAddress(
    masterPublicMint,
    walletAddress,
    false,
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID
  );
  const originalEditionAccount = await connection.getAccountInfo(originalEditionPDA);
  const masterEditionInfo = MasterEditionV2.fromAccountInfo(originalEditionAccount as any)[0];
  // const edition = masterEditionInfo.supply.add(new BN(1));
  const edition = new BN(masterEditionInfo.supply).add(new BN(editionIndex));
  const [editionMarkPda] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("metadata", "utf-8"),
      programPubkey.toBuffer(),
      new PublicKey(masterEdition).toBuffer(),
      Buffer.from("edition", "utf-8"),
      Buffer.from(edition.div(new BN(248)).toString()),
    ],
    programPubkey
  );
  const editionIns = createMintNewEditionFromMasterEditionViaTokenInstruction(
    {
      newEdition: editionPDA,
      newMetadata: metadataPDA,
      newMint: mint.publicKey,
      newMintAuthority: walletAddress,
      payer: walletAddress,
      newMetadataUpdateAuthority: walletAddress,
      masterEdition: originalEditionPDA,
      editionMarkPda,
      tokenAccountOwner: walletAddress,
      metadata: originalMetadataPDA,
      tokenAccount: tokenAccount,
    },
    {
      mintNewEditionFromMasterEditionViaTokenArgs: {
        edition,
      },
    }
  );
  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash({
    commitment: "finalized",
  });
  const transaction = new Transaction({
    feePayer: walletAddress,
    blockhash,
    lastValidBlockHeight,
  });
  transaction
    .add(createAccount)
    .add(createInitializeMint)
    .add(createAta)
    .add(mintTo)
    .add(editionIns);
  transaction.partialSign(mint);

  return transaction.serialize({
    verifySignatures: true,
    requireAllSignatures: false,
  });
}
async function mintMultiEditionFromMaster({
  connection,
  wallet,
  masterEdition,
  numberOfEditions = 1,
}: {
  connection: Connection;
  wallet: PublicKey;
  masterEdition: string;
  numberOfEditions: number;
}) {
  console.log({
    connection,
    wallet,
    masterEdition,
    numberOfEditions,
  });
  const txs: Buffer[] = [];
  for (let i = 0; i < numberOfEditions; ++i) {
    const tx = await mintEditionFromMaster({
      connection,
      address: wallet.toBase58(),
      masterEdition,
      editionIndex: i + 1,
    });
    txs.push(tx);
  }
  return txs;
}
export async function partialMintNewEditionFromMaster({
  wallet,
  data,
  connection,
}: {
  wallet: PublicKey;
  data: {
    masterEdition: string;
    numberOfEditions: number;
  }[];
  connection: Connection;
}) {
  console.log(data);
  let mints: any = [];
  for (const d of data) {
    const { masterEdition, numberOfEditions } = d;
    const mint = await mintMultiEditionFromMaster({
      wallet,
      connection,
      masterEdition,
      numberOfEditions,
    });
    mints = mints.concat(mint);
  }
  const serializedTxs: Buffer[] = mints.map((tx: any) => Buffer.from(tx));
  return serializedTxs;
}
