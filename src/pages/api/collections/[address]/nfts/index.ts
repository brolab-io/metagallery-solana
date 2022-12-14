import { NextApiRequest, NextApiResponse } from "next";
import { Connection, clusterApiUrl, PublicKey } from "@solana/web3.js";
import { getAssetsFromAddress } from "../../../../../services/nft.service";

const connection = new Connection(clusterApiUrl("devnet"));

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { wallet, address } = req.query;
  const collectionAddress = new PublicKey(address as string).toBase58();
  try {
    const data = await getAssetsFromAddress(connection, new PublicKey(wallet!));
    console.log(data);
    const nfts = data.filter((asset) => {
      if (!!asset.collectionDetails) {
        return false;
      }
      if (!collectionAddress) {
        return true;
      }
      return asset.collection?.key.toBase58() === collectionAddress;
    });
    return res.status(200).json(nfts);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
}
