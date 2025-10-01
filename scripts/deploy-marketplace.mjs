import { createThirdwebClient } from "thirdweb";
import { defineChain } from "thirdweb/chains";
import { privateKeyToAccount } from "thirdweb/wallets";
import { deployPublishedContract } from "thirdweb/deploys";
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
  console.log("🚀 Deploying ThirdWeb Marketplace to ApeChain Curtis...\n");

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
    // Deploy Marketplace V3
    console.log("📝 Deploying Marketplace V3...");
    const marketplaceAddress = await deployPublishedContract({
      account,
      chain: apeChainCurtis,
      client,
      contractId: "MarketplaceV3",
      contractParams: [
        account.address, // _defaultAdmin
        "Fortuna Square Marketplace", // _contractURI
        [], // _trustedForwarders
        account.address, // _platformFeeRecipient
        250, // _platformFeeBps (2.5%)
      ],
    });
    console.log("✅ Marketplace V3 deployed to:", marketplaceAddress);

    console.log("\n📝 Deployment Summary:");
    console.log("=".repeat(60));
    console.log("Marketplace Contract:", marketplaceAddress);
    console.log("Platform Fee: 2.5%");
    console.log("Platform Fee Recipient:", account.address);
    console.log("=".repeat(60));

    console.log("\n✅ Update this address in .env.local:");
    console.log(`NEXT_PUBLIC_MARKETPLACE_CONTRACT_ADDRESS=${marketplaceAddress}`);

    console.log("\n🎯 Next steps:");
    console.log("1. Update NEXT_PUBLIC_MARKETPLACE_CONTRACT_ADDRESS in .env.local");
    console.log("2. Restart dev server: pnpm run dev");
    console.log("3. Try listing NFTs again");
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
