import { createThirdwebClient, defineChain } from "thirdweb";
import { sepolia } from "thirdweb/chains";

// Get the client ID from environment variables
const clientId = process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID || "67ac338a3f1dda0f31634dcb98e3ef8c";

// Create the thirdweb client
export const client = createThirdwebClient({
  clientId: clientId,
});

// Define ApeChain Curtis testnet
export const apeChainCurtis = defineChain({
  id: 33111,
  name: "ApeChain Curtis Testnet",
  nativeCurrency: {
    name: "ApeCoin",
    symbol: "APE",
    decimals: 18,
  },
  rpc: "https://curtis.rpc.caldera.xyz/http",
  blockExplorers: [
    {
      name: "Curtis Explorer",
      url: "https://curtis.explorer.caldera.xyz",
    },
  ],
  testnet: true,
});

// Export Sepolia testnet (imported from thirdweb/chains)
export { sepolia };

// Supported chains for the marketplace
export const SUPPORTED_CHAINS = [apeChainCurtis, sepolia] as const;

// Chain metadata for display
export const CHAIN_METADATA = {
  [apeChainCurtis.id]: {
    name: "ApeChain Curtis",
    shortName: "Curtis",
    icon: "🦍",
    color: "from-blue-500 to-blue-600",
    nativeToken: "APE",
  },
  [sepolia.id]: {
    name: "Ethereum Sepolia",
    shortName: "Sepolia",
    icon: "⟠",
    color: "from-gray-400 to-gray-500",
    nativeToken: "ETH",
  },
} as const;

// Marketplace contract address (you'll need to provide this)
export const MARKETPLACE_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_MARKETPLACE_CONTRACT_ADDRESS || "";

if (!MARKETPLACE_CONTRACT_ADDRESS) {
  console.error("❌ CRITICAL: Missing NEXT_PUBLIC_MARKETPLACE_CONTRACT_ADDRESS environment variable");
  console.error("Marketplace features will not work without this address configured in .env.local");
}

// APE token contract address on ApeChain Curtis testnet
// Note: This is a placeholder - replace with actual APE token address when available
export const APE_TOKEN_ADDRESS = process.env.NEXT_PUBLIC_APE_TOKEN_ADDRESS || "0x0000000000000000000000000000000000000000";

// Helper function to safely get chain metadata
export function getChainMetadata(chainId: number | undefined) {
  if (!chainId || !CHAIN_METADATA[chainId as keyof typeof CHAIN_METADATA]) {
    return null;
  }
  return CHAIN_METADATA[chainId as keyof typeof CHAIN_METADATA];
}