"use client"

import { useState } from "react"
import { parseMessage, ParsedSegment } from "@/lib/message-parser"
import { Badge } from "@/components/ui/badge"
import { NFTPreviewCard } from "./nft-preview-card"
import Link from "next/link"

interface RichMessageProps {
  content: string
  collectionAddress?: string // Current collection context
}

/**
 * Rich message component that parses and renders:
 * - @mentions (users/wallets)
 * - #collections (collection references)
 * - NFT references (#Collection:123 or #NFT(addr, id))
 */
export function RichMessage({ content, collectionAddress }: RichMessageProps) {
  const segments = parseMessage(content)

  return (
    <span className="break-words">
      {segments.map((segment, index) => (
        <MessageSegment
          key={index}
          segment={segment}
          currentCollectionAddress={collectionAddress}
        />
      ))}
    </span>
  )
}

function MessageSegment({
  segment,
  currentCollectionAddress
}: {
  segment: ParsedSegment
  currentCollectionAddress?: string
}) {
  const [showNFTPreview, setShowNFTPreview] = useState(false)

  switch (segment.type) {
    case 'text':
      return <span>{segment.content}</span>

    case 'mention':
      return (
        <MentionTag
          username={segment.username}
          address={segment.address}
        />
      )

    case 'collection':
      return (
        <CollectionTag
          slug={segment.collectionSlug!}
          address={segment.collectionAddress}
        />
      )

    case 'nft':
      return (
        <NFTTag
          slug={segment.collectionSlug}
          address={segment.collectionAddress || currentCollectionAddress}
          tokenId={segment.tokenId!}
          onHover={setShowNFTPreview}
        />
      )

    default:
      return <span>{segment.content}</span>
  }
}

/**
 * User mention tag component
 */
function MentionTag({ username, address }: { username?: string; address?: string }) {
  const displayName = username || (address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Unknown')

  return (
    <Link
      href={`/profile/${address || username}`}
      className="inline-flex items-center gap-1
                 px-1.5 py-0.5 rounded
                 bg-cyan-500/10 hover:bg-cyan-500/20
                 text-cyan-400 hover:text-cyan-300
                 border border-cyan-500/30
                 transition-colors
                 font-medium text-sm
                 cursor-pointer"
      onClick={(e) => e.stopPropagation()}
    >
      @{displayName}
    </Link>
  )
}

/**
 * Collection reference tag component
 */
function CollectionTag({ slug, address }: { slug: string; address?: string }) {
  // Convert slug to URL-friendly format
  const collectionSlug = slug.toLowerCase().replace(/\s+/g, '-')

  return (
    <Link
      href={`/collections/${collectionSlug}`}
      className="inline-flex items-center gap-1
                 px-1.5 py-0.5 rounded
                 bg-purple-500/10 hover:bg-purple-500/20
                 text-purple-400 hover:text-purple-300
                 border border-purple-500/30
                 transition-colors
                 font-medium text-sm
                 cursor-pointer"
      onClick={(e) => e.stopPropagation()}
    >
      #{slug}
    </Link>
  )
}

/**
 * NFT reference tag component with hover preview
 */
function NFTTag({
  slug,
  address,
  tokenId,
  onHover
}: {
  slug?: string
  address?: string
  tokenId: string
  onHover: (show: boolean) => void
}) {
  const [showPreview, setShowPreview] = useState(false)

  const handleMouseEnter = () => {
    setShowPreview(true)
    onHover(true)
  }

  const handleMouseLeave = () => {
    setShowPreview(false)
    onHover(false)
  }

  const displayText = slug ? `${slug}:${tokenId}` : `NFT:${tokenId}`

  return (
    <span className="relative inline-block">
      <button
        type="button"
        className="inline-flex items-center gap-1
                   px-1.5 py-0.5 rounded
                   bg-orange-500/10 hover:bg-orange-500/20
                   text-orange-400 hover:text-orange-300
                   border border-orange-500/30
                   transition-colors
                   font-medium text-sm
                   cursor-pointer"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={(e) => {
          e.stopPropagation()
          // Future: Open NFT modal
          console.log('Open NFT:', { slug, address, tokenId })
        }}
      >
        #{displayText}
      </button>

      {/* Hover preview */}
      {showPreview && address && (
        <div className="absolute z-50 bottom-full left-0 mb-2"
             onMouseEnter={handleMouseEnter}
             onMouseLeave={handleMouseLeave}>
          <NFTPreviewCard
            contractAddress={address}
            tokenId={tokenId}
          />
        </div>
      )}
    </span>
  )
}
