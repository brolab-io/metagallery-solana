import * as borsh from 'borsh';

export class StakeIns {
  instruction;

  constructor() {
    this.instruction = 3;
  }

  serialize(): Uint8Array {
    return borsh.serialize(StakeInstructionSchema, this);
  }
  
}

export const StakeInstructionSchema = new Map([[StakeIns, {
  kind: 'struct',
  fields: [
    ['instruction', 'u8'],
  ],
}],
]);
