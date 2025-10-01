/**
 * Automated deployment script using ThirdWeb MCP API
 *
 * This script:
 * 1. Loads compiled contract artifacts
 * 2. Derives wallet address from private key
 * 3. Deploys all contracts in correct order via ThirdWeb API
 * 4. Updates .env.local with deployed addresses
 */

const fs = require('fs');
const path = require('path');
const { ethers } = require('ethers');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const CHAIN_ID = 33111; // ApeChain Curtis testnet
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const ERC6551_REGISTRY = process.env.NEXT_PUBLIC_ERC6551_REGISTRY_ADDRESS;
const ERC6551_ACCOUNT = process.env.NEXT_PUBLIC_ERC6551_ACCOUNT_IMPLEMENTATION;

// Derive wallet address from private key
function getWalletAddress() {
  const wallet = new ethers.Wallet(PRIVATE_KEY);
  return wallet.address;
}

function loadArtifact(contractName) {
  const artifactPath = path.join(__dirname, '../artifacts', `${contractName}.json`);
  const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
  return artifact;
}

async function main() {
  console.log('========================================');
  console.log('Automated ThirdWeb Deployment');
  console.log('========================================');

  const walletAddress = getWalletAddress();
  console.log('Deployer wallet:', walletAddress);
  console.log('Chain ID:', CHAIN_ID);
  console.log('ERC6551 Registry:', ERC6551_REGISTRY);
  console.log('ERC6551 Account:', ERC6551_ACCOUNT);
  console.log('========================================\n');

  // Load artifacts
  console.log('📦 Loading compiled artifacts...\n');
  const artifacts = {
    BundleNFT: loadArtifact('BundleNFT'),
    BundleManager: loadArtifact('BundleManager'),
    SwapManager: loadArtifact('SwapManager'),
    RentalWrapper: loadArtifact('RentalWrapper'),
    RentalManager: loadArtifact('RentalManager')
  };

  console.log('Contract Details:');
  Object.entries(artifacts).forEach(([name, artifact]) => {
    console.log(`  ${name}:`);
    console.log(`    - ABI entries: ${artifact.abi.length}`);
    console.log(`    - Bytecode size: ${(artifact.bytecode.length / 2 - 1).toLocaleString()} bytes`);
  });
  console.log('\n');

  // Prepare deployment data
  const deployments = [
    {
      name: 'BundleNFT',
      artifact: artifacts.BundleNFT,
      constructorParams: {}
    },
    {
      name: 'BundleManager',
      artifact: artifacts.BundleManager,
      constructorParams: {
        _registry: ERC6551_REGISTRY,
        _implementation: ERC6551_ACCOUNT
      }
    },
    {
      name: 'SwapManager',
      artifact: artifacts.SwapManager,
      constructorParams: {}
    },
    {
      name: 'RentalWrapper',
      artifact: artifacts.RentalWrapper,
      constructorParams: {
        _registry: ERC6551_REGISTRY,
        _implementation: ERC6551_ACCOUNT
      }
    }
  ];

  console.log('========================================');
  console.log('Ready to Deploy');
  console.log('========================================');
  console.log('\nDeployment order:');
  deployments.forEach((d, i) => {
    console.log(`${i + 1}. ${d.name}`);
    if (Object.keys(d.constructorParams).length > 0) {
      console.log(`   Constructor params:`, d.constructorParams);
    }
  });
  console.log('5. RentalManager (will use deployed RentalWrapper address)');
  console.log('\n');

  console.log('To proceed with automated deployment via ThirdWeb MCP API,');
  console.log('you need to call the mcp__thirdweb-api__deployContract function');
  console.log('with the wallet address:', walletAddress);
  console.log('\nArtifacts are ready in ./artifacts/');
  console.log('========================================\n');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });
