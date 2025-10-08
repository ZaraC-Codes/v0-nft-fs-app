/**
 * Message Parser
 * Parses chat messages for @mentions, #collections, and NFT references
 */

export interface ParsedSegment {
  type: 'text' | 'mention' | 'collection' | 'nft'
  content: string
  // For mentions
  address?: string
  username?: string
  // For collections
  collectionSlug?: string
  collectionAddress?: string
  // For NFTs
  tokenId?: string
}

/**
 * Parse a message into segments with mentions, collections, and NFT references
 *
 * Supported formats:
 * - @username - User mention
 * - @0x123...456 - Wallet address mention
 * - #CollectionName - Collection reference
 * - #Collection:123 - NFT reference (collection:tokenId)
 * - #NFT(0x123...456, 123) - Explicit NFT reference
 *
 * @param content - Raw message content
 * @returns Array of parsed segments
 */
export function parseMessage(content: string): ParsedSegment[] {
  const segments: ParsedSegment[] = []

  // Combined regex for all patterns
  // Priority: NFT explicit > NFT shorthand > Collection > Mention
  const pattern = /#NFT\(([^,]+),\s*(\d+)\)|#([a-zA-Z0-9-]+):(\d+)|#([a-zA-Z0-9-]+)|@(0x[a-fA-F0-9]{40})|@([a-zA-Z0-9_-]+)/g

  let lastIndex = 0
  let match

  while ((match = pattern.exec(content)) !== null) {
    // Add text before this match
    if (match.index > lastIndex) {
      segments.push({
        type: 'text',
        content: content.slice(lastIndex, match.index)
      })
    }

    // Determine match type
    if (match[1] && match[2]) {
      // #NFT(address, tokenId)
      segments.push({
        type: 'nft',
        content: match[0],
        collectionAddress: match[1].trim(),
        tokenId: match[2]
      })
    } else if (match[3] && match[4]) {
      // #Collection:tokenId
      segments.push({
        type: 'nft',
        content: match[0],
        collectionSlug: match[3],
        tokenId: match[4]
      })
    } else if (match[5]) {
      // #CollectionName
      segments.push({
        type: 'collection',
        content: match[0],
        collectionSlug: match[5]
      })
    } else if (match[6]) {
      // @0x123...456 (wallet address)
      segments.push({
        type: 'mention',
        content: match[0],
        address: match[6]
      })
    } else if (match[7]) {
      // @username
      segments.push({
        type: 'mention',
        content: match[0],
        username: match[7]
      })
    }

    lastIndex = pattern.lastIndex
  }

  // Add remaining text
  if (lastIndex < content.length) {
    segments.push({
      type: 'text',
      content: content.slice(lastIndex)
    })
  }

  return segments
}

/**
 * Extract all mentions from a message
 * Useful for notification system
 *
 * @param content - Raw message content
 * @returns Array of mentioned usernames/addresses
 */
export function extractMentions(content: string): { username?: string; address?: string }[] {
  const mentions: { username?: string; address?: string }[] = []
  const segments = parseMessage(content)

  segments.forEach(segment => {
    if (segment.type === 'mention') {
      mentions.push({
        username: segment.username,
        address: segment.address
      })
    }
  })

  return mentions
}

/**
 * Extract all collection references from a message
 *
 * @param content - Raw message content
 * @returns Array of collection slugs/addresses
 */
export function extractCollections(content: string): { slug?: string; address?: string }[] {
  const collections: { slug?: string; address?: string }[] = []
  const segments = parseMessage(content)

  segments.forEach(segment => {
    if (segment.type === 'collection') {
      collections.push({
        slug: segment.collectionSlug,
        address: segment.collectionAddress
      })
    }
  })

  return collections
}

/**
 * Extract all NFT references from a message
 *
 * @param content - Raw message content
 * @returns Array of NFT references
 */
export function extractNFTs(content: string): { slug?: string; address?: string; tokenId: string }[] {
  const nfts: { slug?: string; address?: string; tokenId: string }[] = []
  const segments = parseMessage(content)

  segments.forEach(segment => {
    if (segment.type === 'nft') {
      nfts.push({
        slug: segment.collectionSlug,
        address: segment.collectionAddress,
        tokenId: segment.tokenId!
      })
    }
  })

  return nfts
}

/**
 * Get autocomplete suggestions based on current input
 *
 * @param text - Current input text
 * @param cursorPosition - Cursor position in text
 * @returns Autocomplete context or null
 */
export function getAutocompleteContext(
  text: string,
  cursorPosition: number
): { type: 'mention' | 'collection'; query: string; startPos: number } | null {
  // Look backwards from cursor to find @ or #
  let i = cursorPosition - 1

  while (i >= 0) {
    const char = text[i]

    // Found @ or #
    if (char === '@' || char === '#') {
      // Make sure it's not in the middle of a word
      if (i > 0 && /[a-zA-Z0-9]/.test(text[i - 1])) {
        return null
      }

      const query = text.slice(i + 1, cursorPosition)

      // Make sure query doesn't contain spaces or special chars (except - and _)
      if (/[\s@#:()]/.test(query)) {
        return null
      }

      return {
        type: char === '@' ? 'mention' : 'collection',
        query,
        startPos: i
      }
    }

    // Stop at whitespace or special characters
    if (/[\s@#:()]/.test(char)) {
      return null
    }

    i--
  }

  return null
}

/**
 * Replace text at cursor position with autocomplete selection
 *
 * @param text - Current input text
 * @param startPos - Start position of autocomplete query
 * @param cursorPosition - Current cursor position
 * @param replacement - Replacement text (e.g., "@alice" or "#bayc")
 * @returns New text and cursor position
 */
export function applyAutocomplete(
  text: string,
  startPos: number,
  cursorPosition: number,
  replacement: string
): { text: string; cursorPosition: number } {
  const before = text.slice(0, startPos)
  const after = text.slice(cursorPosition)

  const newText = before + replacement + ' ' + after
  const newCursorPosition = (before + replacement + ' ').length

  return {
    text: newText,
    cursorPosition: newCursorPosition
  }
}
