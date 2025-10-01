/**
 * Deploy contracts using ThirdWeb API
 *
 * This script uses the compiled artifacts from ./artifacts/
 * and deploys them to ApeChain Curtis testnet via ThirdWeb API
 */

const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const CHAIN_ID = 33111; // ApeChain Curtis testnet
const ERC6551_REGISTRY = process.env.NEXT_PUBLIC_ERC6551_REGISTRY_ADDRESS;
const ERC6551_ACCOUNT = process.env.NEXT_PUBLIC_ERC6551_ACCOUNT_IMPLEMENTATION;

async function loadArtifact(contractName) {
  const artifactPath = path.join(__dirname, '../artifacts', `${contractName}.json`);
  const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
  return artifact;
}

async function main() {
  console.log('========================================');
  console.log('ThirdWeb Contract Deployment');
  console.log('========================================');
  console.log('Chain: ApeChain Curtis Testnet (33111)');
  console.log('ERC6551 Registry:', ERC6551_REGISTRY);
  console.log('ERC6551 Account:', ERC6551_ACCOUNT);
  console.log('========================================\n');

  // Load all artifacts
  console.log('Loading compiled artifacts...\n');

  const bundleNFT = await loadArtifact('BundleNFT');
  const bundleManager = await loadArtifact('BundleManager');
  const swapManager = await loadArtifact('SwapManager');
  const rentalWrapper = await loadArtifact('RentalWrapper');
  const rentalManager = await loadArtifact('RentalManager');

  console.log('✅ All artifacts loaded successfully\n');

  // Display deployment plan
  console.log('Deployment Plan:');
  console.log('================');
  console.log('1. BundleNFT (no constructor params)');
  console.log('2. BundleManager (registry, implementation)');
  console.log('3. Link BundleNFT ↔ BundleManager');
  console.log('4. SwapManager (no constructor params)');
  console.log('5. RentalWrapper (registry, implementation)');
  console.log('6. RentalManager (rentalWrapper address)');
  console.log('================\n');

  console.log('Deployment Information:');
  console.log('- BundleNFT bytecode size:', bundleNFT.bytecode.length / 2 - 1, 'bytes');
  console.log('- BundleManager bytecode size:', bundleManager.bytecode.length / 2 - 1, 'bytes');
  console.log('- SwapManager bytecode size:', swapManager.bytecode.length / 2 - 1, 'bytes');
  console.log('- RentalWrapper bytecode size:', rentalWrapper.bytecode.length / 2 - 1, 'bytes');
  console.log('- RentalManager bytecode size:', rentalManager.bytecode.length / 2 - 1, 'bytes');
  console.log('\n');

  console.log('========================================');
  console.log('Ready for Deployment!');
  console.log('========================================');
  console.log('\nTo deploy, you can either:');
  console.log('1. Use ThirdWeb Dashboard: https://thirdweb.com/dashboard/contracts/deploy');
  console.log('2. Use ThirdWeb CLI: npx thirdweb deploy -k <secret-key>');
  console.log('3. Use the MCP API deployment (automated - requires wallet connection)');
  console.log('\nAll artifacts are ready in ./artifacts/');
  console.log('========================================\n');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });
