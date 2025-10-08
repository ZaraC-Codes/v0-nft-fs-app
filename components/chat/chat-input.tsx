"use client"

import { useState, useRef, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Send, Smile } from "lucide-react"

interface ChatInputProps {
  onSend: (message: string) => void
  disabled?: boolean
  placeholder?: string
}

/**
 * Mobile-optimized chat input component
 * Handles keyboard appearing on mobile with safe area insets
 */
export function ChatInput({ onSend, disabled = false, placeholder = "Message holders..." }: ChatInputProps) {
  const [message, setMessage] = useState("")
  const [keyboardHeight, setKeyboardHeight] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  // Handle keyboard appearing on mobile
  useEffect(() => {
    const handleResize = () => {
      // Calculate keyboard height on mobile
      if (window.visualViewport) {
        const viewportHeight = window.visualViewport.height
        const windowHeight = window.innerHeight
        const kbHeight = Math.max(0, windowHeight - viewportHeight)
        setKeyboardHeight(kbHeight)
      }
    }

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize)
      return () => window.visualViewport.removeEventListener('resize', handleResize)
    }
  }, [])

  const handleSubmit = () => {
    if (!message.trim() || disabled) return
    onSend(message.trim())
    setMessage("")
    inputRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div
      className="flex gap-2 items-end"
      style={{
        // Push input above keyboard on iOS
        transform: `translateY(-${keyboardHeight}px)`,
        transition: 'transform 0.2s ease-out'
      }}
    >
      {/* Emoji Button - Hidden on very small screens */}
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="hidden xs:flex shrink-0 h-9 w-9 sm:h-10 sm:w-10"
        disabled={disabled}
      >
        <Smile className="h-4 w-4 sm:h-5 sm:w-5" />
      </Button>

      {/* Input Field */}
      <Input
        ref={inputRef}
        placeholder={placeholder}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        className="flex-1 h-9 sm:h-10 text-sm sm:text-base
                   resize-none bg-background/80 backdrop-blur-sm
                   focus-visible:ring-2 focus-visible:ring-primary/50"
        maxLength={500}
        // Mobile-specific attributes
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="sentences"
      />

      {/* Send Button - Always visible, larger touch target */}
      <Button
        type="button"
        size="icon"
        onClick={handleSubmit}
        disabled={!message.trim() || disabled}
        className="shrink-0 h-9 w-9 sm:h-10 sm:w-10
                   bg-gradient-to-r from-primary to-secondary
                   active:scale-95 transition-transform
                   touch-manipulation"
      >
        <Send className="h-4 w-4 sm:h-5 sm:w-5" />
      </Button>
    </div>
  )
}
