"use client"

import { useState, useEffect } from "react"
import { ProfileService } from "@/lib/profile-service"
import { UserProfile } from "@/types/profile"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Trash2,
  Users,
  Wallet,
  RefreshCw,
  AlertTriangle,
  Eye,
  EyeOff,
  Database,
  CheckCircle2
} from "lucide-react"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function AdminPage() {
  const [profiles, setProfiles] = useState<UserProfile[]>([])
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [showDetails, setShowDetails] = useState<Record<string, boolean>>({})
  const [profileToDelete, setProfileToDelete] = useState<string | null>(null)
  const [showResetDialog, setShowResetDialog] = useState(false)

  const loadData = () => {
    const allProfiles = ProfileService.getAllProfiles()
    setProfiles(allProfiles)

    const savedUser = localStorage.getItem("fortuna_square_user")
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser))
    } else {
      setCurrentUser(null)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleDeleteProfile = (profileId: string) => {
    try {
      const allProfiles = ProfileService.getAllProfiles()
      const updatedProfiles = allProfiles.filter(p => p.id !== profileId)
      ProfileService.saveProfiles(updatedProfiles)

      // If deleted profile was current user, clear user data
      if (currentUser?.id === profileId) {
        localStorage.removeItem("fortuna_square_user")
        setCurrentUser(null)
      }

      loadData()
      toast.success("Profile deleted successfully")
      setProfileToDelete(null)
    } catch (error) {
      toast.error("Failed to delete profile")
      console.error(error)
    }
  }

  const handleResetAll = () => {
    try {
      localStorage.removeItem("fortuna_square_profiles")
      localStorage.removeItem("fortuna_square_user")
      setProfiles([])
      setCurrentUser(null)
      setShowResetDialog(false)
      toast.success("All data cleared successfully")
    } catch (error) {
      toast.error("Failed to clear data")
      console.error(error)
    }
  }

  const toggleDetails = (profileId: string) => {
    setShowDetails(prev => ({
      ...prev,
      [profileId]: !prev[profileId]
    }))
  }

  const findDuplicates = () => {
    const walletMap = new Map<string, UserProfile[]>()

    profiles.forEach(profile => {
      const wallets = ProfileService.getAllWallets(profile)
      wallets.forEach(wallet => {
        const existing = walletMap.get(wallet.toLowerCase()) || []
        existing.push(profile)
        walletMap.set(wallet.toLowerCase(), existing)
      })
    })

    const duplicates: Array<{ wallet: string; profiles: UserProfile[] }> = []
    walletMap.forEach((profileList, wallet) => {
      if (profileList.length > 1) {
        duplicates.push({ wallet, profiles: profileList })
      }
    })

    return duplicates
  }

  const duplicates = findDuplicates()

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
                Admin Panel
              </h1>
              <p className="text-muted-foreground mt-2">
                Profile management and testing utilities
              </p>
            </div>
            <Button
              onClick={loadData}
              variant="outline"
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>

          {/* Warning Banner */}
          <Card className="border-orange-500/50 bg-orange-500/10">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-orange-500">Testing Environment Only</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    This admin panel modifies localStorage data. Use with caution. Changes are permanent.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4" />
                Total Profiles
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{profiles.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Wallet className="h-4 w-4" />
                Current User
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-medium truncate">
                {currentUser ? currentUser.username : "Not logged in"}
              </div>
            </CardContent>
          </Card>

          <Card className={duplicates.length > 0 ? "border-red-500/50 bg-red-500/5" : ""}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Duplicate Wallets
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${duplicates.length > 0 ? 'text-red-500' : 'text-green-500'}`}>
                {duplicates.length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Duplicates Warning */}
        {duplicates.length > 0 && (
          <Card className="border-red-500/50 bg-red-500/10">
            <CardHeader>
              <CardTitle className="text-red-500 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Duplicate Wallets Detected
              </CardTitle>
              <CardDescription>
                The following wallets are linked to multiple profiles
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {duplicates.map(({ wallet, profiles: dupProfiles }) => (
                <div key={wallet} className="border border-border/50 rounded-lg p-4 space-y-2">
                  <div className="font-mono text-sm">
                    {wallet.slice(0, 10)}...{wallet.slice(-8)}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {dupProfiles.map(p => (
                      <Badge key={p.id} variant="outline" className="text-xs">
                        {p.username} ({p.id.slice(0, 6)}...)
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Profiles List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>All Profiles</CardTitle>
                <CardDescription>
                  Manage all user profiles in localStorage
                </CardDescription>
              </div>
              <Button
                onClick={() => setShowResetDialog(true)}
                variant="destructive"
                size="sm"
                className="gap-2"
              >
                <Database className="h-4 w-4" />
                Reset All Data
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {profiles.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No profiles found</p>
                <p className="text-sm mt-2">Create an account to see it here</p>
              </div>
            ) : (
              <div className="space-y-4">
                {profiles.map((profile) => {
                  const isCurrentUser = currentUser?.id === profile.id
                  const wallets = ProfileService.getAllWallets(profile)
                  const isExpanded = showDetails[profile.id]

                  return (
                    <Card
                      key={profile.id}
                      className={`${isCurrentUser ? 'border-primary bg-primary/5' : 'border-border/50'}`}
                    >
                      <CardContent className="pt-6">
                        <div className="space-y-4">
                          {/* Profile Header */}
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-semibold text-lg">{profile.username}</h3>
                                {isCurrentUser && (
                                  <Badge variant="default" className="bg-primary">
                                    <CheckCircle2 className="h-3 w-3 mr-1" />
                                    Current User
                                  </Badge>
                                )}
                                {profile.verified && (
                                  <Badge variant="outline" className="text-blue-500 border-blue-500">
                                    Verified
                                  </Badge>
                                )}
                              </div>
                              <div className="space-y-1 text-sm text-muted-foreground">
                                {profile.email && <p>📧 {profile.email}</p>}
                                {profile.bio && <p className="line-clamp-2">💬 {profile.bio}</p>}
                                <p className="font-mono text-xs">
                                  ID: {profile.id.slice(0, 20)}...
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                onClick={() => toggleDetails(profile.id)}
                                variant="ghost"
                                size="sm"
                              >
                                {isExpanded ? (
                                  <EyeOff className="h-4 w-4" />
                                ) : (
                                  <Eye className="h-4 w-4" />
                                )}
                              </Button>
                              <Button
                                onClick={() => setProfileToDelete(profile.id)}
                                variant="ghost"
                                size="sm"
                                className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>

                          {/* Wallet Info */}
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm font-medium">
                              <Wallet className="h-4 w-4" />
                              <span>Linked Wallets ({wallets.length})</span>
                            </div>
                            <div className="space-y-1">
                              {wallets.map((wallet, index) => {
                                const isPrimary = wallet === profile.walletAddress
                                const isActive = wallet === profile.activeWallet

                                return (
                                  <div
                                    key={wallet}
                                    className="flex items-center justify-between p-2 rounded bg-muted/50 font-mono text-xs"
                                  >
                                    <span>
                                      {wallet.slice(0, 10)}...{wallet.slice(-8)}
                                    </span>
                                    <div className="flex gap-1">
                                      {isPrimary && (
                                        <Badge variant="outline" className="text-xs">
                                          Primary
                                        </Badge>
                                      )}
                                      {isActive && (
                                        <Badge variant="outline" className="text-xs text-green-500 border-green-500">
                                          Active
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          </div>

                          {/* Expanded Details */}
                          {isExpanded && (
                            <div className="pt-4 border-t border-border/50 space-y-2 text-xs">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <p className="font-medium mb-1">Created</p>
                                  <p className="text-muted-foreground">
                                    {profile.createdAt.toLocaleString()}
                                  </p>
                                </div>
                                <div>
                                  <p className="font-medium mb-1">Updated</p>
                                  <p className="text-muted-foreground">
                                    {profile.updatedAt.toLocaleString()}
                                  </p>
                                </div>
                                <div>
                                  <p className="font-medium mb-1">Followers</p>
                                  <p className="text-muted-foreground">{profile.followersCount}</p>
                                </div>
                                <div>
                                  <p className="font-medium mb-1">Following</p>
                                  <p className="text-muted-foreground">{profile.followingCount}</p>
                                </div>
                              </div>
                              {profile.avatar && (
                                <div>
                                  <p className="font-medium mb-1">Avatar</p>
                                  <img
                                    src={profile.avatar}
                                    alt="Avatar"
                                    className="w-16 h-16 rounded-full"
                                  />
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Delete Profile Dialog */}
      <AlertDialog open={!!profileToDelete} onOpenChange={() => setProfileToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Profile?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this profile from localStorage. This action cannot be undone.
              {currentUser?.id === profileToDelete && (
                <span className="block mt-2 text-orange-500 font-medium">
                  ⚠️ Warning: This is your currently logged-in profile!
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setProfileToDelete(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => profileToDelete && handleDeleteProfile(profileToDelete)}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete Profile
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reset All Dialog */}
      <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset All Data?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete ALL profiles and user data from localStorage. This action cannot be undone.
              <span className="block mt-2 text-red-500 font-bold">
                ⚠️ WARNING: This will log you out and clear everything!
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowResetDialog(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleResetAll}
              className="bg-red-500 hover:bg-red-600"
            >
              Reset Everything
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
