import { prepareContractCall, readContract, getContract } from "thirdweb";
import { ThirdwebClient } from "thirdweb";
import { Chain } from "thirdweb/chains";
import { apeChainCurtis, sepolia } from "./thirdweb";

/**
 * Rental Contract Addresses
 * Update these after deploying the contracts
 */
export const RENTAL_CONTRACT_ADDRESSES = {
  [apeChainCurtis.id]: {
    rentalWrapper: "0xf6a12c5723350db10d0661d9636582728ab06dea",
    rentalManager: "0xb399203384aa1509d31688a93b8d8ec835bf7cb6",
    erc6551Registry: "0x000000006551c19487814612e58FE06813775758", // Standard ERC6551 Registry
    accountImplementation: "0x41C8f39463A868d3A88af00cd0fe7102F30E44eC", // Deployed on Curtis
  },
  [sepolia.id]: {
    rentalWrapper: "0x...",
    rentalManager: "0x...",
    erc6551Registry: "0x000000006551c19487814612e58FE06813775758",
    accountImplementation: "0x...",
  },
} as const;

/**
 * Rental Manager ABI
 */
const RENTAL_MANAGER_ABI = [
  {
    inputs: [
      { name: "nftContract", type: "address" },
      { name: "tokenId", type: "uint256" },
      { name: "pricePerDay", type: "uint256" },
      { name: "minDays", type: "uint256" },
      { name: "maxDays", type: "uint256" },
    ],
    name: "wrapForRental",
    outputs: [{ name: "wrapperId", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { name: "wrapperId", type: "uint256" },
      { name: "durationInDays", type: "uint256" },
    ],
    name: "rentNFT",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [{ name: "wrapperId", type: "uint256" }],
    name: "unwrapNFT",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { name: "wrapperId", type: "uint256" },
      { name: "durationInDays", type: "uint256" },
    ],
    name: "calculateRentalCost",
    outputs: [
      { name: "rentalCost", type: "uint256" },
      { name: "platformFee", type: "uint256" },
      { name: "totalCost", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "wrapperId", type: "uint256" }],
    name: "isAvailableForRent",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "wrapperId", type: "uint256" }],
    name: "getRentalDetails",
    outputs: [
      { name: "renter", type: "address" },
      { name: "startTime", type: "uint256" },
      { name: "endTime", type: "uint256" },
      { name: "timeRemaining", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "", type: "uint256" }],
    name: "listings",
    outputs: [
      { name: "wrapperId", type: "uint256" },
      { name: "owner", type: "address" },
      { name: "isActive", type: "bool" },
      { name: "totalRentals", type: "uint256" },
      { name: "totalEarnings", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;

/**
 * Rental Wrapper ABI
 */
const RENTAL_WRAPPER_ABI = [
  {
    inputs: [{ name: "tokenId", type: "uint256" }],
    name: "wrapperInfo",
    outputs: [
      { name: "originalContract", type: "address" },
      { name: "originalTokenId", type: "uint256" },
      { name: "tbaAccount", type: "address" },
      { name: "pricePerDay", type: "uint256" },
      { name: "minDays", type: "uint256" },
      { name: "maxDays", type: "uint256" },
      { name: "isActive", type: "bool" },
      { name: "createdAt", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "tokenId", type: "uint256" }],
    name: "userOf",
    outputs: [{ name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "tokenId", type: "uint256" }],
    name: "userExpires",
    outputs: [{ name: "", type: "uint64" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "tokenId", type: "uint256" }],
    name: "isRented",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalWrappers",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { name: "tokenId", type: "uint256" },
      { name: "pricePerDay", type: "uint256" },
      { name: "minDays", type: "uint256" },
      { name: "maxDays", type: "uint256" },
    ],
    name: "updateRentalTerms",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { name: "tokenId", type: "uint256" },
      { name: "active", type: "bool" },
    ],
    name: "setActive",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

// Types
export interface WrapperInfo {
  originalContract: string;
  originalTokenId: string;
  tbaAccount: string;
  pricePerDay: bigint;
  minDays: number;
  maxDays: number;
  isActive: boolean;
  createdAt: Date;
}

export interface RentalListing {
  wrapperId: string;
  owner: string;
  isActive: boolean;
  totalRentals: number;
  totalEarnings: bigint;
}

export interface RentalDetails {
  renter: string;
  startTime: Date;
  endTime: Date;
  timeRemaining: number;
}

export interface WrapForRentalParams {
  nftContract: string;
  tokenId: string;
  pricePerDay: string; // in wei
  minDays: number;
  maxDays: number;
}

export interface RentNFTParams {
  wrapperId: string;
  durationInDays: number;
  totalCost: bigint;
}

/**
 * Get the Rental Manager contract
 */
export function getRentalManagerContract(client: ThirdwebClient, chain: Chain) {
  const addresses = RENTAL_CONTRACT_ADDRESSES[chain.id as keyof typeof RENTAL_CONTRACT_ADDRESSES];

  if (!addresses || addresses.rentalManager === "0x...") {
    throw new Error(`Rental Manager not deployed on chain ${chain.id}`);
  }

  return getContract({
    client,
    chain,
    address: addresses.rentalManager,
    abi: RENTAL_MANAGER_ABI,
  });
}

/**
 * Get the Rental Wrapper contract
 */
export function getRentalWrapperContract(client: ThirdwebClient, chain: Chain) {
  const addresses = RENTAL_CONTRACT_ADDRESSES[chain.id as keyof typeof RENTAL_CONTRACT_ADDRESSES];

  if (!addresses || addresses.rentalWrapper === "0x...") {
    throw new Error(`Rental Wrapper not deployed on chain ${chain.id}`);
  }

  return getContract({
    client,
    chain,
    address: addresses.rentalWrapper,
    abi: RENTAL_WRAPPER_ABI,
  });
}

/**
 * Prepare transaction to wrap NFT for rental
 */
export function prepareWrapForRental(
  client: ThirdwebClient,
  chain: Chain,
  params: WrapForRentalParams
) {
  const contract = getRentalManagerContract(client, chain);

  return prepareContractCall({
    contract,
    method: "wrapForRental",
    params: [
      params.nftContract,
      BigInt(params.tokenId),
      BigInt(params.pricePerDay),
      BigInt(params.minDays),
      BigInt(params.maxDays),
    ],
  });
}

/**
 * Prepare transaction to rent an NFT
 */
export function prepareRentNFT(
  client: ThirdwebClient,
  chain: Chain,
  params: RentNFTParams
) {
  const contract = getRentalManagerContract(client, chain);

  return prepareContractCall({
    contract,
    method: "rentNFT",
    params: [BigInt(params.wrapperId), BigInt(params.durationInDays)],
    value: params.totalCost,
  });
}

/**
 * Prepare transaction to unwrap NFT
 */
export function prepareUnwrapNFT(
  client: ThirdwebClient,
  chain: Chain,
  wrapperId: string
) {
  const contract = getRentalManagerContract(client, chain);

  return prepareContractCall({
    contract,
    method: "unwrapNFT",
    params: [BigInt(wrapperId)],
  });
}

/**
 * Calculate rental cost for given duration
 */
export async function calculateRentalCost(
  client: ThirdwebClient,
  chain: Chain,
  wrapperId: string,
  durationInDays: number
): Promise<{ rentalCost: bigint; platformFee: bigint; totalCost: bigint }> {
  const contract = getRentalManagerContract(client, chain);

  const result = await readContract({
    contract,
    method: "calculateRentalCost",
    params: [BigInt(wrapperId), BigInt(durationInDays)],
  });

  return {
    rentalCost: result[0],
    platformFee: result[1],
    totalCost: result[2],
  };
}

/**
 * Check if wrapper is available for rent
 */
export async function isAvailableForRent(
  client: ThirdwebClient,
  chain: Chain,
  wrapperId: string
): Promise<boolean> {
  const contract = getRentalManagerContract(client, chain);

  return await readContract({
    contract,
    method: "isAvailableForRent",
    params: [BigInt(wrapperId)],
  });
}

/**
 * Get wrapper info from Rental Wrapper contract
 */
export async function getWrapperInfo(
  client: ThirdwebClient,
  chain: Chain,
  wrapperId: string
): Promise<WrapperInfo | null> {
  try {
    const contract = getRentalWrapperContract(client, chain);

    const result = await readContract({
      contract,
      method: "wrapperInfo",
      params: [BigInt(wrapperId)],
    });

    return {
      originalContract: result[0],
      originalTokenId: result[1].toString(),
      tbaAccount: result[2],
      pricePerDay: result[3],
      minDays: Number(result[4]),
      maxDays: Number(result[5]),
      isActive: result[6],
      createdAt: new Date(Number(result[7]) * 1000),
    };
  } catch (error) {
    console.error("Error fetching wrapper info:", error);
    return null;
  }
}

/**
 * Get rental details
 */
export async function getRentalDetails(
  client: ThirdwebClient,
  chain: Chain,
  wrapperId: string
): Promise<RentalDetails | null> {
  try {
    const contract = getRentalManagerContract(client, chain);

    const result = await readContract({
      contract,
      method: "getRentalDetails",
      params: [BigInt(wrapperId)],
    });

    return {
      renter: result[0],
      startTime: new Date(Number(result[1]) * 1000),
      endTime: new Date(Number(result[2]) * 1000),
      timeRemaining: Number(result[3]),
    };
  } catch (error) {
    console.error("Error fetching rental details:", error);
    return null;
  }
}

/**
 * Get listing info
 */
export async function getListingInfo(
  client: ThirdwebClient,
  chain: Chain,
  wrapperId: string
): Promise<RentalListing | null> {
  try {
    const contract = getRentalManagerContract(client, chain);

    const result = await readContract({
      contract,
      method: "listings",
      params: [BigInt(wrapperId)],
    });

    return {
      wrapperId: result[0].toString(),
      owner: result[1],
      isActive: result[2],
      totalRentals: Number(result[3]),
      totalEarnings: result[4],
    };
  } catch (error) {
    console.error("Error fetching listing info:", error);
    return null;
  }
}

/**
 * Check if NFT is currently rented
 */
export async function isRented(
  client: ThirdwebClient,
  chain: Chain,
  wrapperId: string
): Promise<boolean> {
  try {
    const contract = getRentalWrapperContract(client, chain);

    return await readContract({
      contract,
      method: "isRented",
      params: [BigInt(wrapperId)],
    });
  } catch (error) {
    console.error("Error checking rental status:", error);
    return false;
  }
}

/**
 * Prepare transaction to update rental terms
 */
export function prepareUpdateRentalTerms(
  client: ThirdwebClient,
  chain: Chain,
  wrapperId: string,
  pricePerDay: string,
  minDays: number,
  maxDays: number
) {
  const contract = getRentalWrapperContract(client, chain);

  return prepareContractCall({
    contract,
    method: "updateRentalTerms",
    params: [BigInt(wrapperId), BigInt(pricePerDay), BigInt(minDays), BigInt(maxDays)],
  });
}