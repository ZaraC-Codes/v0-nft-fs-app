import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("========================================");
  console.log("Deploying Swap Contract");
  console.log("========================================");
  console.log("Deploying with account:", deployer.address);
  console.log("Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH");
  console.log("");

  // Deploy SwapManager
  console.log("Deploying SwapManager...");
  const SwapManager = await ethers.getContractFactory("SwapManager");
  const swapManager = await SwapManager.deploy();
  await swapManager.waitForDeployment();
  const swapManagerAddress = await swapManager.getAddress();
  console.log("✅ SwapManager deployed to:", swapManagerAddress);
  console.log("");

  console.log("========================================");
  console.log("Deployment Complete!");
  console.log("========================================");
  console.log("");
  console.log("📝 Contract Address:");
  console.log("SwapManager:", swapManagerAddress);
  console.log("");
  console.log("🔧 Next Steps:");
  console.log("1. Update lib/swap.ts with this address:");
  console.log(`   [apeChainCurtis.id]: "${swapManagerAddress}",`);
  console.log("");
  console.log("2. Update lib/swap.ts - uncomment the real implementation:");
  console.log("   - Remove the mock throw error in prepareCreateSwapListing");
  console.log("   - Uncomment the real contract call code");
  console.log("");
  console.log("3. (Optional) Verify contract on block explorer:");
  console.log(`   npx hardhat verify --network <network-name> ${swapManagerAddress}`);
  console.log("");
  console.log("========================================");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });