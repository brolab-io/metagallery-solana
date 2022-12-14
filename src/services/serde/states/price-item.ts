import BN from 'bn.js';
import * as borsh from 'borsh';

export interface TPriceItem {
  accountType: Number,
  price: BN,
  salePda: Uint8Array,
  tradeToken: Uint8Array,
}

export class PriceItem implements TPriceItem {

  accountType;
  
  price;
  
  salePda;
  
  tradeToken;
  

  constructor(fields: TPriceItem) {
    this.accountType = fields.accountType;
    this.price = fields.price;
    this.salePda = fields.salePda;
    this.tradeToken = fields.tradeToken;
  }

  serialize(): Uint8Array {
    return borsh.serialize(PriceItemDataSchema, this);
  }

  static deserialize(raw: Buffer): PriceItem {
    return borsh.deserialize(PriceItemDataSchema, PriceItem, raw);
  }
}

export const fields = [
  ['accountType', 'u8'],
  ['tradeToken', [32]],
  ['price', 'u64'],
  ['salePda', [32]],
];

export const PriceItemDataSchema = new Map([[PriceItem, {
  kind: 'struct',
  fields,
}],
]);
