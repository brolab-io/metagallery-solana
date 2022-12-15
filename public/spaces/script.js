/* global BABYLON, solana */

// NFT CONFIGS
const nftConfigs = [
  // 1
  {
    position: "4.38 6.55 16.35",
    rotation: "0 90 0",
  },
  {
    position: "4.38 6.55 11.35",
    rotation: "0 90 0",
  },
  {
    position: "4.05 6.15 -9.8",
    rotation: "0 90 0",
  },
  {
    position: "2.75 6.15 -15.8",
    rotation: "0 90 0",
  },
  {
    position: "4.05 6.15 -22",
    rotation: "0 90 0",
  },
  {
    position: "0.52 6.48 -25.5",
    rotation: "0 -180 0",
  },
  {
    position: "-9.42 6.05 -25.63",
    rotation: "0 -180 0",
  },
  {
    position: "-19.51 6.365 -25.48",
    rotation: "0 -180 0",
  },
  // 9
  {
    position: "-22.9 6.255 -22.09",
    rotation: "0 -90 0",
  },
  {
    position: "-21.9 6.255 -16.07",
    rotation: "0 -90 0",
  },
  {
    position: "-22.9 6.6 -9.49",
    rotation: "0 -90 0",
  },
];

function mapNftConfigsToNfts(listedNfts, nftConfigs) {
  // take random one nft and remove it from the array

  const nfts = [];
  for (let i = 0; i < nftConfigs.length; i++) {
    const nft = listedNfts.splice(Math.floor(Math.random() * listedNfts.length), 1)[0];
    nfts.push({
      ...nft,
      ...nftConfigs[i],
    });
  }
  return nfts;
}

async function spawnNft(nft, scene) {
  const image = new BABYLON.StandardMaterial("test");
  const metadata = await fetch(nft.data.uri).then((res) => res.json());
  image.diffuseTexture = new BABYLON.Texture(metadata.image);

  const playerPicture = BABYLON.MeshBuilder.CreatePlane("playerPicture", {
    height: 16,
    width: 13,
  });
  playerPicture.material = image;
  const [x, y, z] = nft.position.split(" ").map(parseFloat);
  const [, ry] = nft.rotation.split(" ").map(parseFloat);
  playerPicture.position.x = x;
  playerPicture.position.y = y;
  playerPicture.position.z = z;
  playerPicture.scaling = new BABYLON.Vector3(0.3, 0.3, 0.3);
  playerPicture.rotation.y = BABYLON.Tools.ToRadians(ry);
  scene.onPointerObservable.add(function (evt) {
    if (evt.pickInfo.pickedMesh === playerPicture) {
      toggleModal(nft.mint);
    }
  }, BABYLON.PointerEventTypes.POINTERPICK);
}

const getListNFTsFromCollection = async () => {
  const solanaEndpoint = "https://api.devnet.solana.com";
  const connection = new solanaWeb3.Connection(solanaEndpoint);
  const metaplexProgramId = "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s";
  const searchParams = new URLSearchParams(window.location.search);
  const collection = searchParams.get("collection");
  const collectionId = new solanaWeb3.PublicKey(collection);
  let signatures = await connection.getSignaturesForAddress(collectionId);

  const allSignatures = [];
  allSignatures.push(...signatures);
  do {
    let options = {
      before: signatures[signatures.length - 1].signature,
    };
    signatures = await connection.getSignaturesForAddress(collectionId, options);
    allSignatures.push(...signatures);
  } while (signatures.length > 0);
  console.log(`Found ${allSignatures.length} signatures`);

  const metadataAddresses = [];

  console.log("Getting transaction data...");
  const promises = allSignatures.map((s) => connection.getTransaction(s.signature));
  const transactions = await Promise.all(promises);

  console.log("Parsing transaction data...");
  for (const tx of transactions) {
    if (tx) {
      let programIds = tx.transaction.message.programIds().map((p) => p.toString());
      let accountKeys = tx.transaction.message.accountKeys.map((p) => p.toString());

      // Only look in transactions that call the Metaplex token metadata program
      if (programIds.includes(metaplexProgramId)) {
        // Go through all instructions in a given transaction
        for (const ix of tx.transaction.message.instructions) {
          // Filter for setAndVerify or verify instructions in the Metaplex token metadata program
          // console.log(ix.data);
          if (
            (ix.data == "K" || ix.data == "S" || ix.data == "X") &&
            accountKeys[ix.programIdIndex] == metaplexProgramId
          ) {
            let metadataAddressIndex = ix.accounts[0];
            let metadata_address = tx.transaction.message.accountKeys[metadataAddressIndex];
            metadataAddresses.push(metadata_address);
          }
        }
      }
    }
  }

  // const promises2 = metadataAddresses.map((a) => connection.getAccountInfo(a));
  // const metadataAccounts = await Promise.all(promises2);

  const tokenMetadataes = await connection.getMultipleAccountsInfo(metadataAddresses);
  console.log(tokenMetadataes);

  return tokenMetadataes.map((t) => {
    return metaplex.Metadata.deserialize(t.data)[0];
  });
};

const spawnNFTs = async (scene) => {
  const listNfts = await getListNFTsFromCollection("NyXgPoqcioPJAmSkAvwLXuAvcfwsKbn2d1BKRroWCpJ");
  const nfts = mapNftConfigsToNfts(listNfts, nftConfigs);
  nfts.forEach((nft) => spawnNft(nft, scene));
};
