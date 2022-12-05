import axios from "axios";
import { buildMetadata } from "../util.service";

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
