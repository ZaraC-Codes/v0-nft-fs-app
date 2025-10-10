/**
 * Centralized Constants
 * Single source of truth for all chain IDs, contract addresses, and app metadata
 *
 * IMPORTANT: All new constants must be added here.
 * Never hardcode chain IDs or addresses directly in components.
 */

// ============================================
// CHAIN IDS
// ============================================

export const CHAIN_IDS = {
  // ApeChain Mainnet
  APECHAIN_MAINNET: 33139,

  // ApeChain Curtis Testnet
  APECHAIN_CURTIS: 33111,

  // Ethereum (for reference)
  ETHEREUM_MAINNET: 1,
  ETHEREUM_SEPOLIA: 11155111,
} as const

export type ChainId = typeof CHAIN_IDS[keyof typeof CHAIN_IDS]

// ============================================
// CHAIN METADATA
// ============================================

export const CHAIN_METADATA = {
  [CHAIN_IDS.APECHAIN_MAINNET]: {
    id: CHAIN_IDS.APECHAIN_MAINNET,
    name: 'ApeChain',
    shortName: 'ApeChain',
    nativeCurrency: {
      name: 'ApeCoin',
      symbol: 'APE',
      decimals: 18,
    },
    blockExplorer: {
      name: 'ApeChain Explorer',
      url: 'https://apescan.io',
    },
  },
  [CHAIN_IDS.APECHAIN_CURTIS]: {
    id: CHAIN_IDS.APECHAIN_CURTIS,
    name: 'ApeChain Curtis',
    shortName: 'Curtis',
    nativeCurrency: {
      name: 'ApeCoin',
      symbol: 'APE',
      decimals: 18,
    },
    blockExplorer: {
      name: 'Curtis Explorer',
      url: 'https://curtis.explorer.caldera.xyz',
    },
  },
} as const

// ============================================
// CONTRACT ADDRESSES (ApeChain Mainnet)
// ============================================

export const CONTRACTS = {
  // ERC6551 Infrastructure (Token Bound Accounts)
  ERC6551_REGISTRY: '0x000000006551c19487814612e58FE06813775758',
  ERC6551_ACCOUNT_IMPLEMENTATION: '0x718D032B42ff34a63A5100B9dFc897EC04c139be',

  // Bundle System
  BUNDLE_NFT: '0x8051dECcEa3105f4a6993391d2A36F1E9D96b017',
  BUNDLE_MANAGER: '0x8051dECcEa3105f4a6993391d2A36F1E9D96b017',
  FORTUNA_BUNDLE_ACCOUNT: '0x76591D246caC5DFB0D31c65d0052a15f6A887e7f',

  // Swap System
  SWAP_MANAGER: '0x732984EC859f4597502B9336FD3B1fCCBCD57C91',

  // Rental System
  RENTAL_ACCOUNT: '0x718D032B42ff34a63A5100B9dFc897EC04c139be',
  RENTAL_WRAPPER: '0xc06D38353dc437d981C4C0F6E0bEac63196A4A68',
  RENTAL_MANAGER: '0x96b692b2301925e3284001E963B69F8fb2B53c1d',

  // Delegate.cash (same address on all chains)
  DELEGATE_REGISTRY: '0x00000000000000447e69651d841bD8D104Bed493',

  // Marketplace
  FORTUNA_MARKETPLACE: '0x3e076856f0E06A37F4C79Cd46C936fc27f8fA7E0',

  // Group Chat
  GROUP_CHAT_RELAY: '0xC75255aB6eeBb6995718eBa64De276d5B110fb7f',

  // ThirdWeb Account Factory
  ACCOUNT_FACTORY: '0x90daa5d43077c8dd600b8570029f7edac3e3c099',
} as const

// ============================================
// RELAYER CONFIGURATION (Backend only)
// ============================================

export const RELAYER = {
  // IMPORTANT: These are read from env vars in server-side code only
  // Never expose RELAYER_PRIVATE_KEY to frontend!
  WALLET_ADDRESS: '0x33946f623200f60E5954b78AAa9824AD29e5928c',
} as const

// ============================================
// APP METADATA
// ============================================

export const APP_METADATA = {
  NAME: 'Fortuna Square',
  SHORT_NAME: 'Fortuna Square',
  DESCRIPTION: 'NFT Marketplace & Social Platform',
  BUNDLE_COLLECTION_NAME: 'Fortuna Square Bundle NFTs',

  // Default chain for new deployments
  DEFAULT_CHAIN_ID: CHAIN_IDS.APECHAIN_MAINNET,

  // Social links
  TWITTER: 'https://twitter.com/fortunasquare',
  DISCORD: 'https://discord.gg/fortunasquare',
  WEBSITE: 'https://fortunasquare.io',
} as const

// ============================================
// RATE LIMITS
// ============================================

export const RATE_LIMITS = {
  // Chat system
  CHAT_MESSAGES_PER_MINUTE: 10,
  CHAT_MESSAGE_MAX_LENGTH: 500,

  // API polling
  CHAT_POLL_INTERVAL_MS: 3000, // 3 seconds

  // Pagination
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const

// ============================================
// UI CONSTANTS
// ============================================

export const UI_CONSTANTS = {
  // Toast durations
  TOAST_SUCCESS_DURATION: 3000,
  TOAST_ERROR_DURATION: 5000,

  // Animation durations (ms)
  TRANSITION_FAST: 150,
  TRANSITION_NORMAL: 300,
  TRANSITION_SLOW: 500,

  // Breakpoints (px) - matches Tailwind defaults
  BREAKPOINTS: {
    XS: 0,
    SM: 640,
    MD: 768,
    LG: 1024,
    XL: 1280,
    '2XL': 1536,
  },
} as const

// ============================================
// TYPE GUARDS
// ============================================

/**
 * Check if a chain ID is ApeChain Mainnet
 */
export function isApeChainMainnet(chainId: number): boolean {
  return chainId === CHAIN_IDS.APECHAIN_MAINNET
}

/**
 * Check if a chain ID is ApeChain Curtis Testnet
 */
export function isApeChainCurtis(chainId: number): boolean {
  return chainId === CHAIN_IDS.APECHAIN_CURTIS
}

/**
 * Check if a chain ID is any ApeChain network
 */
export function isApeChain(chainId: number): boolean {
  return isApeChainMainnet(chainId) || isApeChainCurtis(chainId)
}

/**
 * Get chain metadata by chain ID
 */
export function getChainMetadata(chainId: number) {
  return CHAIN_METADATA[chainId as keyof typeof CHAIN_METADATA]
}

/**
 * Get chain name by chain ID
 */
export function getChainName(chainId: number): string {
  const metadata = getChainMetadata(chainId)
  return metadata?.name || `Chain ${chainId}`
}

/**
 * Get native currency symbol by chain ID
 */
export function getNativeCurrencySymbol(chainId: number): string {
  const metadata = getChainMetadata(chainId)
  return metadata?.nativeCurrency.symbol || 'ETH'
}
