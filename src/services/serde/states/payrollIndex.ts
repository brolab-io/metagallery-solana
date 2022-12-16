import * as borsh from "borsh";
import BN from "bn.js";
import { PublicKey } from "@solana/web3.js";

export interface TPayrollIndex {
  accountType: number;
  rewardTokenMintAccount: Uint8Array;
  index: BN;
  payrollPda: Uint8Array;
  creator: Uint8Array;
}
export interface TReadableTokenData {
  accountType: number;
  rewardTokenMintAccount: string;
  index: number;
  payrollPda: string;
  creator: string;
}
export class PayrollIndex implements TPayrollIndex {
  accountType;
  rewardTokenMintAccount;
  index;
  payrollPda;
  creator;

  constructor(fields: TPayrollIndex) {
    this.accountType = fields.accountType;
    this.rewardTokenMintAccount = fields.rewardTokenMintAccount;
    this.index = fields.index;
    this.payrollPda = fields.payrollPda;
    this.creator = fields.creator;
  }

  serialize(): Uint8Array {
    return borsh.serialize(TokenDataSchema, this);
  }

  static deserialize(raw: Buffer): PayrollIndex {
    return borsh.deserialize(TokenDataSchema, PayrollIndex, raw);
  }
  static deserializeToReadable(raw: Buffer): TReadableTokenData {
    const data = borsh.deserialize(TokenDataSchema, PayrollIndex, raw);
    return {
      accountType: data.accountType,
      rewardTokenMintAccount: new PublicKey(data.rewardTokenMintAccount).toBase58(),
      index: data.index.toNumber(),
      payrollPda: new PublicKey(data.payrollPda).toBase58(),
      creator: new PublicKey(data.creator).toBase58(),
    };
  }
}
export const TokenDataSchema = new Map([
  [
    PayrollIndex,
    {
      kind: "struct",
      fields: [
        ["accountType", "u8"],
        ["rewardTokenMintAccount", [32]],
        ["index", "u64"],
        ["payrollPda", [32]],
        ["creator", [32]],
      ],
    },
  ],
]);
