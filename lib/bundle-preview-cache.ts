/**
 * Bundle Preview Cache
 * In-memory cache for bundle preview images with TTL expiration
 */

interface BundlePreview {
  tokenId: string
  contractAddress: string
  previewImages: Array<{
    image: string
    name: string
    tokenId: string
  }>
  timestamp: number
}

class BundlePreviewCache {
  private cache: Map<string, BundlePreview> = new Map()
  private readonly TTL = 24 * 60 * 60 * 1000 // 24 hours in milliseconds

  /**
   * Generate cache key from contract address and token ID
   */
  private getCacheKey(contractAddress: string, tokenId: string): string {
    return `${contractAddress.toLowerCase()}_${tokenId}`
  }

  /**
   * Check if cache entry is expired
   */
  private isExpired(entry: BundlePreview): boolean {
    return Date.now() - entry.timestamp > this.TTL
  }

  /**
   * Get bundle preview from cache
   */
  get(contractAddress: string, tokenId: string): Array<{ image: string; name: string; tokenId: string }> | null {
    const key = this.getCacheKey(contractAddress, tokenId)
    const entry = this.cache.get(key)

    if (!entry) {
      console.log(`📦 Cache miss for bundle ${tokenId}`)
      return null
    }

    if (this.isExpired(entry)) {
      console.log(`⏰ Cache expired for bundle ${tokenId}`)
      this.cache.delete(key)
      return null
    }

    console.log(`✅ Cache hit for bundle ${tokenId}`)
    return entry.previewImages
  }

  /**
   * Set bundle preview in cache
   */
  set(
    contractAddress: string,
    tokenId: string,
    previewImages: Array<{ image: string; name: string; tokenId: string }>
  ): void {
    const key = this.getCacheKey(contractAddress, tokenId)
    this.cache.set(key, {
      tokenId,
      contractAddress,
      previewImages,
      timestamp: Date.now(),
    })
    console.log(`💾 Cached ${previewImages.length} preview images for bundle ${tokenId}`)
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear()
    console.log("🧹 Bundle preview cache cleared")
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
      console.log(`🧹 Cleared ${cleared} expired bundle preview entries`)
    }
  }

  /**
   * Get cache stats
   */
  getStats(): { size: number; entries: string[] } {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.keys()),
    }
  }
}

// Singleton instance
export const bundlePreviewCache = new BundlePreviewCache()

// Clear expired entries periodically (every 1 hour)
if (typeof window !== "undefined") {
  setInterval(() => {
    bundlePreviewCache.clearExpired()
  }, 60 * 60 * 1000)
}
