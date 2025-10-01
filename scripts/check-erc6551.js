/**
 * Check if ERC-6551 contracts are deployed on ApeChain Curtis
 * Run: node scripts/check-erc6551.js
 */

const ERC6551_REGISTRY = "0x000000006551c19487814612e58FE06813775758";
const ERC6551_ACCOUNT_IMPLEMENTATION = "0x41C8f39463A868d3A88af00cd0fe7102F30E44eC";
const CURTIS_RPC = "https://curtis.rpc.caldera.xyz/http";

async function checkContract(address, name) {
  try {
    const response = await fetch(CURTIS_RPC, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_getCode',
        params: [address, 'latest'],
        id: 1
      })
    });

    const data = await response.json();
    const code = data.result;
    const isDeployed = code !== '0x' && code !== '0x0';

    console.log(`\n${name}:`);
    console.log(`   Address: ${address}`);
    console.log(`   Status: ${isDeployed ? '✅ DEPLOYED' : '❌ NOT DEPLOYED'}`);

    return isDeployed;
  } catch (error) {
    console.error(`Error checking ${name}:`, error.message);
    return false;
  }
}

async function main() {
  console.log('\n🔍 Checking ERC-6551 deployment on ApeChain Curtis...\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const registryDeployed = await checkContract(ERC6551_REGISTRY, '📋 ERC-6551 Registry');
  const accountDeployed = await checkContract(ERC6551_ACCOUNT_IMPLEMENTATION, '🔐 ERC-6551 Account Implementation');

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  if (registryDeployed && accountDeployed) {
    console.log('✅ ERC-6551 is READY on ApeChain Curtis!');
    console.log('\n📝 Add these to your .env.local:');
    console.log(`NEXT_PUBLIC_ERC6551_REGISTRY_ADDRESS=${ERC6551_REGISTRY}`);
    console.log(`NEXT_PUBLIC_ERC6551_ACCOUNT_IMPLEMENTATION=${ERC6551_ACCOUNT_IMPLEMENTATION}`);
    console.log('\n✨ You can now deploy Bundle and Rental contracts!');
  } else {
    console.log('❌ ERC-6551 is NOT deployed on ApeChain Curtis');
    console.log('\n📝 You need to deploy ERC-6551 contracts first.');
    console.log('   See ERC6551_SETUP.md for deployment instructions.');
    console.log('\n💡 Quick deploy options:');
    console.log('   1. Use ThirdWeb Deploy: https://thirdweb.com/thirdweb.eth/TokenBoundAccount');
    console.log('   2. Deploy manually using the reference implementation');
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

main().catch(console.error);
