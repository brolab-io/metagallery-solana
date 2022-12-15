import { Connection } from "@solana/web3.js";
import axios from "axios";
import { buildMetadata } from "../util.service";
import {
  bundlrStorage,
  Metaplex,
  toMetaplexFileFromBrowser,
  walletAdapterIdentity,
} from "@metaplex-foundation/js";
import { WalletContextState } from "@solana/wallet-adapter-react";

export const uploadMetadata = async (
  file: File,
  metadata: ReturnType<typeof buildMetadata>
): Promise<string> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("metadata", JSON.stringify(metadata));
  return axios
    .post("/api/ipfs/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    .then((res) => res.data.url);
};

export const uploadMetadataUsingMetaplex = async (
  connection: Connection,
  wallet: WalletContextState,
  files: FileList,
  metadata: ReturnType<typeof buildMetadata>
) => {
  const metaplex = Metaplex.make(connection)
    .use(walletAdapterIdentity(wallet))
    .use(
      bundlrStorage({
        address: process.env.NEXT_PUBLIC_BUNDLR_ENDPOINT!,
        providerUrl: process.env.NEXT_PUBLIC_SOLANA_ENDPOINT!,
        timeout: 60000,
      })
    );
  const image = await toMetaplexFileFromBrowser(files[0]);
  const url = await metaplex.storage().upload(image);
  metadata.image = url;
  metadata.properties.files[0].uri = url;
  metadata.properties.files[0].type = files[0].type;
  const metadataURI = await metaplex.storage().uploadJson(metadata);
  return metadataURI;
};
