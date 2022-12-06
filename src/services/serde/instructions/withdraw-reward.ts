import BN from 'bn.js';
import * as borsh from 'borsh';

export type TInitRedeemInstruction = {
  payrollIndex: BN,
  poolPda: Uint8Array,
}
export class InitRedeemInstruction {
  instruction;

  poolPda;

  payrollIndex;

  constructor(fields: TInitRedeemInstruction) {
    this.instruction = 4;
    this.poolPda = fields.poolPda;
    this.payrollIndex = fields.payrollIndex;
  }

  serialize(): Uint8Array {
    return borsh.serialize(InitRedeemInstructionDataSchema, this);
  }

  static deserialize(raw: Buffer): InitRedeemInstruction {
    return borsh.deserialize(InitRedeemInstructionDataSchema, InitRedeemInstruction, raw);
  }
}

export const InitRedeemInstructionDataSchema = new Map([[InitRedeemInstruction, {
  kind: 'struct',
  fields: [
    ['instruction', 'u8'],
    ['payrollIndex', 'u64'],
  ],
}],
]);
