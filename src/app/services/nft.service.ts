import { PROGRAM_ID, Metadata, MasterEditionV2 } from "@metaplex-foundation/mpl-token-metadata";
import { Connection, PublicKey } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { IWalletProvider } from "./wallet.service";
import { partialMintMasterEdition } from "./nft/master-edition";
import { partialMintCollection } from "./nft/collection";
import { partialMintNewEditionFromMaster } from "./nft/edition";
import { sendTransaction } from "./solana.service";
import { stakeAsset } from "./nft/stake";
import { StakingAccount } from "./serde/states/stake";
import base58 from "bs58";

export async function getMetaData(connection: Connection, mintAddress: string) {
  const mintPubKey = new PublicKey(mintAddress);
  const [originalEdition] = await PublicKey.findProgramAddress(
    [Buffer.from("metadata", "utf-8"), PROGRAM_ID.toBuffer(), mintPubKey.toBuffer()],
    PROGRAM_ID
  );
  const originalEditionAccount = await connection.getAccountInfo(originalEdition);
  return Metadata.fromAccountInfo(originalEditionAccount as any);
}

export async function getAssetsFromAddressV2(
  connection: Connection,
  address: PublicKey,
  programId: PublicKey = PROGRAM_ID
) {
  const assets = await connection.getProgramAccounts(programId, {
    // filters: [
    //   {
    //     memcmp: {
    //       offset: 1,
    //       bytes: address.toBase58(),
    //     },
    //   },
    // ],
  });
  console.log("getAssetsFromAddressV2", assets);
  return assets.map((a) => {
    return Metadata.fromAccountInfo(a.account);
  });
}

export async function getStakingsForAddress(
  connection: Connection,
  address: PublicKey,
  programId: PublicKey = PROGRAM_ID
) {
  const assets = await connection.getProgramAccounts(programId, {
    filters: [
      {
        memcmp: {
          offset: 137,
          bytes: address.toBase58(),
        },
      },
      {
        memcmp: {
          offset: 0,
          bytes: base58.encode(Buffer.from([101])),
        },
      },
    ],
  });
  const mintPubkeys: any = [];
  const stakingData = assets
    .map((a) => {
      try {
        const data = StakingAccount.deserializeToReadable(a.account.data as Buffer);
        if (!data) {
          throw new Error(`Invalid mint data, ignore`);
        }
        const mintPubkey = data.stakingTokenMintAddress;
        mintPubkeys.push(mintPubkey);
        return a;
      } catch (error) {
        // console.log(error);
        return null;
      }
    })
    .filter((data) => data);
  const mintData = await Promise.all(mintPubkeys.map((m: any) => getMetaData(connection, m)));
  return stakingData.map((s, i) => ({
    staking: s,
    mintData: mintData[i][0],
  }));
}
export async function getAssetsFromAddress(
  connection: Connection,
  address: PublicKey,
  programId: PublicKey = PROGRAM_ID
) {
  const accountList = await connection.getParsedTokenAccountsByOwner(address, {
    programId: TOKEN_PROGRAM_ID,
  });
  const tokenList = accountList.value
    .filter(
      (a) =>
        a.account.data.parsed.info.tokenAmount.amount === "1" &&
        a.account.data.program === "spl-token"
    )
    .filter((_, index) => index < 20);
  return Promise.all(
    tokenList.map(async (t) => {
      return (await getMetaData(connection, t.account.data.parsed.info.mint))[0];
    })
  );
}

export async function checkCollection(
  connection: Connection,
  collectionAddress: string
): Promise<boolean> {
  const collectionPubKey = new PublicKey(collectionAddress);
  // const [originalEdition] = (await PublicKey.findProgramAddress([
  //   Buffer.from('metadata', 'utf-8'),
  //   PROGRAM_ID.toBuffer(),
  //   collectionPubKey.toBuffer(),
  // ], PROGRAM_ID));
  const [editionPDA] = await PublicKey.findProgramAddress(
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
  if (!provider) {
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
  if (!provider) {
    throw new Error(`you must firstly connect to a wallet!`);
  }
  const serializedTx = await stakeAsset(connection, provider.publicKey, data);
  return sendTransaction(connection, provider, [serializedTx]);
}
