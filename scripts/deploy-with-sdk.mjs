/**
 * Deploy contracts using ThirdWeb SDK deployContract function
 * Uses compiled artifacts from ./artifacts/
 */

import { createThirdwebClient } from "thirdweb";
import { privateKeyToAccount } from "thirdweb/wallets";
import { deployContract } from "thirdweb/deploys";
import { defineChain } from "thirdweb/chains";
import { readFileSync, writeFileSync } from 'fs';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

const SECRET_KEY = process.env.THIRDWEB_SECRET_KEY;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const ERC6551_REGISTRY = process.env.NEXT_PUBLIC_ERC6551_REGISTRY_ADDRESS;
const ERC6551_ACCOUNT = process.env.NEXT_PUBLIC_ERC6551_ACCOUNT_IMPLEMENTATION;

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
console.log('ThirdWeb SDK Contract Deployment');
console.log('========================================');
console.log('Deployer:', account.address);
console.log('Chain: ApeChain Curtis (33111)');
console.log('ERC6551 Registry:', ERC6551_REGISTRY);
console.log('ERC6551 Account:', ERC6551_ACCOUNT);
console.log('========================================\n');

// Load artifact
function loadArtifact(contractName) {
  const artifact = JSON.parse(
    readFileSync(`./artifacts/${contractName}.json`, 'utf8')
  );
  return artifact;
}

// Deploy a contract
async function deployContractWithParams(contractName, constructorParams = {}) {
  console.log(`\n📦 Deploying ${contractName}...`);
  const artifact = loadArtifact(contractName);

  console.log(`   Bytecode size: ${(artifact.bytecode.length / 2 - 1).toLocaleString()} bytes`);
  console.log(`   ABI entries: ${artifact.abi.length}`);
  if (Object.keys(constructorParams).length > 0) {
    console.log(`   Constructor params:`, constructorParams);
  }

  try {
    const address = await deployContract({
      client,
      chain: apeChainCurtis,
      account,
      bytecode: artifact.bytecode,
      abi: artifact.abi,
      constructorParams,
    });

    console.log(`✅ ${contractName} deployed at: ${address}`);
    return address;
  } catch (error) {
    console.error(`❌ Failed to deploy ${contractName}:`, error.message);
    throw error;
  }
}

// Main deployment function
async function main() {
  const deployedAddresses = {};

  try {
    // 1. Deploy BundleNFT
    deployedAddresses.BundleNFT = await deployContractWithParams('BundleNFT');

    // 2. Deploy BundleManager
    deployedAddresses.BundleManager = await deployContractWithParams('BundleManager', {
      _registry: ERC6551_REGISTRY,
      _accountImplementation: ERC6551_ACCOUNT,
    });

    // 3. Deploy SwapManager
    deployedAddresses.SwapManager = await deployContractWithParams('SwapManager');

    // 4. Deploy RentalWrapper
    deployedAddresses.RentalWrapper = await deployContractWithParams('RentalWrapper', {
      _registry: ERC6551_REGISTRY,
      _accountImplementation: ERC6551_ACCOUNT,
    });

    // 5. Deploy RentalManager
    deployedAddresses.RentalManager = await deployContractWithParams('RentalManager', {
      _erc6551Registry: ERC6551_REGISTRY,
      _accountImplementation: ERC6551_ACCOUNT,
      _feeRecipient: account.address, // Use deployer as fee recipient
    });

    console.log('\n========================================');
    console.log('✅ All Contracts Deployed Successfully!');
    console.log('========================================\n');

    console.log('📝 Deployed Addresses:');
    Object.entries(deployedAddresses).forEach(([name, address]) => {
      console.log(`   ${name.padEnd(20)}: ${address}`);
    });

    // Save addresses to file
    const envUpdates = `
# Contract Addresses (Deployed ${new Date().toISOString()})
NEXT_PUBLIC_BUNDLE_NFT_ADDRESS=${deployedAddresses.BundleNFT}
NEXT_PUBLIC_BUNDLE_MANAGER_ADDRESS=${deployedAddresses.BundleManager}
NEXT_PUBLIC_SWAP_MANAGER_ADDRESS=${deployedAddresses.SwapManager}
NEXT_PUBLIC_RENTAL_WRAPPER_ADDRESS=${deployedAddresses.RentalWrapper}
NEXT_PUBLIC_RENTAL_MANAGER_ADDRESS=${deployedAddresses.RentalManager}
`;

    writeFileSync('./deployed-addresses.txt', envUpdates);
    console.log('\n💾 Addresses saved to: deployed-addresses.txt');

    console.log('\n📋 Next Steps:');
    console.log('1. Add these addresses to .env.local');
    console.log('2. Call setBundleManager() on BundleNFT');
    console.log('3. Call setBundleNFT() on BundleManager');
    console.log('4. Update lib/bundle.ts, lib/swap.ts, lib/rental.ts');
    console.log('5. Restart dev server: pnpm run dev');
    console.log('========================================\n');

  } catch (error) {
    console.error('\n❌ Deployment failed:', error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
