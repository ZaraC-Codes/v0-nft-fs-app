import { ethers } from "hardhat";

/**
 * Deployment script for Fortuna Square Rental System with Delegate.cash
 *
 * Deploys:
 * 1. FortunaSquareRentalAccount (TBA implementation)
 * 2. RentalWrapperDelegated (ERC721 + ERC4907 wrapper)
 * 3. RentalManagerDelegated (Rental marketplace)
 *
 * Network: ApeChain MAINNET (chain ID: 33139)
 */
async function main() {
  console.log("🚀 Deploying Fortuna Square Rental System to MAINNET with Delegate.cash...\n");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying from:", deployer.address);
  console.log("Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "APE\n");

  // Platform fee recipient (deployer for now, can be changed later)
  const feeRecipient = deployer.address;

  // ========================================
  // 1. Deploy FortunaSquareRentalAccount
  // ========================================
  console.log("📦 Deploying FortunaSquareRentalAccount (TBA implementation)...");
  const RentalAccount = await ethers.getContractFactory("FortunaSquareRentalAccount");
  const rentalAccount = await RentalAccount.deploy();
  await rentalAccount.waitForDeployment();
  const rentalAccountAddress = await rentalAccount.getAddress();
  console.log("✅ FortunaSquareRentalAccount deployed to:", rentalAccountAddress);
  console.log("   - Delegate.cash registry:", await rentalAccount.DELEGATE_REGISTRY());
  console.log();

  // ========================================
  // 2. Deploy RentalWrapperDelegated
  // ========================================
  console.log("📦 Deploying RentalWrapperDelegated (ERC721 + ERC4907 wrapper)...");
  const RentalWrapper = await ethers.getContractFactory("RentalWrapperDelegated");
  // We'll set rental manager after deploying it
  const rentalWrapper = await RentalWrapper.deploy(
    rentalAccountAddress,
    ethers.ZeroAddress // Temporary, will update after deploying manager
  );
  await rentalWrapper.waitForDeployment();
  const rentalWrapperAddress = await rentalWrapper.getAddress();
  console.log("✅ RentalWrapperDelegated deployed to:", rentalWrapperAddress);
  console.log("   - Account implementation:", rentalAccountAddress);
  console.log("   - ERC6551 Registry:", await rentalWrapper.ERC6551_REGISTRY());
  console.log();

  // ========================================
  // 3. Deploy RentalManagerDelegated
  // ========================================
  console.log("📦 Deploying RentalManagerDelegated (Rental marketplace)...");
  const RentalManager = await ethers.getContractFactory("RentalManagerDelegated");
  const rentalManager = await RentalManager.deploy(
    rentalWrapperAddress,
    feeRecipient
  );
  await rentalManager.waitForDeployment();
  const rentalManagerAddress = await rentalManager.getAddress();
  console.log("✅ RentalManagerDelegated deployed to:", rentalManagerAddress);
  console.log("   - Wrapper contract:", rentalWrapperAddress);
  console.log("   - Fee recipient:", feeRecipient);
  console.log("   - Platform fee:", await rentalManager.platformFeeBps(), "bps (2.5%)");
  console.log();

  // ========================================
  // 4. Configure RentalWrapper with Manager
  // ========================================
  console.log("⚙️  Configuring RentalWrapper with RentalManager...");
  const tx = await rentalWrapper.setRentalManager(rentalManagerAddress);
  await tx.wait();
  console.log("✅ RentalWrapper configured with RentalManager\n");

  // ========================================
  // Deployment Summary
  // ========================================
  console.log("=" .repeat(60));
  console.log("🎉 MAINNET DEPLOYMENT COMPLETE!");
  console.log("=" .repeat(60));
  console.log("\n📋 Contract Addresses (MAINNET):\n");
  console.log("FortunaSquareRentalAccount:", rentalAccountAddress);
  console.log("RentalWrapperDelegated:    ", rentalWrapperAddress);
  console.log("RentalManagerDelegated:    ", rentalManagerAddress);
  console.log("\n📝 Add these to your .env.local:\n");
  console.log(`NEXT_PUBLIC_RENTAL_ACCOUNT_ADDRESS=${rentalAccountAddress}`);
  console.log(`NEXT_PUBLIC_RENTAL_WRAPPER_ADDRESS=${rentalWrapperAddress}`);
  console.log(`NEXT_PUBLIC_RENTAL_MANAGER_ADDRESS=${rentalManagerAddress}`);
  console.log("\n🔗 Delegate.cash Registry: 0x00000000000000447e69651d841bD8D104Bed493");
  console.log("🔗 ERC6551 Registry:       0x000000006551c19487814612e58FE06813775758");
  console.log("\n💡 Features Enabled:");
  console.log("   ✅ Wrap any ERC721 NFT for rental");
  console.log("   ✅ Custom pricing and duration");
  console.log("   ✅ Delegate.cash integration for token-gating");
  console.log("   ✅ Zero collateral rentals");
  console.log("   ✅ 2.5% platform fee");
  console.log("   ✅ ERC4907 compliance");
  console.log("\n🔍 Verify contracts on explorer:");
  console.log(`   npx hardhat verify --network apechain ${rentalAccountAddress}`);
  console.log(`   npx hardhat verify --network apechain ${rentalWrapperAddress} "${rentalAccountAddress}" "${ethers.ZeroAddress}"`);
  console.log(`   npx hardhat verify --network apechain ${rentalManagerAddress} "${rentalWrapperAddress}" "${feeRecipient}"`);
  console.log("\n⚠️  MAINNET - REAL APE - BE CAREFUL!");
  console.log("=" .repeat(60));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
