"use client"

import { useEffect, useState, useRef } from "react"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Users, Palette } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"

interface AutocompleteOption {
  type: 'user' | 'collection'
  value: string
  displayName: string
  avatar?: string
  badge?: string
  address?: string
}

interface MentionAutocompleteProps {
  query: string
  type: 'mention' | 'collection'
  onSelect: (value: string) => void
  onClose: () => void
  position: { x: number; y: number }
  // Data sources
  users?: Array<{ id: string; username: string; avatar: string; address: string }>
  collections?: Array<{ slug: string; name: string; symbol?: string; contractAddress: string }>
}

/**
 * Autocomplete dropdown for @mentions and #collections
 * Shows suggestions as user types
 */
export function MentionAutocomplete({
  query,
  type,
  onSelect,
  onClose,
  position,
  users = [],
  collections = []
}: MentionAutocompleteProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [options, setOptions] = useState<AutocompleteOption[]>([])
  const containerRef = useRef<HTMLDivElement>(null)

  // Filter options based on query
  useEffect(() => {
    let filtered: AutocompleteOption[] = []

    if (type === 'mention') {
      // Filter users
      filtered = users
        .filter(user =>
          user.username.toLowerCase().includes(query.toLowerCase()) ||
          user.address.toLowerCase().includes(query.toLowerCase())
        )
        .slice(0, 10)
        .map(user => ({
          type: 'user' as const,
          value: user.username,
          displayName: user.username,
          avatar: user.avatar,
          address: user.address,
          badge: user.address.slice(0, 6) + '...' + user.address.slice(-4)
        }))
    } else if (type === 'collection') {
      // Filter collections
      filtered = collections
        .filter(col =>
          col.name.toLowerCase().includes(query.toLowerCase()) ||
          col.slug.toLowerCase().includes(query.toLowerCase())
        )
        .slice(0, 10)
        .map(col => ({
          type: 'collection' as const,
          value: col.slug,
          displayName: col.name,
          badge: col.symbol,
          address: col.contractAddress
        }))
    }

    setOptions(filtered)
    setSelectedIndex(0)
  }, [query, type, users, collections])

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (options.length === 0) return

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex(prev => Math.min(prev + 1, options.length - 1))
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex(prev => Math.max(prev - 1, 0))
          break
        case 'Enter':
          e.preventDefault()
          if (options[selectedIndex]) {
            handleSelect(options[selectedIndex].value)
          }
          break
        case 'Escape':
          e.preventDefault()
          onClose()
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [options, selectedIndex])

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (value: string) => {
    const prefix = type === 'mention' ? '@' : '#'
    onSelect(prefix + value)
  }

  if (options.length === 0) {
    return null
  }

  return (
    <Card
      ref={containerRef}
      className="absolute z-50 w-72 max-h-64 overflow-hidden
                 shadow-xl border-primary/20 bg-card/95 backdrop-blur-md"
      style={{
        left: position.x,
        bottom: position.y + 10, // Position above input
      }}
    >
      <ScrollArea className="max-h-64">
        <div className="p-1">
          {options.map((option, index) => (
            <button
              key={option.value}
              type="button"
              className={`w-full flex items-center gap-3 p-2 rounded-lg
                         transition-colors text-left
                         ${index === selectedIndex
                           ? 'bg-primary/20 text-primary'
                           : 'hover:bg-muted/50'
                         }`}
              onClick={() => handleSelect(option.value)}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              {/* Icon/Avatar */}
              {option.type === 'user' ? (
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarImage src={option.avatar} alt={option.displayName} />
                  <AvatarFallback className="text-xs">
                    {option.displayName[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              ) : (
                <div className="h-8 w-8 flex-shrink-0 rounded-lg bg-muted/50 flex items-center justify-center">
                  <Palette className="h-4 w-4 text-muted-foreground" />
                </div>
              )}

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium truncate">
                    {option.displayName}
                  </span>
                  {option.badge && (
                    <Badge variant="outline" className="text-[10px] px-1.5">
                      {option.badge}
                    </Badge>
                  )}
                </div>
                {option.type === 'user' && option.address && (
                  <p className="text-[10px] text-muted-foreground truncate">
                    {option.address}
                  </p>
                )}
              </div>

              {/* Type indicator */}
              <div className="flex-shrink-0">
                {option.type === 'user' ? (
                  <Users className="h-3 w-3 text-muted-foreground" />
                ) : (
                  <Palette className="h-3 w-3 text-muted-foreground" />
                )}
              </div>
            </button>
          ))}
        </div>
      </ScrollArea>

      {/* Instructions */}
      <div className="border-t border-border/50 px-2 py-1.5 bg-muted/20">
        <p className="text-[10px] text-muted-foreground text-center">
          ↑↓ Navigate • Enter Select • Esc Close
        </p>
      </div>
    </Card>
  )
}
