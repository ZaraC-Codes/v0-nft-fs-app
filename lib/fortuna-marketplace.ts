/**
 * FortunaSquareMarketplace Integration
 *
 * TypeScript library for interacting with the custom FortunaSquareMarketplace contract.
 * Drop-in replacement for lib/marketplace.ts with simplified, optimized functionality.
 */

import { getContract, prepareContractCall, readContract } from "thirdweb"
import {
  approve as approveERC721,
  isApprovedForAll as isApprovedForAllERC721,
  getApproved as getApprovedERC721,
} from "thirdweb/extensions/erc721"
import {
  setApprovalForAll as setApprovalForAllERC1155,
  isApprovedForAll as isApprovedForAllERC1155,
} from "thirdweb/extensions/erc1155"
import { apeChain } from "@/lib/thirdweb"

const FORTUNA_MARKETPLACE_ADDRESS = process.env.NEXT_PUBLIC_FORTUNA_MARKETPLACE_ADDRESS || ""

if (!FORTUNA_MARKETPLACE_ADDRESS) {
  console.warn("⚠️ NEXT_PUBLIC_FORTUNA_MARKETPLACE_ADDRESS not set - marketplace features disabled")
}

/**
 * Get the FortunaSquareMarketplace contract instance
 */
export function getFortunaMarketplaceContract() {
  if (!FORTUNA_MARKETPLACE_ADDRESS) {
    throw new Error("NEXT_PUBLIC_FORTUNA_MARKETPLACE_ADDRESS not configured")
  }

  return getContract({
    address: FORTUNA_MARKETPLACE_ADDRESS,
    chain: apeChain,
    client: {} as any, // Will be provided in transaction context
  })
}

/**
 * Auto-detect NFT token type (ERC721 or ERC1155)
 */
export async function detectNFTTokenType({
  client,
  chain,
  contractAddress,
}: {
  client: any
  chain: any
  contractAddress: string
}): Promise<'erc721' | 'erc1155'> {
  try {
    const nftContract = getContract({
      client,
      chain,
      address: contractAddress,
    })

    // Check for ERC1155 interface
    const isERC1155 = await readContract({
      contract: nftContract,
      method: "function supportsInterface(bytes4 interfaceId) view returns (bool)",
      params: ["0xd9b67a26"], // ERC1155 interface ID
    })

    return isERC1155 ? 'erc1155' : 'erc721'
  } catch {
    // Default to ERC721 if detection fails
    return 'erc721'
  }
}

/**
 * Check if NFT is approved for the FortunaSquareMarketplace
 */
export async function isNFTApproved({
  client,
  chain,
  contractAddress,
  ownerAddress,
  tokenId,
  tokenType
}: {
  client: any
  chain: any
  contractAddress: string
  ownerAddress: string
  tokenId?: string
  tokenType?: 'erc721' | 'erc1155'
}) {
  // Auto-detect token type if not provided
  if (!tokenType) {
    tokenType = await detectNFTTokenType({ client, chain, contractAddress })
    console.log("🔍 Detected token type:", tokenType)
  }

  console.log("🔍 Checking FortunaSquare marketplace approval:")
  console.log("  - NFT Contract:", contractAddress)
  console.log("  - Owner:", ownerAddress)
  console.log("  - Marketplace:", FORTUNA_MARKETPLACE_ADDRESS)
  console.log("  - Token type:", tokenType)

  const nftContract = getContract({
    client,
    chain,
    address: contractAddress,
  })

  // For ERC721, check specific token approval first, then fallback to operator approval
  if (tokenType === 'erc721' && tokenId) {
    try {
      const approvedAddress = await getApprovedERC721({
        contract: nftContract,
        tokenId: BigInt(tokenId),
      })

      console.log("  - Specific approval (getApproved):", approvedAddress)

      if (approvedAddress.toLowerCase() === FORTUNA_MARKETPLACE_ADDRESS.toLowerCase()) {
        console.log("✅ NFT approved via specific approval")
        return true
      }
    } catch (error) {
      console.log("  - Could not check specific approval:", error)
    }
  }

  // Check operator approval
  let approved = false
  if (tokenType === 'erc1155') {
    approved = await isApprovedForAllERC1155({
      contract: nftContract,
      owner: ownerAddress,
      operator: FORTUNA_MARKETPLACE_ADDRESS,
    })
  } else {
    approved = await isApprovedForAllERC721({
      contract: nftContract,
      owner: ownerAddress,
      operator: FORTUNA_MARKETPLACE_ADDRESS,
    })
  }

  console.log("  - Operator approval (isApprovedForAll):", approved)

  if (approved) {
    console.log("✅ NFT approved via operator approval")
  } else {
    console.log("❌ NFT not approved")
  }

  return approved
}

