import { ethers } from "hardhat";

async function main() {
  console.log("🚀 Deploying Test NFT contracts to ApeChain Curtis...\n");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  console.log("Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "APE\n");

  // Deploy TestERC721
  console.log("📝 Deploying TestERC721...");
  const TestERC721 = await ethers.getContractFactory("TestERC721");
  const testERC721 = await TestERC721.deploy();
  await testERC721.waitForDeployment();
  const erc721Address = await testERC721.getAddress();
  console.log("✅ TestERC721 deployed to:", erc721Address);

  // Deploy TestERC1155
  console.log("\n📝 Deploying TestERC1155...");
  const TestERC1155 = await ethers.getContractFactory("TestERC1155");
  const testERC1155 = await TestERC1155.deploy();
  await testERC1155.waitForDeployment();
  const erc1155Address = await testERC1155.getAddress();
  console.log("✅ TestERC1155 deployed to:", erc1155Address);

  console.log("\n📝 Deployment Summary:");
  console.log("=".repeat(60));
  console.log("TestERC721:", erc721Address);
  console.log("TestERC1155:", erc1155Address);
  console.log("=".repeat(60));

  console.log("\n✅ Update these addresses in app/mint/page.tsx:");
  console.log(`const ERC721_CONTRACT = '${erc721Address}'`);
  console.log(`const ERC1155_CONTRACT = '${erc1155Address}'`);

  console.log("\n🎯 Next steps:");
  console.log("1. Update contract addresses in app/mint/page.tsx");
  console.log("2. Visit http://localhost:3001/mint");
  console.log("3. Mint test NFTs");
  console.log("4. Try listing them on the marketplace");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
