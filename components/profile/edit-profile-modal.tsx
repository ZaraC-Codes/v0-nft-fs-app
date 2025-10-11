"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { BaseModal } from "@/components/shared/BaseModal"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Camera, Save, User, Shield } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useProfile } from "./profile-provider"
import { WalletManagement } from "@/components/wallet/wallet-management"

interface EditProfileModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditProfileModal({ open, onOpenChange }: EditProfileModalProps) {
  const { userProfile, updateProfile, loading } = useProfile()
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    username: userProfile?.username || "",
    bio: userProfile?.bio || "",
    email: userProfile?.email || "",
    showWalletAddress: userProfile?.showWalletAddress || false,
    showEmail: userProfile?.showEmail || false,
    isPublic: userProfile?.isPublic || true,
  })

  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)

  // Update form data when profile changes
  useEffect(() => {
    if (userProfile) {
      setFormData({
        username: userProfile.username,
        bio: userProfile.bio || "",
        email: userProfile.email || "",
        showWalletAddress: userProfile.showWalletAddress || false,
        showEmail: userProfile.showEmail || false,
        isPublic: userProfile.isPublic || true,
      })
    }
  }, [userProfile])

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleFileChange = (type: 'avatar' | 'cover', file: File | null) => {
    if (!file) return

    // Convert to base64 data URL instead of blob URL for persistence
    const reader = new FileReader()
    reader.onloadend = () => {
      if (type === 'avatar') {
        setAvatarPreview(reader.result as string)
        setAvatarFile(file)
      } else {
        setCoverPreview(reader.result as string)
        setCoverFile(file)
      }
    }
    reader.readAsDataURL(file)
  }

  const handleSave = async () => {
    if (!userProfile) return

    try {
      const updates: any = {
        username: formData.username,
        bio: formData.bio,
        email: formData.email,
        showWalletAddress: formData.showWalletAddress,
        showEmail: formData.showEmail,
        isPublic: formData.isPublic,
      }

      // Use base64 data URLs for persistence (not blob URLs!)
      if (avatarPreview) {
        updates.avatar = avatarPreview
      }
      if (coverPreview) {
        updates.coverImage = coverPreview
      }

      await updateProfile(updates)

      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      })

      // Close modal after short delay to ensure toast shows
      setTimeout(() => {
        onOpenChange(false)
      }, 500)
    } catch (error) {
      console.error("Profile update error:", error)
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      })
      // Still close the modal even if there's an error
      setTimeout(() => {
        onOpenChange(false)
      }, 500)
    }
  }

  if (!userProfile) return null

  return (
    <BaseModal
      isOpen={open}
      onClose={() => onOpenChange(false)}
      title="Edit Profile"
      description="Make changes to your profile information and privacy settings"
      size="lg"
      scrollable={true}
      footer={
        <div className="flex justify-end gap-2 w-full">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={loading}
            className="bg-gradient-to-r from-primary to-secondary hover:from-primary/80 hover:to-secondary/80"
          >
            <Save className="mr-2 h-4 w-4" />
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
          {/* Profile Images Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              <h3 className="font-semibold">Profile Images</h3>
            </div>

            {/* Cover Image */}
            <div>
              <Label className="text-sm font-medium">Cover Image</Label>
              <div className="mt-2">
                <div className="relative h-32 w-full rounded-lg border-2 border-dashed border-border bg-muted/50 flex items-center justify-center overflow-hidden">
                  {(coverPreview || userProfile.coverImage) ? (
                    <img
                      src={coverPreview || userProfile.coverImage}
                      alt="Cover"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center">
                      <Camera className="mx-auto h-8 w-8 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground mt-2">Upload cover image</p>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange('cover', e.target.files?.[0] || null)}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Avatar */}
            <div>
              <Label className="text-sm font-medium">Profile Picture</Label>
              <div className="mt-2 flex items-center gap-4">
                <div className="relative">
                  <Avatar className="h-20 w-20">
                    <AvatarImage
                      src={avatarPreview || userProfile.avatar}
                      alt={userProfile.username}
                    />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white text-xl">
                      {userProfile.username[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange('avatar', e.target.files?.[0] || null)}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>
                <div>
                  <Button variant="outline" className="relative">
                    <Camera className="mr-2 h-4 w-4" />
                    Change Avatar
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange('avatar', e.target.files?.[0] || null)}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Basic Information Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5" />
              <h3 className="font-semibold">Basic Information</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => handleInputChange("username", e.target.value)}
                  placeholder="Enter your username"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => handleInputChange("bio", e.target.value)}
                placeholder="Tell us about yourself..."
                rows={4}
              />
            </div>

            {userProfile.walletAddress && (
              <div>
                <Label>Wallet Address</Label>
                <Input
                  value={userProfile.walletAddress}
                  disabled
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Wallet address cannot be changed
                </p>
              </div>
            )}
          </div>

          <Separator />

          {/* Privacy Settings Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              <h3 className="font-semibold">Privacy Settings</h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Public Profile</Label>
                  <p className="text-sm text-muted-foreground">
                    Make your profile visible to everyone
                  </p>
                </div>
                <Switch
                  checked={formData.isPublic}
                  onCheckedChange={(checked) => handleInputChange("isPublic", checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Show Wallet Address</Label>
                  <p className="text-sm text-muted-foreground">
                    Display your wallet address on your profile
                  </p>
                </div>
                <Switch
                  checked={formData.showWalletAddress}
                  onCheckedChange={(checked) => handleInputChange("showWalletAddress", checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Show Email</Label>
                  <p className="text-sm text-muted-foreground">
                    Display your email address on your profile
                  </p>
                </div>
                <Switch
                  checked={formData.showEmail}
                  onCheckedChange={(checked) => handleInputChange("showEmail", checked)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Wallet Management */}
        <Separator className="my-6" />
        <WalletManagement />
    </BaseModal>
  )
}
