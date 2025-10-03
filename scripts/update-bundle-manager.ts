import { ethers } from "hardhat";

async function main() {
  const bundleNFTAddress = "0xB4D6608abc304B0395BE12bFE2304954dD85B64C";
  const newBundleManagerAddress = "0x6Da979FF28Bc778ddD730CC8d4d57C010131379E";

  console.log("📝 Updating BundleNFT to authorize new BundleManager...");
  console.log("BundleNFT address:", bundleNFTAddress);
  console.log("New BundleManager address:", newBundleManagerAddress);

  // Get the BundleNFT contract
  const BundleNFT = await ethers.getContractFactory("BundleNFT");
  const bundleNFT = BundleNFT.attach(bundleNFTAddress);

  // Call setBundleManager
  console.log("\n🔄 Calling setBundleManager on BundleNFT...");
  const tx1 = await bundleNFT.setBundleManager(newBundleManagerAddress);
  console.log("⏳ Transaction sent:", tx1.hash);
  console.log("⏳ Waiting for confirmation...");
  await tx1.wait();
  console.log("✅ BundleNFT now authorizes BundleManager to mint/burn!");

  // Get the BundleManager contract
  const BundleManager = await ethers.getContractFactory("BundleManager");
  const bundleManager = BundleManager.attach(newBundleManagerAddress);

  // Call setBundleNFT
  console.log("\n🔄 Calling setBundleNFT on BundleManager...");
  const tx2 = await bundleManager.setBundleNFT(bundleNFTAddress);
  console.log("⏳ Transaction sent:", tx2.hash);
  console.log("⏳ Waiting for confirmation...");
  await tx2.wait();
  console.log("✅ BundleManager now knows about BundleNFT contract!");

  console.log("\n✅ Setup complete! You can now create and unwrap bundles.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
