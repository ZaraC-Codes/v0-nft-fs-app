import { ethers } from "hardhat";

async function main() {
  console.log("\n🚀 Deploying FortunaSquareMarketplace...\n");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying from account:", deployer.address);
  console.log("Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "APE\n");

  // Fee recipient (your wallet or treasury address)
  const feeRecipient = deployer.address; // Change this to your treasury address if different
  console.log("Fee recipient:", feeRecipient);

  // Deploy FortunaSquareMarketplace
  const FortunaSquareMarketplace = await ethers.getContractFactory("FortunaSquareMarketplace");
  const marketplace = await FortunaSquareMarketplace.deploy(feeRecipient);
  await marketplace.waitForDeployment();

  const marketplaceAddress = await marketplace.getAddress();
  console.log("\n✅ FortunaSquareMarketplace deployed to:", marketplaceAddress);

  // Configure SwapManager and RentalManager if you have them deployed
  const SWAP_MANAGER = process.env.NEXT_PUBLIC_SWAP_MANAGER_ADDRESS;
  const RENTAL_MANAGER = process.env.NEXT_PUBLIC_RENTAL_MANAGER_ADDRESS;

  if (SWAP_MANAGER && SWAP_MANAGER !== "NOT_DEPLOYED") {
    console.log("\n📝 Setting SwapManager address:", SWAP_MANAGER);
    const tx1 = await marketplace.setSwapManager(SWAP_MANAGER);
    await tx1.wait();
    console.log("✅ SwapManager configured");
  }

  if (RENTAL_MANAGER && RENTAL_MANAGER !== "NOT_DEPLOYED") {
    console.log("\n📝 Setting RentalManager address:", RENTAL_MANAGER);
    const tx2 = await marketplace.setRentalManager(RENTAL_MANAGER);
    await tx2.wait();
    console.log("✅ RentalManager configured");
  }

  // Display configuration
  console.log("\n📋 Marketplace Configuration:");
  console.log("  Sale Fee:", await marketplace.saleFeePercent(), "bps (2.5%)");
  console.log("  Fee Recipient:", await marketplace.feeRecipient());
  console.log("  Total Listings:", await marketplace.totalListings());

  console.log("\n🎯 Next Steps:");
  console.log("  1. Update .env.local with:");
  console.log(`     NEXT_PUBLIC_FORTUNA_MARKETPLACE_ADDRESS=${marketplaceAddress}`);
  console.log("\n  2. Restart dev server:");
  console.log("     pnpm run dev");
  console.log("\n  3. Test creating a listing!");
  console.log("\n✨ Deployment complete!\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
