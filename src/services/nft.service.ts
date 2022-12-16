import axios from "axios";
import { PROGRAM_ID, Metadata, MasterEditionV2 } from "@metaplex-foundation/mpl-token-metadata";
import { Connection, PublicKey } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { IWalletProvider } from "./wallet.service";
import { partialMintMasterEdition } from "./nft/master-edition";
import { partialMintCollection } from "./nft/collection";
import { partialMintNewEditionFromMaster } from "./nft/edition";
import { sendTransaction } from "./solana.service";
import { stakeAsset } from "./nft/stake";
import { TokenData } from "./serde/states/token-data";
import { pad } from "./util.service";
import base58 from "bs58";
import { CollectionData } from "./serde/states/collection-data";

type NftMetadata = {
  name: string;
  symbol: string;
  description: string;
  seller_fee_basis_points: number;
  image: string;
  attributes: [];
  collection: {
    name: string;
    family: string;
  };
  properties: {};
};

export type TokenMetdata = Metadata & {
  tokenData?: TokenData;
};

export const getNftMetadataFromUri = async (uri: string): Promise<NftMetadata> => {
  return axios.get(uri).then((res) => res.data);
};

export async function getMetaData(connection: Connection, mintAddress: string) {
  const mintPubKey = new PublicKey(mintAddress);
  const [originalEdition] = PublicKey.findProgramAddressSync(
    [Buffer.from("metadata", "utf-8"), PROGRAM_ID.toBuffer(), mintPubKey.toBuffer()],
    PROGRAM_ID
  );
  const originalEditionAccount = await connection.getAccountInfo(originalEdition);
  return Metadata.fromAccountInfo(originalEditionAccount as any);
}

export async function getMultiMetaData(connection: Connection, mintAddresses: string[]) {
  const mintPubKeys = mintAddresses.map((m) => {
    const [originalEdition] = PublicKey.findProgramAddressSync(
      [Buffer.from("metadata", "utf-8"), PROGRAM_ID.toBuffer(), new PublicKey(m).toBuffer()],
      PROGRAM_ID
    );
    return originalEdition;
  });
  const originalEditionAccounts = await connection.getMultipleAccountsInfo(mintPubKeys);
  return originalEditionAccounts.map((d) => Metadata.fromAccountInfo(d as any));
}
export async function getMultiTokenData(connection: Connection, mintAddresses: string[]) {
  const mintPubKeys = mintAddresses.map((m) => {
    const [originalEdition] = PublicKey.findProgramAddressSync(
      [Buffer.from("tokendata"), new PublicKey(m).toBuffer()],
      new PublicKey(process.env.NEXT_PUBLIC_SC_ADDRESS || "")
    );
    return originalEdition;
  });
  const originalEditionAccounts = await connection.getMultipleAccountsInfo(mintPubKeys);

  return originalEditionAccounts.map((d) => {
    try {
      return TokenData.deserializeToReadable(d?.data as any);
    } catch (error) {
      return null;
    }
  });
}

export async function getAssetsFromAddressV2(
  connection: Connection,
  address: PublicKey,
  programId: PublicKey = PROGRAM_ID
) {
  const assets = await connection.getProgramAccounts(programId, {
    filters: [
      {
        memcmp: {
          offset: 1,
          bytes: address.toBase58(),
        },
      },
    ],
  });
  return assets.map((a) => {
    return Metadata.fromAccountInfo(a.account);
  });
}

