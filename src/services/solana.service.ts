import { Buffer } from 'buffer';
import {
  clusterApiUrl,
  Connection,
  Transaction
} from '@solana/web3.js';
import {
  PROGRAM_ID,
} from '@metaplex-foundation/mpl-token-metadata';

import { IWalletProvider } from "./wallet.service";
export enum ChainId {
  MainnetBeta = 101,
  Testnet = 102,
  Devnet = 103,
}
export const NETWORKS: Record<string, { endpoint: string; ChainId: ChainId, name: string, cluster: string }> = {
  testnet: {
    name: 'testnet',
    endpoint: clusterApiUrl('testnet'),
    ChainId: ChainId.Testnet,
    cluster: 'testnet',
  },
  devnet: {
    name: 'devnet',
    endpoint: clusterApiUrl('devnet'),
    ChainId: ChainId.Devnet,
    cluster: 'devnet',
  },
  metaplex: {
    name: 'metaplex',
    endpoint: 'https://api.metaplex.solana.com',
    ChainId: ChainId.MainnetBeta,
    cluster: 'mainnet',
  },
  solana: {
    name: 'solana',
    endpoint: 'https://api.mainnet-beta.solana.com',
    ChainId: ChainId.MainnetBeta,
    cluster: 'mainnet',
  },
};
export const MARKETS: Record<string,{ name: string, address: string } >= {
  metaplex: {
    name: 'Metaplex',
    address: PROGRAM_ID.toString(),
  },
  solanart: {
    name: 'Solanart',
    address: 'CJsLwbP1iu5DuUikHEJnLfANgKy6stB2uFgvBBHoyxwz',
  },
  solsea: {
    name: 'Sol Sea',
    address: '617jbWo616ggkDxvW1Le8pV38XLbVSyWY8ae6QUmGBAU',
  },
  magicEden: {
    name: 'Magic Eden',
    address: 'MEisE1HzehtrDpAAT8PnLHjpSSkRYakotTuJRPjTpo8',
  },
  digitalEyes: {
    name: 'Digital Eye',
    address: 'A7p8451ktDCHq5yYaHczeLMYsjRsAkzc3hCXcSrwYHU7',
  },
  alphaArt: {
    name: 'Alpha Art',
    address: 'HZaWndaNWHFDd9Dhk5pqUUtsmoBCqzb1MLu3NAh1VX6B',
  }
}
export function getNetworkEntry(network: string) {
  const entry = NETWORKS[network];
  if (!entry) {
    throw new Error(`Network ${network} not valid`)
  }
  return entry;
}
export function getMargetEntry(name: string) {
  const entry = MARKETS[name];
  if (!entry) {
    throw new Error(`Market ${name} not valid`)
  }
  return entry;
}
export function connect(endpoint: string, auth: any = {}) {
  const {
    username = '',
    password = ''
  } =  auth;
  const opts: any = {};
  if (username && password) {
    const base64Auth = Buffer.from(`${username}:${password}`).toString('base64');
    opts.httpHeaders = {
      Authorization: `Basic ${base64Auth}`
    };
  }
  console.log(`Network set to ${endpoint}`);
  // const url = currentNetwork === 'SOLANA_MAIN_NET' ? web3.clusterApiUrl('d  ')
  const connection = new Connection(endpoint, {
    commitment: 'confirmed',
    ...opts
  });
  return connection;
}
export async function sendTransaction(connection: Connection, provider: IWalletProvider, serializedTransactions: Buffer []): Promise<any> {
  const transactions = serializedTransactions.map(serializedTransaction => {
    const tx = Transaction.from(serializedTransaction);
    return tx;
  });
  const signedTransactions = await provider.signAllTransactions(transactions);
  // const connection = await connect(network);
  const tx = await Promise.all(signedTransactions.map(async (_tx: Transaction) => {
    const r = await connection.simulateTransaction(_tx);
    console.log(r)
    return connection.sendRawTransaction(_tx.serialize())
  }));
  // const tx = await connection.confirmTransaction(signature);
  console.log(tx[0]);
  return tx[0];
}