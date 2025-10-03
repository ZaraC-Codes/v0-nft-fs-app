import hre from "hardhat";
const { ethers } = hre;

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log(`\n🚀 Deploying to ${hre.network.name} (Chain ID: ${await deployer.provider.getNetwork().then(n => n.chainId)})...`);
  console.log("Deploying with account:", deployer.address);
  console.log("Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH");

  // Step 1: Deploy Account Implementation
  console.log("\n📦 Step 1: Deploying FortunaSquareBundleAccount...");
  const AccountImpl = await ethers.getContractFactory("FortunaSquareBundleAccount");
  const accountImpl = await AccountImpl.deploy();
  await accountImpl.waitForDeployment();
  const accountImplAddress = await accountImpl.getAddress();
  console.log("✅ Account Implementation deployed:", accountImplAddress);

  // Step 2: Deploy Bundle Contract
  console.log("\n📦 Step 2: Deploying BundleNFTUnified...");
  const BundleContract = await ethers.getContractFactory("contracts/BundleNFTUnified_Updated.sol:BundleNFTUnified");
  const bundleContract = await BundleContract.deploy(
    "0x000000006551c19487814612e58FE06813775758", // ERC6551 Registry
    accountImplAddress // Account Implementation
  );
  await bundleContract.waitForDeployment();
  const bundleContractAddress = await bundleContract.getAddress();
  console.log("✅ Bundle Contract deployed:", bundleContractAddress);

  // Step 3: Initialize Account Implementation
  console.log("\n⚙️ Step 3: Initializing Account Implementation...");
  const initTx = await accountImpl.initialize(bundleContractAddress);
  await initTx.wait();
  console.log("✅ Account Implementation initialized!");

  // Step 4: Verify Setup
  console.log("\n🔍 Verifying Setup...");
  const configuredBundle = await accountImpl.bundleContract();
  const isInitialized = await accountImpl.initialized();

  console.log("Configured Bundle Contract:", configuredBundle);
  console.log("Is Initialized:", isInitialized);
  console.log("Addresses Match:", configuredBundle === bundleContractAddress);

  if (configuredBundle === bundleContractAddress && isInitialized) {
    console.log("\n🎉 DEPLOYMENT SUCCESSFUL!");
    console.log("\n📋 Update your config with these addresses:");
    console.log(`bundleNFT: "${bundleContractAddress}",`);
    console.log(`bundleManager: "${bundleContractAddress}",`);
    console.log(`accountImplementation: "${accountImplAddress}",`);
    console.log(`erc6551Registry: "0x000000006551c19487814612e58FE06813775758",`);

    return {
      bundleContract: bundleContractAddress,
      accountImplementation: accountImplAddress
    };
  } else {
    throw new Error("❌ Deployment verification failed!");
  }
}

main()
  .then((addresses) => {
    console.log("\n✅ Deployment complete!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
