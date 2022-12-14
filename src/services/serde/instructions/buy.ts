import BN from 'bn.js';
import * as borsh from 'borsh';

export class BuyIns {
  instruction;

  constructor() {
    this.instruction = 2;
  }

  serialize(): Uint8Array {
    return borsh.serialize(BuyInstructionSchema, this);
  }
  
}

export const BuyInstructionSchema = new Map([[BuyIns, {
  kind: 'struct',
  fields: [
    ['instruction', 'u8'],
  ],
}],
]);
