import * as borsh from "borsh";
import BN from "bn.js";
import { PublicKey } from "@solana/web3.js";

export interface TPayrollToken {
  accountType: number;
  rewardTokenMintAccount: Uint8Array;
  rewardWithdrawnAmount: BN;
  totalRewardAmount: BN;
  payrollPda: Uint8Array;
  creator: Uint8Array;
}
export interface TReadablePayrollToken {
  accountType: number;
  rewardTokenMintAccount: string;
  rewardWithdrawnAmount: number;
  totalRewardAmount: BN;
  payrollPda: string;
  creator: string;
}
export class PayrollToken implements TPayrollToken {
  accountType;
  rewardTokenMintAccount;
  rewardWithdrawnAmount;
  totalRewardAmount;
  payrollPda;
  creator;

  constructor(fields: TPayrollToken) {
    this.accountType = fields.accountType;
    this.rewardTokenMintAccount = fields.rewardTokenMintAccount;
    this.rewardWithdrawnAmount = fields.rewardWithdrawnAmount;
    this.totalRewardAmount = fields.totalRewardAmount;
    this.payrollPda = fields.payrollPda;
    this.creator = fields.creator;
  }

  serialize(): Uint8Array {
    return borsh.serialize(PayrollDataSchema, this);
  }

  static deserialize(raw: Buffer): PayrollToken {
    return borsh.deserialize(PayrollDataSchema, PayrollToken, raw);
  }
  static deserializeToReadable(raw: Buffer): TReadablePayrollToken {
    const data = borsh.deserialize(PayrollDataSchema, PayrollToken, raw);
    return {
      accountType: data.accountType,
      rewardTokenMintAccount: new PublicKey(data.rewardTokenMintAccount).toBase58(),
      rewardWithdrawnAmount: data.rewardWithdrawnAmount.toNumber(),
      totalRewardAmount: data.totalRewardAmount,
      payrollPda: new PublicKey(data.payrollPda).toBase58(),
      creator: new PublicKey(data.creator).toBase58(),
    };
  }
}
export const PayrollDataSchema = new Map([
  [
    PayrollToken,
    {
      kind: "struct",
      fields: [
        ["accountType", "u8"],
        ["rewardTokenMintAccount", [32]],
        ["rewardWithdrawnAmount", "u64"],
        ["totalRewardAmount", "u64"],
        ["payrollPda", [32]],
        ["creator", [32]],
      ],
    },
  ],
]);