/**
 * Prepare NFT approval transaction for FortunaSquareMarketplace
 */
export async function prepareApproveNFT({
  client,
  chain,
  contractAddress,
  tokenId,
  tokenType
}: {
  client: any
  chain: any
  contractAddress: string
  tokenId?: string
  tokenType?: 'erc721' | 'erc1155'
}) {
  // Auto-detect token type if not provided
  if (!tokenType) {
    tokenType = await detectNFTTokenType({ client, chain, contractAddress })
    console.log("🔍 Detected token type for approval:", tokenType)
  }

  const nftContract = getContract({
    client,
    chain,
    address: contractAddress,
  })

  if (tokenType === 'erc1155') {
    console.log("📝 Preparing ERC1155 setApprovalForAll")
    return setApprovalForAllERC1155({
      contract: nftContract,
      operator: FORTUNA_MARKETPLACE_ADDRESS,
      approved: true,
    })
  } else {
    // For ERC721, use specific token approval
    console.log("📝 Preparing ERC721 approve for token:", tokenId)
    if (!tokenId) {
      throw new Error("Token ID required for ERC721 approval")
    }
    return approveERC721({
      contract: nftContract,
      to: FORTUNA_MARKETPLACE_ADDRESS,
      tokenId: BigInt(tokenId),
    })
  }
}

/**
 * Prepare a listing creation transaction
 */
export function prepareListForSale({
  client,
  chain,
  contractAddress,
  tokenId,
  price,
  quantity = "1",
  duration = 30 * 24 * 60 * 60 // 30 days default
}: {
  client: any
  chain: any
  contractAddress: string
  tokenId: string
  price: string
  quantity?: string
  duration?: number
}) {
  console.log("📝 Preparing FortunaSquare listing...")
  console.log("  - NFT Contract:", contractAddress)
  console.log("  - Token ID:", tokenId)
  console.log("  - Price:", price, "APE")
  console.log("  - Quantity:", quantity)
  console.log("  - Duration:", duration, "seconds")

  const marketplaceContract = getContract({
    client,
    chain,
    address: FORTUNA_MARKETPLACE_ADDRESS,
  })

  const priceInWei = BigInt(Math.floor(parseFloat(price) * 1e18))
  const nativeCurrency = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"

  return prepareContractCall({
    contract: marketplaceContract,
    method: "function createListing(address nftContract, uint256 tokenId, uint256 quantity, address currency, uint256 pricePerToken, uint256 duration) returns (uint256)",
    params: [
      contractAddress,
      BigInt(tokenId),
      BigInt(quantity),
      nativeCurrency,
      priceInWei,
      BigInt(duration)
    ],
  })
}

/**
 * Prepare a buy transaction
 */
export function prepareBuyNFT({
  client,
  chain,
  listingId,
  quantity = "1",
  price
}: {
  client: any
  chain: any
  listingId: string
  quantity?: string
  price: string
}) {
  console.log("📝 Preparing FortunaSquare buy...")
  console.log("  - Listing ID:", listingId)
  console.log("  - Quantity:", quantity)
  console.log("  - Price:", price, "APE")

  const marketplaceContract = getContract({
    client,
    chain,
    address: FORTUNA_MARKETPLACE_ADDRESS,
  })

  const totalPriceWei = BigInt(Math.floor(parseFloat(price) * parseFloat(quantity) * 1e18))

  return prepareContractCall({
    contract: marketplaceContract,
    method: "function buyFromListing(uint256 listingId, uint256 quantity) payable",
    params: [BigInt(listingId), BigInt(quantity)],
    value: totalPriceWei,
  })
}

