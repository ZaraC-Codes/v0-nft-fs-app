/**
 * Diagnostic Script: Rental Listing Issue
 *
 * This script will:
 * 1. Verify contract deployment
 * 2. Read storage directly for wrapper ID 2
 * 3. Call getRentalInfo() and show raw response
 * 4. Check if the issue is frontend parsing or contract state
 */

import { createThirdwebClient, getContract, readContract } from "thirdweb";
import { defineChain } from "thirdweb/chains";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const client = createThirdwebClient({
  clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID!,
});

const apeChain = defineChain({
  id: 33139,
  name: "ApeChain",
});

const RENTAL_MANAGER_ADDRESS = process.env.NEXT_PUBLIC_RENTAL_MANAGER_ADDRESS!;

async function main() {
  console.log("\n=== RENTAL LISTING DIAGNOSTIC ===\n");

  console.log("📍 Configuration:");
  console.log(`   Contract: ${RENTAL_MANAGER_ADDRESS}`);
  console.log(`   Chain: ApeChain Mainnet (${apeChain.id})`);
  console.log(`   Wrapper ID: 2`);
  console.log("");

  const contract = getContract({
    client,
    chain: apeChain,
    address: RENTAL_MANAGER_ADDRESS,
  });

  // Test 1: Call getRentalInfo for wrapper 2
  console.log("🔍 TEST 1: Calling getRentalInfo(2)...");
  try {
    const result = await readContract({
      contract,
      method: "function getRentalInfo(uint256 wrapperId) view returns ((uint256 wrapperId, address owner, uint256 pricePerDay, uint256 minRentalDays, uint256 maxRentalDays, bool isActive, uint256 createdAt) listing, address currentRenter, uint64 expiresAt)",
      params: [2n],
    });

    console.log("\n📦 RAW RESULT FROM CONTRACT:");
    console.log(result);
    console.log("");

    // ThirdWeb v5 returns tuples as arrays
    console.log("🔬 ANALYZING RESULT STRUCTURE:");
    console.log(`   Type: ${typeof result}`);
    console.log(`   Is Array: ${Array.isArray(result)}`);
    console.log(`   Length: ${Array.isArray(result) ? result.length : 'N/A'}`);
    console.log("");

    if (Array.isArray(result)) {
      console.log("✅ Result is an ARRAY (ThirdWeb v5 tuple return)");
      console.log(`   Element [0] (listing): ${typeof result[0]}`);
      console.log(`   Element [1] (currentRenter): ${result[1]}`);
      console.log(`   Element [2] (expiresAt): ${result[2]}`);
      console.log("");

      const listingData = result[0];
      console.log("📋 LISTING DATA (result[0]):");
      console.log(listingData);
      console.log("");

      console.log("🎯 KEY FIELDS:");
      console.log(`   wrapperId: ${listingData.wrapperId}`);
      console.log(`   owner: ${listingData.owner}`);
      console.log(`   pricePerDay: ${listingData.pricePerDay}`);
      console.log(`   minRentalDays: ${listingData.minRentalDays}`);
      console.log(`   maxRentalDays: ${listingData.maxRentalDays}`);
      console.log(`   isActive: ${listingData.isActive}`);
      console.log(`   createdAt: ${listingData.createdAt}`);
      console.log("");

      if (listingData.isActive === true) {
        console.log("✅ SUCCESS: Listing IS ACTIVE in contract storage!");
        console.log("   The contract is working correctly.");
        console.log("   The issue is in how lib/rental.ts parses the response.");
        console.log("");
        console.log("🔧 FIX NEEDED: Update lib/rental.ts to use array destructuring:");
        console.log("   const [listingData, currentRenter, expiresAt] = result;");
        console.log("   return { listing: listingData, currentRenter, expiresAt };");
      } else {
        console.log("❌ CRITICAL: Listing shows isActive = false in contract!");
        console.log("   This is a smart contract storage issue.");
        console.log("   The contract may need to be redeployed.");
      }
    } else if (result && typeof result === 'object') {
      console.log("⚠️ Result is an OBJECT (unexpected for ThirdWeb v5)");
      console.log("   This suggests ABI mismatch or old ThirdWeb version");

      if ('listing' in result) {
        console.log(`   listing.isActive: ${(result as any).listing?.isActive}`);
      }
    } else {
      console.log("❌ Result has unexpected structure");
    }

  } catch (error: any) {
    console.error("❌ ERROR calling getRentalInfo:", error.message);
  }

  // Test 2: Check if listing exists in public mapping
  console.log("\n🔍 TEST 2: Reading public listings[2] mapping...");
  try {
    const listing = await readContract({
      contract,
      method: "function listings(uint256) view returns (uint256 wrapperId, address owner, uint256 pricePerDay, uint256 minRentalDays, uint256 maxRentalDays, bool isActive, uint256 createdAt)",
      params: [2n],
    });

    console.log("\n📦 LISTING FROM PUBLIC MAPPING:");
    console.log(listing);
    console.log("");

    if (Array.isArray(listing)) {
      console.log("📋 PARSED LISTING FIELDS:");
      console.log(`   wrapperId: ${listing[0]}`);
      console.log(`   owner: ${listing[1]}`);
      console.log(`   pricePerDay: ${listing[2]}`);
      console.log(`   minRentalDays: ${listing[3]}`);
      console.log(`   maxRentalDays: ${listing[4]}`);
      console.log(`   isActive: ${listing[5]}`);
      console.log(`   createdAt: ${listing[6]}`);
      console.log("");

      if (listing[5] === true) {
        console.log("✅ CONFIRMED: Listing is ACTIVE in contract storage");
      } else if (listing[1] === "0x0000000000000000000000000000000000000000") {
        console.log("⚠️ Listing does not exist (owner is zero address)");
      } else {
        console.log("❌ Listing exists but isActive = false");
      }
    }
  } catch (error: any) {
    console.error("❌ ERROR reading listings mapping:", error.message);
  }

  console.log("\n=== DIAGNOSTIC COMPLETE ===\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
