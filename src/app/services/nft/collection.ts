import {
  PublicKey,
  Connection,
  Transaction
} from '@solana/web3.js';
import {
  createSplToken
} from './transactions/common';
import { verifySizeCollection }from './verify-collection';

 import {
  createCreateMasterEditionV3Instruction,
  createCreateMetadataAccountV3Instruction,
  Creator,
  Collection,
  DataV2,
  Uses,
  UseMethod,
  PROGRAM_ADDRESS,
  CollectionDetails,
} from '@metaplex-foundation/mpl-token-metadata';
export async function mintCollection({
  connection,
  address,
  uri,
  symbol = '',
  size,
  name,
  collection = '',
  creators = [],
  sellerFeeBasisPoints,
}: {
  connection: Connection,
  address: string,
  size: number,
  name: string,
  sellerFeeBasisPoints: number,
  uri: string,
  collection: string,
  creators: {address: string, verified: boolean, share: number} [],
  symbol: string,
}) {
  console.log({
    size,
    address,
    uri,
    symbol,
    name,
    collection,
    creators,
    sellerFeeBasisPoints,
  });
  const walletAddress = new PublicKey(address);
  const {
    mint,
    createAccount,
    createInitializeMint,
    createAta,
    mintTo
  } =
  await createSplToken(connection, walletAddress);
  const {
    blockhash
  } =  await connection.getLatestBlockhash({
    commitment: 'finalized',
  })
  // const metadataPDA = await Metadata.getPDA(connection, mint.publicKey);
  const programPubkey = new PublicKey(PROGRAM_ADDRESS);
  const [metadataPDA] = (await PublicKey.findProgramAddress([
    Buffer.from('metadata'),
    programPubkey.toBuffer(),
    mint.publicKey.toBuffer()
  ], programPubkey));
  // const editionPDA = await MasterEdition.getPDA(mint.publicKey);
  const [editionPDA] =  (await PublicKey.findProgramAddress([
    Buffer.from('metadata'),
    programPubkey.toBuffer(),
    mint.publicKey.toBuffer(),
    Buffer.from('edition'),
  ], programPubkey));
  const creatorsData = creators.reduce<Creator []>((memo, {
    address,
    share
  }) => {
    const creator: Creator = {
      address: new PublicKey(address),
      share,
      verified: address === walletAddress.toBase58(),
    };

    memo = [...memo as any, creator];

    return memo;
  }, []);
  const collectionData: Collection | null = collection ? {
    key: new PublicKey(collection),
    verified: false,
  } : null;
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
  const collectionDetails: CollectionDetails = { __kind: 'V1', size };
;
  const createMetadataIns = createCreateMetadataAccountV3Instruction({
    metadata: metadataPDA,
    mint: mint.publicKey,
    mintAuthority: walletAddress,
    payer: walletAddress,
    updateAuthority: walletAddress
  }, {
    createMetadataAccountArgsV3: {
      data: metadataData,
      isMutable: false,
      collectionDetails: collectionDetails,
    }
  });
  const masterEditionIns = createCreateMasterEditionV3Instruction({
    edition: editionPDA,
    metadata: metadataPDA,
    mint: mint.publicKey,
    mintAuthority: walletAddress,
    payer: walletAddress,
    updateAuthority: walletAddress
  }, {
    createMasterEditionArgs: {
      maxSupply: 0,
    }
  });
  const transaction = new Transaction({
    feePayer: walletAddress,
  });
  transaction
    .add(createAccount)
    .add(createInitializeMint)
    .add(createMetadataIns)
    .add(createAta)
    .add(mintTo)
    .add(masterEditionIns)
  transaction.recentBlockhash = blockhash;
  // verify collection
  if (collection) {
    const verifyIns = await verifySizeCollection({
      collection,
      address,
      token: mint.publicKey.toBase58(),
    });
    transaction.add(verifyIns);
  }
  transaction.partialSign(mint);
  console.log(transaction);
  return transaction.serialize({
    verifySignatures: false,
    requireAllSignatures: false,
  })
}

export async function partialMintCollection({
  wallet, data, connection
} : {
  wallet: PublicKey,
  data: {
    uri: string,
    size: number,
    name: string,
    collection: string,
    sellerFeeBasisPoints: number,
    symbol: string,
    creators: any []
  } [],
  connection: Connection
}) {
  console.log(connection);
  let mints: any = [];
  for (const d of data) {
    const {
      uri,
      size = 1,
      name,
      collection,
      sellerFeeBasisPoints,
      symbol,
      creators,
    } = d;
    const mint = await mintCollection({
      name,
      sellerFeeBasisPoints,
      collection,
      symbol,
      creators,
      address: wallet.toBase58(),
      uri,
      size,
      connection,
    });
    mints.push(mint)
  }
  const serializedTxs: Buffer[]= mints.map((tx: any) => Buffer.from(tx));
  return serializedTxs;
}