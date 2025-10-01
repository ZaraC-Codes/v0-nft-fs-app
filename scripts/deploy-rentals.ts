import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("========================================");
  console.log("Deploying Rental Contracts");
  console.log("========================================");
  console.log("Deploying with account:", deployer.address);
  console.log("Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH");
  console.log("");

  // ERC6551 addresses
  const ERC6551_REGISTRY = "0x000000006551c19487814612e58FE06813775758";
  const ACCOUNT_IMPLEMENTATION = "0xaaf75c1727304f0990487517b5eb1c961b7dfade";

  // Platform fee recipient (update with your platform wallet)
  const FEE_RECIPIENT = deployer.address; // Using deployer for now, update as needed

  console.log("Using ERC6551 Registry:", ERC6551_REGISTRY);
  console.log("Using Account Implementation:", ACCOUNT_IMPLEMENTATION);
  console.log("Platform Fee Recipient:", FEE_RECIPIENT);
  console.log("");

  // Deploy RentalWrapper
  console.log("1/3 - Deploying RentalWrapper...");
  const RentalWrapper = await ethers.getContractFactory("RentalWrapper");
  const rentalWrapper = await RentalWrapper.deploy();
  await rentalWrapper.waitForDeployment();
  const rentalWrapperAddress = await rentalWrapper.getAddress();
  console.log("✅ RentalWrapper deployed to:", rentalWrapperAddress);
  console.log("");

  // Deploy RentalManager
  console.log("2/3 - Deploying RentalManager...");
  const RentalManager = await ethers.getContractFactory("RentalManager");
  const rentalManager = await RentalManager.deploy(
    ERC6551_REGISTRY,
    ACCOUNT_IMPLEMENTATION,
    FEE_RECIPIENT
  );
  await rentalManager.waitForDeployment();
  const rentalManagerAddress = await rentalManager.getAddress();
  console.log("✅ RentalManager deployed to:", rentalManagerAddress);
  console.log("");

  // Set RentalManager in RentalWrapper
  console.log("3/3 - Linking contracts...");
  const tx1 = await rentalWrapper.setRentalManager(rentalManagerAddress);
  await tx1.wait();
  console.log("✅ RentalManager set in RentalWrapper");

  // Set RentalWrapper in RentalManager
  const tx2 = await rentalManager.setRentalWrapper(rentalWrapperAddress);
  await tx2.wait();
  console.log("✅ RentalWrapper set in RentalManager");
  console.log("");

  console.log("========================================");
  console.log("Deployment Complete!");
  console.log("========================================");
  console.log("");
  console.log("📝 Contract Addresses:");
  console.log("RentalWrapper:         ", rentalWrapperAddress);
  console.log("RentalManager:         ", rentalManagerAddress);
  console.log("ERC6551 Registry:      ", ERC6551_REGISTRY);
  console.log("Account Implementation:", ACCOUNT_IMPLEMENTATION);
  console.log("Fee Recipient:         ", FEE_RECIPIENT);
  console.log("");
  console.log("🔧 Next Steps:");
  console.log("1. Update lib/rental.ts with these addresses:");
  console.log(`   rentalWrapper: "${rentalWrapperAddress}",`);
  console.log(`   rentalManager: "${rentalManagerAddress}",`);
  console.log("");
  console.log("2. (Optional) Verify contracts on block explorer:");
  console.log(`   npx hardhat verify --network <network-name> ${rentalWrapperAddress}`);
  console.log(`   npx hardhat verify --network <network-name> ${rentalManagerAddress} \\`);
  console.log(`     "${ERC6551_REGISTRY}" "${ACCOUNT_IMPLEMENTATION}" "${FEE_RECIPIENT}"`);
  console.log("");
  console.log("========================================");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });