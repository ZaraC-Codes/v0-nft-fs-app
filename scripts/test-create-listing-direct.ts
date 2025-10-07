/**
 * DIRECT LISTING CREATION TEST
 *
 * Creates a rental listing directly via script to isolate contract functionality
 * This bypasses all frontend code to test if the contract works
 *
 * Run with: npx tsx scripts/test-create-listing-direct.ts <wrapperId>
 *
 * Example: npx tsx scripts/test-create-listing-direct.ts 0
 */

import { createThirdwebClient, getContract, prepareContractCall, readContract, sendTransaction, waitForReceipt } from "thirdweb";
import { privateKeyToAccount } from "thirdweb/wallets";
import { apeChain } from "thirdweb/chains";
import "dotenv/config";

const client = createThirdwebClient({
  clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID!,
});

const account = privateKeyToAccount({
  client,
  privateKey: `0x${process.env.PRIVATE_KEY}`,
});

const RENTAL_MANAGER_ADDRESS = process.env.NEXT_PUBLIC_RENTAL_MANAGER_ADDRESS!;
const RENTAL_WRAPPER_ADDRESS = process.env.NEXT_PUBLIC_RENTAL_WRAPPER_ADDRESS!;

// Get wrapper ID from command line
const wrapperId = process.argv[2];

if (!wrapperId) {
  console.error("\n❌ Error: Please provide wrapper ID as argument");
  console.log("\nUsage: npx tsx scripts/test-create-listing-direct.ts <wrapperId>");
  console.log("Example: npx tsx scripts/test-create-listing-direct.ts 0\n");
  process.exit(1);
}

console.log("\n=== DIRECT LISTING CREATION TEST ===\n");
console.log("Network: ApeChain Mainnet");
console.log("Account:", account.address);
console.log("Wrapper ID:", wrapperId);
console.log("Manager:", RENTAL_MANAGER_ADDRESS);
console.log("\n" + "=".repeat(50) + "\n");

