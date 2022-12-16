import { NextApiRequest, NextApiResponse } from "next";
import fetch from "node-fetch";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { url } = req.query;
  if (!url) {
    res.status(400).send("Missing URL");
    return;
  }
  // Get data from external API
  // Allow cors from *
  res.setHeader("Access-Control-Allow-Origin", "*");

  try {
    const response = await fetch(url as string);
    const json = await response.json();
    res.status(200).json(json);
  } catch (e) {
    res.status(500).json(e);
    return;
  }
}
