"use client"

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Users, Crown } from "lucide-react"
import { cn } from "@/lib/utils"

interface Member {
  id: string
  username: string
  avatar: string
  role?: string
  isOnline?: boolean
  nftCount?: number
}

interface MembersDrawerProps {
  members: Member[]
  isOpen: boolean
  onClose: () => void
}

interface MembersSidebarProps {
  members: Member[]
  className?: string
}

/**
 * Mobile members drawer component
 * Slides in from right on mobile devices
 */
export function MembersDrawer({ members, isOpen, onClose }: MembersDrawerProps) {
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent
        side="right"
        className="w-[85vw] max-w-[350px] p-0"
      >
        <SheetHeader className="px-4 py-3 border-b">
          <SheetTitle className="flex items-center gap-2 text-base">
            <Users className="h-4 w-4" />
            Members ({members.length})
          </SheetTitle>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-60px)]">
          <div className="p-3 space-y-1">
            {members.map((member) => (
              <MemberItem key={member.id} member={member} compact />
            ))}

            {members.length === 0 && (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No active members
              </div>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}

/**
 * Desktop members sidebar component
 * Always visible on larger screens
 */
export function MembersSidebar({ members, className }: MembersSidebarProps) {
  return (
    <Card className={cn("h-full flex flex-col", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Users className="h-4 w-4" />
          Members ({members.length})
        </CardTitle>
      </CardHeader>

      <CardContent className="p-0 flex-1 flex flex-col">
        <ScrollArea className="flex-1 px-3">
          <div className="space-y-1 pb-3">
            {members.map((member) => (
              <MemberItem key={member.id} member={member} />
            ))}

            {members.length === 0 && (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No active members
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

/**
 * Individual member item component
 * Used in both drawer and sidebar
 */
function MemberItem({ member, compact = false }: { member: Member; compact?: boolean }) {
  return (
    <div
      className="flex items-center gap-3 p-2.5 rounded-lg
                 hover:bg-muted/50 active:bg-muted transition-colors
                 touch-manipulation"
    >
      {/* Avatar with online indicator */}
      <div className="relative flex-shrink-0">
        <Avatar className={compact ? "h-9 w-9" : "h-10 w-10"}>
          <AvatarImage src={member.avatar} alt={member.username} />
          <AvatarFallback className="text-xs">
            {member.username[0]?.toUpperCase() || '?'}
          </AvatarFallback>
        </Avatar>

        {/* Online status indicator */}
        {member.isOnline && (
          <div className="absolute -bottom-0.5 -right-0.5
                          h-3 w-3 bg-green-500 rounded-full
                          border-2 border-background" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className={cn(
            "font-medium truncate",
            compact ? "text-sm" : "text-sm"
          )}>
            {member.username}
          </span>
          {member.role === 'creator' && (
            <Crown className="h-3.5 w-3.5 text-yellow-500 flex-shrink-0" />
          )}
        </div>

        <div className="flex items-center gap-1.5 mt-0.5">
          <Badge
            variant={member.role === 'creator' ? 'default' : 'outline'}
            className="text-[10px] h-4 px-1.5"
          >
            {member.role === 'creator' ? 'Creator' : 'Holder'}
          </Badge>

          {member.nftCount && member.nftCount > 1 && (
            <span className="text-[10px] text-muted-foreground">
              {member.nftCount} NFTs
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