async function run() {
  const wrapperContract = getContract({
    client,
    chain: apeChain,
    address: RENTAL_WRAPPER_ADDRESS,
  });

  const managerContract = getContract({
    client,
    chain: apeChain,
    address: RENTAL_MANAGER_ADDRESS,
  });

  try {
    // Step 1: Verify wrapper ownership
    console.log("Step 1: Verifying wrapper ownership");
    console.log("-".repeat(50));

    const owner = await readContract({
      contract: wrapperContract,
      method: "function ownerOf(uint256 tokenId) view returns (address)",
      params: [BigInt(wrapperId)],
    });

    console.log(`Wrapper ${wrapperId} owner: ${owner}`);
    console.log(`Your address: ${account.address}`);

    if (owner.toLowerCase() !== account.address.toLowerCase()) {
      console.log("\n❌ ERROR: You don't own this wrapper NFT");
      console.log("   Only the wrapper owner can create rental listings");
      return;
    }

    console.log("✅ Ownership verified\n");

    // Step 2: Check if already rented
    console.log("Step 2: Checking if wrapper is currently rented");
    console.log("-".repeat(50));

    const currentRenter = await readContract({
      contract: wrapperContract,
      method: "function userOf(uint256 tokenId) view returns (address)",
      params: [BigInt(wrapperId)],
    });

    console.log(`Current renter: ${currentRenter}`);

    if (currentRenter !== "0x0000000000000000000000000000000000000000") {
      console.log("\n❌ ERROR: Wrapper is currently rented");
      console.log("   Cannot create listing while NFT is rented");
      return;
    }

    console.log("✅ Not currently rented\n");

    // Step 3: Check existing listing
    console.log("Step 3: Checking for existing listing");
    console.log("-".repeat(50));

    const beforeInfo = await readContract({
      contract: managerContract,
      method: "function getRentalInfo(uint256 wrapperId) view returns ((uint256 wrapperId, address owner, uint256 pricePerDay, uint256 minRentalDays, uint256 maxRentalDays, bool isActive, uint256 createdAt) listing, address currentRenter, uint64 expiresAt)",
      params: [BigInt(wrapperId)],
    });

    console.log("Before creating listing:");
    console.log(`  isActive: ${beforeInfo.listing.isActive}`);
    console.log(`  owner: ${beforeInfo.listing.owner}`);
    console.log(`  pricePerDay: ${beforeInfo.listing.pricePerDay.toString()}`);
    console.log(`  createdAt: ${beforeInfo.listing.createdAt.toString()}\n`);

    if (beforeInfo.listing.isActive) {
      console.log("⚠️  WARNING: Listing already active");
      console.log("   Proceeding anyway (will update listing)");
    }

    // Step 4: Create listing
    console.log("\nStep 4: Creating rental listing");
    console.log("-".repeat(50));

    const pricePerDay = BigInt("100000000000000000"); // 0.1 APE in wei
    const minDays = BigInt(1);
    const maxDays = BigInt(7);

    console.log("Listing parameters:");
    console.log(`  Price per day: ${pricePerDay.toString()} wei (0.1 APE)`);
    console.log(`  Min rental days: ${minDays}`);
    console.log(`  Max rental days: ${maxDays}\n`);

    const transaction = prepareContractCall({
      contract: managerContract,
      method: "function createRentalListing(uint256 wrapperId, uint256 pricePerDay, uint256 minRentalDays, uint256 maxRentalDays)",
      params: [BigInt(wrapperId), pricePerDay, minDays, maxDays],
    });

    console.log("⏳ Sending transaction...");
    const result = await sendTransaction({
      transaction,
      account,
    });

    console.log("  Transaction hash:", result.transactionHash);
    console.log("  Explorer:", `https://apechain.calderaexplorer.xyz/tx/${result.transactionHash}`);

    console.log("\n⏳ Waiting for confirmation...");
    const receipt = await waitForReceipt(result);

    console.log("  ✅ Confirmed in block:", receipt.blockNumber);
    console.log("  Status:", receipt.status === "success" ? "✅ SUCCESS" : "❌ REVERTED");

    if (receipt.status !== "success") {
      console.log("\n❌ Transaction reverted - listing not created");
      return;
    }

    // Step 5: Verify listing was created
    console.log("\n\nStep 5: Verifying listing creation");
    console.log("-".repeat(50));

    // Wait 2 seconds to ensure state is updated
    await new Promise(resolve => setTimeout(resolve, 2000));

    const afterInfo = await readContract({
      contract: managerContract,
      method: "function getRentalInfo(uint256 wrapperId) view returns ((uint256 wrapperId, address owner, uint256 pricePerDay, uint256 minRentalDays, uint256 maxRentalDays, bool isActive, uint256 createdAt) listing, address currentRenter, uint64 expiresAt)",
      params: [BigInt(wrapperId)],
    });

    console.log("After creating listing:");
    console.log(`  isActive: ${afterInfo.listing.isActive ? "✅ true" : "❌ false"}`);
    console.log(`  owner: ${afterInfo.listing.owner}`);
    console.log(`  pricePerDay: ${afterInfo.listing.pricePerDay.toString()}`);
    console.log(`  minRentalDays: ${afterInfo.listing.minRentalDays.toString()}`);
    console.log(`  maxRentalDays: ${afterInfo.listing.maxRentalDays.toString()}`);
    console.log(`  createdAt: ${afterInfo.listing.createdAt.toString()}\n`);

    // Step 6: Compare before/after
    console.log("\nStep 6: Analysis");
    console.log("-".repeat(50));

    const wasActive = beforeInfo.listing.isActive;
    const isNowActive = afterInfo.listing.isActive;
    const priceChanged = beforeInfo.listing.pricePerDay !== afterInfo.listing.pricePerDay;
    const timestampChanged = beforeInfo.listing.createdAt !== afterInfo.listing.createdAt;

    console.log("Changes detected:");
    console.log(`  Was active: ${wasActive}`);
    console.log(`  Now active: ${isNowActive} ${isNowActive && !wasActive ? "✅ (newly created)" : ""}`);
    console.log(`  Price changed: ${priceChanged ? "✅" : "❌"}`);
    console.log(`  Timestamp changed: ${timestampChanged ? "✅" : "❌"}\n`);

    if (isNowActive && (priceChanged || timestampChanged)) {
      console.log("✅ SUCCESS: Listing created/updated successfully!");
    } else if (!isNowActive && afterInfo.listing.owner === "0x0000000000000000000000000000000000000000") {
      console.log("❌ FAILURE: Listing was NOT created (empty struct returned)");
      console.log("   Possible causes:");
      console.log("   1. Transaction reverted silently");
      console.log("   2. Contract storage not updating");
      console.log("   3. Reading from wrong contract address");
    } else if (!isNowActive && afterInfo.listing.owner !== "0x0000000000000000000000000000000000000000") {
      console.log("❌ CRITICAL: Listing data exists but isActive = false!");
      console.log("   This indicates a contract bug in createRentalListing()");
      console.log("   The struct is created but isActive is not set to true");
    }

    // Step 7: Check allListingIds
    console.log("\n\nStep 7: Checking allListingIds array");
    console.log("-".repeat(50));

    let foundInArray = false;
    let arrayContents: bigint[] = [];

    for (let i = 0; i < 20; i++) {
      try {
        const id = await readContract({
          contract: managerContract,
          method: "function allListingIds(uint256 index) view returns (uint256)",
          params: [BigInt(i)],
        });
        arrayContents.push(id);
        if (id === BigInt(wrapperId)) {
          foundInArray = true;
        }
      } catch {
        break;
      }
    }

    console.log(`Array contents: [${arrayContents.join(", ")}]`);
    console.log(`Wrapper ${wrapperId} in array: ${foundInArray ? "✅ YES" : "❌ NO"}\n`);

    if (isNowActive && !foundInArray) {
      console.log("⚠️  WARNING: Listing is active but not in allListingIds array");
      console.log("   This will prevent it from showing in getActiveListings()");
    }

    if (!isNowActive && foundInArray) {
      console.log("⚠️  WARNING: Wrapper in array but listing inactive");
      console.log("   Array push executed but isActive not set");
    }

    console.log("\n" + "=".repeat(50) + "\n");

  } catch (error: any) {
    console.error("\n❌ Fatal error:", error.message);
    console.error(error);
  }
}

run();
