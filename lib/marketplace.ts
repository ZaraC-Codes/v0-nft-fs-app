import { getContract, prepareContractCall, readContract } from "thirdweb";
import { approve as approveERC721, isApprovedForAll as isApprovedForAllERC721 } from "thirdweb/extensions/erc721";
import { setApprovalForAll as setApprovalForAllERC1155, isApprovedForAll as isApprovedForAllERC1155 } from "thirdweb/extensions/erc1155";
import { createListing as createDirectListing } from "thirdweb/extensions/marketplace";
import { client, apeChainCurtis, MARKETPLACE_CONTRACT_ADDRESS } from "./thirdweb";
import { calculateTotalWithFee, PLATFORM_FEE_RECIPIENT } from "./platform-fees";

// Get the marketplace contract instance
export function getMarketplaceContract() {
  console.log("🔍 Marketplace address:", MARKETPLACE_CONTRACT_ADDRESS);

  if (!MARKETPLACE_CONTRACT_ADDRESS) {
    const error = "❌ Marketplace contract address not configured. Please set NEXT_PUBLIC_MARKETPLACE_CONTRACT_ADDRESS in environment variables.";
    console.error(error);
    throw new Error(error);
  }

  return getContract({
    client,
    chain: apeChainCurtis,
    address: MARKETPLACE_CONTRACT_ADDRESS,
  });
}

// Get all listings from the marketplace
export async function getAllListings() {
  const contract = getMarketplaceContract();

  try {
    const listings = await readContract({
      contract,
      method: "function getAllListings() view returns ((uint256 listingId, uint256 tokenId, uint256 quantity, uint256 pricePerToken, uint128 startTimestamp, uint128 endTimestamp, address listingCreator, address assetContract, address currency, uint8 tokenType, uint8 status, bool reserved)[])",
      params: [],
    });

    return listings;
  } catch (error) {
    console.error("Error fetching listings:", error);
    return [];
  }
}

// Get a specific listing by ID
export async function getListing(listingId: bigint) {
  const contract = getMarketplaceContract();

  try {
    const listing = await readContract({
      contract,
      method: "function getListing(uint256 _listingId) view returns ((uint256 listingId, uint256 tokenId, uint256 quantity, uint256 pricePerToken, uint128 startTimestamp, uint128 endTimestamp, address listingCreator, address assetContract, address currency, uint8 tokenType, uint8 status, bool reserved))",
      params: [listingId],
    });

    return listing;
  } catch (error) {
    console.error("Error fetching listing:", error);
    return null;
  }
}

// Create a new direct listing
export function createDirectListing({
  assetContract,
  tokenId,
  quantity,
  currency,
  pricePerToken,
  startTimestamp,
  endTimestamp,
  reserved = false,
}: {
  assetContract: string;
  tokenId: bigint;
  quantity: bigint;
  currency: string;
  pricePerToken: bigint;
  startTimestamp: bigint;
  endTimestamp: bigint;
  reserved?: boolean;
}) {
  const contract = getMarketplaceContract();

  return prepareContractCall({
    contract,
    method: "function createListing((address assetContract, uint256 tokenId, uint256 quantity, address currency, uint256 pricePerToken, uint128 startTimestamp, uint128 endTimestamp, bool reserved) _params)",
    params: [{
      assetContract,
      tokenId,
      quantity,
      currency,
      pricePerToken,
      startTimestamp,
      endTimestamp,
      reserved,
    }],
  });
}

// Buy from a direct listing (with 2.5% platform fee)
export function buyFromListing({
  listingId,
  quantityToBuy,
  buyFor,
  currency,
  pricePerToken,
}: {
  listingId: bigint;
  quantityToBuy: bigint;
  buyFor: string;
  currency: string;
  pricePerToken: bigint;
}) {
  const contract = getMarketplaceContract();

  // Calculate total price for the quantity
  const basePrice = pricePerToken * quantityToBuy;

  // Add 2.5% platform fee
  const { totalPrice, platformFee } = calculateTotalWithFee(basePrice, "BUY");

  console.log(`Purchase: Base ${basePrice}, Fee ${platformFee}, Total ${totalPrice}`);

  return prepareContractCall({
    contract,
    method: "function buyFromListing(uint256 _listingId, address _buyFor, uint256 _quantity, address _currency, uint256 _expectedTotalPrice)",
    params: [listingId, buyFor, quantityToBuy, currency, totalPrice],
  });
}

// Cancel a listing
export function cancelListing(listingId: bigint) {
  const contract = getMarketplaceContract();

  return prepareContractCall({
    contract,
    method: "function cancelListing(uint256 _listingId)",
    params: [listingId],
  });
}

