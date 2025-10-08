"use client"

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { Copy } from "lucide-react"
import { formatMessageTime } from "@/lib/collection-chat"

interface MessageBubbleProps {
  message: {
    id: string
    type: string
    content: string
    timestamp: string
    sender: {
      id: string
      username: string
      avatar: string
      isBot: boolean
      verified?: boolean
    }
  }
  isMobile: boolean
}

/**
 * Mobile-optimized message bubble component
 * Adapts size and spacing based on screen size
 */
export function MessageBubble({ message, isMobile }: MessageBubbleProps) {
  const [showActions, setShowActions] = useState(false)

  // System messages (joins, leaves, announcements)
  if (message.type === 'system') {
    return (
      <div className="flex justify-center">
        <div className="text-[10px] xs:text-xs text-muted-foreground
                        bg-muted/30 rounded-full px-2 xs:px-3 py-1
                        inline-block max-w-[90%] text-center">
          {message.content}
        </div>
      </div>
    )
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content)
    // Could add toast notification here
  }

  return (
    <div
      className="flex gap-2 xs:gap-3 group"
      onTouchStart={() => isMobile && setShowActions(true)}
      onTouchEnd={() => isMobile && setTimeout(() => setShowActions(false), 3000)}
    >
      {/* Avatar - Smaller on mobile */}
      <Avatar className="h-7 w-7 xs:h-8 xs:w-8 sm:h-9 sm:w-9 flex-shrink-0 mt-0.5">
        <AvatarImage src={message.sender.avatar} alt={message.sender.username} />
        <AvatarFallback className="text-[10px] xs:text-xs">
          {message.sender.username[0]?.toUpperCase() || '?'}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        {/* Username & Timestamp */}
        <div className="flex items-center gap-1.5 xs:gap-2 mb-0.5 xs:mb-1 flex-wrap">
          <span className="font-medium text-[11px] xs:text-xs sm:text-sm truncate">
            {message.sender.username}
          </span>

          {/* Verified NFT holder badge */}
          {message.sender.verified && !message.sender.isBot && (
            <Badge
              variant="outline"
              className="text-[9px] xs:text-[10px] h-4 px-1 xs:px-1.5 py-0 border-green-500/50 text-green-400"
            >
              Holder
            </Badge>
          )}

          {/* Bot badge */}
          {message.sender.isBot && (
            <Badge
              variant="outline"
              className="text-[9px] xs:text-[10px] h-4 px-1 xs:px-1.5 py-0 border-purple-500/50 text-purple-400"
            >
              Bot
            </Badge>
          )}

          <span className="text-[10px] xs:text-xs text-muted-foreground">
            {formatMessageTime(new Date(message.timestamp))}
          </span>
        </div>

        {/* Message Content - Adaptive width */}
        <div className="relative">
          <div className={`
            text-xs xs:text-sm sm:text-base
            p-2 xs:p-2.5 sm:p-3
            rounded-lg rounded-tl-none
            ${message.sender.isBot
              ? 'bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20'
              : 'bg-muted/30'
            }
            break-words
            max-w-full xs:max-w-[85%] sm:max-w-[75%] md:max-w-[65%]
          `}>
            {message.content}
          </div>

          {/* Action buttons - Show on hover (desktop) or tap (mobile) */}
          {(showActions || !isMobile) && (
            <div className="absolute -right-1 top-0
                            opacity-0 group-hover:opacity-100
                            transition-opacity">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 bg-card/80 backdrop-blur-sm"
                onClick={handleCopy}
              >
                <Copy className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
