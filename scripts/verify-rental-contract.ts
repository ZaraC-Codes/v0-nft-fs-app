/**
 * RENTAL CONTRACT VERIFICATION
 *
 * Verify the rental contract is deployed correctly and has expected functions
 *
 * Run with: npx tsx scripts/verify-rental-contract.ts
 */

import { createThirdwebClient, getContract, readContract, eth_getCode } from "thirdweb";
import { apeChain } from "thirdweb/chains";
import { getRpcClient } from "thirdweb/rpc";
import "dotenv/config";

const client = createThirdwebClient({
  clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID!,
});

const RENTAL_MANAGER_ADDRESS = process.env.NEXT_PUBLIC_RENTAL_MANAGER_ADDRESS!;
const RENTAL_WRAPPER_ADDRESS = process.env.NEXT_PUBLIC_RENTAL_WRAPPER_ADDRESS!;

console.log("\n=== RENTAL CONTRACT VERIFICATION ===\n");

async function verifyDeployment() {
  console.log("1. Verifying contract deployment");
  console.log("-".repeat(50));

  const rpcRequest = getRpcClient({ client, chain: apeChain });

  // Check manager contract
  console.log("\n📋 RentalManager:", RENTAL_MANAGER_ADDRESS);
  const managerCode = await eth_getCode(rpcRequest, {
    address: RENTAL_MANAGER_ADDRESS,
  });

  if (managerCode === "0x" || managerCode === "0x0") {
    console.log("   ❌ NO CODE - Contract not deployed at this address!");
    return false;
  } else {
    console.log(`   ✅ Deployed (${managerCode.length} bytes of bytecode)`);
  }

  // Check wrapper contract
  console.log("\n📦 RentalWrapper:", RENTAL_WRAPPER_ADDRESS);
  const wrapperCode = await eth_getCode(rpcRequest, {
    address: RENTAL_WRAPPER_ADDRESS,
  });

  if (wrapperCode === "0x" || wrapperCode === "0x0") {
    console.log("   ❌ NO CODE - Contract not deployed at this address!");
    return false;
  } else {
    console.log(`   ✅ Deployed (${wrapperCode.length} bytes of bytecode)`);
  }

  console.log("\n" + "=".repeat(50) + "\n");
  return true;
}

async function verifyFunctions() {
  console.log("2. Verifying contract functions");
  console.log("-".repeat(50));

  const contract = getContract({
    client,
    chain: apeChain,
    address: RENTAL_MANAGER_ADDRESS,
  });

  // Test each critical function
  const tests = [
    {
      name: "getRentalInfo()",
      method: "function getRentalInfo(uint256 wrapperId) view returns ((uint256 wrapperId, address owner, uint256 pricePerDay, uint256 minRentalDays, uint256 maxRentalDays, bool isActive, uint256 createdAt) listing, address currentRenter, uint64 expiresAt)",
      params: [0n],
    },
    {
      name: "allListingIds()",
      method: "function allListingIds(uint256 index) view returns (uint256)",
      params: [0n],
      allowRevert: true, // Array might be empty
    },
    {
      name: "platformFeeBps()",
      method: "function platformFeeBps() view returns (uint256)",
      params: [],
    },
    {
      name: "feeRecipient()",
      method: "function feeRecipient() view returns (address)",
      params: [],
    },
    {
      name: "rentalWrapper()",
      method: "function rentalWrapper() view returns (address)",
      params: [],
    },
  ];

  console.log();
  for (const test of tests) {
    try {
      const result = await readContract({
        contract,
        method: test.method,
        params: test.params,
      });

      console.log(`   ✅ ${test.name} - works`);

      // Show result for some functions
      if (test.name === "platformFeeBps()") {
        console.log(`      Platform fee: ${result.toString()} bps (${Number(result) / 100}%)`);
      } else if (test.name === "feeRecipient()") {
        console.log(`      Fee recipient: ${result}`);
      } else if (test.name === "rentalWrapper()") {
        console.log(`      Wrapper address: ${result}`);
        if (result !== RENTAL_WRAPPER_ADDRESS) {
          console.log(`      ⚠️  WARNING: Doesn't match env var!`);
          console.log(`      Expected: ${RENTAL_WRAPPER_ADDRESS}`);
        }
      }
    } catch (error: any) {
      if (test.allowRevert) {
        console.log(`   ⚠️  ${test.name} - reverted (expected if empty)`);
      } else {
        console.log(`   ❌ ${test.name} - FAILED: ${error.message}`);
      }
    }
  }

  console.log("\n" + "=".repeat(50) + "\n");
}

async function verifyOwnership() {
  console.log("3. Verifying contract ownership and configuration");
  console.log("-".repeat(50));

  const contract = getContract({
    client,
    chain: apeChain,
    address: RENTAL_MANAGER_ADDRESS,
  });

  try {
    const owner = await readContract({
      contract,
      method: "function owner() view returns (address)",
      params: [],
    });

    console.log(`\n   Contract owner: ${owner}`);

    const platformFee = await readContract({
      contract,
      method: "function platformFeeBps() view returns (uint256)",
      params: [],
    });

    console.log(`   Platform fee: ${Number(platformFee) / 100}%`);

    const feeRecipient = await readContract({
      contract,
      method: "function feeRecipient() view returns (address)",
      params: [],
    });

    console.log(`   Fee recipient: ${feeRecipient}`);

  } catch (error: any) {
    console.log(`   ❌ Error: ${error.message}`);
  }

  console.log("\n" + "=".repeat(50) + "\n");
}

async function checkStorageSlots() {
  console.log("4. Checking storage initialization");
  console.log("-".repeat(50));

  const contract = getContract({
    client,
    chain: apeChain,
    address: RENTAL_MANAGER_ADDRESS,
  });

  try {
    // Try to read mapping for wrapper 0
    const result = await readContract({
      contract,
      method: "function listings(uint256 wrapperId) view returns (uint256 wrapperId, address owner, uint256 pricePerDay, uint256 minRentalDays, uint256 maxRentalDays, bool isActive, uint256 createdAt)",
      params: [0n],
    });

    console.log(`\n   listings[0]:`);
    console.log(`     wrapperId: ${result[0].toString()}`);
    console.log(`     owner: ${result[1]}`);
    console.log(`     pricePerDay: ${result[2].toString()}`);
    console.log(`     minRentalDays: ${result[3].toString()}`);
    console.log(`     maxRentalDays: ${result[4].toString()}`);
    console.log(`     isActive: ${result[5]}`);
    console.log(`     createdAt: ${result[6].toString()}`);

    if (result[1] === "0x0000000000000000000000000000000000000000") {
      console.log(`\n   ⚠️  Default/empty struct - listing never created`);
    } else {
      console.log(`\n   ✅ Listing data exists`);
    }

  } catch (error: any) {
    console.log(`\n   Note: listings() mapping is public, should be readable`);
    console.log(`   Error: ${error.message}`);
  }

  console.log("\n" + "=".repeat(50) + "\n");
}

async function run() {
  try {
    const deployed = await verifyDeployment();
    if (!deployed) {
      console.log("❌ Contract deployment verification failed - stopping tests");
      return;
    }

    await verifyFunctions();
    await verifyOwnership();
    await checkStorageSlots();

    console.log("\n=== VERIFICATION COMPLETE ===\n");
  } catch (error: any) {
    console.error("❌ Fatal error:", error.message);
    console.error(error);
  }
}

run();
