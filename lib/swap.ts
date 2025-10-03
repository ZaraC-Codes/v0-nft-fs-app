import { prepareContractCall, readContract, getContract } from "thirdweb";
import { ThirdwebClient } from "thirdweb";
import { Chain } from "thirdweb/chains";
import { apeChain, apeChainCurtis, sepolia } from "./thirdweb";

// Contract addresses (update after deployment)
export const SWAP_CONTRACT_ADDRESSES = {
  [apeChain.id]: "0x...",        // Deploy to mainnet when ready
  [apeChainCurtis.id]: "0x36cf50b633b4095c19ac5677b24d9f9bb4c5c179",
  [sepolia.id]: "0x...",        // Deploy and update this
} as const;

// Swap contract ABI (simplified - only the functions we need)
const SWAP_CONTRACT_ABI = [
  {
    "inputs": [
      { "name": "nftContract", "type": "address" },
      { "name": "tokenId", "type": "uint256" },
      { "name": "wantedNftContract", "type": "address" },
      { "name": "wantedTokenId", "type": "uint256" },
      { "name": "durationInDays", "type": "uint256" }
    ],
    "name": "createSwapListing",
    "outputs": [{ "name": "listingId", "type": "uint256" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "name": "listingId", "type": "uint256" },
      { "name": "myTokenId", "type": "uint256" }
    ],
    "name": "executeSwap",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "name": "listingId", "type": "uint256" }],
    "name": "cancelSwapListing",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "name": "listingId", "type": "uint256" }],
    "name": "getSwapListing",
    "outputs": [{
      "components": [
        { "name": "lister", "type": "address" },
        { "name": "nftContract", "type": "address" },
        { "name": "tokenId", "type": "uint256" },
        { "name": "wantedNftContract", "type": "address" },
        { "name": "wantedTokenId", "type": "uint256" },
        { "name": "isActive", "type": "bool" },
        { "name": "createdAt", "type": "uint256" },
        { "name": "expiresAt", "type": "uint256" }
      ],
      "name": "",
      "type": "tuple"
    }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "name": "listingId", "type": "uint256" }],
    "name": "isListingValid",
    "outputs": [{ "name": "", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

// ERC721 ABI for approvals
const ERC721_ABI = [
  {
    "inputs": [
      { "name": "to", "type": "address" },
      { "name": "tokenId", "type": "uint256" }
    ],
    "name": "approve",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "name": "operator", "type": "address" },
      { "name": "approved", "type": "bool" }
    ],
    "name": "setApprovalForAll",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "name": "tokenId", "type": "uint256" }],
    "name": "getApproved",
    "outputs": [{ "name": "", "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

// Types
export interface SwapListing {
  listingId: string;
  lister: string;
  nftContract: string;
  tokenId: string;
  wantedNftContract: string;
  wantedTokenId: string; // "0" means "Any"
  isActive: boolean;
  createdAt: Date;
  expiresAt: Date;
}

export interface CreateSwapListingParams {
  tokenId: string;
  wantedCollection: string;
  wantedTokenId?: string; // "0" or undefined means "Any"
  wantedTraits?: string[]; // Not used in contract, but stored in metadata
}

export interface ExecuteSwapParams {
  listingId: string;
  myTokenId: string;
}

/**
 * Get the swap contract for a specific chain
 */
export function getSwapContract(client: ThirdwebClient, chain: Chain) {
  const contractAddress = SWAP_CONTRACT_ADDRESSES[chain.id as keyof typeof SWAP_CONTRACT_ADDRESSES];

  console.log("🔍 Swap contract address for chain", chain.id, ":", contractAddress);

  if (!contractAddress || contractAddress === "0x...") {
    const error = `❌ Swap contract not deployed on chain ${chain.id}. Please deploy the contract first.`;
    console.error(error);
    throw new Error(error);
  }

  return getContract({
    client,
    chain,
    address: contractAddress,
    abi: SWAP_CONTRACT_ABI,
  });
}

/**
 * Prepare transaction to approve NFT for swap contract
 */
export function prepareApproveNFT(
  client: ThirdwebClient,
  chain: Chain,
  nftContract: string,
  tokenId: string
) {
  const swapContractAddress = SWAP_CONTRACT_ADDRESSES[chain.id as keyof typeof SWAP_CONTRACT_ADDRESSES];

  const contract = getContract({
    client,
    chain,
    address: nftContract,
    abi: ERC721_ABI,
  });

  return prepareContractCall({
    contract,
    method: "function approve(address to, uint256 tokenId)",
    params: [swapContractAddress, BigInt(tokenId)],
  });
}

/**
 * Prepare transaction to create a swap listing
 */
export function prepareCreateSwapListing(
  client: ThirdwebClient,
  chain: Chain,
  nftContract: string,
  params: CreateSwapListingParams
) {
  const contract = getSwapContract(client, chain);

  return prepareContractCall({
    contract,
    method: "function createSwapListing(address nftContract, uint256 tokenId, address wantedNftContract, uint256 wantedTokenId, uint256 durationInDays) returns (uint256 listingId)",
    params: [
      nftContract,
      BigInt(params.tokenId),
      params.wantedCollection,
      BigInt(params.wantedTokenId || "0"),
      BigInt(30), // Default 30 days duration
    ],
  });
}

/**
 * Prepare transaction to execute a swap
 */
export function prepareExecuteSwap(
  client: ThirdwebClient,
  chain: Chain,
  params: ExecuteSwapParams
) {
  const contract = getSwapContract(client, chain);

  return prepareContractCall({
    contract,
    method: "function executeSwap(uint256 listingId, uint256 myTokenId)",
    params: [BigInt(params.listingId), BigInt(params.myTokenId)],
  });
}

/**
 * Prepare transaction to cancel a swap listing
 */
export function prepareCancelSwapListing(
  client: ThirdwebClient,
  chain: Chain,
  listingId: string
) {
  const contract = getSwapContract(client, chain);

  return prepareContractCall({
    contract,
    method: "function cancelSwapListing(uint256 listingId)",
    params: [BigInt(listingId)],
  });
}

/**
 * Read swap listing details from contract
 */
export async function getSwapListing(
  client: ThirdwebClient,
  chain: Chain,
  listingId: string
): Promise<SwapListing | null> {
  try {
    const contract = getSwapContract(client, chain);

    const result = await readContract({
      contract,
      method: "function getSwapListing(uint256 listingId) view returns (address lister, address nftContract, uint256 tokenId, address wantedNftContract, uint256 wantedTokenId, bool isActive, uint256 createdAt, uint256 expiresAt)",
      params: [BigInt(listingId)],
    });

    return {
      listingId,
      lister: result[0],
      nftContract: result[1],
      tokenId: result[2].toString(),
      wantedNftContract: result[3],
      wantedTokenId: result[4].toString(),
      isActive: result[5],
      createdAt: new Date(Number(result[6]) * 1000),
      expiresAt: new Date(Number(result[7]) * 1000),
    };
  } catch (error) {
    console.error("Error fetching swap listing:", error);
    return null;
  }
}

/**
 * Check if a swap listing is still valid
 */
export async function isSwapListingValid(
  client: ThirdwebClient,
  chain: Chain,
  listingId: string
): Promise<boolean> {
  try {
    const contract = getSwapContract(client, chain);

    const result = await readContract({
      contract,
      method: "function isListingValid(uint256 listingId) view returns (bool)",
      params: [BigInt(listingId)],
    });

    return result;
  } catch (error) {
    console.error("Error checking listing validity:", error);
    return false;
  }
}

/**
 * Check if an NFT is approved for the swap contract
 */
export async function isNFTApprovedForSwap(
  client: ThirdwebClient,
  chain: Chain,
  nftContract: string,
  tokenId: string
): Promise<boolean> {
  try {
    const swapContractAddress = SWAP_CONTRACT_ADDRESSES[chain.id as keyof typeof SWAP_CONTRACT_ADDRESSES];

    const contract = getContract({
      client,
      chain,
      address: nftContract,
      abi: ERC721_ABI,
    });

    const approvedAddress = await readContract({
      contract,
      method: "function getApproved(uint256 tokenId) view returns (address)",
      params: [BigInt(tokenId)],
    });

    return approvedAddress.toLowerCase() === swapContractAddress.toLowerCase();
  } catch (error) {
    console.error("Error checking NFT approval:", error);
    return false;
  }
}