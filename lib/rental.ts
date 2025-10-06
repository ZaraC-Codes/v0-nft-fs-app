/**
 * Fortuna Square Rental System Integration
 *
 * Delegate.cash-powered NFT rentals with zero collateral
 * - Wrap any ERC721 NFT for rental
 * - Create rental listings with custom pricing and duration
 * - Rent NFTs with automatic Delegate.cash delegation
 * - Token-gating compatible
 */

import { getContract, prepareContractCall, readContract, sendTransaction } from "thirdweb";
import { apeChain, client } from "./thirdweb";
import type { Account } from "thirdweb/wallets";

// Contract addresses from environment variables
const RENTAL_ACCOUNT_ADDRESS = process.env.NEXT_PUBLIC_RENTAL_ACCOUNT_ADDRESS!;
const RENTAL_WRAPPER_ADDRESS = process.env.NEXT_PUBLIC_RENTAL_WRAPPER_ADDRESS!;
const RENTAL_MANAGER_ADDRESS = process.env.NEXT_PUBLIC_RENTAL_MANAGER_ADDRESS!;
const DELEGATE_REGISTRY_ADDRESS = process.env.NEXT_PUBLIC_DELEGATE_REGISTRY_ADDRESS!;

// Rental listing type
export interface RentalListing {
  wrapperId: bigint;
  owner: string;
  pricePerDay: bigint;
  minRentalDays: bigint;
  maxRentalDays: bigint;
  isActive: boolean;
  createdAt: bigint;
}

// Wrapped NFT info
export interface WrappedNFT {
  originalContract: string;
  originalTokenId: bigint;
  tbaAddress: string;
}

// Rental info
export interface RentalInfo {
  listing: RentalListing;
  currentRenter: string;
  expiresAt: bigint;
}

/**
 * Get the RentalManager contract instance
 */
export function getRentalManagerContract() {
  return getContract({
    client,
    chain: apeChain,
    address: RENTAL_MANAGER_ADDRESS,
  });
}

/**
 * Get the RentalWrapper contract instance
 */
export function getRentalWrapperContract() {
  return getContract({
    client,
    chain: apeChain,
    address: RENTAL_WRAPPER_ADDRESS,
  });
}

/**
 * Wrap an NFT to make it rentable
 * @param account User's wallet account
 * @param nftContract Original NFT contract address
 * @param tokenId Original NFT token ID
 * @returns Transaction result with wrapper ID
 */
export async function wrapNFT(
  account: Account,
  nftContract: string,
  tokenId: bigint
) {
  const contract = getRentalManagerContract();

  const transaction = prepareContractCall({
    contract,
    method: "function wrapNFT(address originalContract, uint256 originalTokenId) returns (uint256 wrapperId)",
    params: [nftContract, tokenId],
  });

  return sendTransaction({
    transaction,
    account,
  });
}

/**
 * Extract wrapper ID by querying user's wallet balance
 * Workaround for Curtis testnet not returning logs in receipts
 * @param userAddress User's wallet address
 * @returns Latest wrapper token ID owned by user
 */
export async function getLatestWrapperIdForUser(userAddress: string): Promise<bigint> {
  const { balanceOf, ownerOf } = await import("thirdweb/extensions/erc721");

  const wrapperContract = getRentalWrapperContract();

  console.log("🔍 Querying wrapper balance for user:", userAddress);

  // Get total number of wrapper NFTs owned by user
  const balance = await balanceOf({
    contract: wrapperContract,
    owner: userAddress,
  });

  console.log("📊 User owns", balance.toString(), "wrapper NFTs");

  if (balance === 0n) {
    throw new Error("User doesn't own any wrapper NFTs");
  }

  // Find the highest wrapper ID owned by this user
  // Start from a low number and work upwards (most wrapper IDs will be 0-100)
  let latestWrapperId: bigint | null = null;
  const maxToCheck = 100; // Check first 100 IDs

  console.log(`🔍 Checking wrapper IDs 0-${maxToCheck}...`);

  for (let i = 0; i <= maxToCheck; i++) {
    try {
      const owner = await ownerOf({
        contract: wrapperContract,
        tokenId: BigInt(i),
      });

      if (owner.toLowerCase() === userAddress.toLowerCase()) {
        latestWrapperId = BigInt(i);
        console.log(`🎁 Found wrapper ID ${i} owned by user`);
        // Don't break - keep checking to find the LATEST one
      }
    } catch {
      // Token doesn't exist or not owned by user, continue
    }
  }

  if (!latestWrapperId && latestWrapperId !== 0n) {
    throw new Error("Could not find wrapper ID for user in range 0-100");
  }

  console.log("🎁 Latest wrapper ID:", latestWrapperId.toString());
  return latestWrapperId;
}

