import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("========================================");
  console.log("Deploying Unified Bundle Contract");
  console.log("========================================");
  console.log("Deploying with account:", deployer.address);
  console.log("Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH");
  console.log("");

  // ERC6551 addresses (already deployed on Curtis testnet)
  const ERC6551_REGISTRY = process.env.NEXT_PUBLIC_ERC6551_REGISTRY_ADDRESS || "0x000000006551c19487814612e58FE06813775758";
  const ACCOUNT_IMPLEMENTATION = process.env.NEXT_PUBLIC_ERC6551_ACCOUNT_IMPLEMENTATION || "0x41C8f39463A868d3A88af00cd0fe7102F30E44eC";

  console.log("Using ERC6551 Registry:", ERC6551_REGISTRY);
  console.log("Using Account Implementation:", ACCOUNT_IMPLEMENTATION);
  console.log("");

  // Deploy BundleNFTUnified
  console.log("Deploying BundleNFTUnified...");
  const BundleNFTUnified = await ethers.getContractFactory("BundleNFTUnified");
  const bundleNFT = await BundleNFTUnified.deploy(
    ERC6551_REGISTRY,
    ACCOUNT_IMPLEMENTATION
  );
  await bundleNFT.waitForDeployment();
  const bundleNFTAddress = await bundleNFT.getAddress();
  console.log("✅ BundleNFTUnified deployed to:", bundleNFTAddress);
  console.log("");

  console.log("========================================");
  console.log("Deployment Complete!");
  console.log("========================================");
  console.log("");
  console.log("📝 Contract Address:");
  console.log("BundleNFTUnified: ", bundleNFTAddress);
  console.log("ERC6551 Registry: ", ERC6551_REGISTRY);
  console.log("Account Impl:     ", ACCOUNT_IMPLEMENTATION);
  console.log("");
  console.log("🔧 Next Steps:");
  console.log("1. Update .env.local:");
  console.log(`   NEXT_PUBLIC_BUNDLE_NFT_ADDRESS=${bundleNFTAddress}`);
  console.log(`   NEXT_PUBLIC_BUNDLE_MANAGER_ADDRESS=${bundleNFTAddress}`);
  console.log("");
  console.log("2. Update lib/bundle.ts:");
  console.log(`   bundleNFT: "${bundleNFTAddress}",`);
  console.log(`   bundleManager: "${bundleNFTAddress}",`);
  console.log("");
  console.log("3. Update Vercel environment variables and redeploy");
  console.log("");
  console.log("4. (Optional) Verify contract on block explorer:");
  console.log(`   npx hardhat verify --network apechain_curtis ${bundleNFTAddress} "${ERC6551_REGISTRY}" "${ACCOUNT_IMPLEMENTATION}"`);
  console.log("");
  console.log("========================================");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
