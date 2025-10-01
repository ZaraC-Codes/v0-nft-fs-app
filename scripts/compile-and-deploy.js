const solc = require('solc');
const fs = require('fs');
const path = require('path');

// Read contract sources
function findImports(importPath) {
  // Handle OpenZeppelin imports
  if (importPath.startsWith('@openzeppelin/')) {
    const resolvedPath = path.resolve(__dirname, '../node_modules', importPath);
    try {
      const content = fs.readFileSync(resolvedPath, 'utf8');
      return { contents: content };
    } catch (error) {
      return { error: 'File not found: ' + importPath };
    }
  }

  // Handle local imports
  const contractsPath = path.resolve(__dirname, '../contracts', importPath);
  try {
    const content = fs.readFileSync(contractsPath, 'utf8');
    return { contents: content };
  } catch (error) {
    return { error: 'File not found: ' + importPath };
  }
}

function compileContract(contractName) {
  console.log(`\nCompiling ${contractName}...`);

  const contractPath = path.resolve(__dirname, '../contracts', `${contractName}.sol`);
  const source = fs.readFileSync(contractPath, 'utf8');

  const input = {
    language: 'Solidity',
    sources: {
      [`${contractName}.sol`]: {
        content: source
      }
    },
    settings: {
      outputSelection: {
        '*': {
          '*': ['abi', 'evm.bytecode']
        }
      },
      optimizer: {
        enabled: true,
        runs: 200
      },
      viaIR: true
    }
  };

  const output = JSON.parse(solc.compile(JSON.stringify(input), { import: findImports }));

  // Check for errors
  if (output.errors) {
    const errors = output.errors.filter(error => error.severity === 'error');
    if (errors.length > 0) {
      console.error('Compilation errors:');
      errors.forEach(error => console.error(error.formattedMessage));
      throw new Error('Compilation failed');
    }

    // Show warnings
    const warnings = output.errors.filter(error => error.severity === 'warning');
    if (warnings.length > 0) {
      console.warn('Compilation warnings:');
      warnings.forEach(warning => console.warn(warning.formattedMessage));
    }
  }

  const contract = output.contracts[`${contractName}.sol`][contractName];

  // Save artifacts
  const artifactsDir = path.resolve(__dirname, '../artifacts');
  if (!fs.existsSync(artifactsDir)) {
    fs.mkdirSync(artifactsDir);
  }

  const artifact = {
    contractName: contractName,
    abi: contract.abi,
    bytecode: '0x' + contract.evm.bytecode.object
  };

  fs.writeFileSync(
    path.join(artifactsDir, `${contractName}.json`),
    JSON.stringify(artifact, null, 2)
  );

  console.log(`✅ ${contractName} compiled successfully`);
  console.log(`   ABI entries: ${contract.abi.length}`);
  console.log(`   Bytecode size: ${contract.evm.bytecode.object.length / 2} bytes`);

  return artifact;
}

// Compile all contracts
async function main() {
  console.log('========================================');
  console.log('Compiling Smart Contracts');
  console.log('========================================');

  const contracts = [
    'BundleNFT',
    'BundleManager',
    'SwapManager',
    'RentalWrapper',
    'RentalManager'
  ];

  const artifacts = {};

  for (const contractName of contracts) {
    try {
      artifacts[contractName] = compileContract(contractName);
    } catch (error) {
      console.error(`\n❌ Failed to compile ${contractName}:`, error.message);
      process.exit(1);
    }
  }

  console.log('\n========================================');
  console.log('Compilation Complete!');
  console.log('========================================');
  console.log('\nArtifacts saved to ./artifacts/');
  console.log('\nNext steps:');
  console.log('1. Run deployment script with compiled artifacts');
  console.log('2. Or use ThirdWeb dashboard to deploy manually');
  console.log('========================================\n');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
