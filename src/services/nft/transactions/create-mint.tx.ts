import { MintLayout, createInitializeMintInstruction, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { PublicKey, SystemProgram } from '@solana/web3.js';

type CreateMintParams = {
  newAccountPubkey: PublicKey;
  lamports: number;
  decimals?: number;
  owner: PublicKey;
  freezeAuthority?: PublicKey;
}
export default function createMintIx(params: CreateMintParams) {
  const {
    newAccountPubkey, lamports, decimals, owner, freezeAuthority,
  } = params;

  const createAccountIx = SystemProgram.createAccount({
    fromPubkey: owner,
    newAccountPubkey,
    lamports,
    space: MintLayout.span,
    programId: TOKEN_PROGRAM_ID,
  });
  const createInitializeMintIx = createInitializeMintInstruction(
    newAccountPubkey,
    decimals ?? 0,
    owner as any,
    freezeAuthority || owner,
    TOKEN_PROGRAM_ID,
  );
  return {
    createAccountIx,
    createInitializeMintIx,
  }
}