import { ethers } from "hardhat";

/**
 * Deploy BundleNFTUnified to ApeChain Mainnet
 *
 * This script deploys the unified bundle contract to ApeChain mainnet with:
 * - Standard ERC-6551 Registry: 0x000000006551c19487814612e58FE06813775758
 * - Standard Account Implementation: 0x2d25602551487c3f3354dd80d76d54383a243358
 *
 * Run: npx hardhat run scripts/deploy-bundle-mainnet.ts --network apechain
 */

async function main() {
  console.log("\n🚀 Deploying BundleNFTUnified to ApeChain Mainnet...\n");

  // ApeChain mainnet ERC-6551 addresses (standard implementation)
  const ERC6551_REGISTRY = "0x000000006551c19487814612e58FE06813775758";
  const ACCOUNT_IMPLEMENTATION = "0x2d25602551487c3f3354dd80d76d54383a243358";

  console.log("📋 Configuration:");
  console.log("  ERC-6551 Registry:", ERC6551_REGISTRY);
  console.log("  Account Implementation:", ACCOUNT_IMPLEMENTATION);
  console.log("");

  // Get deployer
  const [deployer] = await ethers.getSigners();
  console.log("👤 Deployer:", deployer.address);

  // Check balance
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 Balance:", ethers.formatEther(balance), "APE");
  console.log("");

  if (balance === 0n) {
    throw new Error("❌ Deployer has no APE tokens. Get some from the faucet or exchange.");
  }

  // Deploy BundleNFTUnified
  console.log("📦 Deploying BundleNFTUnified...");
  const BundleNFTUnified = await ethers.getContractFactory("BundleNFTUnified_Updated");

  const bundleContract = await BundleNFTUnified.deploy(
    ERC6551_REGISTRY,
    ACCOUNT_IMPLEMENTATION
  );

  await bundleContract.waitForDeployment();
  const bundleAddress = await bundleContract.getAddress();

  console.log("✅ BundleNFTUnified deployed to:", bundleAddress);
  console.log("");

  // Verify deployment
  console.log("🔍 Verifying deployment...");
  const registry = await bundleContract.registry();
  const implementation = await bundleContract.accountImplementation();

  console.log("  Registry:", registry);
  console.log("  Implementation:", implementation);
  console.log("");

  // Summary
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("✨ DEPLOYMENT COMPLETE!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("");
  console.log("📝 Update lib/bundle.ts with:");
  console.log("");
  console.log(`  [apeChain.id]: {`);
  console.log(`    bundleNFT: "${bundleAddress}",`);
  console.log(`    bundleManager: "${bundleAddress}",`);
  console.log(`    erc6551Registry: "${ERC6551_REGISTRY}",`);
  console.log(`    accountImplementation: "${ACCOUNT_IMPLEMENTATION}",`);
  console.log(`  },`);
  console.log("");
  console.log("🔗 ApeChain Explorer:");
  console.log(`  https://apechain.calderachain.xyz/address/${bundleAddress}`);
  console.log("");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
