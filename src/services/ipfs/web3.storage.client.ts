import { Web3Storage } from "web3.storage";

// Construct with token and endpoint
const web3StorageClient = new Web3Storage({ token: process.env.WEB3_STORAGE_API_KEY! });

export default web3StorageClient;
