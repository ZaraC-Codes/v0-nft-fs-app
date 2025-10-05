/**
 * Network switching and detection utilities
 */

import { defineChain } from "thirdweb";
import { apeChain, apeChainCurtis, sepolia } from "./thirdweb";

/**
 * Switch user's wallet to the specified chain
 * Uses wallet_switchEthereumChain and wallet_addEthereumChain
 */
export async function switchToChain(chainId: number): Promise<boolean> {
  if (typeof window === "undefined" || !window.ethereum) {
    console.warn("⚠️ No Ethereum provider found");
    return false;
  }

  try {
    console.log(`🔄 Attempting to switch to chain ${chainId}...`);

    // Try to switch to the chain
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: `0x${chainId.toString(16)}` }],
    });

    console.log(`✅ Switched to chain ${chainId}`);
    return true;
  } catch (switchError: any) {
    // This error code indicates that the chain has not been added to MetaMask
    if (switchError.code === 4902) {
      try {
        console.log(`📝 Chain ${chainId} not added, attempting to add...`);

        const chainParams = getChainParams(chainId);
        if (!chainParams) {
          console.error(`❌ Unknown chain ID: ${chainId}`);
          return false;
        }

        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [chainParams],
        });

        console.log(`✅ Added and switched to chain ${chainId}`);
        return true;
      } catch (addError) {
        console.error("❌ Failed to add chain:", addError);
        return false;
      }
    }

    console.error("❌ Failed to switch chain:", switchError);
    return false;
  }
}

/**
 * Get chain parameters for wallet_addEthereumChain
 */
function getChainParams(chainId: number) {
  const chains: Record<number, any> = {
    [apeChain.id]: {
      chainId: `0x${apeChain.id.toString(16)}`,
      chainName: "ApeChain",
      nativeCurrency: {
        name: "ApeCoin",
        symbol: "APE",
        decimals: 18,
      },
      rpcUrls: ["https://apechain.calderachain.xyz/http"],
      blockExplorerUrls: ["https://apechain.calderaexplorer.xyz"],
    },
    [apeChainCurtis.id]: {
      chainId: `0x${apeChainCurtis.id.toString(16)}`,
      chainName: "ApeChain Curtis Testnet",
      nativeCurrency: {
        name: "ApeCoin",
        symbol: "APE",
        decimals: 18,
      },
      rpcUrls: ["https://curtis.rpc.caldera.xyz/http"],
      blockExplorerUrls: ["https://curtis.explorer.caldera.xyz"],
    },
    [sepolia.id]: {
      chainId: `0x${sepolia.id.toString(16)}`,
      chainName: "Sepolia",
      nativeCurrency: {
        name: "Sepolia Ether",
        symbol: "ETH",
        decimals: 18,
      },
      rpcUrls: ["https://rpc.sepolia.org"],
      blockExplorerUrls: ["https://sepolia.etherscan.io"],
    },
  };

  return chains[chainId];
}

/**
 * Get the current chain ID from the user's wallet
 */
export async function getCurrentChainId(): Promise<number | null> {
  if (typeof window === "undefined" || !window.ethereum) {
    return null;
  }

  try {
    const chainId = await window.ethereum.request({ method: "eth_chainId" });
    return parseInt(chainId, 16);
  } catch (error) {
    console.error("Failed to get current chain ID:", error);
    return null;
  }
}

/**
 * Check if user is on the correct network, and switch if not
 * @param requiredChainId The chain ID required for the transaction
 * @returns true if on correct network or successfully switched
 */
export async function ensureCorrectNetwork(requiredChainId: number): Promise<boolean> {
  const currentChainId = await getCurrentChainId();

  if (currentChainId === requiredChainId) {
    console.log(`✅ Already on correct network (${requiredChainId})`);
    return true;
  }

  console.log(`⚠️ Wrong network. Current: ${currentChainId}, Required: ${requiredChainId}`);
  return await switchToChain(requiredChainId);
}

/**
 * MetaMask Multi-Network Detection
 *
 * Note: MetaMask's multi-network feature (introduced in v10.28.0) allows users to
 * be connected to multiple networks simultaneously. However, wallet_switchEthereumChain
 * still only returns the "active" network for signing transactions.
 *
 * The multi-network feature is primarily for viewing assets across chains,
 * but transactions still require switching to a single active network.
 *
 * Web3 apps can only detect the currently active network via eth_chainId.
 */
export function getMetaMaskMultiNetworkInfo() {
  return {
    supported: true,
    note: "MetaMask supports viewing multiple networks, but transactions require a single active network",
    detection: "Apps can only detect the active network via eth_chainId",
    recommendation: "Always call ensureCorrectNetwork() before transactions to auto-switch if needed",
  };
}
