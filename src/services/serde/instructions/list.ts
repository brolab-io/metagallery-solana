import BN from 'bn.js';
import * as borsh from 'borsh';

export type TListInstruction = {
  validUntil: BN,
  price: BN,
  wallet: Uint8Array,
  tradeToken: Uint8Array,

}
export class ListIns {
  instruction;
  
  validUntil;

  price;
  
  wallet;
  
  tradeToken;

  constructor(fields: TListInstruction) {
    this.instruction = 1;
    this.validUntil = fields.validUntil;
    this.price = fields.price;
    this.wallet = fields.wallet;
    this.tradeToken = fields.tradeToken;
  }

  serialize(): Uint8Array {
    return borsh.serialize(ListInstructionSchema, this);
  }
  
}

export const ListInstructionSchema = new Map([[ListIns, {
  kind: 'struct',
  fields: [
    ['instruction', 'u8'],
    ['validUntil', 'u64'],
    ['wallet', [32]],
    ['price', 'u64'],
    ['tradeToken', [32]],
  ],
}],
]);
