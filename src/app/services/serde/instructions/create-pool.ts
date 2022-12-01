import BN from 'bn.js';
import * as borsh from 'borsh';

export type TCreatePoolInstruction = {
  name: Uint8Array,
  rewardPeriod: BN,
  startAt: BN,
  creator: Uint8Array,
  collection: Uint8Array,
  poolType: number,

}
export class CreatePoolIns {
  instruction;
  
  name;

  rewardPeriod;
  
  startAt;
  
  poolType;

  creator: Uint8Array;
  
  collection: Uint8Array;

  constructor(fields: TCreatePoolInstruction) {
    this.instruction = 1;
    this.name = fields.name;
    this.rewardPeriod = fields.rewardPeriod;
    this.startAt = fields.startAt;
    this.creator = fields.creator;
    this.collection = fields.collection;
    this.poolType = fields.poolType;
  }

  serialize(): Uint8Array {
    return borsh.serialize(CreatePoolInstructionSchema, this);
  }
  
}

export const CreatePoolInstructionSchema = new Map([[CreatePoolIns, {
  kind: 'struct',
  fields: [
    ['instruction', 'u8'],
    ['name', [16]],
    ['rewardPeriod', 'u64'],
    ['startAt', 'u64'],
    ['creator', [32]],
    ['collection', [32]],
    ['poolType', 'u8'],
  ],
}],
]);
