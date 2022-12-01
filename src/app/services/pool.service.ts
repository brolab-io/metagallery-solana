import BN from 'bn.js';
import {
  Connection,
  PublicKey,
} from '@solana/web3.js';
import { IWalletProvider } from "./wallet.service";
import { createPool } from './pool/create-pool';
import {
  sendTransaction
} from './solana.service';

export async function createStakingPool(provider: IWalletProvider, data: any = {}, connection: Connection) {
  if (!provider) {
    throw new Error(`you must firstly connect to a wallet!`);
  }
  const pk = provider.publicKey;
  const serializedTx = await createPool(connection, pk, {
    name: data.name,
    rewardPeriod: new BN(100),
    rewardTokenMintAddress: new PublicKey(data.rewardTokenMintAddress),
    collection: new PublicKey(data.collection),
    poolType: 1,
  })
  return sendTransaction(connection, provider, [serializedTx]);
}