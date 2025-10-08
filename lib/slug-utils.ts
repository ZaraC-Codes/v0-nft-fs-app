/**
 * Slug Utilities
 * Convert collection names to URL-friendly slugs
 */

/**
 * Convert a collection name to a URL slug
 * Examples:
 * - "Curtis Collection" → "curtis-collection"
 * - "GLITCH ON APE" → "glitch-on-ape"
 * - "Cool NFTs #1" → "cool-nfts-1"
 */
export function nameToSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
}

/**
 * Convert a slug back to a display name
 * Examples:
 * - "curtis-collection" → "Curtis Collection"
 * - "glitch-on-ape" → "Glitch On Ape"
 */
export function slugToName(slug: string): string {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

/**
 * Validate a slug format
 */
export function isValidSlug(slug: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)
}
