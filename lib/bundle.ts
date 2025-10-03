import { prepareContractCall, readContract, getContract } from "thirdweb";
import { ThirdwebClient } from "thirdweb";
import { Chain } from "thirdweb/chains";
import { apeChain, apeChainCurtis, sepolia } from "./thirdweb";
import { encodeFunctionData } from "viem";

/**
 * Bundle Contract Addresses
 * Updated: Oct 3, 2025 - Added ApeChain mainnet configuration
 */
export const BUNDLE_CONTRACT_ADDRESSES = {
  // ApeChain Mainnet (PRODUCTION) - Deployed Oct 3, 2025
  [apeChain.id]: {
    bundleNFT: "0x4c1E579711A9a8f9ba66aaa924fBf134F4cf107c", // BundleNFTUnified with emergency/demo unwrap
    bundleManager: "0x4c1E579711A9a8f9ba66aaa924fBf134F4cf107c", // Same as bundleNFT (unified contract)
    erc6551Registry: "0x000000006551c19487814612e58FE06813775758", // Standard ERC6551 Registry
    accountImplementation: "0x2d25602551487c3f3354dd80d76d54383a243358", // Standard implementation
  },
  // ApeChain Curtis (testnet)
  [apeChainCurtis.id]: {
    bundleNFT: "0xA3e7564D153cc7f45B8479E9891dbFF858B9155e", // BundleNFTUnified with emergency unwrap - Oct 3, 2025
    bundleManager: "0xA3e7564D153cc7f45B8479E9891dbFF858B9155e", // Same as bundleNFT (unified contract)
    erc6551Registry: "0x000000006551c19487814612e58FE06813775758", // Standard ERC6551 Registry
    accountImplementation: "0x41C8f39463A868d3A88af00cd0fe7102F30E44eC", // Curtis-specific implementation (broken executeCall)
  },
  // Sepolia (testnet)
  [sepolia.id]: {
    bundleNFT: "0x...",
    bundleManager: "0x...",
    erc6551Registry: "0x000000006551c19487814612e58FE06813775758", // Standard ERC6551 Registry
    accountImplementation: "0x...", // Deploy AccountFactory on Sepolia if needed
  },
} as const;

/**
 * Bundle Manager ABI
 */
