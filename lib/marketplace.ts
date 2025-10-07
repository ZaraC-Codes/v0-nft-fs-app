import { getContract, prepareContractCall, readContract, getContractEvents, prepareEvent } from "thirdweb";
import { approve as approveERC721, isApprovedForAll as isApprovedForAllERC721 } from "thirdweb/extensions/erc721";
import { setApprovalForAll as setApprovalForAllERC1155, isApprovedForAll as isApprovedForAllERC1155 } from "thirdweb/extensions/erc1155";
import { client, apeChain, MARKETPLACE_CONTRACT_ADDRESS } from "./thirdweb";
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
    chain: apeChain,
    address: MARKETPLACE_CONTRACT_ADDRESS,
  });
}

// Get all listings from the marketplace
export async function getAllListings() {
  const contract = getMarketplaceContract();

  try {
    // Get the total listing count using getTotalListings
    const listingCount = await readContract({
      contract,
      method: "function getTotalListings() view returns (uint256)",
      params: [],
    });

    console.log(`📊 Total listings created: ${listingCount}`)

    // Fetch all listings by ID
    const listings = [];
    for (let i = 0; i < Number(listingCount); i++) {
      try {
        const listing = await readContract({
          contract,
          method: "function getListing(uint256 listingId) view returns ((uint256 listingId, address seller, address nftContract, uint256 tokenId, uint256 quantity, address currency, uint256 pricePerToken, uint256 startTime, uint256 endTime, bool active, uint8 tokenType))",
          params: [BigInt(i)],
        });
        listings.push(listing);
      } catch (error) {
        console.warn(`Could not fetch listing ${i}:`, error);
      }
    }

    return listings;
  } catch (error) {
    console.error("❌ Error fetching listings:", error);
    console.error("Error details:", error instanceof Error ? error.message : JSON.stringify(error));
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
    method: "function cancelListing(uint256 listingId)",
    params: [listingId],
  });
}

