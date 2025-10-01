/**
 * Platform Fee Configuration for Fortuna Square
 *
 * All fees are collected by the platform on various transaction types.
 *
 * IMPLEMENTATION STATUS:
 * ✅ BUY fees (2.5%) - Implemented in marketplace-listing.tsx and marketplace.ts
 * ⏳ RENTAL fees (2.5%) - Ready to implement (functions available below)
 * ⏳ SWAP fees ($1.00 USD in APE) - Ready to implement (see PLATFORM_FIXED_FEES.SWAP)
 * ⏳ Bundle fees - Ready to implement (use calculateBundleFee for bundles)
 *
 * HOW TO USE:
 * 1. For percentage-based fees (BUY, RENTAL):
 *    const { totalPrice, platformFee } = calculateTotalWithFee(basePrice, "BUY")
 *
 * 2. For fixed fees (SWAP) - TESTNET:
 *    const swapFee = PLATFORM_FIXED_FEES.SWAP // Fixed 1.00 APE for testnet
 *    const totalPrice = baseAmount + swapFee
 *
 * 3. For fixed fees (SWAP) - PRODUCTION:
 *    const apeUsdPrice = await getPriceOracle("APE/USD")
 *    const swapFee = calculateSwapFeeUSD(apeUsdPrice) // Dynamic $1.00 USD worth
 *    const totalPrice = baseAmount + swapFee
 *
 * 4. For bundles:
 *    const bundleFee = calculateBundleFee(totalBundlePrice, "BUY")
 */

// Platform fee recipient address (replace with your actual wallet address)
export const PLATFORM_FEE_RECIPIENT = process.env.NEXT_PUBLIC_PLATFORM_FEE_RECIPIENT || "0x0000000000000000000000000000000000000000"

// Fee percentages (in basis points: 100 bp = 1%)
export const PLATFORM_FEE_BPS = {
  BUY: 250,      // 2.5% fee on purchases
  RENTAL: 250,   // 2.5% fee on rentals
} as const

// Fixed fees (in wei for native token or smallest unit for ERC20)
// NOTE: For production, SWAP fee should be calculated as $1.00 USD worth of APE
// This requires a price oracle to get current APE/USD price
// For testnet demo purposes, using a fixed amount
export const PLATFORM_FIXED_FEES = {
  SWAP: BigInt("1000000000000000000"), // 1.00 APE (testnet) - In production, calculate $1.00 USD worth of APE
} as const

/**
 * Calculate platform fee for a purchase or rental
 * @param price - The price of the item in wei
 * @param feeType - Type of fee (BUY or RENTAL)
 * @returns Platform fee amount in wei
 *
 * @example
 * // For purchases (already implemented)
 * const purchaseFee = calculatePlatformFee(priceInWei, "BUY")
 *
 * @example
 * // For rentals (to be implemented)
 * const rentalFee = calculatePlatformFee(rentalPriceInWei, "RENTAL")
 */
export function calculatePlatformFee(
  price: bigint,
  feeType: keyof typeof PLATFORM_FEE_BPS
): bigint {
  const bps = PLATFORM_FEE_BPS[feeType]
  return (price * BigInt(bps)) / BigInt(10000)
}

/**
 * Calculate total price including platform fee
 * @param basePrice - The base price in wei
 * @param feeType - Type of fee (BUY or RENTAL)
 * @returns Object with basePrice, platformFee, and totalPrice
 *
 * @example
 * // For purchases (already implemented in marketplace.ts)
 * const { totalPrice, platformFee } = calculateTotalWithFee(itemPrice, "BUY")
 *
 * @example
 * // For rentals (to be implemented)
 * const { totalPrice, platformFee } = calculateTotalWithFee(rentalPrice, "RENTAL")
 */
export function calculateTotalWithFee(
  basePrice: bigint,
  feeType: keyof typeof PLATFORM_FEE_BPS
) {
  const platformFee = calculatePlatformFee(basePrice, feeType)
  const totalPrice = basePrice + platformFee

  return {
    basePrice,
    platformFee,
    totalPrice,
  }
}

/**
 * Format fee percentage for display
 * @param feeType - Type of fee (BUY or RENTAL)
 * @returns Formatted percentage string (e.g., "2.5%")
 */
export function formatFeePercentage(feeType: keyof typeof PLATFORM_FEE_BPS): string {
  const bps = PLATFORM_FEE_BPS[feeType]
  return `${(bps / 100).toFixed(1)}%`
}

/**
 * Get swap fee in user-friendly format
 * @returns Formatted swap fee string
 *
 * NOTE: In production, this should display "$1.00 USD" and the actual APE amount
 * should be calculated dynamically based on current APE/USD price from an oracle
 *
 * @example
 * // Display swap fee in UI (testnet)
 * const feeText = getSwapFeeDisplay() // Returns "$1.00 USD (≈1.00 APE)"
 *
 * @example
 * // Use in swap transaction (testnet)
 * const swapFee = PLATFORM_FIXED_FEES.SWAP // 1e18 wei (1.00 APE on testnet)
 * const totalCost = swapAmount + swapFee
 *
 * @example
 * // Production implementation with price oracle:
 * // const apeUsdPrice = await getPriceOracle("APE/USD") // e.g., 1.25
 * // const swapFeeInApe = 1.00 / apeUsdPrice // 0.8 APE
 * // const swapFeeInWei = BigInt(Math.floor(swapFeeInApe * 1e18))
 */
export function getSwapFeeDisplay(): string {
  return "$1.00 USD (≈1.00 APE)" // Testnet approximation
}

/**
 * Calculate bundle platform fee (applies to entire bundle)
 * @param bundlePrice - Total bundle price in wei
 * @param feeType - Type of fee (BUY or RENTAL)
 * @returns Platform fee amount in wei
 *
 * @example
 * // For bundle purchases (to be implemented)
 * const totalBundlePrice = nft1Price + nft2Price + nft3Price
 * const bundleFee = calculateBundleFee(totalBundlePrice, "BUY")
 * const totalCost = totalBundlePrice + bundleFee
 *
 * @example
 * // For bundle rentals (to be implemented)
 * const bundleRentalFee = calculateBundleFee(totalRentalPrice, "RENTAL")
 */
export function calculateBundleFee(
  bundlePrice: bigint,
  feeType: keyof typeof PLATFORM_FEE_BPS
): bigint {
  return calculatePlatformFee(bundlePrice, feeType)
}

/**
 * Calculate dynamic swap fee based on USD value
 * @param apeUsdPrice - Current APE/USD price from oracle (e.g., 1.25 means 1 APE = $1.25)
 * @returns Swap fee in wei (smallest unit)
 *
 * NOTE: For testnet, use PLATFORM_FIXED_FEES.SWAP directly
 * For production, integrate with a price oracle (Chainlink, Pyth, etc.) to get real-time APE/USD price
 *
 * @example
 * // Production implementation:
 * // const apeUsdPrice = await getChainlinkPrice("APE/USD") // e.g., 1.25
 * // const swapFee = calculateSwapFeeUSD(apeUsdPrice)
 * // const totalCost = swapAmount + swapFee
 */
export function calculateSwapFeeUSD(apeUsdPrice: number): bigint {
  const USD_FEE = 1.00 // $1.00 USD
  const apeAmount = USD_FEE / apeUsdPrice
  return BigInt(Math.floor(apeAmount * 1e18))
}

/**
 * Check if platform fee recipient is configured
 * @returns true if configured, false otherwise
 */
export function isPlatformFeeConfigured(): boolean {
  return PLATFORM_FEE_RECIPIENT !== "0x0000000000000000000000000000000000000000"
}