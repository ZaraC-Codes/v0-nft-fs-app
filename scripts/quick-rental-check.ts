/**
 * QUICK RENTAL CHECK
 *
 * Fast check of rental listing status for wrapper IDs 0, 1, 2
 *
 * Run with: npx tsx scripts/quick-rental-check.ts
 */

import { createThirdwebClient, getContract, readContract } from "thirdweb";
import { apeChain } from "thirdweb/chains";
import "dotenv/config";

const client = createThirdwebClient({
  clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID!,
});

const RENTAL_MANAGER_ADDRESS = process.env.NEXT_PUBLIC_RENTAL_MANAGER_ADDRESS!;

console.log("\n🔍 Quick Rental Listing Check");
console.log("Manager:", RENTAL_MANAGER_ADDRESS);
console.log("Network: ApeChain Mainnet\n");

const contract = getContract({
  client,
  chain: apeChain,
  address: RENTAL_MANAGER_ADDRESS,
});

async function checkWrapper(wrapperId: number) {
  try {
    const result = await readContract({
      contract,
      method: "function getRentalInfo(uint256 wrapperId) view returns ((uint256 wrapperId, address owner, uint256 pricePerDay, uint256 minRentalDays, uint256 maxRentalDays, bool isActive, uint256 createdAt) listing, address currentRenter, uint64 expiresAt)",
      params: [BigInt(wrapperId)],
    });

    console.log(`📦 Wrapper ${wrapperId}:`);
    console.log(`   isActive: ${result.listing.isActive ? "✅ true" : "❌ false"}`);
    console.log(`   owner: ${result.listing.owner}`);
    console.log(`   price: ${result.listing.pricePerDay.toString()} wei`);
    console.log(`   createdAt: ${result.listing.createdAt.toString()}`);

    if (result.listing.owner === "0x0000000000000000000000000000000000000000") {
      console.log(`   ⚠️  Empty listing (never created)\n`);
    } else if (!result.listing.isActive) {
      console.log(`   ❌ Listing exists but inactive\n`);
    } else {
      console.log(`   ✅ Active listing\n`);
    }
  } catch (error: any) {
    console.log(`❌ Wrapper ${wrapperId}: Error - ${error.message}\n`);
  }
}

async function checkAllListingIds() {
  console.log("📋 Checking allListingIds array:");

  try {
    const ids: bigint[] = [];
    for (let i = 0; i < 10; i++) {
      try {
        const id = await readContract({
          contract,
          method: "function allListingIds(uint256 index) view returns (uint256)",
          params: [BigInt(i)],
        });
        ids.push(id);
      } catch {
        break;
      }
    }

    console.log(`   Total listings: ${ids.length}`);
    console.log(`   Listing IDs: [${ids.join(", ")}]\n`);

    if (ids.length === 0) {
      console.log("   ⚠️  NO LISTINGS - createRentalListing() may not be executing!\n");
    }
  } catch (error: any) {
    console.log(`   ❌ Error: ${error.message}\n`);
  }
}

async function run() {
  await checkWrapper(0);
  await checkWrapper(1);
  await checkWrapper(2);
  await checkAllListingIds();

  console.log("Summary:");
  console.log("If all show 'Empty listing' → Listings were never created");
  console.log("If all show 'Inactive' → Contract storage issue");
  console.log("If allListingIds is empty → createRentalListing() not executing");
}

run();
