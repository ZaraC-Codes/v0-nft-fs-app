/**
 * RENTAL LISTING DEBUG SCRIPT
 *
 * Comprehensive testing to diagnose why rental listings show isActive: false
 *
 * Run with: npx tsx scripts/debug-rental-listing.ts
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

console.log("\n=== RENTAL LISTING DIAGNOSTICS ===\n");
console.log("Network: ApeChain Mainnet");
console.log("Rental Manager:", RENTAL_MANAGER_ADDRESS);
console.log("Rental Wrapper:", RENTAL_WRAPPER_ADDRESS);
console.log("Test Account:", account.address);
console.log("\n" + "=".repeat(50) + "\n");

async function test1_DirectContractRead() {
  console.log("TEST 1: Direct Contract Storage Read");
  console.log("Purpose: Read listing data directly from contract storage");
  console.log("-".repeat(50));

  const contract = getContract({
    client,
    chain: apeChain,
    address: RENTAL_MANAGER_ADDRESS,
  });

  // Test wrapper IDs 0, 1, 2
  for (const wrapperId of [0, 1, 2]) {
    console.log(`\n📦 Wrapper ID: ${wrapperId}`);

    try {
      const result = await readContract({
        contract,
        method: "function getRentalInfo(uint256 wrapperId) view returns ((uint256 wrapperId, address owner, uint256 pricePerDay, uint256 minRentalDays, uint256 maxRentalDays, bool isActive, uint256 createdAt) listing, address currentRenter, uint64 expiresAt)",
        params: [BigInt(wrapperId)],
      });

      console.log("  Raw result:", JSON.stringify(result, (key, value) =>
        typeof value === "bigint" ? value.toString() : value, 2
      ));

      console.log("\n  Parsed listing:");
      console.log("    wrapperId:", result.listing.wrapperId.toString());
      console.log("    owner:", result.listing.owner);
      console.log("    pricePerDay:", result.listing.pricePerDay.toString());
      console.log("    minRentalDays:", result.listing.minRentalDays.toString());
      console.log("    maxRentalDays:", result.listing.maxRentalDays.toString());
      console.log("    isActive:", result.listing.isActive);
      console.log("    createdAt:", result.listing.createdAt.toString());
      console.log("    currentRenter:", result.currentRenter);
      console.log("    expiresAt:", result.expiresAt.toString());

      // Check if listing is default/empty
      if (result.listing.owner === "0x0000000000000000000000000000000000000000") {
        console.log("  ⚠️  EMPTY LISTING - No listing exists for this wrapper ID");
      } else if (!result.listing.isActive) {
        console.log("  ❌ INACTIVE - Listing exists but isActive = false");
      } else {
        console.log("  ✅ ACTIVE - Listing is active");
      }
    } catch (error: any) {
      console.error("  ❌ Error reading wrapper:", error.message);
    }
  }

  console.log("\n" + "=".repeat(50) + "\n");
}

async function test2_AllListingIds() {
  console.log("TEST 2: Check allListingIds Array");
  console.log("Purpose: Verify if wrapper IDs were added to allListingIds");
  console.log("-".repeat(50));

  const contract = getContract({
    client,
    chain: apeChain,
    address: RENTAL_MANAGER_ADDRESS,
  });

  try {
    // Read allListingIds array (check first 10 entries)
    console.log("\n📋 Reading allListingIds array:");
    const listingIds: bigint[] = [];

    for (let i = 0; i < 10; i++) {
      try {
        const id = await readContract({
          contract,
          method: "function allListingIds(uint256 index) view returns (uint256)",
          params: [BigInt(i)],
        });
        listingIds.push(id);
        console.log(`  allListingIds[${i}] = ${id}`);
      } catch {
        console.log(`  allListingIds[${i}] = (out of bounds)`);
        break;
      }
    }

    console.log("\n📊 Summary:");
    console.log("  Total listing IDs found:", listingIds.length);
    console.log("  Contains wrapper 0?", listingIds.includes(0n) ? "✅ YES" : "❌ NO");
    console.log("  Contains wrapper 1?", listingIds.includes(1n) ? "✅ YES" : "❌ NO");
    console.log("  Contains wrapper 2?", listingIds.includes(2n) ? "✅ YES" : "❌ NO");

    if (listingIds.length === 0) {
      console.log("\n⚠️  CRITICAL: No listings in allListingIds array!");
      console.log("   This suggests createRentalListing() is NOT executing the push to array");
    }
  } catch (error: any) {
    console.error("❌ Error reading allListingIds:", error.message);
  }

  console.log("\n" + "=".repeat(50) + "\n");
}

async function test3_TransactionAnalysis() {
  console.log("TEST 3: Transaction Analysis");
  console.log("Purpose: Analyze known transaction to verify it called createRentalListing");
  console.log("-".repeat(50));

  const txHash = "0x342e1354161988f0ea86cf8c665069264ccb0ed70f9a40f4d13a9687337e8896";
  console.log("\n🔍 Transaction:", txHash);
  console.log("🌐 Explorer: https://apechain.calderaexplorer.xyz/tx/" + txHash);

  // Note: ThirdWeb SDK doesn't expose transaction input data directly
  // User needs to check transaction in block explorer manually
  console.log("\n📝 Manual Verification Steps:");
  console.log("  1. Open transaction in block explorer (link above)");
  console.log("  2. Check 'Input Data' section");
  console.log("  3. First 4 bytes (function selector) should be:");
  console.log("     createRentalListing(uint256,uint256,uint256,uint256) = 0x????????");
  console.log("  4. Decode remaining bytes to verify parameters:");
  console.log("     - wrapperId (uint256)");
  console.log("     - pricePerDay (uint256)");
  console.log("     - minRentalDays (uint256)");
  console.log("     - maxRentalDays (uint256)");
  console.log("  5. Check 'Logs' tab for RentalListingCreated event");
  console.log("  6. Check 'State Changes' tab (if available)");

  console.log("\n" + "=".repeat(50) + "\n");
}

async function test4_EventsQuery() {
  console.log("TEST 4: Query RentalListingCreated Events");
  console.log("Purpose: Fetch events to see if listing creation was logged");
  console.log("-".repeat(50));

  const contract = getContract({
    client,
    chain: apeChain,
    address: RENTAL_MANAGER_ADDRESS,
  });

  try {
    const { getContractEvents, prepareEvent } = await import("thirdweb");

    // Prepare event filter
    const rentalListingCreatedEvent = prepareEvent({
      signature: "event RentalListingCreated(uint256 indexed wrapperId, address indexed owner, uint256 pricePerDay, uint256 minDays, uint256 maxDays)",
    });

    console.log("\n📡 Fetching RentalListingCreated events...");

    const events = await getContractEvents({
      contract,
      events: [rentalListingCreatedEvent],
      fromBlock: 0n,
      toBlock: "latest" as any,
    });

    console.log(`\n📊 Found ${events.length} event(s):\n`);

    events.forEach((event: any, i: number) => {
      console.log(`Event #${i + 1}:`);
      console.log("  Block:", event.blockNumber);
      console.log("  Transaction:", event.transactionHash);
      console.log("  wrapperId:", event.args?.wrapperId?.toString() || "N/A");
      console.log("  owner:", event.args?.owner || "N/A");
      console.log("  pricePerDay:", event.args?.pricePerDay?.toString() || "N/A");
      console.log("  minDays:", event.args?.minDays?.toString() || "N/A");
      console.log("  maxDays:", event.args?.maxDays?.toString() || "N/A");
      console.log("");
    });

    if (events.length === 0) {
      console.log("⚠️  NO EVENTS FOUND!");
      console.log("   Possible causes:");
      console.log("   1. createRentalListing() was never called successfully");
      console.log("   2. Transaction reverted silently (unlikely - receipt would show status: 0)");
      console.log("   3. Event not emitted (contract bug - but code looks correct)");
    }
  } catch (error: any) {
    console.error("❌ Error fetching events:", error.message);
  }

  console.log("\n" + "=".repeat(50) + "\n");
}

async function test5_CreateNewListing() {
  console.log("TEST 5: Create Test Listing (Isolated)");
  console.log("Purpose: Create a new listing from script and verify immediately");
  console.log("-".repeat(50));

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
    // Step 1: Check if account owns any wrappers
    console.log("\n📦 Step 1: Find wrapper owned by test account");

    let testWrapperId: bigint | null = null;
    for (let i = 0; i < 10; i++) {
      try {
        const owner = await readContract({
          contract: wrapperContract,
          method: "function ownerOf(uint256 tokenId) view returns (address)",
          params: [BigInt(i)],
        });

        if (owner.toLowerCase() === account.address.toLowerCase()) {
          testWrapperId = BigInt(i);
          console.log(`  ✅ Found wrapper ID ${i} owned by test account`);
          break;
        }
      } catch {
        // Token doesn't exist, continue
      }
    }

    if (!testWrapperId && testWrapperId !== 0n) {
      console.log("  ⚠️  Test account doesn't own any wrappers");
      console.log("     Skipping test 5 (requires wrapper ownership)");
      return;
    }

    // Step 2: Check if already rented
    const currentRenter = await readContract({
      contract: wrapperContract,
      method: "function userOf(uint256 tokenId) view returns (address)",
      params: [testWrapperId],
    });

    if (currentRenter !== "0x0000000000000000000000000000000000000000") {
      console.log(`  ⚠️  Wrapper ${testWrapperId} is currently rented`);
      console.log("     Skipping test 5 (cannot list rented NFTs)");
      return;
    }

    // Step 3: Create listing
    console.log(`\n📝 Step 2: Creating listing for wrapper ${testWrapperId}`);
    console.log("  Price: 0.1 APE/day");
    console.log("  Duration: 1-7 days");

    const pricePerDay = BigInt(100000000000000000); // 0.1 APE in wei
    const minDays = BigInt(1);
    const maxDays = BigInt(7);

    const transaction = prepareContractCall({
      contract: managerContract,
      method: "function createRentalListing(uint256 wrapperId, uint256 pricePerDay, uint256 minRentalDays, uint256 maxRentalDays)",
      params: [testWrapperId, pricePerDay, minDays, maxDays],
    });

    console.log("\n⏳ Sending transaction...");
    const result = await sendTransaction({
      transaction,
      account,
    });

    console.log("  Transaction hash:", result.transactionHash);

    console.log("\n⏳ Waiting for confirmation...");
    const receipt = await waitForReceipt(result);

    console.log("  ✅ Transaction confirmed in block:", receipt.blockNumber);
    console.log("  Status:", receipt.status === "success" ? "✅ SUCCESS" : "❌ REVERTED");

    // Step 4: Immediately read back listing
    console.log(`\n🔍 Step 3: Read listing immediately after confirmation`);

    const rentalInfo = await readContract({
      contract: managerContract,
      method: "function getRentalInfo(uint256 wrapperId) view returns ((uint256 wrapperId, address owner, uint256 pricePerDay, uint256 minRentalDays, uint256 maxRentalDays, bool isActive, uint256 createdAt) listing, address currentRenter, uint64 expiresAt)",
      params: [testWrapperId],
    });

    console.log("  Listing.isActive:", rentalInfo.listing.isActive);
    console.log("  Listing.owner:", rentalInfo.listing.owner);
    console.log("  Listing.pricePerDay:", rentalInfo.listing.pricePerDay.toString());
    console.log("  Listing.createdAt:", rentalInfo.listing.createdAt.toString());

    if (rentalInfo.listing.isActive) {
      console.log("\n  ✅ SUCCESS - Listing is active immediately after creation");
    } else {
      console.log("\n  ❌ FAILURE - Listing shows inactive despite successful transaction");
      console.log("     This indicates a contract storage issue or read issue");
    }

    // Step 5: Check allListingIds
    console.log(`\n🔍 Step 4: Check if wrapper ${testWrapperId} is in allListingIds`);

    let foundInArray = false;
    for (let i = 0; i < 20; i++) {
      try {
        const id = await readContract({
          contract: managerContract,
          method: "function allListingIds(uint256 index) view returns (uint256)",
          params: [BigInt(i)],
        });

        if (id === testWrapperId) {
          console.log(`  ✅ Found wrapper ${testWrapperId} at index ${i} in allListingIds`);
          foundInArray = true;
          break;
        }
      } catch {
        break;
      }
    }

    if (!foundInArray) {
      console.log(`  ❌ Wrapper ${testWrapperId} NOT found in allListingIds array`);
      console.log("     This confirms the push() is not executing");
    }

  } catch (error: any) {
    console.error("❌ Error in test 5:", error.message);
    console.error(error);
  }

  console.log("\n" + "=".repeat(50) + "\n");
}

// Main test runner
async function runAllTests() {
  try {
    await test1_DirectContractRead();
    await test2_AllListingIds();
    await test3_TransactionAnalysis();
    await test4_EventsQuery();
    await test5_CreateNewListing();

    console.log("\n=== DIAGNOSTICS COMPLETE ===\n");
    console.log("Next Steps Based on Results:");
    console.log("");
    console.log("IF allListingIds is empty AND isActive = false:");
    console.log("  → Contract deployment issue or wrong contract address");
    console.log("");
    console.log("IF events show creation but isActive = false:");
    console.log("  → Contract storage bug (unlikely - code looks correct)");
    console.log("  → Reading from wrong contract/network");
    console.log("");
    console.log("IF no events emitted:");
    console.log("  → Transaction not calling createRentalListing()");
    console.log("  → Check transaction input data in explorer");
    console.log("");
    console.log("IF test 5 succeeds but user's listings fail:");
    console.log("  → Frontend integration issue (wrong params, wrong wrapper ID)");

  } catch (error: any) {
    console.error("\n❌ Fatal error:", error.message);
    console.error(error);
  }
}

// Run all tests
runAllTests();
