const { config: dotenvConfig } = require("dotenv");
require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-verify");
require("ts-node").register({
  project: "./tsconfig.hardhat.json"
});

dotenvConfig({ path: ".env.local" });

const config = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      viaIR: true, // Enable IR compiler for stack too deep issues
      evmVersion: "cancun", // Required for OpenZeppelin v5 (mcopy opcode)
    },
  },
  networks: {
    // ApeChain Mainnet
    apechain: {
      url: "https://apechain.calderachain.xyz/http",
      chainId: 33139,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
    // ApeChain Curtis Testnet
    apechain_curtis: {
      url: "https://curtis.rpc.caldera.xyz/http",
      chainId: 33111,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
    // Sepolia Testnet
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || "https://ethereum-sepolia-rpc.publicnode.com",
      chainId: 11155111,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
  },
  etherscan: {
    apiKey: {
      sepolia: process.env.ETHERSCAN_API_KEY || "",
      // Add ApeChain explorer API key if available
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
  defaultNetwork: "apechain", // Default to ApeChain mainnet
};

module.exports = config;