/**
 * Prepare a cancel listing transaction
 */
export function prepareCancelListing({
  client,
  chain,
  listingId
}: {
  client: any
  chain: any
  listingId: string
}) {
  console.log("📝 Preparing cancel listing:", listingId)

  const marketplaceContract = getContract({
    client,
    chain,
    address: FORTUNA_MARKETPLACE_ADDRESS,
  })

  return prepareContractCall({
    contract: marketplaceContract,
    method: "function cancelListing(uint256 listingId)",
    params: [BigInt(listingId)],
  })
}

/**
 * Prepare an update listing price transaction
 */
export function prepareUpdateListing({
  client,
  chain,
  listingId,
  newPrice
}: {
  client: any
  chain: any
  listingId: string
  newPrice: string
}) {
  console.log("📝 Preparing update listing:", listingId, "to", newPrice, "APE")

  const marketplaceContract = getContract({
    client,
    chain,
    address: FORTUNA_MARKETPLACE_ADDRESS,
  })

  const priceInWei = BigInt(Math.floor(parseFloat(newPrice) * 1e18))

  return prepareContractCall({
    contract: marketplaceContract,
    method: "function updateListingPrice(uint256 listingId, uint256 newPrice)",
    params: [BigInt(listingId), priceInWei],
  })
}

/**
 * Get listing details
 */
export async function getListing({
  client,
  chain,
  listingId
}: {
  client: any
  chain: any
  listingId: string
}) {
  const marketplaceContract = getContract({
    client,
    chain,
    address: FORTUNA_MARKETPLACE_ADDRESS,
  })

  return await readContract({
    contract: marketplaceContract,
    method: "function getListing(uint256 listingId) view returns (tuple(uint256 listingId, address seller, address nftContract, uint256 tokenId, uint256 quantity, address currency, uint256 pricePerToken, uint256 startTime, uint256 endTime, bool active, uint8 tokenType))",
    params: [BigInt(listingId)],
  })
}

/**
 * Get user's listings
 */
export async function getUserListings({
  client,
  chain,
  userAddress
}: {
  client: any
  chain: any
  userAddress: string
}) {
  const marketplaceContract = getContract({
    client,
    chain,
    address: FORTUNA_MARKETPLACE_ADDRESS,
  })

  return await readContract({
    contract: marketplaceContract,
    method: "function getUserListings(address user) view returns (uint256[])",
    params: [userAddress],
  })
}

/**
 * Check if listing is valid
 */
export async function isListingValid({
  client,
  chain,
  listingId
}: {
  client: any
  chain: any
  listingId: string
}) {
  const marketplaceContract = getContract({
    client,
    chain,
    address: FORTUNA_MARKETPLACE_ADDRESS,
  })

  return await readContract({
    contract: marketplaceContract,
    method: "function isListingValid(uint256 listingId) view returns (bool)",
    params: [BigInt(listingId)],
  })
}

/**
 * Get total listings count
 */
export async function getTotalListings({
  client,
  chain
}: {
  client: any
  chain: any
}) {
  const marketplaceContract = getContract({
    client,
    chain,
    address: FORTUNA_MARKETPLACE_ADDRESS,
  })

  return await readContract({
    contract: marketplaceContract,
    method: "function totalListings() view returns (uint256)",
    params: [],
  })
}

/**
 * Check if NFT is a bundle
 */
export async function isBundleNFT({
  client,
  chain,
  contractAddress,
  tokenId
}: {
  client: any
  chain: any
  contractAddress: string
  tokenId: string
}) {
  const marketplaceContract = getContract({
    client,
    chain,
    address: FORTUNA_MARKETPLACE_ADDRESS,
  })

  return await readContract({
    contract: marketplaceContract,
    method: "function isBundleNFT(address nftContract, uint256 tokenId) view returns (bool)",
    params: [contractAddress, BigInt(tokenId)],
  })
}
