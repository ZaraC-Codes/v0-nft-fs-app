import { ethers } from "hardhat"

async function main() {
  console.log("🚀 Deploying GroupChatRelay contract to ApeChain...")

  // Get the deployer account
  const [deployer] = await ethers.getSigners()
  console.log("📝 Deploying with account:", deployer.address)

  // Check balance
  const balance = await ethers.provider.getBalance(deployer.address)
  console.log("💰 Account balance:", ethers.formatEther(balance), "APE")

  // Deploy GroupChatRelay
  // Constructor parameter: groupManager address (can be zero address if not using group treasury integration)
  const groupManagerAddress = "0x0000000000000000000000000000000000000000" // No group manager needed for collection chats

  console.log("\n📦 Deploying GroupChatRelay...")
  const GroupChatRelay = await ethers.getContractFactory("GroupChatRelay")
  const groupChatRelay = await GroupChatRelay.deploy(groupManagerAddress)

  await groupChatRelay.waitForDeployment()
  const groupChatRelayAddress = await groupChatRelay.getAddress()

  console.log("✅ GroupChatRelay deployed to:", groupChatRelayAddress)

  // Verify deployer is authorized relayer
  const isAuthorized = await groupChatRelay.authorizedRelayers(deployer.address)
  console.log("🔐 Deployer is authorized relayer:", isAuthorized)

  console.log("\n" + "=".repeat(60))
  console.log("📋 DEPLOYMENT SUMMARY")
  console.log("=".repeat(60))
  console.log("GroupChatRelay:        ", groupChatRelayAddress)
  console.log("Deployer (Relayer):    ", deployer.address)
  console.log("Group Manager:         ", groupManagerAddress)
  console.log("=".repeat(60))

  console.log("\n✅ Add this to your .env.local file:")
  console.log(`NEXT_PUBLIC_GROUP_CHAT_RELAY_ADDRESS=${groupChatRelayAddress}`)

  console.log("\n🔧 Next steps:")
  console.log("1. Add the contract address to .env.local")
  console.log("2. Deploy to Vercel with: vercel env add NEXT_PUBLIC_GROUP_CHAT_RELAY_ADDRESS")
  console.log("3. Update API routes to use this contract")
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