// Update listing price
export function updateListingPrice(listingId: bigint, newPriceInEth: string) {
  const contract = getMarketplaceContract();
  const priceInWei = BigInt(Math.floor(parseFloat(newPriceInEth) * 1e18));

  return prepareContractCall({
    contract,
    method: "function updateListingPrice(uint256 listingId, uint256 newPrice)",
    params: [listingId, priceInWei],
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
    tokenType = await detectNFTTokenType({ client, chain, contractAddress });
    console.log("🔍 Detected token type:", tokenType);
  }

  console.log("🔍 Checking approval:")
  console.log("  - NFT Contract:", contractAddress)
  console.log("  - Owner:", ownerAddress)
  console.log("  - Token ID:", tokenId)
  console.log("  - Marketplace (operator):", MARKETPLACE_CONTRACT_ADDRESS)
  console.log("  - Token type:", tokenType)

  const nftContract = getContract({
    client,
    chain,
    address: contractAddress,
  });

  let approved = false

  if (tokenType === 'erc1155') {
    // ERC1155 always uses operator approval
    approved = await isApprovedForAllERC1155({
      contract: nftContract,
      owner: ownerAddress,
      operator: MARKETPLACE_CONTRACT_ADDRESS!,
    });
    console.log("🔍 isApprovedForAll result:", approved)
  } else {
    // ERC721: Check specific token approval first, then operator approval
    if (tokenId) {
      try {
        const approvedAddress = await readContract({
          contract: nftContract,
          method: "function getApproved(uint256 tokenId) view returns (address)",
          params: [BigInt(tokenId)],
        });
        console.log("🔍 getApproved result:", approvedAddress)

        if (approvedAddress.toLowerCase() === MARKETPLACE_CONTRACT_ADDRESS!.toLowerCase()) {
          console.log("✅ Token specifically approved for marketplace")
          return true
        }
      } catch (error) {
        console.log("⚠️ Could not check specific approval:", error)
      }
    }

    // Fallback to operator approval
    approved = await isApprovedForAllERC721({
      contract: nftContract,
      owner: ownerAddress,
      operator: MARKETPLACE_CONTRACT_ADDRESS!,
    });
    console.log("🔍 isApprovedForAll result:", approved)
  }

  return approved
}

// Prepare approval transaction for NFT (specific token approval)
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
    tokenType = await detectNFTTokenType({ client, chain, contractAddress });
    console.log("🔍 Detected token type for approval:", tokenType);
  }

  const nftContract = getContract({
    client,
    chain,
    address: contractAddress,
  });

  if (tokenType === 'erc1155') {
    // ERC1155 uses setApprovalForAll
    return setApprovalForAllERC1155({
      contract: nftContract,
      operator: MARKETPLACE_CONTRACT_ADDRESS!,
      approved: true,
    });
  } else {
    // For ERC721, approve the specific token (not setApprovalForAll)
    // This is what the marketplace contract is checking!
    console.log("🔍 Approving specific token:", tokenId, "for marketplace:", MARKETPLACE_CONTRACT_ADDRESS);
    return prepareContractCall({
      contract: nftContract,
      method: "function approve(address to, uint256 tokenId)",
      params: [MARKETPLACE_CONTRACT_ADDRESS!, BigInt(tokenId!)],
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
  quantity = "1",
  duration = 30 * 24 * 60 * 60, // 30 days default
  isBundle = false
}: {
  client: any
  chain: any
  contractAddress: string
  tokenId: string
  price: string
  quantity?: string
  duration?: number
  isBundle?: boolean
}) {
  console.log("📝 Preparing FortunaSquare marketplace listing...")
  console.log("  - NFT Contract:", contractAddress)
  console.log("  - Token ID:", tokenId)
  console.log("  - Price:", price, "APE")
  console.log("  - Quantity:", quantity)
  console.log("  - Duration:", duration, "seconds")

  const marketplaceContract = getMarketplaceContract()

  const priceInWei = BigInt(Math.floor(parseFloat(price) * 1e18))
  const nativeCurrency = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"

  // Call FortunaSquareMarketplace's createListing function
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

/**
 * Get the most recent sale price for an NFT
 * @param contractAddress NFT contract address
 * @param tokenId NFT token ID
 * @returns Last sale price in APE (as string) or null if never sold
 */
export async function getLastSalePrice(contractAddress: string, tokenId: string): Promise<string | null> {
  const contract = getMarketplaceContract();

  try {
    // Define Sale event
    const saleEvent = prepareEvent({
      signature: "event Sale(uint256 indexed listingId, address indexed buyer, address indexed seller, address nftContract, uint256 tokenId, uint256 quantity, uint256 totalPrice, uint256 platformFee)"
    });

    console.log(`🔍 Fetching sale events for NFT ${contractAddress}/${tokenId}...`);

    // Fetch all Sale events
    const saleEvents = await getContractEvents({
      contract,
      events: [saleEvent]
    });

    // Filter for this specific NFT
    const relevantSales = saleEvents
      .filter((event: any) => {
        const args = event.args;
        return args &&
          args.nftContract?.toLowerCase() === contractAddress.toLowerCase() &&
          args.tokenId?.toString() === tokenId;
      })
      .map((event: any) => ({
        totalPrice: event.args.totalPrice,
        timestamp: Number(event.blockTimestamp || 0)
      }))
      .sort((a, b) => b.timestamp - a.timestamp); // Sort by most recent first

    if (relevantSales.length === 0) {
      console.log(`📊 No sale history found for NFT ${contractAddress}/${tokenId}`);
      return null;
    }

    // Get the most recent sale
    const lastSale = relevantSales[0];
    const priceInAPE = (Number(lastSale.totalPrice) / 1e18).toFixed(2);

    console.log(`✅ Last sale price: ${priceInAPE} APE`);
    return priceInAPE;
  } catch (error) {
    console.error("❌ Error fetching last sale price:", error);
    return null;
  }
}

// Get NFT activity from marketplace events
export async function getNFTActivity(contractAddress: string, tokenId: string) {
  const contract = getMarketplaceContract();

  try {
    const activities: Array<{
      type: string;
      price?: string;
      from?: string;
      to?: string;
      date: Date;
      txHash: string;
    }> = [];

    // Define ListingCreated event
    const listingCreatedEvent = prepareEvent({
      signature: "event ListingCreated(uint256 indexed listingId, address indexed seller, address indexed nftContract, uint256 tokenId, uint256 pricePerToken, uint8 tokenType)"
    });

    // Fetch ListingCreated events for this NFT
    const listingEvents = await getContractEvents({
      contract,
      events: [listingCreatedEvent]
    });

    // Define Sale event
    const saleEvent = prepareEvent({
      signature: "event Sale(uint256 indexed listingId, address indexed buyer, address indexed seller, address nftContract, uint256 tokenId, uint256 quantity, uint256 totalPrice, uint256 platformFee)"
    });

    // Fetch Sale events for this NFT
    const saleEvents = await getContractEvents({
      contract,
      events: [saleEvent]
    });

    // Define ListingCancelled event
    const cancelEvent = prepareEvent({
      signature: "event ListingCancelled(uint256 indexed listingId, address indexed seller)"
    });

    // Fetch ListingCancelled events for this NFT
    const cancelEvents = await getContractEvents({
      contract,
      events: [cancelEvent]
    });

    // Define ListingUpdated event
    const updateEvent = prepareEvent({
      signature: "event ListingUpdated(uint256 indexed listingId, uint256 newPrice)"
    });

    // Fetch ListingUpdated events for this NFT
    const updateEvents = await getContractEvents({
      contract,
      events: [updateEvent]
    });

    // Filter and process listing events
    for (const event of listingEvents) {
      const args = event.args as any;
      if (!args) continue;

      if (args.nftContract?.toLowerCase() === contractAddress.toLowerCase() &&
          args.tokenId?.toString() === tokenId) {
        activities.push({
          type: "listed",
          price: (Number(args.pricePerToken) / 1e18).toFixed(2),
          from: args.seller,
          date: new Date(Number(event.blockTimestamp || 0) * 1000),
          txHash: event.transactionHash || "",
        });
      }
    }

    // Filter and process sale events
    for (const event of saleEvents) {
      const args = event.args as any;
      if (!args) continue; // Skip if no args
      if (args.nftContract?.toLowerCase() === contractAddress.toLowerCase() &&
          args.tokenId?.toString() === tokenId) {
        activities.push({
          type: "sale",
          price: (Number(args.totalPrice) / 1e18).toFixed(2),
          from: args.seller,
          to: args.buyer,
          date: new Date(Number(event.blockTimestamp || 0) * 1000),
          txHash: event.transactionHash || "",
        });
      }
    }

    // Filter and process cancel events
    for (const event of cancelEvents) {
      const args = event.args as any;
      if (!args) continue; // Skip if no args
      const listingId = args.listingId;

      // Find the corresponding listing to get NFT details
      const matchingListing = listingEvents.find(le => {
        const leArgs = le.args as any;
        return leArgs && leArgs.listingId?.toString() === listingId?.toString();
      });

      if (matchingListing) {
        const matchArgs = matchingListing.args as any;
        if (matchArgs && matchArgs.nftContract?.toLowerCase() === contractAddress.toLowerCase() &&
            matchArgs.tokenId?.toString() === tokenId) {
          activities.push({
            type: "delisted",
            from: args.seller,
            date: new Date(Number(event.blockTimestamp || 0) * 1000),
            txHash: event.transactionHash || "",
          });
        }
      }
    }

    // Filter and process update events
    for (const event of updateEvents) {
      const args = event.args as any;
      if (!args) continue; // Skip if no args
      const listingId = args.listingId;

      // Find the corresponding listing to get NFT details
      const matchingListing = listingEvents.find(le => {
        const leArgs = le.args as any;
        return leArgs && leArgs.listingId?.toString() === listingId?.toString();
      });

      if (matchingListing) {
        const matchArgs = matchingListing.args as any;
        if (matchArgs && matchArgs.nftContract?.toLowerCase() === contractAddress.toLowerCase() &&
            matchArgs.tokenId?.toString() === tokenId) {
          activities.push({
            type: "price updated",
            price: (Number(args.newPrice) / 1e18).toFixed(2),
            from: matchArgs.seller,
            date: new Date(Number(event.blockTimestamp || 0) * 1000),
            txHash: event.transactionHash || "",
          });
        }
      }
    }

    // Sort by date descending (newest first)
    return activities.sort((a, b) => b.date.getTime() - a.date.getTime());
  } catch (error) {
    console.error("Error fetching NFT activity:", error);
    return [];
  }
}