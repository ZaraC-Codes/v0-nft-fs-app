import { createThirdwebClient } from "thirdweb";
import { defineChain } from "thirdweb/chains";
import { privateKeyToAccount } from "thirdweb/wallets";
import { deployERC721Contract, deployERC1155Contract } from "thirdweb/deploys";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const apeChainCurtis = defineChain({
  id: 33111,
  name: "ApeChain Curtis Testnet",
  nativeCurrency: {
    name: "ApeCoin",
    symbol: "APE",
    decimals: 18,
  },
  rpc: "https://curtis.rpc.caldera.xyz/http",
  blockExplorers: [
    {
      name: "Curtis Explorer",
      url: "https://curtis.explorer.caldera.xyz",
    },
  ],
  testnet: true,
});

async function main() {
  console.log("🚀 Deploying ThirdWeb NFT contracts to ApeChain Curtis...\n");

  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    throw new Error("❌ PRIVATE_KEY not found in .env.local");
  }

  const secretKey = process.env.THIRDWEB_SECRET_KEY;
  if (!secretKey) {
    throw new Error("❌ THIRDWEB_SECRET_KEY not found in .env.local");
  }

  const client = createThirdwebClient({
    secretKey,
  });

  const account = privateKeyToAccount({
    client,
    privateKey,
  });

  console.log("Deploying with account:", account.address);
  console.log();

  try {
    // Deploy ERC721
    console.log("📝 Deploying ERC721 NFT Collection...");
    const erc721Address = await deployERC721Contract({
      account,
      chain: apeChainCurtis,
      client,
      type: "TokenERC721",
      params: {
        name: "Test NFT Collection",
        symbol: "TEST",
        contractURI: "ipfs://QmTest",
      },
    });
    console.log("✅ ERC721 deployed to:", erc721Address);

    // Deploy ERC1155
    console.log("\n📝 Deploying ERC1155 NFT Collection...");
    const erc1155Address = await deployERC1155Contract({
      account,
      chain: apeChainCurtis,
      client,
      type: "TokenERC1155",
      params: {
        name: "Test Multi-Edition Collection",
        contractURI: "ipfs://QmTest1155",
      },
    });
    console.log("✅ ERC1155 deployed to:", erc1155Address);

    console.log("\n📝 Deployment Summary:");
    console.log("=".repeat(60));
    console.log("ERC721 Contract:", erc721Address);
    console.log("ERC1155 Contract:", erc1155Address);
    console.log("=".repeat(60));

    console.log("\n✅ Update these addresses in app/mint/page.tsx:");
    console.log(`const ERC721_CONTRACT = '${erc721Address}'`);
    console.log(`const ERC1155_CONTRACT = '${erc1155Address}'`);

    console.log("\n🎯 Next steps:");
    console.log("1. Update contract addresses in app/mint/page.tsx");
    console.log("2. Restart dev server: pnpm run dev");
    console.log("3. Visit http://localhost:3001/mint");
    console.log("4. Mint test NFTs");
    console.log("5. Try listing them on the marketplace");
  } catch (error) {
    console.error("\n❌ Deployment failed:", error.message);
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