const BUNDLE_MANAGER_ABI = [
  {
    "inputs": [
      { "name": "nftContracts", "type": "address[]" },
      { "name": "tokenIds", "type": "uint256[]" },
      { "name": "bundleName", "type": "string" },
      { "name": "bundleTokenURI", "type": "string" }
    ],
    "name": "createBundle",
    "outputs": [
      { "name": "bundleId", "type": "uint256" },
      { "name": "accountAddress", "type": "address" }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "name": "bundleId", "type": "uint256" },
      { "name": "nftContracts", "type": "address[]" },
      { "name": "tokenIds", "type": "uint256[]" },
      { "name": "recipient", "type": "address" }
    ],
    "name": "withdrawFromBundle",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "name": "bundleId", "type": "uint256" },
      { "name": "nftContracts", "type": "address[]" },
      { "name": "tokenIds", "type": "uint256[]" }
    ],
    "name": "unwrapBundle",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "name": "nftContracts", "type": "address[]" }
    ],
    "name": "batchApproveNFTs",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "name": "bundleId", "type": "uint256" }
    ],
    "name": "getBundleAccount",
    "outputs": [
      { "name": "", "type": "address" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "name": "bundleId", "type": "uint256" }
    ],
    "name": "bundleAccountExists",
    "outputs": [
      { "name": "", "type": "bool" }
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

/**
 * Bundle NFT ABI
 */
const BUNDLE_NFT_ABI = [
  {
    "inputs": [
      { "name": "tokenId", "type": "uint256" }
    ],
    "name": "getBundleMetadata",
    "outputs": [
      {
        "components": [
          { "name": "name", "type": "string" },
          { "name": "itemCount", "type": "uint256" },
          { "name": "createdAt", "type": "uint256" },
          { "name": "creator", "type": "address" },
          { "name": "exists", "type": "bool" }
        ],
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "name": "tokenId", "type": "uint256" }
    ],
    "name": "bundleExists",
    "outputs": [
      { "name": "", "type": "bool" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalBundles",
    "outputs": [
      { "name": "", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

// Types
export interface BundleMetadata {
  name: string;
  itemCount: number;
  createdAt: Date;
  creator: string;
  exists: boolean;
}

export interface CreateBundleParams {
  nftContracts: string[];
  tokenIds: string[];
  bundleName: string;
  bundleTokenURI: string;
}

export interface UnwrapBundleParams {
  bundleId: string;
  nftContracts: string[];
  tokenIds: string[];
}

export interface WithdrawFromBundleParams {
  bundleId: string;
  nftContracts: string[];
  tokenIds: string[];
  recipient: string;
}

/**
 * Get the Bundle Manager contract
 */
export function getBundleManagerContract(client: ThirdwebClient, chain: Chain) {
  const addresses = BUNDLE_CONTRACT_ADDRESSES[chain.id as keyof typeof BUNDLE_CONTRACT_ADDRESSES];

  if (!addresses || addresses.bundleManager === "0x...") {
    throw new Error(`Bundle Manager not deployed on chain ${chain.id}`);
  }

  return getContract({
    client,
    chain,
    address: addresses.bundleManager,
    abi: BUNDLE_MANAGER_ABI,
  });
}

/**
 * Get the Bundle NFT contract
 */
export function getBundleNFTContract(client: ThirdwebClient, chain: Chain) {
  const addresses = BUNDLE_CONTRACT_ADDRESSES[chain.id as keyof typeof BUNDLE_CONTRACT_ADDRESSES];

  if (!addresses || addresses.bundleNFT === "0x...") {
    throw new Error(`Bundle NFT not deployed on chain ${chain.id}`);
  }

  return getContract({
    client,
    chain,
    address: addresses.bundleNFT,
    abi: BUNDLE_NFT_ABI,
  });
}

/**
 * Prepare transaction to approve a single NFT contract for bundle manager
 * User calls setApprovalForAll directly on the NFT contract
 */
export function prepareApproveNFTContract(
  client: ThirdwebClient,
  chain: Chain,
  nftContract: string
) {
  const bundleManagerAddress = BUNDLE_CONTRACT_ADDRESSES[chain.id as keyof typeof BUNDLE_CONTRACT_ADDRESSES]?.bundleManager;

  if (!bundleManagerAddress || bundleManagerAddress === "0x...") {
    throw new Error(`Bundle Manager not deployed on chain ${chain.id}`);
  }

  const contract = getContract({
    client,
    chain,
    address: nftContract,
  });

  return prepareContractCall({
    contract,
    method: "function setApprovalForAll(address operator, bool approved)",
    params: [bundleManagerAddress, true],
  });
}

/**
 * Prepare transaction to batch approve NFT contracts (DEPRECATED - broken in contract)
 */
export function prepareBatchApproveNFTs(
  client: ThirdwebClient,
  chain: Chain,
  nftContracts: string[]
) {
  // This contract function is broken - it tries to call setApprovalForAll from within the contract
  // which results in "ERC721: approve to caller" error
  // Instead, call prepareApproveNFTContract for each contract individually
  throw new Error("Use prepareApproveNFTContract for each contract individually");
}

/**
 * Prepare transaction to create a bundle
 */
export function prepareCreateBundle(
  client: ThirdwebClient,
  chain: Chain,
  params: CreateBundleParams
) {
  const contract = getBundleManagerContract(client, chain);

  return prepareContractCall({
    contract,
    method: "function createBundle(address[] calldata nftContracts, uint256[] calldata tokenIds, string calldata bundleName, string calldata bundleTokenURI) returns (uint256 bundleId, address accountAddress)",
    params: [
      params.nftContracts,
      params.tokenIds.map(id => BigInt(id)),
      params.bundleName,
      params.bundleTokenURI
    ],
  });
}

/**
 * Prepare transaction to approve BundleManager to unwrap (called via TBA.executeCall)
 */
export function prepareApproveBundleManagerForUnwrap(
  client: ThirdwebClient,
  chain: Chain,
  bundleId: string,
  nftContracts: string[],
  tbaAddress: string
) {
  const bundleManagerAddress = getBundleManagerContract(client, chain).address;

  // Encode the approveBundleManagerForUnwrap call
  const approveCalldata = encodeFunctionData({
    abi: [{
      name: "approveBundleManagerForUnwrap",
      type: "function",
      stateMutability: "nonpayable",
      inputs: [
        { name: "bundleId", type: "uint256" },
        { name: "nftContracts", type: "address[]" }
      ],
      outputs: []
    }],
    functionName: "approveBundleManagerForUnwrap",
    args: [BigInt(bundleId), nftContracts],
  });

  // Call executeCall on the TBA
  const tbaContract = getContract({
    client,
    chain,
    address: tbaAddress,
  });

  return prepareContractCall({
    contract: tbaContract,
    method: "function executeCall(address to, uint256 value, bytes calldata data) payable returns (bytes memory)",
    params: [
      bundleManagerAddress,
      0n,
      approveCalldata
    ],
  });
}

/**
 * Prepare transaction to withdraw specific NFTs from bundle
 */
export function prepareWithdrawFromBundle(
  client: ThirdwebClient,
  chain: Chain,
  params: WithdrawFromBundleParams
) {
  const contract = getBundleManagerContract(client, chain);

  return prepareContractCall({
    contract,
    method: "function withdrawFromBundle(uint256 bundleId, address[] calldata nftContracts, uint256[] calldata tokenIds, address recipient)",
    params: [
      BigInt(params.bundleId),
      params.nftContracts,
      params.tokenIds.map(id => BigInt(id)),
      params.recipient
    ],
  });
}

/**
 * Prepare transaction to unwrap a bundle (called directly by bundle owner)
 */
export function prepareUnwrapBundle(
  client: ThirdwebClient,
  chain: Chain,
  params: UnwrapBundleParams
) {
  const contract = getBundleManagerContract(client, chain);

  return prepareContractCall({
    contract,
    method: "function unwrapBundle(uint256 bundleId, address[] calldata nftContracts, uint256[] calldata tokenIds)",
    params: [
      BigInt(params.bundleId),
      params.nftContracts,
      params.tokenIds.map(id => BigInt(id))
    ],
  });
}

/**
 * Get the ERC6551 Token Bound Account address for a bundle
 */
export async function getBundleAccountAddress(
  client: ThirdwebClient,
  chain: Chain,
  bundleId: string
): Promise<string> {
  const contract = getBundleManagerContract(client, chain);

  const address = await readContract({
    contract,
    method: "function getBundleAccount(uint256 bundleId) view returns (address)",
    params: [BigInt(bundleId)],
  });

  return address;
}

/**
 * Check if a bundle's TBA has been created
 */
export async function bundleAccountExists(
  client: ThirdwebClient,
  chain: Chain,
  bundleId: string
): Promise<boolean> {
  const contract = getBundleManagerContract(client, chain);

  const exists = await readContract({
    contract,
    method: "function bundleAccountExists(uint256 bundleId) view returns (bool)",
    params: [BigInt(bundleId)],
  });

  return exists;
}

/**
 * Get bundle metadata from the Bundle NFT contract
 */
export async function getBundleMetadata(
  client: ThirdwebClient,
  chain: Chain,
  bundleId: string
): Promise<BundleMetadata | null> {
  try {
    const contract = getBundleNFTContract(client, chain);

    // Use the ABI directly instead of method string for tuple returns
    const result = await readContract({
      contract,
      method: {
        type: "function",
        name: "getBundleMetadata",
        inputs: [{ name: "tokenId", type: "uint256" }],
        outputs: [
          {
            type: "tuple",
            components: [
              { name: "name", type: "string" },
              { name: "itemCount", type: "uint256" },
              { name: "createdAt", type: "uint256" },
              { name: "creator", type: "address" },
              { name: "exists", type: "bool" }
            ]
          }
        ],
        stateMutability: "view",
      },
      params: [BigInt(bundleId)],
    }) as any;

    console.log(`📦 Raw bundle metadata result:`, result)

    // ThirdWeb v5 returns tuple as an object with named properties
    return {
      name: result.name || result[0] || "",
      itemCount: Number(result.itemCount || result[1] || 0),
      createdAt: new Date(Number(result.createdAt || result[2] || 0) * 1000),
      creator: result.creator || result[3] || "",
      exists: result.exists !== undefined ? result.exists : (result[4] !== undefined ? result[4] : true),
    };
  } catch (error) {
    console.error("Error fetching bundle metadata:", error);
    return null;
  }
}

/**
 * Check if a bundle exists
 */
export async function isBundleExists(
  client: ThirdwebClient,
  chain: Chain,
  bundleId: string
): Promise<boolean> {
  try {
    const contract = getBundleNFTContract(client, chain);

    const exists = await readContract({
      contract,
      method: "function bundleExists(uint256 tokenId) view returns (bool)",
      params: [BigInt(bundleId)],
    });

    return exists;
  } catch (error) {
    console.error("Error checking bundle existence:", error);
    return false;
  }
}

/**
 * Get total number of bundles created
 */
export async function getTotalBundles(
  client: ThirdwebClient,
  chain: Chain
): Promise<number> {
  try {
    const contract = getBundleNFTContract(client, chain);

    const total = await readContract({
      contract,
      method: "function totalBundles() view returns (uint256)",
      params: [],
    });

    return Number(total);
  } catch (error) {
    console.error("Error getting total bundles:", error);
    return 0;
  }
}

/**
 * Helper: Get unique NFT contracts from an array of NFTs
 */
export function getUniqueNFTContracts(nfts: Array<{ contractAddress: string }>): string[] {
  const unique = new Set(nfts.map(nft => nft.contractAddress));
  return Array.from(unique);
}

/**
 * Helper: Generate bundle metadata URI
 * This would typically upload to IPFS, but for now returns a data URI
 */
export function generateBundleMetadataURI(
  bundleName: string,
  description: string,
  imageUrl: string,
  nfts: Array<{ name: string; contractAddress: string; tokenId: string; image?: string }>,
  thumbnails?: Array<{ name: string; image: string; tokenId: string }>
): string {
  const metadata = {
    name: bundleName,
    description,
    image: imageUrl, // Cover image
    attributes: [
      {
        trait_type: "Bundle Size",
        value: nfts.length
      },
      {
        trait_type: "Created On",
        value: new Date().toISOString()
      }
    ],
    properties: {
      bundled_nfts: nfts.map(nft => ({
        name: nft.name,
        contract: nft.contractAddress,
        token_id: nft.tokenId
      })),
      // Store thumbnail preview data
      thumbnails: thumbnails || []
    }
  };

  // For development, return data URI
  // In production, upload to IPFS and return ipfs:// URI
  const jsonString = JSON.stringify(metadata);
  const base64 = Buffer.from(jsonString).toString('base64');
  return `data:application/json;base64,${base64}`;
}