import base58 from "bs58";
import BN from "bn.js";
import { Connection, GetProgramAccountsFilter, PublicKey } from "@solana/web3.js";
import { IWalletProvider } from "./wallet.service";
import { list } from "./mk/list";
import { buy } from "./mk/buy";

import { sendTransaction } from "./solana.service";
import { getMultiMetaData, getMultiTokenData, TokenMetdata } from "./nft.service";
import { SaleItem } from "./serde/states/sale-item";
import { PriceItem, TPriceItem } from "./serde/states/price-item";
import { Metadata } from "@metaplex-foundation/mpl-token-metadata";
import { delist } from "./mk/delist";

export async function listNft(provider: IWalletProvider, data: any = {}, connection: Connection) {
  if (!provider || !provider.publicKey) {
    throw new Error(`you must firstly connect to a wallet!`);
  }
  const pk = provider.publicKey;
  const serializedTx = await list(connection, pk, {
    validUntil: new Date(data.validUntil),
    price: new BN(data.price),
    tokenMintAddress: new PublicKey(data.tokenMintAddress),
    tradeToken: new PublicKey(data.tradeToken),
  });
  return sendTransaction(connection, provider, [serializedTx]);
}

export async function buyNft(provider: IWalletProvider, data: any = {}, connection: Connection) {
  if (!provider || !provider.publicKey) {
    throw new Error(`you must firstly connect to a wallet!`);
  }

  const programId = new PublicKey(process.env.NEXT_PUBLIC_MK_ADDRESS!);

  const [salePda] = PublicKey.findProgramAddressSync(
    [Buffer.from("saleitem"), data.tokenMintAddress.toBuffer()],
    new PublicKey(programId)
  );

  const pk = provider.publicKey;
  const serializedTx = await buy(connection, pk, {
    salePda,
    priceIndex: data.priceIndex,
  });

  return sendTransaction(connection, provider, [serializedTx]);
}

export async function delistNft(provider: IWalletProvider, data: any = {}, connection: Connection) {
  if (!provider || !provider.publicKey) {
    throw new Error(`you must firstly connect to a wallet!`);
  }

  const programId = new PublicKey(process.env.NEXT_PUBLIC_MK_ADDRESS!);
  const [salePda] = PublicKey.findProgramAddressSync(
    [Buffer.from("saleitem"), data.tokenMintAddress.toBuffer()],
    new PublicKey(programId)
  );

  const pk = provider.publicKey;
  const serializedTx = await delist(connection, pk, {
    salePda,
  });
  return sendTransaction(connection, provider, [serializedTx]);
}

export async function getListingItem(connection: Connection, tokenMintAddress: PublicKey) {
  const programId = new PublicKey(process.env.NEXT_PUBLIC_MK_ADDRESS!);

  const [salePda] = PublicKey.findProgramAddressSync(
    [Buffer.from("saleitem"), tokenMintAddress.toBuffer()],
    new PublicKey(programId)
  );

  const [pricePda] = PublicKey.findProgramAddressSync(
    [Buffer.from("priceitem"), Buffer.from("1"), salePda.toBuffer()],
    new PublicKey(programId)
  );
  const priceAccount = await connection.getAccountInfo(pricePda);
  const priceData = PriceItem.deserialize(priceAccount?.data as Buffer);

  const saleAccount = await connection.getAccountInfo(salePda);
  const saleData = SaleItem.deserializeToReadable(saleAccount?.data as Buffer);
  const [mintData] = await Promise.all([
    getMultiMetaData(connection, [tokenMintAddress.toBase58()]),
  ]);
  const [tokenData] = await Promise.all([
    getMultiTokenData(connection, [tokenMintAddress.toBase58()]),
  ]);
  return {
    ...mintData[0][0],
    tokenData: tokenData[0],
    sale: saleData,
    price: priceData,
  };
}

export async function getMultiPriceData(connection: Connection, mintPubKeys: string[]) {
  const programId = new PublicKey(process.env.NEXT_PUBLIC_MK_ADDRESS!);
  const pricePubKeys = mintPubKeys.map((mintPubKey) => {
    const [salePda] = PublicKey.findProgramAddressSync(
      [Buffer.from("saleitem"), new PublicKey(mintPubKey).toBuffer()],
      new PublicKey(programId)
    );
    const [pricePda] = PublicKey.findProgramAddressSync(
      [Buffer.from("priceitem"), Buffer.from("1"), salePda.toBuffer()],
      new PublicKey(programId)
    );
    return pricePda;
  });
  const originalEditionAccounts = await connection.getMultipleAccountsInfo(pricePubKeys);

  return originalEditionAccounts.map((d) => {
    try {
      return PriceItem.deserialize(d?.data as any);
    } catch (error) {
      return null;
    }
  });
}

export async function getListingsForAddress(connection: Connection, address?: PublicKey) {
  const programId = new PublicKey(process.env.NEXT_PUBLIC_MK_ADDRESS!);
  const filters: GetProgramAccountsFilter[] = [
    {
      memcmp: {
        offset: 0,
        bytes: base58.encode(Buffer.from([100])),
      },
    },
  ];
  if (address) {
    filters.push({
      memcmp: {
        offset: 1 + 8 + 8 + 32 + 32,
        bytes: address.toBase58(),
      },
    });
  }
  const assets = await connection.getProgramAccounts(programId, {
    filters,
  });

  const mintPubkeys: any = [];
  const saleData = assets
    .map((a) => {
      try {
        const data = SaleItem.deserializeToReadable(a.account.data as Buffer);
        if (!data) {
          throw new Error(`Invalid mint data, ignore`);
        }
        const mintPubkey = data.token;
        mintPubkeys.push(mintPubkey);
        return a;
      } catch (error) {
        // console.log(error);
        return null;
      }
    })
    .filter((data) => data);

  const chunks = mintPubkeys.reduce((result: any, m: any, index: number) => {
    const base = Math.floor(index / 100);
    result[base] = result[base] || [];
    result[base].push(m);
    return result;
  }, []);

  const mintData = await Promise.all(chunks.map((m: any) => getMultiMetaData(connection, m)));
  const tokenData = await Promise.all(chunks.map((m: any) => getMultiTokenData(connection, m)));
  const priceData = await Promise.all(chunks.map((m: any) => getMultiPriceData(connection, m)));
  const flattenedMintDatas = mintData.flat();
  const flattenedTokenDatas = tokenData.flat();
  const flattenedPriceDatas = priceData.flat();
  return saleData.map((s, i) => ({
    ...(flattenedMintDatas[i][0] as Metadata),
    tokenData: flattenedTokenDatas[i],
    sale: SaleItem.deserializeToReadable(s?.account.data as Buffer)!,
    price: flattenedPriceDatas[i] as TPriceItem,
  }));
}
