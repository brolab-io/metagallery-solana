import { withImageProxy } from "@blazity/next-image-proxy";

export default withImageProxy({
  whitelistedPatterns: [
    /^https?:\/\/(.*).ipfs.w3s.link/,
    /^https?:\/\/arweave.net/,
    /^https?:\/\/(.*).arweave.net/,
  ],
});
