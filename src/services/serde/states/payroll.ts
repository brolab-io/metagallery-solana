import BN from "bn.js";
import * as borsh from "borsh";

export interface TPayroll {
  accountType: Number;
  totalDepositedPower: BN;
  numberOfRewardTokens: BN;
  index: BN;
  claimableAfter: BN;
  startAt: BN;
  poolAccount: Uint8Array;
  creator: Uint8Array;
}

export class Payroll implements TPayroll {
  accountType;

  totalDepositedPower;

  index;

  numberOfRewardTokens;

  claimableAfter;

  startAt;

  poolAccount;

  creator;

  constructor(fields: TPayroll) {
    this.accountType = fields.accountType;
    this.totalDepositedPower = fields.totalDepositedPower;
    this.numberOfRewardTokens = fields.numberOfRewardTokens;
    this.index = fields.index;
    this.startAt = fields.startAt;
    this.claimableAfter = fields.claimableAfter;
    this.poolAccount = fields.poolAccount;
    this.creator = fields.creator;
  }

  serialize(): Uint8Array {
    return borsh.serialize(PayrollDataSchema, this);
  }

  static deserialize(raw: Buffer): Payroll {
    return borsh.deserialize(PayrollDataSchema, Payroll, raw);
  }
}

export const fields = [
  ["accountType", "u8"],
  ["totalDepositedAmount", "u64"],
  ["index", "u64"],
  ["numberOfRewardTokens", "u64"],
  ["claimableAfter", "u64"],
  ["startAt", "u64"],
  ["poolAccount", [32]],
  ["creator", [32]],
];

export const PayrollDataSchema = new Map([
  [
    Payroll,
    {
      kind: "struct",
      fields,
    },
  ],
]);
