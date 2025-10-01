"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Search, User, Wallet, Menu, X, Bell, LogOut, Settings, UserCircle, ChevronDown, Check } from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"
import { useActiveAccount } from "thirdweb/react"
import { WalletConnect } from "@/components/web3/wallet-connect"
import { useProfile } from "@/components/profile/profile-provider"
import { ProfileService } from "@/lib/profile-service"
import { toast } from "sonner"

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { user, logout } = useAuth()
  const account = useActiveAccount()
  const { userProfile, refreshProfile } = useProfile()

  const handleSwitchWallet = async (walletAddress: string) => {
    if (!userProfile) return
    try {
      await ProfileService.setActiveWallet(userProfile.id, walletAddress)
      await refreshProfile()
      toast.success(`Switched to ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`)
    } catch (error) {
      console.error("Failed to switch wallet:", error)
      toast.error("Failed to switch wallet")
    }
  }

  // Get linked wallets safely - fallback to empty array if profile not loaded yet
  const linkedWallets = userProfile ? ProfileService.getAllWallets(userProfile) : []
  const activeWallet = userProfile?.activeWallet || userProfile?.walletAddress

  // Debug logging
  if (typeof window !== 'undefined') {
    console.log('Header - userProfile:', !!userProfile, 'linkedWallets:', linkedWallets.length)
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <img
              src="/fs-temp-logo.png"
              alt="Fortuna Square Logo"
              className="h-8 w-8 object-contain"
            />
            <span className="text-xl font-bold neon-text text-primary">Fortuna Square</span>
          </Link>

          {/* Search Bar - Desktop */}
          <div className="hidden sm:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search NFTs, collections, creators..."
                className="pl-10 bg-card/50 border-border/50 focus:border-primary/50 focus:ring-primary/20"
              />
            </div>
          </div>

          {/* Navigation - Desktop */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/" className="text-sm font-medium hover:text-primary transition-colors">
              Home
            </Link>

            {/* Demos Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="h-auto px-2 py-1 text-sm font-medium hover:text-primary transition-colors flex items-center gap-1">
                  Demos
                  <ChevronDown className="h-3 w-3" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48 bg-card/90 backdrop-blur-xl border-border/50" align="start">
                <DropdownMenuItem asChild>
                  <Link href="/mint" className="cursor-pointer">
                    Mint NFTs
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/collections" className="cursor-pointer">
                    Collections
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/bundles" className="cursor-pointer">
                    Bundles
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/treasury" className="cursor-pointer">
                    Treasury
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/cross-chain-demo" className="cursor-pointer">
                    Cross-Chain
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/profile/crypto_collector" className="cursor-pointer">
                    Profiles
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Link href="/treasuries" className="text-sm font-medium hover:text-primary transition-colors">
              Treasuries
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-3">
            {/* Wallet Connection - Always available */}
            <div className="hidden sm:flex">
              <WalletConnect />
            </div>

            {/* User Actions - Only show when user is logged in */}
            {user && (
              <div className="flex items-center space-x-2">
                {/* Notifications */}
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-4 w-4" />
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs bg-secondary">3</Badge>
                </Button>
              </div>
            )}

            {/* User Menu - Only show when user is logged in */}
            {user ? (
              <div className="flex items-center space-x-2">
                {/* Profile Avatar Link */}
                <Link href={`/profile/${user.username}`}>
                  <Avatar className="h-8 w-8 cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all">
                    <AvatarImage
                      src={user?.avatar || "/placeholder.svg"}
                      alt={user?.username || "User"}
                    />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white">
                      {user?.username?.[0]?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Link>

                {/* Dropdown Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64 bg-card/90 backdrop-blur-xl border-border/50 z-[100]" align="end">
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">
                        {user?.username || "User"}
                      </p>
                      {user?.email && <p className="w-[200px] truncate text-sm text-muted-foreground">{user.email}</p>}
                    </div>
                  </div>
                  <DropdownMenuSeparator />

                  {/* Wallet Switcher Section */}
                  {linkedWallets.length > 0 && (
                    <>
                      <div className="px-2 py-1.5">
                        <p className="text-xs font-semibold text-muted-foreground uppercase">Your Wallets</p>
                      </div>
                      {linkedWallets.map((wallet) => {
                        const isActive = activeWallet?.toLowerCase() === wallet.toLowerCase()
                        const isPrimary = userProfile?.walletAddress?.toLowerCase() === wallet.toLowerCase()

                        return (
                          <DropdownMenuItem
                            key={wallet}
                            onClick={() => handleSwitchWallet(wallet)}
                            className="cursor-pointer"
                          >
                            <Wallet className="mr-2 h-4 w-4" />
                            <div className="flex-1 flex items-center justify-between">
                              <span className="font-mono text-xs">
                                {wallet.slice(0, 6)}...{wallet.slice(-4)}
                              </span>
                              <div className="flex items-center gap-1">
                                {isPrimary && (
                                  <Badge variant="secondary" className="text-[10px] px-1 py-0">
                                    Primary
                                  </Badge>
                                )}
                                {isActive && <Check className="h-3 w-3 text-primary" />}
                              </div>
                            </div>
                          </DropdownMenuItem>
                        )
                      })}
                      <DropdownMenuSeparator />
                    </>
                  )}

                  <DropdownMenuItem asChild>
                    <Link href={`/profile/${user?.username || 'me'}`}>
                      <UserCircle className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings">
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              </div>
            ) : null}

            {/* Mobile Menu Toggle */}
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-border/50 py-4">
            <div className="flex flex-col space-y-4">
              {/* Mobile Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search NFTs, collections..." className="pl-10 bg-card/50 border-border/50" />
              </div>

              {/* Mobile Navigation */}
              <nav className="flex flex-col space-y-2">
                <Link href="/" className="text-sm font-medium hover:text-primary transition-colors py-2">
                  Home
                </Link>

                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider pt-2">
                  Demos
                </div>
                <Link href="/mint" className="text-sm font-medium hover:text-primary transition-colors py-2 pl-4">
                  Mint NFTs
                </Link>
                <Link href="/collections" className="text-sm font-medium hover:text-primary transition-colors py-2 pl-4">
                  Collections
                </Link>
                <Link href="/bundles" className="text-sm font-medium hover:text-primary transition-colors py-2 pl-4">
                  Bundles
                </Link>
                <Link href="/treasury" className="text-sm font-medium hover:text-primary transition-colors py-2 pl-4">
                  Treasury
                </Link>
                <Link href="/cross-chain-demo" className="text-sm font-medium hover:text-primary transition-colors py-2 pl-4">
                  Cross-Chain
                </Link>
                <Link href="/profile/crypto_collector" className="text-sm font-medium hover:text-primary transition-colors py-2 pl-4">
                  Profiles
                </Link>

                <div className="pt-2">
                  <Link href="/treasuries" className="text-sm font-medium hover:text-primary transition-colors py-2">
                    Treasuries
                  </Link>
                </div>
              </nav>

              {/* Mobile Wallet Connection */}
              <div className="space-y-2">
                <WalletConnect />
              </div>

              {/* Mobile Auth */}
              {!user && (
                <div className="space-y-2">
                  <Button
                    className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/80 hover:to-secondary/80"
                    asChild
                  >
                    <Link href="/auth/login">Sign In</Link>
                  </Button>
                  <Button variant="outline" className="w-full bg-transparent" asChild>
                    <Link href="/auth/signup">Sign Up</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
