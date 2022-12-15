import { PublicKey, Connection, Transaction } from "@solana/web3.js";

import { createSplToken } from "./transactions/common";
import { verifySizeCollection } from "./verify-collection";
import BN from "bn.js";
import {
  createCreateMasterEditionV3Instruction,
  createCreateMetadataAccountV3Instruction,
  Creator,
  Collection,
  DataV2,
  Uses,
  UseMethod,
  PROGRAM_ADDRESS,
} from "@metaplex-foundation/mpl-token-metadata";
import updateTokenData from "./transactions/create-token-data";
export async function mintMasterEdition({
  connection,
  address,
  uri,
  symbol = "",
  name,
  collection = "",
  creators = [],
  sellerFeeBasisPoints,
  maxSupply,
  tokenPower,
}: {
  connection: Connection;
  address: string;
  maxSupply: number;
  name: string;
  sellerFeeBasisPoints: number;
  uri: string;
  collection: string;
  creators: { address: string; verified: boolean; share: number }[];
  symbol: string;
  tokenPower: number;
}) {
  console.log({
    address,
    uri,
    symbol,
    name,
    collection,
    creators,
    sellerFeeBasisPoints,
    maxSupply,
    tokenPower,
  });
  const walletAddress = new PublicKey(address);
  const { mint, createAccount, createInitializeMint, createAta, mintTo } = await createSplToken(
    connection,
    walletAddress
  );
  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash({
    commitment: "finalized",
  });
  // const metadataPDA = await Metadata.getPDA(connection, mint.publicKey);
  const programPubkey = new PublicKey(PROGRAM_ADDRESS);
  const [metadataPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from("metadata"), programPubkey.toBuffer(), mint.publicKey.toBuffer()],
    programPubkey
  );
  // const editionPDA = await MasterEdition.getPDA(mint.publicKey);
  const [editionPDA] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("metadata"),
      programPubkey.toBuffer(),
      mint.publicKey.toBuffer(),
      Buffer.from("edition"),
    ],
    programPubkey
  );
  const creatorsData = creators.reduce<Creator[]>((memo, { address, share }) => {
    const creator: Creator = {
      address: new PublicKey(address),
      share,
      verified: address === walletAddress.toBase58(),
    };

    memo = [...(memo as any), creator];

    return memo;
  }, []);
  const collectionData: Collection | null = collection
    ? {
        key: new PublicKey(collection),
        verified: false,
      }
    : null;
  const uses: Uses = {
    useMethod: UseMethod.Single,
    total: 1,
    remaining: 1,
  };
  const metadataData: DataV2 = {
    name,
    symbol,
    uri,
    sellerFeeBasisPoints,
    creators: creatorsData.length ? creatorsData : null,
    collection: collectionData,
    uses,
  };
  const createMetadataIns = createCreateMetadataAccountV3Instruction(
    {
      metadata: metadataPDA,
      mint: mint.publicKey,
      mintAuthority: walletAddress,
      payer: walletAddress,
      updateAuthority: walletAddress,
    },
    {
      createMetadataAccountArgsV3: {
        data: metadataData,
        isMutable: false,
        collectionDetails: null,
      },
    }
  );
  const masterEditionIns = createCreateMasterEditionV3Instruction(
    {
      edition: editionPDA,
      metadata: metadataPDA,
      mint: mint.publicKey,
      mintAuthority: walletAddress,
      payer: walletAddress,
      updateAuthority: walletAddress,
    },
    {
      createMasterEditionArgs: {
        maxSupply,
      },
    }
  );
  const transaction = new Transaction({
    feePayer: walletAddress,
    blockhash,
    lastValidBlockHeight,
  });
  const updateTokenIx = await updateTokenData(
    new PublicKey(process.env.NEXT_PUBLIC_SC_ADDRESS as any),
    {
      account: walletAddress,
      power: new BN(tokenPower),
      mint: mint.publicKey,
    }
  );
  transaction
    .add(createAccount)
    .add(createInitializeMint)
    .add(createMetadataIns)
    .add(createAta)
    .add(mintTo)
    .add(masterEditionIns)
    .add(updateTokenIx);
  //arweave.net/Hc-5VnE3dRwUZPAEEZl5GcFxmGr5hqnyxVjWFSWW11Q
  // verify collection
  https: if (collection) {
    const verifyIns = await verifySizeCollection({
      collection,
      address,
      token: mint.publicKey.toBase58(),
    });
    transaction.add(verifyIns);
  }
  transaction.partialSign(mint);
  return transaction.serialize({
    verifySignatures: true,
    requireAllSignatures: false,
  });
}

export async function partialMintMasterEdition({
  wallet,
  data,
  connection,
}: {
  wallet: PublicKey;
  data: {
    uri: string;
    maxSupply: number;
    name: string;
    collection: string;
    sellerFeeBasisPoints: number;
    symbol: string;
    tokenPower: number;
    creators: any[];
  }[];
  connection: Connection;
}) {
  let mints: any = [];
  for (const d of data) {
    const {
      uri,
      maxSupply = 1,
      name,
      collection,
      sellerFeeBasisPoints,
      symbol,
      creators,
      tokenPower = 1,
    } = d;
    const mint = await mintMasterEdition({
      name,
      sellerFeeBasisPoints,
      collection,
      symbol,
      creators,
      address: wallet.toBase58(),
      uri,
      maxSupply,
      connection,
      tokenPower,
    });
    mints.push(mint);
  }
  const serializedTxs: Buffer[] = mints.map((tx: any) => Buffer.from(tx));
  return serializedTxs;
}
