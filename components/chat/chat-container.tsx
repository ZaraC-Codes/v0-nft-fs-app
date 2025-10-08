"use client"

import { useEffect, useRef, useState, ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { ChevronDown } from "lucide-react"

interface ChatContainerProps {
  messages: any[]
  children: ReactNode
}

/**
 * Chat container with scroll management and pull-to-refresh
 * Handles auto-scroll to bottom on new messages
 */
export function ChatContainer({ messages, children }: ChatContainerProps) {
  const messagesRef = useRef<HTMLDivElement>(null)
  const [atBottom, setAtBottom] = useState(true)
  const touchStartY = useRef(0)

  // Auto-scroll to bottom on new message (only if already at bottom)
  useEffect(() => {
    if (atBottom && messagesRef.current) {
      scrollToBottom()
    }
  }, [messages.length, atBottom])

  // Scroll to bottom function
  const scrollToBottom = () => {
    if (messagesRef.current) {
      messagesRef.current.scrollTo({
        top: messagesRef.current.scrollHeight,
        behavior: 'smooth'
      })
    }
  }

  // Check if at bottom
  const handleScroll = () => {
    if (!messagesRef.current) return

    const { scrollTop, scrollHeight, clientHeight } = messagesRef.current
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 50
    setAtBottom(isAtBottom)
  }

  // Pull-to-refresh (load older messages) - Future enhancement
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!messagesRef.current) return

    const touchY = e.touches[0].clientY
    const deltaY = touchY - touchStartY.current

    // If at top and pulling down, could trigger refresh
    if (messagesRef.current.scrollTop === 0 && deltaY > 100) {
      // Future: Load older messages
      console.log('Pull to refresh triggered')
    }
  }

  return (
    <div className="relative flex-1 flex flex-col h-full">
      {/* Messages container */}
      <div
        ref={messagesRef}
        onScroll={handleScroll}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        className="flex-1 overflow-y-auto overscroll-contain
                   scroll-smooth will-change-scroll h-full"
        style={{
          // Performance optimization
          transform: 'translateZ(0)',
          WebkitOverflowScrolling: 'touch'
        }}
      >
        {children}
      </div>

      {/* Scroll to bottom FAB - Show when not at bottom */}
      {!atBottom && (
        <Button
          onClick={scrollToBottom}
          size="icon"
          className="absolute bottom-4 right-4 z-10
                     h-10 w-10 rounded-full
                     bg-primary text-primary-foreground
                     shadow-lg shadow-primary/25
                     active:scale-95 transition-transform
                     touch-manipulation"
          aria-label="Scroll to bottom"
        >
          <ChevronDown className="h-5 w-5" />
        </Button>
      )}
    </div>
  )
}
