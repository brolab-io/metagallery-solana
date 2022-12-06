import * as borsh from 'borsh';

export class InitWithdrawInstruction {
  instruction;

  constructor() {
    this.instruction = 5;
  }

  serialize(): Uint8Array {
    return borsh.serialize(InitWithdrawInstructionDataSchema, this);
  }

  static deserialize(raw: Buffer): InitWithdrawInstruction {
    return borsh.deserialize(InitWithdrawInstructionDataSchema, InitWithdrawInstruction, raw);
  }
}

export const InitWithdrawInstructionDataSchema = new Map([[InitWithdrawInstruction, {
  kind: 'struct',
  fields: [
    ['instruction', 'u8'],
  ],
}],
]);
