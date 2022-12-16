import { PublicKey } from '@solana/web3.js';
import BN from 'bn.js';
import * as borsh from 'borsh';

export interface TSaleItem {
  accountType: Number,
  listedAt: BN,
  validUntil: BN,
  wallet: Uint8Array,
  token: Uint8Array,
  seller: Uint8Array,
  collection: Uint8Array,
}
export interface TReadableSaleItem {
  accountType: Number,
  listedAt: Date,
  validUntil: Date,
  wallet: string,
  token: string,
  seller: string,
  collection: string,
}

export class SaleItem implements TSaleItem {

  accountType;
  
  listedAt;
  
  validUntil;
  
  wallet;
  
  token;
  
  seller;
  
  collection;
  

  constructor(fields: TSaleItem) {
    this.accountType = fields.accountType;
    this.listedAt = fields.listedAt;
    this.validUntil = fields.validUntil;
    this.wallet = fields.wallet;
    this.token = fields.token;
    this.seller = fields.seller;
    this.collection = fields.collection;
  }

  serialize(): Uint8Array {
    return borsh.serialize(SaleItemDataSchema, this);
  }

  static deserialize(raw: Buffer): SaleItem {
    return borsh.deserialize(SaleItemDataSchema, SaleItem, raw);
  }
  static deserializeToReadable(raw: Buffer): TReadableSaleItem {
    const {
      accountType,
      listedAt,
      validUntil,
      wallet,
      token,
      seller,
      collection,
    } =  SaleItem.deserialize(raw);
    return {
      accountType,
      listedAt: new Date(listedAt.toNumber() * 1000),
      validUntil: new Date(validUntil.toNumber() * 1000),
      wallet: new PublicKey(wallet).toBase58(),
      token: new PublicKey(token).toBase58(),
      seller: new PublicKey(seller).toBase58(),
      collection: new PublicKey(collection).toBase58(),
    };
  }
}

export const fields = [
  ['accountType', 'u8'],
  ['listedAt', 'u64'],
  ['validUntil', 'u64'],
  ['wallet', [32]],
  ['token', [32]],
  ['seller', [32]],
  ['collection', [32]],
];

export const SaleItemDataSchema = new Map([[SaleItem, {
  kind: 'struct',
  fields,
}],
]);