// Detect if an NFT contract is ERC1155 or ERC721
export async function detectNFTTokenType({
  client,
  chain,
  contractAddress
}: {
  client: any
  chain: any
  contractAddress: string
}): Promise<'erc721' | 'erc1155'> {
  const nftContract = getContract({
    client,
    chain,
    address: contractAddress,
  });

  try {
    // Try to call supportsInterface for ERC1155 (0xd9b67a26)
    const supportsERC1155 = await readContract({
      contract: nftContract,
      method: "function supportsInterface(bytes4 interfaceId) view returns (bool)",
      params: ["0xd9b67a26"],
    });

    if (supportsERC1155) {
      return 'erc1155';
    }
  } catch (error) {
    // If supportsInterface fails, it's likely ERC721
    console.log("Not ERC1155, assuming ERC721");
  }

  return 'erc721';
}

// Check if NFT is approved for marketplace
export async function isNFTApproved({
  client,
  chain,
  contractAddress,
  ownerAddress,
  tokenType
}: {
  client: any
  chain: any
  contractAddress: string
  ownerAddress: string
  tokenType?: 'erc721' | 'erc1155'
}) {
  // Auto-detect token type if not provided
  if (!tokenType) {
    tokenType = await detectNFTTokenType({ client, chain, contractAddress });
    console.log("🔍 Detected token type:", tokenType);
  }

  console.log("🔍 Checking approval:")
  console.log("  - NFT Contract:", contractAddress)
  console.log("  - Owner:", ownerAddress)
  console.log("  - Marketplace (operator):", MARKETPLACE_CONTRACT_ADDRESS)
  console.log("  - Token type:", tokenType)

  const nftContract = getContract({
    client,
    chain,
    address: contractAddress,
  });

  let approved = false
  if (tokenType === 'erc1155') {
    approved = await isApprovedForAllERC1155({
      contract: nftContract,
      owner: ownerAddress,
      operator: MARKETPLACE_CONTRACT_ADDRESS!,
    });
  } else {
    approved = await isApprovedForAllERC721({
      contract: nftContract,
      owner: ownerAddress,
      operator: MARKETPLACE_CONTRACT_ADDRESS!,
    });
  }

  console.log("🔍 isApprovedForAll result:", approved)
  return approved
}

// Prepare approval transaction for NFT
export async function prepareApproveNFT({
  client,
  chain,
  contractAddress,
  tokenType
}: {
  client: any
  chain: any
  contractAddress: string
  tokenType?: 'erc721' | 'erc1155'
}) {
  // Auto-detect token type if not provided
  if (!tokenType) {
    tokenType = await detectNFTTokenType({ client, chain, contractAddress });
    console.log("🔍 Detected token type for approval:", tokenType);
  }

  const nftContract = getContract({
    client,
    chain,
    address: contractAddress,
  });

  if (tokenType === 'erc1155') {
    return setApprovalForAllERC1155({
      contract: nftContract,
      operator: MARKETPLACE_CONTRACT_ADDRESS!,
      approved: true,
    });
  } else {
    // For ERC721, we need to use setApprovalForAll too
    return prepareContractCall({
      contract: nftContract,
      method: "function setApprovalForAll(address operator, bool approved)",
      params: [MARKETPLACE_CONTRACT_ADDRESS!, true],
    });
  }
}

// Helper function to prepare a list for sale transaction
export function prepareListForSale({
  client,
  chain,
  contractAddress,
  tokenId,
  price,
  isBundle = false
}: {
  client: any
  chain: any
  contractAddress: string
  tokenId: string
  price: string
  isBundle?: boolean
}) {
  console.log("📝 Preparing listing with ThirdWeb marketplace extension...")
  console.log("  - NFT Contract:", contractAddress)
  console.log("  - Token ID:", tokenId)
  console.log("  - Price:", price, "APE")

  const marketplaceContract = getMarketplaceContract()

  return createDirectListing({
    contract: marketplaceContract,
    assetContractAddress: contractAddress,
    tokenId: BigInt(tokenId),
    pricePerToken: price, // ThirdWeb will handle conversion to wei
  })
}

// Helper function to prepare a buy NFT transaction
export function prepareBuyNFT({
  client,
  chain,
  contractAddress,
  tokenId,
  price,
  isBundle = false
}: {
  client: any
  chain: any
  contractAddress: string
  tokenId: string
  price: string
  isBundle?: boolean
}) {
  const priceInWei = BigInt(Math.floor(parseFloat(price) * 1e18))

  // Native currency address (APE on ApeChain)
  const nativeCurrency = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"

  // In a real implementation, you would need to get the actual listing ID
  // For now, we'll use a placeholder - this should be retrieved from the NFT listing data
  const listingId = BigInt(0) // TODO: Get actual listing ID from blockchain

  // Get buyer's address from the active account
  // This will be set by the TransactionButton component
  const buyFor = "0x0000000000000000000000000000000000000000" // Placeholder - will be replaced by TransactionButton

  return buyFromListing({
    listingId,
    quantityToBuy: BigInt(1),
    buyFor,
    currency: nativeCurrency,
    pricePerToken: priceInWei
  })
}