import * as borsh from "borsh";
import BN from "bn.js";
import { PublicKey } from "@solana/web3.js";

export interface TTokenData {
  accountType: number;
  power: BN;
  stakingTokenMintAddress: Uint8Array;
}
export interface TReadableTokenData {
  accountType: number;
  power: BN;
  stakingTokenMintAddress: string;
}
export class TokenData implements TTokenData {
  accountType;

  power;

  stakingTokenMintAddress;

  constructor(fields: TTokenData) {
    this.accountType = fields.accountType;
    this.power = fields.power;
    this.stakingTokenMintAddress = fields.stakingTokenMintAddress;
  }

  serialize(): Uint8Array {
    return borsh.serialize(TokenDataSchema, this);
  }

  static deserialize(raw: Buffer): TokenData {
    return borsh.deserialize(TokenDataSchema, TokenData, raw);
  }
  static deserializeToReadable(raw: Buffer): TReadableTokenData {
    const { accountType, power, stakingTokenMintAddress } = borsh.deserialize(
      TokenDataSchema,
      TokenData,
      raw
    );
    return {
      accountType,
      power: power,
      stakingTokenMintAddress: new PublicKey(stakingTokenMintAddress).toBase58(),
    };
  }
}
export const TokenDataSchema = new Map([
  [
    TokenData,
    {
      kind: "struct",
      fields: [
        ["accountType", "u8"],
        ["power", "u64"],
        ["stakingTokenMintAddress", [32]],
      ],
    },
  ],
]);