/**
 * Create a rental listing for a wrapped NFT
 * @param account Wrapper owner's wallet account
 * @param wrapperId Wrapper token ID
 * @param pricePerDay Rental price in wei per day
 * @param minDays Minimum rental duration in days
 * @param maxDays Maximum rental duration in days
 */
export async function createRentalListing(
  account: Account,
  wrapperId: bigint,
  pricePerDay: bigint,
  minDays: bigint,
  maxDays: bigint
) {
  const contract = getRentalManagerContract();

  const transaction = prepareContractCall({
    contract,
    method: "function createRentalListing(uint256 wrapperId, uint256 pricePerDay, uint256 minRentalDays, uint256 maxRentalDays)",
    params: [wrapperId, pricePerDay, minDays, maxDays],
  });

  return sendTransaction({
    transaction,
    account,
  });
}

/**
 * Update an existing rental listing
 * @param account Listing owner's wallet account
 * @param wrapperId Wrapper token ID
 * @param newPricePerDay New rental price per day
 * @param newMinDays New minimum rental duration
 * @param newMaxDays New maximum rental duration
 */
export async function updateRentalListing(
  account: Account,
  wrapperId: bigint,
  newPricePerDay: bigint,
  newMinDays: bigint,
  newMaxDays: bigint
) {
  const contract = getRentalManagerContract();

  const transaction = prepareContractCall({
    contract,
    method: "function updateRentalListing(uint256 wrapperId, uint256 newPricePerDay, uint256 newMinDays, uint256 newMaxDays)",
    params: [wrapperId, newPricePerDay, newMinDays, newMaxDays],
  });

  return sendTransaction({
    transaction,
    account,
  });
}

/**
 * Cancel a rental listing
 * @param account Listing owner's wallet account
 * @param wrapperId Wrapper token ID
 */
export async function cancelRentalListing(
  account: Account,
  wrapperId: bigint
) {
  const contract = getRentalManagerContract();

  const transaction = prepareContractCall({
    contract,
    method: "function cancelRentalListing(uint256 wrapperId)",
    params: [wrapperId],
  });

  return sendTransaction({
    transaction,
    account,
  });
}

/**
 * Rent an NFT
 * @param account Renter's wallet account
 * @param wrapperId Wrapper token ID to rent
 * @param rentalDays Number of days to rent for
 * @param paymentAmount Total payment amount in wei (rental cost + platform fee)
 */
export async function rentNFT(
  account: Account,
  wrapperId: bigint,
  rentalDays: bigint,
  paymentAmount: bigint
) {
  const contract = getRentalManagerContract();

  const transaction = prepareContractCall({
    contract,
    method: "function rentNFT(uint256 wrapperId, uint256 rentalDays) payable",
    params: [wrapperId, rentalDays],
    value: paymentAmount,
  });

  return sendTransaction({
    transaction,
    account,
  });
}

/**
 * Unwrap an NFT to get the original back
 * @param account Wrapper owner's wallet account
 * @param wrapperId Wrapper token ID
 */
export async function unwrapNFT(
  account: Account,
  wrapperId: bigint
) {
  const contract = getRentalManagerContract();

  const transaction = prepareContractCall({
    contract,
    method: "function unwrapNFT(uint256 wrapperId)",
    params: [wrapperId],
  });

  return sendTransaction({
    transaction,
    account,
  });
}

/**
 * Get all active rental listings
 * @returns Array of active rental listings
 */
export async function getActiveRentalListings(): Promise<RentalListing[]> {
  const contract = getRentalManagerContract();

  const result = await readContract({
    contract,
    method: "function getActiveListings() view returns ((uint256 wrapperId, address owner, uint256 pricePerDay, uint256 minRentalDays, uint256 maxRentalDays, bool isActive, uint256 createdAt)[])",
    params: [],
  });

  return result.map((listing: any) => ({
    wrapperId: listing.wrapperId,
    owner: listing.owner,
    pricePerDay: listing.pricePerDay,
    minRentalDays: listing.minRentalDays,
    maxRentalDays: listing.maxRentalDays,
    isActive: listing.isActive,
    createdAt: listing.createdAt,
  }));
}

/**
 * Get rental info for a specific wrapper
 * @param wrapperId Wrapper token ID
 * @returns Rental info including listing, current renter, and expiration
 */
