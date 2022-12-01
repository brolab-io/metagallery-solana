import { Connection, Keypair, PublicKey, TransactionInstruction } from '@solana/web3.js';
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  MintLayout,
  getAssociatedTokenAddress,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token';
import { createAta as _createAta, createMintIx, createMintToIx } from '../transactions';

export async function createSplToken(
  connection: Connection,
  owner: PublicKey,
): Promise<{
  mint: Keypair,
  createInitializeMint: TransactionInstruction,
  createAccount: TransactionInstruction,
  createAta: TransactionInstruction,
  mintTo: TransactionInstruction,
  recipient: PublicKey,
}> {
  const mint = Keypair.generate();
  const mintRent = await connection.getMinimumBalanceForRentExemption(MintLayout.span);
  const {
    createAccountIx: createAccount,
    createInitializeMintIx: createInitializeMint
  } = createMintIx({
    newAccountPubkey: mint.publicKey,
    lamports: mintRent,
    owner,
  });

  const recipient = await getAssociatedTokenAddress(
    mint.publicKey,
    owner,
    false,
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID,
  );

  const createAta = _createAta({
    owner,
    associatedTokenAddress: recipient,
    splTokenMintAddress: mint.publicKey,
  });

  const mintTo = createMintToIx({
    mint: mint.publicKey,
    authority: owner,
    dest: recipient,
    amount: 1,
  });

  return { mint, createInitializeMint, createAccount, createAta, mintTo, recipient };
}