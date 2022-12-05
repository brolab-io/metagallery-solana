import BN from 'bn.js';
import * as borsh from 'borsh';

export type TUpdateTokenDataInstruction = {
  power: BN,
}
export class UpdateTokenDataInstruction {
  instruction;

  power;

  constructor(fields: TUpdateTokenDataInstruction) {
    this.instruction = 6;
    this.power = fields.power;
  }

  serialize(): Uint8Array {
    return borsh.serialize(UpdateTokenDataInstructionDataSchema, this);
  }

  static deserialize(raw: Buffer): UpdateTokenDataInstruction {
    return borsh.deserialize(UpdateTokenDataInstructionDataSchema, UpdateTokenDataInstruction, raw);
  }
}

export const UpdateTokenDataInstructionDataSchema = new Map([[UpdateTokenDataInstruction, {
  kind: 'struct',
  fields: [
    ['instruction', 'u8'],
    ['power', 'u64'],
  ],
}],
]);
