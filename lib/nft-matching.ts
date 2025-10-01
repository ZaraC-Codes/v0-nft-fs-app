import { PortfolioNFT } from "@/types/profile";

/**
 * NFT trait matching and filtering utilities for swap functionality
 */

export interface SwapCriteria {
  wantedCollection: string;
  wantedTokenId?: string; // "Any" or undefined means any token
  wantedTraits?: string[]; // up to 3 traits, "Any" means any trait
  chainId: number;
}

export interface NFTWithTraits extends PortfolioNFT {
  traits?: Array<{
    trait_type: string;
    value: string;
  }>;
}

/**
 * Check if an NFT matches the swap criteria
 */
export function matchesSwapCriteria(
  nft: NFTWithTraits,
  criteria: SwapCriteria
): boolean {
  // Must be on the same chain
  if (nft.chainId !== criteria.chainId) {
    return false;
  }

  // Must be from the wanted collection
  if (nft.collection !== criteria.wantedCollection) {
    return false;
  }

  // Check specific token ID if specified
  if (criteria.wantedTokenId &&
      criteria.wantedTokenId !== "Any" &&
      criteria.wantedTokenId !== "0" &&
      nft.tokenId !== criteria.wantedTokenId) {
    return false;
  }

  // Check traits if specified
  if (criteria.wantedTraits && criteria.wantedTraits.length > 0) {
    // If all traits are "Any", no need to check
    const hasSpecificTraits = criteria.wantedTraits.some(trait => trait !== "Any");

    if (hasSpecificTraits) {
      return hasMatchingTraits(nft, criteria.wantedTraits);
    }
  }

  return true;
}

/**
 * Check if an NFT has any of the wanted traits
 */
function hasMatchingTraits(
  nft: NFTWithTraits,
  wantedTraits: string[]
): boolean {
  // If no traits data, can't match specific traits
  if (!nft.traits || nft.traits.length === 0) {
    return false;
  }

  // Get all trait values from the NFT
  const nftTraitValues = nft.traits.map(t => t.value.toLowerCase());

  // Check if NFT has at least one of the wanted traits
  return wantedTraits.some(wantedTrait => {
    if (wantedTrait === "Any") return true;
    return nftTraitValues.includes(wantedTrait.toLowerCase());
  });
}

/**
 * Filter user's NFTs to only those matching swap criteria
 */
export function findMatchingNFTs(
  userNFTs: NFTWithTraits[],
  criteria: SwapCriteria
): NFTWithTraits[] {
  return userNFTs.filter(nft => matchesSwapCriteria(nft, criteria));
}

/**
 * Count how many NFTs match the criteria
 */
export function countMatchingNFTs(
  userNFTs: NFTWithTraits[],
  criteria: SwapCriteria
): number {
  return findMatchingNFTs(userNFTs, criteria).length;
}

/**
 * Get a human-readable description of swap criteria
 */
export function getSwapCriteriaDescription(criteria: SwapCriteria): string {
  const parts: string[] = [];

  // Collection
  parts.push(criteria.wantedCollection);

  // Token ID
  if (criteria.wantedTokenId && criteria.wantedTokenId !== "Any" && criteria.wantedTokenId !== "0") {
    parts.push(`#${criteria.wantedTokenId}`);
  } else {
    parts.push("(Any token)");
  }

  // Traits
  if (criteria.wantedTraits && criteria.wantedTraits.length > 0) {
    const specificTraits = criteria.wantedTraits.filter(t => t !== "Any");
    if (specificTraits.length > 0) {
      parts.push(`with traits: ${specificTraits.join(", ")}`);
    }
  }

  return parts.join(" ");
}

/**
 * Format collection name for display
 */
export function formatCollectionName(collection: string): string {
  // Add spacing to camelCase or PascalCase names
  return collection
    .replace(/([A-Z])/g, " $1")
    .trim()
    .replace(/\s+/g, " ");
}

/**
 * Mock trait data generator for testing
 * In production, this would come from NFT metadata
 */
export function getMockTraits(tokenId: string): Array<{ trait_type: string; value: string }> {
  // Generate deterministic traits based on token ID
  const id = parseInt(tokenId);
  const traits = [];

  // Background
  const backgrounds = ["Aquamarine", "Purple", "Yellow", "Orange", "Blue"];
  traits.push({
    trait_type: "Background",
    value: backgrounds[id % backgrounds.length]
  });

  // Fur
  const furs = ["Golden Brown", "Black", "Cream", "Gray", "Tan"];
  traits.push({
    trait_type: "Fur",
    value: furs[(id + 1) % furs.length]
  });

  // Eyes
  const eyes = ["Laser Eyes", "Sad", "Bored", "Angry", "Cyborg"];
  traits.push({
    trait_type: "Eyes",
    value: eyes[(id + 2) % eyes.length]
  });

  // Clothes
  const clothes = ["Striped Tee", "Biker Vest", "Smoking Jacket", "Sailor Shirt", "Bone Necklace"];
  traits.push({
    trait_type: "Clothes",
    value: clothes[(id + 3) % clothes.length]
  });

  return traits;
}

/**
 * Check if user owns any NFTs from a specific collection
 */
export function hasNFTsFromCollection(
  userNFTs: PortfolioNFT[],
  collection: string,
  chainId: number
): boolean {
  return userNFTs.some(
    nft => nft.collection === collection && nft.chainId === chainId
  );
}

/**
 * Group NFTs by collection for easier filtering
 */
export function groupNFTsByCollection(
  nfts: PortfolioNFT[]
): Record<string, PortfolioNFT[]> {
  return nfts.reduce((acc, nft) => {
    if (!acc[nft.collection]) {
      acc[nft.collection] = [];
    }
    acc[nft.collection].push(nft);
    return acc;
  }, {} as Record<string, PortfolioNFT[]>);
}

/**
 * Validate swap criteria
 */
export function validateSwapCriteria(criteria: Partial<SwapCriteria>): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!criteria.wantedCollection) {
    errors.push("Collection is required");
  }

  if (criteria.chainId === undefined) {
    errors.push("Chain ID is required");
  }

  if (criteria.wantedTraits && criteria.wantedTraits.length > 3) {
    errors.push("Maximum 3 traits allowed");
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}