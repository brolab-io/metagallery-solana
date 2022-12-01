import { createMintToInstruction, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { PublicKey } from '@solana/web3.js';
import BN from 'bn.js';

type MintToParams = {
  mint: PublicKey;
  dest: PublicKey;
  amount: number | BN;
  authority?: PublicKey;
};
export default function createMintToIx(params: MintToParams) {
  const {
    mint, dest, authority, amount,
  } = params
  return createMintToInstruction(
    mint,
    dest,
    authority as any,
    new BN(amount).toNumber(),
    [],
    TOKEN_PROGRAM_ID,
  );
}
