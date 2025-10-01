/**
 * Link BundleNFT and BundleManager contracts
 */

import { createThirdwebClient } from "thirdweb";
import { privateKeyToAccount } from "thirdweb/wallets";
import { defineChain } from "thirdweb/chains";
import { getContract, prepareContractCall, sendTransaction } from "thirdweb";
import { config } from 'dotenv';
import { readFileSync } from 'fs';

// Load environment variables
config({ path: '.env.local' });

const SECRET_KEY = process.env.THIRDWEB_SECRET_KEY;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const BUNDLE_NFT_ADDRESS = process.env.NEXT_PUBLIC_BUNDLE_NFT_ADDRESS;
const BUNDLE_MANAGER_ADDRESS = process.env.NEXT_PUBLIC_BUNDLE_MANAGER_ADDRESS;

// Create ThirdWeb client
const client = createThirdwebClient({
  secretKey: SECRET_KEY,
});

// Define ApeChain Curtis testnet
const apeChainCurtis = defineChain({
  id: 33111,
  name: "ApeChain Curtis Testnet",
  nativeCurrency: {
    name: "APE",
    symbol: "APE",
    decimals: 18,
  },
  rpc: "https://curtis.rpc.caldera.xyz/http",
});

// Create account from private key
const account = privateKeyToAccount({
  client,
  privateKey: PRIVATE_KEY,
});

console.log('========================================');
console.log('Linking BundleNFT and BundleManager');
console.log('========================================');
console.log('Account:', account.address);
console.log('BundleNFT:', BUNDLE_NFT_ADDRESS);
console.log('BundleManager:', BUNDLE_MANAGER_ADDRESS);
console.log('========================================\n');

async function main() {
  try {
    // Load BundleNFT ABI
    const bundleNFTArtifact = JSON.parse(
      readFileSync('./artifacts/BundleNFT.json', 'utf8')
    );

    // Load BundleManager ABI
    const bundleManagerArtifact = JSON.parse(
      readFileSync('./artifacts/BundleManager.json', 'utf8')
    );

    // Get contract instances
    const bundleNFT = getContract({
      client,
      chain: apeChainCurtis,
      address: BUNDLE_NFT_ADDRESS,
      abi: bundleNFTArtifact.abi,
    });

    const bundleManager = getContract({
      client,
      chain: apeChainCurtis,
      address: BUNDLE_MANAGER_ADDRESS,
      abi: bundleManagerArtifact.abi,
    });

    // 1. Set BundleManager in BundleNFT
    console.log('1️⃣  Calling setBundleManager() on BundleNFT...');
    const tx1 = prepareContractCall({
      contract: bundleNFT,
      method: "function setBundleManager(address _bundleManager)",
      params: [BUNDLE_MANAGER_ADDRESS],
    });

    const result1 = await sendTransaction({
      transaction: tx1,
      account,
    });

    console.log(`   ✅ Transaction hash: ${result1.transactionHash}`);

    // 2. Set BundleNFT in BundleManager
    console.log('\n2️⃣  Calling setBundleNFT() on BundleManager...');
    const tx2 = prepareContractCall({
      contract: bundleManager,
      method: "function setBundleNFT(address _bundleNFT)",
      params: [BUNDLE_NFT_ADDRESS],
    });

    const result2 = await sendTransaction({
      transaction: tx2,
      account,
    });

    console.log(`   ✅ Transaction hash: ${result2.transactionHash}`);

    console.log('\n========================================');
    console.log('✅ Contracts Linked Successfully!');
    console.log('========================================\n');

  } catch (error) {
    console.error('\n❌ Linking failed:', error.message);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
