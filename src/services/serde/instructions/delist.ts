import * as borsh from "borsh";

export class DelistIns {
  instruction;

  constructor() {
    this.instruction = 3;
  }

  serialize(): Uint8Array {
    return borsh.serialize(DelistInstructionSchema, this);
  }
}

export const DelistInstructionSchema = new Map([
  [
    DelistIns,
    {
      kind: "struct",
      fields: [["instruction", "u8"]],
    },
  ],
]);
