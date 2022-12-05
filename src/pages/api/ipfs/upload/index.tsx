import { Writable } from "stream";
import FormData from "form-data";
import formidable from "formidable";
import { NextApiRequest, NextApiResponse, PageConfig } from "next";
import { AxiosError } from "axios";
import { Blob } from "buffer";
import web3StorageClient from "../../../../services/ipfs/web3.storage.client";
import { File } from "web3.storage";

const formidableConfig = {
  keepExtensions: true,
  maxFileSize: 10_000_000,
  maxFieldsSize: 10_000_000,
  maxFields: 7,
  allowEmptyFiles: false,
  multiples: false,
};

function formidablePromise(
  req: NextApiRequest,
  opts?: Parameters<typeof formidable>[0]
): Promise<{ fields: formidable.Fields; files: formidable.Files }> {
  return new Promise((accept, reject) => {
    const form = formidable(opts);
    form.parse(req, (err, fields, files) => {
      if (err) {
        return reject(err);
      }
      return accept({ fields, files });
    });
  });
}

const fileConsumer = <T extends unknown>(acc: T[]) => {
  const writable = new Writable({
    write: (chunk, _enc, next) => {
      acc.push(chunk);
      next();
    },
  });

  return writable;
};

export async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(404).end();
  try {
    const chunks: never[] = [];

    const { fields } = await formidablePromise(req, {
      ...formidableConfig,
      // consume this, otherwise formidable tries to save the file to disk
      fileWriteStreamHandler: () => fileConsumer(chunks),
    });

    const { metadata: metadataStr } = fields;
    const metadata = JSON.parse(Array.isArray(metadataStr) ? metadataStr[0] : metadataStr);

    const fileData = Buffer.concat(chunks); // or is it from? I always mix these up
    const imageCid = await web3StorageClient.put([new File([fileData], metadata.name)], {
      wrapWithDirectory: false,
    });

    metadata.image = `https://${imageCid}.ipfs.w3s.link`;
    metadata.properties.files[0].uri = metadata.image;
    const metadataFile = new File([JSON.stringify(metadata)], "metadata.json");
    const metadataCid = await web3StorageClient.put([metadataFile], {
      wrapWithDirectory: false,
    });
    return res.status(200).json({ url: `https://${metadataCid}.ipfs.w3s.link` });
  } catch (err) {
    const error = err as AxiosError;
    console.error(error.response?.data || error.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

export const config: PageConfig = {
  api: {
    bodyParser: false,
  },
};

export default handler;
