import {
  PublicKey
} from '@solana/web3.js';
import {
  createVerifyCollectionInstruction,
  createVerifySizedCollectionItemInstruction,
  PROGRAM_ADDRESS,
} from '@metaplex-foundation/mpl-token-metadata';
export async function verifyCollection({
  collection,
  token,
  address,
} : {
  collection: string,
  token: string,
  address: string,
}) {
  const programPubkey = new PublicKey(PROGRAM_ADDRESS);
  const mint = new PublicKey(token);
  const mintCollection = new PublicKey(collection);
  const walletAddress = new PublicKey(address);
  const metadataPDA = (await PublicKey.findProgramAddress([
    Buffer.from('metadata'),
    programPubkey.toBuffer(),
    mint.toBuffer()
  ], programPubkey))[0];
  const collectionMetadataPDA = (await PublicKey.findProgramAddress([
    Buffer.from('metadata'),
    programPubkey.toBuffer(),
    mintCollection.toBuffer()
  ], programPubkey))[0];
  const masterCollectionPDA =  (await PublicKey.findProgramAddress([
    Buffer.from('metadata'),
    programPubkey.toBuffer(),
    mintCollection.toBuffer(),
    Buffer.from('edition'),
  ], programPubkey))[0];
  const verifyIns = createVerifyCollectionInstruction({
    collection: collectionMetadataPDA,
    collectionAuthority: walletAddress,
    collectionMasterEditionAccount: masterCollectionPDA,
    collectionMint: mintCollection,
    metadata: metadataPDA,
    payer: walletAddress
  });
  return verifyIns;
}
export async function verifySizeCollection({
  collection,
  token,
  address,
} : {
  collection: string,
  token: string,
  address: string,
}) {
  const programPubkey = new PublicKey(PROGRAM_ADDRESS);
  const mint = new PublicKey(token);
  const mintCollection = new PublicKey(collection);
  const walletAddress = new PublicKey(address);
  const metadataPDA = (await PublicKey.findProgramAddress([
    Buffer.from('metadata'),
    programPubkey.toBuffer(),
    mint.toBuffer()
  ], programPubkey))[0];
  const collectionMetadataPDA = (await PublicKey.findProgramAddress([
    Buffer.from('metadata'),
    programPubkey.toBuffer(),
    mintCollection.toBuffer()
  ], programPubkey))[0];
  const masterCollectionPDA =  (await PublicKey.findProgramAddress([
    Buffer.from('metadata'),
    programPubkey.toBuffer(),
    mintCollection.toBuffer(),
    Buffer.from('edition'),
  ], programPubkey))[0];
  const verifyIns = createVerifySizedCollectionItemInstruction({
    collection: collectionMetadataPDA,
    collectionAuthority: walletAddress,
    collectionMasterEditionAccount: masterCollectionPDA,
    collectionMint: mintCollection,
    metadata: metadataPDA,
    payer: walletAddress
  });
  return verifyIns;
}