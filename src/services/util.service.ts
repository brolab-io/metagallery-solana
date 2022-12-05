export function pad(str: string, len: number) {
  return str.padEnd(len, String.fromCharCode(0x00));
}

export function getCurrentPayrollIndex(currentAt: number, rewardPeriod: number, startAt: number) {
  return Math.floor((currentAt - startAt) / rewardPeriod) + 1;
}

type CreatorShare = {
  creator: string;
  share: number;
};
export function buildMetadata({
  name,
  symbol,
  description,
  seller_fee_basis_points,
  fileType,
}: {
  name: string;
  symbol: string;
  description: string;
  seller_fee_basis_points: number;
  fileType: string;
  creators: CreatorShare[];
}) {
  return {
    name,
    symbol,
    description,
    seller_fee_basis_points,
    image: "",
    attributes: [
      {
        trait_type: "web",
        value: "yes",
      },
      {
        trait_type: "mobile",
        value: "yes",
      },
      {
        trait_type: "extension",
        value: "yes",
      },
    ],
    collection: {
      name,
      family: "BigRich",
    },
    properties: {
      files: [
        {
          uri: "",
          type: fileType,
        },
      ],
      category: "video",
      creators: [],
    },
  };
}
