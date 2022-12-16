import { NextApiRequest, NextApiResponse } from "next";
import { Connection, clusterApiUrl, PublicKey } from "@solana/web3.js";
import { Metadata, PROGRAM_ID } from "@metaplex-foundation/mpl-token-metadata";

const connection = new Connection(clusterApiUrl("devnet"));

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { address } = req.query;
  const collectionAddress = new PublicKey(address as string).toBase58();
  try {
    let metaplexProgramId = PROGRAM_ID.toBase58();
    console.log(metaplexProgramId);

    console.log("Getting signatures...");
    const allSignatures = [];
    const collectionId = new PublicKey(collectionAddress!);

    // This returns the first 1000, so we need to loop through until we run out of signatures to get.
    let signatures = await connection.getSignaturesForAddress(collectionId);
    allSignatures.push(...signatures);
    do {
      let options = {
        before: signatures[signatures.length - 1].signature,
      };
      signatures = await connection.getSignaturesForAddress(collectionId, options);
      allSignatures.push(...signatures);
    } while (signatures.length > 0);
    console.log(`Found ${allSignatures.length} signatures`);

    let metadataAddresses = [];
    let mintAddresses = new Set<string>();

    console.log("Getting transaction data...");
    const promises = allSignatures.map((s) => connection.getTransaction(s.signature));
    const transactions = await Promise.all(promises);

    console.log("Parsing transaction data...");
    for (const tx of transactions) {
      if (tx) {
        let programIds = tx!.transaction.message.programIds().map((p) => p.toString());
        let accountKeys = tx!.transaction.message.accountKeys.map((p) => p.toString());

        // Only look in transactions that call the Metaplex token metadata program
        if (programIds.includes(metaplexProgramId)) {
          // Go through all instructions in a given transaction
          for (const ix of tx!.transaction.message.instructions) {
            // Filter for setAndVerify or verify instructions in the Metaplex token metadata program
            // console.log(ix.data);
            if (
              (ix.data == "K" || ix.data == "S" || ix.data == "X") &&
              accountKeys[ix.programIdIndex] == metaplexProgramId
            ) {
              let metadataAddressIndex = ix.accounts[0];
              let metadata_address = tx!.transaction.message.accountKeys[metadataAddressIndex];
              metadataAddresses.push(metadata_address);
            }
          }
        }
      }
    }

    const promises2 = metadataAddresses.map((a) => connection.getAccountInfo(a));
    const metadataAccounts = await Promise.all(promises2);
    for (const account of metadataAccounts) {
      let metadata = Metadata.deserialize(account!.data)[0];
      mintAddresses.add(metadata.mint.toBase58());
    }
    const nfts = metadataAccounts.map((a) => Metadata.deserialize(a!.data)[0]);

    return res.status(200).json(nfts);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
}
