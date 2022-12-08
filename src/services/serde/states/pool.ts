import BN from "bn.js";
import * as borsh from "borsh";

export type TPool = {
  name: Uint8Array;
  accountType: number;
  totalDepositedPower: BN;
  rewardPeriod: BN;
  startAt: BN;
  poolType: number;
  creator: Uint8Array;
  colletion: Uint8Array;
};
export class Pool {
  name;

  accountType;

  totalDepositedPower;

  rewardPeriod;

  startAt;

  poolType;

  creator: Uint8Array;

  collection: Uint8Array;

  constructor(fields: TPool) {
    this.accountType = fields.accountType;
    this.name = fields.name;
    this.totalDepositedPower = fields.totalDepositedPower;
    this.rewardPeriod = fields.rewardPeriod;
    this.startAt = fields.startAt;
    this.creator = fields.creator;
    this.collection = fields.colletion;
    this.poolType = fields.poolType;
  }

  serialize(): Uint8Array {
    return borsh.serialize(PoolSchema, this);
  }

  static deserialize(raw: Buffer): Pool {
    return borsh.deserialize(PoolSchema, Pool, raw);
  }
}

export const PoolSchema = new Map([
  [
    Pool,
    {
      kind: "struct",
      fields: [
        ["accountType", "u8"],
        ["name", [16]],
        ["totalDepositedPower", "u64"],
        ["rewardPeriod", "u64"],
        ["startAt", "u64"],
        ["poolType", "u8"],
        ["creator", [32]],
        ["collection", [32]],
      ],
    },
  ],
]);