export async function getAssetsFromAddress(
  connection: Connection,
  address: PublicKey,
  programId: PublicKey = PROGRAM_ID
): Promise<TokenMetdata[]> {
  const accountList = await connection.getParsedTokenAccountsByOwner(address, {
    programId: TOKEN_PROGRAM_ID,
  });
  const tokenList = accountList.value
    .filter(
      (a) =>
        a.account.data.parsed.info.tokenAmount.amount === "1" &&
        a.account.data.program === "spl-token"
    )
    .filter((_, index) => index < 100)
    .map((t) => t.account.data.parsed.info.mint);

  const tokenData = await getMultiTokenData(connection, tokenList);

  return Promise.all(
    tokenList.map(async (m, index) => {
      const data = await getMetaData(connection, m);
      return {
        ...data[0],
        tokenData: tokenData[index] || undefined,
      } as TokenMetdata;
    })
  );
}
export async function checkCollection(
  connection: Connection,
  collectionAddress: string
): Promise<boolean> {
  const collectionPubKey = new PublicKey(collectionAddress);
  // const [originalEdition] = (PublicKey.findProgramAddressSync([
  //   Buffer.from('metadata', 'utf-8'),
  //   PROGRAM_ID.toBuffer(),
  //   collectionPubKey.toBuffer(),
  // ], PROGRAM_ID));
  const [editionPDA] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("metadata"),
      PROGRAM_ID.toBuffer(),
      collectionPubKey.toBuffer(),
      Buffer.from("edition"),
    ],
    PROGRAM_ID
  );
  // const originalEditionAccount = await connection.getAccountInfo(originalEdition);
  const masterEditon = await connection.getAccountInfo(editionPDA);
  // const account = await getAccount(connection, mint.address, 'finalized', TOKEN_PROGRAM_ID);
  let masterEditionV2;
  if (masterEditon) {
    masterEditionV2 = MasterEditionV2.fromAccountInfo(masterEditon as any)[0];
  }
  return !!masterEditionV2 && masterEditionV2.maxSupply?.toString() === "0";
}
export async function mint(
  type: string,
  provider: IWalletProvider,
  data: any[],
  connection: Connection
) {
  if (!provider || !provider.publicKey) {
    throw new Error(`you must firstly connect to a wallet!`);
  }
  const pk = provider.publicKey;
  let txData: any = [];
  if (type === "masteredition") {
    txData = await partialMintMasterEdition({
      wallet: pk,
      data,
      connection,
    });
  } else if (type === "collection") {
    txData = await partialMintCollection({
      wallet: pk,
      data,
      connection,
    });
  } else if (type === "edition") {
    txData = await partialMintNewEditionFromMaster({
      wallet: pk,
      data,
      connection,
    });
  }
  const serializedTxs: Buffer[] = txData.map((tx: any) => Buffer.from(tx));
  return sendTransaction(connection, provider, serializedTxs);
}

export async function stakeNft(provider: IWalletProvider, data: any, connection: Connection) {
  if (!provider || !provider.publicKey) {
    throw new Error(`you must firstly connect to a wallet!`);
  }
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from(pad(data.poolId, 16)), Buffer.from("pool")],
    new PublicKey(process.env.NEXT_PUBLIC_SC_ADDRESS!)
  );
  data.poolPda = pda;
  const serializedTx = await stakeAsset(connection, provider.publicKey, data);
  return sendTransaction(connection, provider, [serializedTx]);
}

export async function listOurCollections(connection: Connection) {
  const programId = new PublicKey(process.env.NEXT_PUBLIC_SC_ADDRESS!);
  const pdas = await connection.getProgramAccounts(programId, {
    filters: [
      {
        memcmp: {
          offset: 0,
          bytes: base58.encode(Buffer.from([107])),
        },
      },
    ],
  });
  const data = await connection.getMultipleAccountsInfo(pdas.map((p) => new PublicKey(p.pubkey)));
  const parsedPda = data.map((d) => {
    const parsed = CollectionData.deserializeToReadable(d?.data as any);
    return PublicKey.findProgramAddressSync(
      [
        Buffer.from("metadata", "utf-8"),
        PROGRAM_ID.toBuffer(),
        new PublicKey(parsed.collectionMintAddress).toBuffer(),
      ],
      PROGRAM_ID
    )[0];
  });
  const mintData = await connection.getMultipleAccountsInfo(parsedPda);
  const parsedMint = mintData.map((d) => {
    return Metadata.fromAccountInfo(d as any)[0];
  });
  return parsedMint;
}

export async function listOurNftsFromAddress(connection: Connection, address: PublicKey) {
  const nfts = await getAssetsFromAddress(connection, address);
  const tokenPdas = nfts.map((nft) => {
    return PublicKey.findProgramAddressSync(
      [Buffer.from("tokendata"), (nft as any).mint.toBuffer()],
      new PublicKey(process.env.NEXT_PUBLIC_SC_ADDRESS!)
    )[0];
  });
  const data = await connection.getMultipleAccountsInfo(tokenPdas);
  const filteredNfts = nfts.filter((nft, index) => !!data[index]?.data);
  return filteredNfts;
}
