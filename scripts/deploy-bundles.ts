import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("========================================");
  console.log("Deploying Bundle Contracts");
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

  // Deploy BundleNFT
  console.log("1/4 - Deploying BundleNFT...");
  const BundleNFT = await ethers.getContractFactory("BundleNFT");
  const bundleNFT = await BundleNFT.deploy();
  await bundleNFT.waitForDeployment();
  const bundleNFTAddress = await bundleNFT.getAddress();
  console.log("✅ BundleNFT deployed to:", bundleNFTAddress);
  console.log("");

  // Deploy BundleManager
  console.log("2/4 - Deploying BundleManager...");
  const BundleManager = await ethers.getContractFactory("BundleManager");
  const bundleManager = await BundleManager.deploy(
    ERC6551_REGISTRY,
    ACCOUNT_IMPLEMENTATION
  );
  await bundleManager.waitForDeployment();
  const bundleManagerAddress = await bundleManager.getAddress();
  console.log("✅ BundleManager deployed to:", bundleManagerAddress);
  console.log("");

  // Set BundleManager in BundleNFT
  console.log("3/4 - Setting BundleManager in BundleNFT...");
  const tx1 = await bundleNFT.setBundleManager(bundleManagerAddress);
  await tx1.wait();
  console.log("✅ BundleManager set successfully");
  console.log("");

  // Set BundleNFT in BundleManager
  console.log("4/4 - Setting BundleNFT in BundleManager...");
  const tx2 = await bundleManager.setBundleNFT(bundleNFTAddress);
  await tx2.wait();
  console.log("✅ BundleNFT set successfully");
  console.log("");

  console.log("========================================");
  console.log("Deployment Complete!");
  console.log("========================================");
  console.log("");
  console.log("📝 Contract Addresses:");
  console.log("BundleNFT:        ", bundleNFTAddress);
  console.log("BundleManager:    ", bundleManagerAddress);
  console.log("ERC6551 Registry: ", ERC6551_REGISTRY);
  console.log("Account Impl:     ", ACCOUNT_IMPLEMENTATION);
  console.log("");
  console.log("🔧 Next Steps:");
  console.log("1. Update lib/bundle.ts with these addresses:");
  console.log(`   bundleNFT: "${bundleNFTAddress}",`);
  console.log(`   bundleManager: "${bundleManagerAddress}",`);
  console.log("");
  console.log("2. (Optional) Verify contracts on block explorer:");
  console.log(`   npx hardhat verify --network <network-name> ${bundleNFTAddress}`);
  console.log(`   npx hardhat verify --network <network-name> ${bundleManagerAddress} "${ERC6551_REGISTRY}" "${ACCOUNT_IMPLEMENTATION}"`);
  console.log("");
  console.log("========================================");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });