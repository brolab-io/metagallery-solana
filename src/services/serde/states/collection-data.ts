import * as borsh from 'borsh';
import { PublicKey } from '@solana/web3.js';

export interface TCollectionData {
  accountType: number,
  collectionMintAddress: Uint8Array,
}
export interface TReadableCollectionData {
  accountType: number,
  collectionMintAddress: string,
}
export class CollectionData implements TCollectionData {

  accountType;

  collectionMintAddress;

  constructor(fields: TCollectionData) {
    this.accountType = fields.accountType;
    this.collectionMintAddress = fields.collectionMintAddress;
  }

  serialize(): Uint8Array {
    return borsh.serialize(CollectionDataSchema, this);
  }

  static deserialize(raw: Buffer): CollectionData {
    return borsh.deserialize(CollectionDataSchema, CollectionData, raw);
  }
  static deserializeToReadable(raw: Buffer): TReadableCollectionData {
    const {
      accountType,
      collectionMintAddress,
    } = borsh.deserialize(CollectionDataSchema, CollectionData, raw);
    return {
      accountType,
      collectionMintAddress: new PublicKey(collectionMintAddress).toBase58(),
    };
  }
}
export const CollectionDataSchema = new Map([[CollectionData, {
  kind: 'struct',
  fields: [
    ['accountType', 'u8'],
    ['collectionMintAddress', [32]],
  ],
}],
]);