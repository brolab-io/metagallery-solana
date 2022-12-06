import BN from 'bn.js';
import * as borsh from 'borsh';
export type TUpdateRewarderInstruction = {
  amount: BN,
  payrollIndex: BN,
}

export class UpdateRewarderInstruction {
  instruction;

  amount;

  payrollIndex;

  constructor(fields: TUpdateRewarderInstruction) {
    this.instruction = 2;
    this.amount = fields.amount;
    this.payrollIndex = fields.payrollIndex;
  }

  serialize(): Uint8Array {
    return borsh.serialize(UpdateRewarderInstructionDataSchema, this);
  }

  static deserialize(raw: Buffer): UpdateRewarderInstruction {
    return borsh.deserialize(UpdateRewarderInstructionDataSchema, UpdateRewarderInstruction, raw);
  }
}

export const UpdateRewarderInstructionDataSchema = new Map([[UpdateRewarderInstruction, {
  kind: 'struct',
  fields: [
    ['instruction', 'u8'],
    ['amount', 'u64'],
    ['payrollIndex', 'u64'],
  ],
}],
]);
