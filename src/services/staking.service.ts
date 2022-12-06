import BN from 'bn.js';
import {
  Connection,
  PublicKey,
} from '@solana/web3.js';
import { IWalletProvider } from "./wallet.service";
import { withdrawReward } from './pool/withdraw-reward';
import { withdraw } from './pool/withdraw-nft';
import {
  sendTransaction
} from './solana.service';
import base58 from 'bs58';
import { StakingAccount } from './serde/states/stake';
import { getMultiMetaData, getMultiTokenData } from './nft.service';
import { PROGRAM_ID } from '@metaplex-foundation/mpl-token-metadata';

export async function redeem(provider: IWalletProvider, data: any = {}, connection: Connection) {
  if (!provider) {
    throw new Error(`you must firstly connect to a wallet!`);
  }
  const pk = provider.publicKey;
  const serializedTx = await withdrawReward(connection, pk, {
    poolPda: data.poolPda ? new PublicKey(data.poolPda) : null,
    payrollIndex: data.payrollIndex ? new BN(data.payrollIndex) : null,
    stakingTokenMintAddress: new PublicKey(data.stakingTokenMintAddress),
  })
  return sendTransaction(connection, provider, [serializedTx]);
}

export async function withdrawNft(provider: IWalletProvider, data: any = {}, connection: Connection) {
  if (!provider) {
    throw new Error(`you must firstly connect to a wallet!`);
  }
  const pk = provider.publicKey;
  const serializedTx = await withdraw(connection, pk, {
    pdaAccount: new PublicKey(data.pdaAccount),
  })
  return sendTransaction(connection, provider, [serializedTx]);
}
export async function getStakingsForAddress(connection: Connection, address: PublicKey, programId: PublicKey = PROGRAM_ID) {
  const assets = await connection.getProgramAccounts(programId, {
    filters: [{
      memcmp: {
        offset: 137,
        bytes: address.toBase58(),
      } 
    }, {
      memcmp: {
        offset: 0,
        bytes: base58.encode(Buffer.from([101]))
      } 
    },  {
      memcmp: {
        offset: 17,
        bytes: base58.encode(Buffer.from([0]))
      } 
    }]
  });
  const mintPubkeys: any = [];
  const stakingData = assets.map((a) => {
    try {
      const data = StakingAccount.deserializeToReadable(a.account.data as Buffer);
      if (!data) {
        throw new Error(`Invalid mint data, ignore`);
      }
      const mintPubkey = data.stakingTokenMintAddress;
      mintPubkeys.push(mintPubkey);
      return a;
    } catch (error) {
      // console.log(error);
      return null;
    }
  }).filter(data => data);
  const chunks = mintPubkeys.reduce((result: any, m: any, index: number) => {
    const base = Math.floor(index / 100);
    result[base] = result[base] || [];
    result[base].push(m);
    return result;
  }, [])
  const mintData = await Promise.all(chunks.map((m: any) => getMultiMetaData(connection, m)));
  const tokenData = await Promise.all(chunks.map((m: any) => getMultiTokenData(connection, m)));
  const flattenedMintDatas = mintData.reduce((result, m) => result.concat(m), []);
  const flattenedTokenDatas = tokenData.reduce((result, m) => result.concat(m), []);
  return stakingData.map((s, i) => ({
    staking: s,
    mintData: {
      ...flattenedMintDatas[i][0],
      tokenData: flattenedTokenDatas[i],
    }
  }))

}