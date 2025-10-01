import { getContract, prepareContractCall, readContract } from "thirdweb";
import { client, apeChainCurtis, MARKETPLACE_CONTRACT_ADDRESS } from "./thirdweb";
import { calculateTotalWithFee, PLATFORM_FEE_RECIPIENT } from "./platform-fees";

// Get the marketplace contract instance
export function getMarketplaceContract() {
  if (!MARKETPLACE_CONTRACT_ADDRESS) {
    throw new Error("Marketplace contract address not configured");
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
  const priceInWei = BigInt(Math.floor(parseFloat(price) * 1e18))
  const currentTimestamp = BigInt(Math.floor(Date.now() / 1000))
  const endTimestamp = currentTimestamp + BigInt(30 * 24 * 60 * 60) // 30 days from now

  // Native currency address (APE on ApeChain)
  const nativeCurrency = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"

  return createDirectListing({
    assetContract: contractAddress,
    tokenId: BigInt(tokenId),
    quantity: BigInt(1),
    currency: nativeCurrency,
    pricePerToken: priceInWei,
    startTimestamp: currentTimestamp,
    endTimestamp: endTimestamp,
    reserved: false
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