export async function getRentalInfo(wrapperId: bigint): Promise<RentalInfo> {
  const contract = getRentalManagerContract();

  const result = await readContract({
    contract,
    method: "function getRentalInfo(uint256 wrapperId) view returns ((uint256 wrapperId, address owner, uint256 pricePerDay, uint256 minRentalDays, uint256 maxRentalDays, bool isActive, uint256 createdAt) listing, address currentRenter, uint64 expiresAt)",
    params: [wrapperId],
  });

  return {
    listing: {
      wrapperId: result.listing.wrapperId,
      owner: result.listing.owner,
      pricePerDay: result.listing.pricePerDay,
      minRentalDays: result.listing.minRentalDays,
      maxRentalDays: result.listing.maxRentalDays,
      isActive: result.listing.isActive,
      createdAt: result.listing.createdAt,
    },
    currentRenter: result.currentRenter,
    expiresAt: result.expiresAt,
  };
}

/**
 * Get original NFT details for a wrapper
 * @param wrapperId Wrapper token ID
 * @returns Original NFT contract and token ID
 */
export async function getOriginalNFT(wrapperId: bigint): Promise<WrappedNFT> {
  const contract = getRentalWrapperContract();

  const result = await readContract({
    contract,
    method: "function getOriginalNFT(uint256 tokenId) view returns (address originalContract, uint256 originalTokenId)",
    params: [wrapperId],
  });

  const tbaResult = await readContract({
    contract,
    method: "function getTBA(uint256 tokenId) view returns (address)",
    params: [wrapperId],
  });

  return {
    originalContract: result[0],
    originalTokenId: result[1],
    tbaAddress: tbaResult,
  };
}

/**
 * Get the current renter of a wrapper (ERC4907)
 * @param wrapperId Wrapper token ID
 * @returns Current renter address (0x0 if not rented)
 */
export async function getCurrentRenter(wrapperId: bigint): Promise<string> {
  const contract = getRentalWrapperContract();

  return readContract({
    contract,
    method: "function userOf(uint256 tokenId) view returns (address)",
    params: [wrapperId],
  });
}

/**
 * Get rental expiration timestamp (ERC4907)
 * @param wrapperId Wrapper token ID
 * @returns Expiration timestamp
 */
export async function getRentalExpiration(wrapperId: bigint): Promise<bigint> {
  const contract = getRentalWrapperContract();

  return readContract({
    contract,
    method: "function userExpires(uint256 tokenId) view returns (uint64)",
    params: [wrapperId],
  });
}

/**
 * Calculate rental costs
 * @param pricePerDay Price per day in wei
 * @param rentalDays Number of days
 * @returns Object with rental cost, platform fee, and total
 */
export function calculateRentalCost(pricePerDay: bigint, rentalDays: bigint) {
  const rentalCost = pricePerDay * rentalDays;
  const platformFeeBps = 250n; // 2.5%
  const platformFee = (rentalCost * platformFeeBps) / 10000n;
  const totalCost = rentalCost + platformFee;

  return {
    rentalCost,
    platformFee,
    totalCost,
  };
}

/**
 * Check if a wallet has delegation for an NFT via Delegate.cash
 * @param delegateAddress The potential renter's address
 * @param vaultAddress The TBA holding the NFT
 * @param nftContract The original NFT contract
 * @param tokenId The original token ID
 * @returns True if delegation exists
 */
export async function checkDelegation(
  delegateAddress: string,
  vaultAddress: string,
  nftContract: string,
  tokenId: bigint
): Promise<boolean> {
  const delegateRegistry = getContract({
    client,
    chain: apeChain,
    address: DELEGATE_REGISTRY_ADDRESS,
  });

  return readContract({
    contract: delegateRegistry,
    method: "function checkDelegateForERC721(address to, address from, address contract_, uint256 tokenId, bytes32 rights) view returns (bool)",
    params: [delegateAddress, vaultAddress, nftContract, tokenId, "0x0000000000000000000000000000000000000000000000000000000000000000" as `0x${string}`],
  });
}

/**
 * Format duration in days to human-readable string
 * @param days Number of days
 * @returns Formatted string (e.g., "7 days", "1 day", "30 days")
 */
export function formatDuration(days: bigint): string {
  if (days === 1n) return "1 day";
  return `${days} days`;
}

/**
 * Check if a rental is currently active
 * @param expiresAt Expiration timestamp
 * @returns True if rental is active
 */
export function isRentalActive(expiresAt: bigint): boolean {
  return expiresAt > BigInt(Math.floor(Date.now() / 1000));
}
