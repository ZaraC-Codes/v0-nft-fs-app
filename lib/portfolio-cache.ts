/**
 * Portfolio Cache Service
 * Caches entire NFT portfolio data with TTL and stale-while-revalidate pattern
 */

import { PortfolioNFT } from "@/types/profile"

interface PortfolioCacheEntry {
  walletAddresses: string[] // Array of wallet addresses this portfolio belongs to
  nfts: PortfolioNFT[]
  timestamp: number
  isStale: boolean // Marked true when fetching fresh data
}

class PortfolioCache {
  private cache: Map<string, PortfolioCacheEntry> = new Map()
  private readonly TTL = 24 * 60 * 60 * 1000 // 24 hours in milliseconds
  private readonly STALE_TIME = 5 * 60 * 1000 // Consider stale after 5 minutes

  /**
   * Generate cache key from wallet addresses
   */
  private getCacheKey(walletAddresses: string[]): string {
    return walletAddresses
      .map(addr => addr.toLowerCase())
      .sort()
      .join('_')
  }

  /**
   * Check if cache entry is expired (past TTL)
   */
  private isExpired(entry: PortfolioCacheEntry): boolean {
    return Date.now() - entry.timestamp > this.TTL
  }

  /**
   * Check if cache entry is stale (past stale time but not expired)
   */
  private isStaleData(entry: PortfolioCacheEntry): boolean {
    return Date.now() - entry.timestamp > this.STALE_TIME
  }

  /**
   * Get portfolio from cache
   * Returns { data, isStale } where isStale indicates if background refresh is needed
   */
  get(walletAddresses: string[]): { data: PortfolioNFT[] | null; shouldRefresh: boolean } {
    const key = this.getCacheKey(walletAddresses)
    const entry = this.cache.get(key)

    if (!entry) {
      console.log(`📦 Portfolio cache miss for ${walletAddresses.length} wallet(s)`)
      return { data: null, shouldRefresh: true }
    }

    if (this.isExpired(entry)) {
      console.log(`⏰ Portfolio cache expired for ${walletAddresses.length} wallet(s)`)
      this.cache.delete(key)
      return { data: null, shouldRefresh: true }
    }

    const isStale = this.isStaleData(entry)
    if (isStale) {
      console.log(`🔄 Portfolio cache stale, will refresh in background for ${walletAddresses.length} wallet(s)`)
    } else {
      console.log(`✅ Portfolio cache hit (fresh) for ${walletAddresses.length} wallet(s)`)
    }

    return {
      data: entry.nfts,
      shouldRefresh: isStale
    }
  }

  /**
   * Set portfolio in cache
   */
  set(walletAddresses: string[], nfts: PortfolioNFT[]): void {
    const key = this.getCacheKey(walletAddresses)
    this.cache.set(key, {
      walletAddresses,
      nfts,
      timestamp: Date.now(),
      isStale: false,
    })
    console.log(`💾 Cached portfolio with ${nfts.length} NFTs for ${walletAddresses.length} wallet(s)`)
  }

  /**
   * Mark cache entry as stale (being refreshed)
   */
  markAsRefreshing(walletAddresses: string[]): void {
    const key = this.getCacheKey(walletAddresses)
    const entry = this.cache.get(key)
    if (entry) {
      entry.isStale = true
    }
  }

  /**
   * Clear portfolio cache for specific wallets
   */
  clearForWallets(walletAddresses: string[]): void {
    const key = this.getCacheKey(walletAddresses)
    this.cache.delete(key)
    console.log(`🧹 Cleared portfolio cache for ${walletAddresses.length} wallet(s)`)
  }

  /**
   * Clear all cache entries
   */
  clearAll(): void {
    this.cache.clear()
    console.log("🧹 Portfolio cache cleared completely")
  }

  /**
   * Clear expired entries
   */
  clearExpired(): void {
    let cleared = 0
    for (const [key, entry] of this.cache.entries()) {
      if (this.isExpired(entry)) {
        this.cache.delete(key)
        cleared++
      }
    }
    if (cleared > 0) {
      console.log(`🧹 Cleared ${cleared} expired portfolio entries`)
    }
  }

  /**
   * Get cache stats
   */
  getStats(): {
    size: number
    entries: Array<{
      key: string
      wallets: number
      nfts: number
      age: string
      isStale: boolean
    }>
  } {
    const entries = Array.from(this.cache.entries()).map(([key, entry]) => {
      const ageMs = Date.now() - entry.timestamp
      const ageMinutes = Math.floor(ageMs / 60000)
      const ageHours = Math.floor(ageMinutes / 60)
      const ageDays = Math.floor(ageHours / 24)

      let age: string
      if (ageDays > 0) {
        age = `${ageDays}d ${ageHours % 24}h`
      } else if (ageHours > 0) {
        age = `${ageHours}h ${ageMinutes % 60}m`
      } else {
        age = `${ageMinutes}m`
      }

      return {
        key: key.substring(0, 20) + '...',
        wallets: entry.walletAddresses.length,
        nfts: entry.nfts.length,
        age,
        isStale: entry.isStale,
      }
    })

    return {
      size: this.cache.size,
      entries,
    }
  }
}

// Singleton instance
export const portfolioCache = new PortfolioCache()

// Clear expired entries periodically (every 1 hour)
if (typeof window !== "undefined") {
  setInterval(() => {
    portfolioCache.clearExpired()
  }, 60 * 60 * 1000)
}
