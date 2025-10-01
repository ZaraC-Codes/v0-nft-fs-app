import { ethers } from "hardhat"

async function main() {
  console.log("🚀 Deploying Group Treasury Contracts...")

  // Get deployer account
  const [deployer] = await ethers.getSigners()
  console.log("📝 Deploying with account:", deployer.address)

  const balance = await deployer.getBalance()
  console.log("💰 Account balance:", ethers.utils.formatEther(balance), "APE")

  // Deploy GroupTreasuryNFT
  console.log("\n📦 Deploying GroupTreasuryNFT...")
  const GroupTreasuryNFT = await ethers.getContractFactory("GroupTreasuryNFT")
  const groupNFT = await GroupTreasuryNFT.deploy()
  await groupNFT.deployed()
  console.log("✅ GroupTreasuryNFT deployed to:", groupNFT.address)

  // Deploy GroupTreasuryManager
  console.log("\n📦 Deploying GroupTreasuryManager...")
  const GroupTreasuryManager = await ethers.getContractFactory("GroupTreasuryManager")
  const groupManager = await GroupTreasuryManager.deploy(groupNFT.address)
  await groupManager.deployed()
  console.log("✅ GroupTreasuryManager deployed to:", groupManager.address)

  // Deploy GroupChatRelay
  console.log("\n📦 Deploying GroupChatRelay...")
  const GroupChatRelay = await ethers.getContractFactory("GroupChatRelay")
  const chatRelay = await GroupChatRelay.deploy(groupManager.address)
  await chatRelay.deployed()
  console.log("✅ GroupChatRelay deployed to:", chatRelay.address)

  // Summary
  console.log("\n" + "=".repeat(60))
  console.log("🎉 DEPLOYMENT COMPLETE!")
  console.log("=".repeat(60))
  console.log("\n📋 Contract Addresses:")
  console.log("   GroupTreasuryNFT:    ", groupNFT.address)
  console.log("   GroupTreasuryManager:", groupManager.address)
  console.log("   GroupChatRelay:      ", chatRelay.address)

  console.log("\n⚙️  Next Steps:")
  console.log("1. Update contract addresses in lib/group-treasury.ts")
  console.log("2. Update GROUP_TREASURY_ADDRESSES with:")
  console.log(`   groupNFT: "${groupNFT.address}",`)
  console.log(`   manager: "${groupManager.address}",`)
  console.log(`   chatRelay: "${chatRelay.address}",`)
  console.log("\n3. Restart your dev server: pnpm run dev")
  console.log("\n4. Configure backend relayer for gasless chat transactions")
  console.log("   - Set relayer address in .env.local")
  console.log("   - Fund relayer wallet for gas sponsorship")

  console.log("\n" + "=".repeat(60))
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
