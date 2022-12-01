import * as borsh from 'borsh';
import BN from 'bn.js';
import { PublicKey } from '@solana/web3.js';

export interface TStakingAccount {
  accountType: number,
  depositedPower: BN,
  depositedAt: BN,
  withdrawnAt: BN,
  firstPayrollIndex: BN,
  withdrawnRewardAmount: BN,
  poolPdaAccount: Uint8Array,
  withdrawnAddress: Uint8Array,
  stakingTokenMintAddress: Uint8Array,
  depositor: Uint8Array
}
export interface TReadableStakingAccount {
  accountType: number,
  depositedPower: number,
  depositedAt: Date,
  withdrawnAt: Date,
  firstPayrollIndex: number,
  withdrawnRewardAmount: number,
  poolPdaAccount: string,
  withdrawnAddress: string,
  stakingTokenMintAddress: string,
  depositor: string
}
export class StakingAccount implements TStakingAccount {

  accountType;
  
  poolPdaAccount;

  depositedPower;

  depositor;

  withdrawnAt;

  depositedAt;

  firstPayrollIndex;

  withdrawnAddress;

  withdrawnRewardAmount

  stakingTokenMintAddress;

  constructor(fields: TStakingAccount) {
    this.accountType = fields.accountType;
    this.poolPdaAccount = fields.poolPdaAccount
    this.depositor = fields.depositor;
    this.withdrawnRewardAmount = fields.withdrawnRewardAmount;
    this.withdrawnAt = fields.withdrawnAt;
    this.firstPayrollIndex = fields.firstPayrollIndex;
    this.depositedPower = fields.depositedPower;
    this.depositedAt = fields.depositedAt;
    this.withdrawnAddress = fields.withdrawnAddress;
    this.stakingTokenMintAddress = fields.stakingTokenMintAddress;
  }

  serialize(): Uint8Array {
    return borsh.serialize(StakingDataSchema, this);
  }

  static deserialize(raw: Buffer): StakingAccount {
    return borsh.deserialize(StakingDataSchema, StakingAccount, raw);
  }
  static deserializeToReadable(raw: Buffer): TReadableStakingAccount {
    const {
      accountType,
      poolPdaAccount,
      depositedPower,
      depositor,
      withdrawnAt,
      depositedAt,
      firstPayrollIndex,
      withdrawnAddress,
      withdrawnRewardAmount,
      stakingTokenMintAddress,
    } = borsh.deserialize(StakingDataSchema, StakingAccount, raw);
    return {
      accountType,
      depositedPower: depositedPower.toNumber(),
      withdrawnAddress: new PublicKey(withdrawnAddress).toBase58(),
      stakingTokenMintAddress: new PublicKey(stakingTokenMintAddress).toBase58(),
      depositedAt: new Date(depositedAt.toNumber() * 1000),
      withdrawnAt: new Date(withdrawnAt.toNumber() * 1000),
      poolPdaAccount: new PublicKey(poolPdaAccount).toBase58(),
      depositor: new PublicKey(depositor).toBase58(),
      firstPayrollIndex: firstPayrollIndex.toNumber(),
      withdrawnRewardAmount: withdrawnRewardAmount.toNumber(),
    };
  }
}
export const StakingDataSchema = new Map([[StakingAccount, {
  kind: 'struct',
  fields: [
    ['accountType', 'u8'],
    ['depositedPower', 'u64'],
    ['depositedAt', 'u64'],
    ['withdrawnAt', 'u64'],
    ['firstPayrollIndex', 'u64'],
    ['withdrawnRewardAmount', 'u64'],
    ['poolPdaAccount', [32]],
    ['withdrawnAddress', [32]],
    ['stakingTokenMintAddress', [32]],
    ['depositor', [32]],
  ],
}],
]);