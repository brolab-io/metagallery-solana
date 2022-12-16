import BN from 'bn.js';
import * as borsh from 'borsh';

export class UpdateCollectionDataInstruction {
  instruction;

  constructor() {
    this.instruction = 7;
  }

  serialize(): Uint8Array {
    return borsh.serialize(UpdateCollectionDataInstructionDataSchema, this);
  }

  static deserialize(raw: Buffer): UpdateCollectionDataInstruction {
    return borsh.deserialize(UpdateCollectionDataInstructionDataSchema, UpdateCollectionDataInstruction, raw);
  }
}

export const UpdateCollectionDataInstructionDataSchema = new Map([[UpdateCollectionDataInstruction, {
  kind: 'struct',
  fields: [
    ['instruction', 'u8'],
  ],
}],
]);
