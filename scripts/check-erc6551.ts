/**
 * Check if ERC-6551 contracts are deployed on ApeChain Curtis
 * Run: npx hardhat run scripts/check-erc6551.ts --network apechain_curtis
 */

import { ethers } from "hardhat";

const ERC6551_REGISTRY = "0x000000006551c19487814612e58FE06813775758";
const ERC6551_ACCOUNT_IMPLEMENTATION = "0x41C8f39463A868d3A88af00cd0fe7102F30E44eC";

async function main() {
  console.log("\n🔍 Checking ERC-6551 deployment on ApeChain Curtis...\n");

  const provider = ethers.provider;

  // Check Registry
  console.log("📋 Checking ERC-6551 Registry:");
  console.log(`   Address: ${ERC6551_REGISTRY}`);
  const registryCode = await provider.getCode(ERC6551_REGISTRY);
  const registryDeployed = registryCode !== "0x";
  console.log(`   Status: ${registryDeployed ? "✅ DEPLOYED" : "❌ NOT DEPLOYED"}\n`);

  // Check Account Implementation
  console.log("🔐 Checking ERC-6551 Account Implementation:");
  console.log(`   Address: ${ERC6551_ACCOUNT_IMPLEMENTATION}`);
  const accountCode = await provider.getCode(ERC6551_ACCOUNT_IMPLEMENTATION);
  const accountDeployed = accountCode !== "0x";
  console.log(`   Status: ${accountDeployed ? "✅ DEPLOYED" : "❌ NOT DEPLOYED"}\n`);

  // Summary
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  if (registryDeployed && accountDeployed) {
    console.log("✅ ERC-6551 is READY on ApeChain Curtis!");
    console.log("\n📝 Add these to your .env.local:");
    console.log(`NEXT_PUBLIC_ERC6551_REGISTRY_ADDRESS=${ERC6551_REGISTRY}`);
    console.log(`NEXT_PUBLIC_ERC6551_ACCOUNT_IMPLEMENTATION=${ERC6551_ACCOUNT_IMPLEMENTATION}`);
  } else {
    console.log("❌ ERC-6551 is NOT deployed on ApeChain Curtis");
    console.log("\n📝 You need to deploy ERC-6551 contracts first.");
    console.log("   See ERC6551_SETUP.md for deployment instructions.");
  }
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
