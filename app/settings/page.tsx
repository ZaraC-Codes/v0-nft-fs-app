"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import { Camera, Save, User, Shield, Eye, Link as LinkIcon, Twitter, Globe, MessageCircle } from "lucide-react"
import { useProfile } from "@/components/profile/profile-provider"
import { useAuth } from "@/components/auth/auth-provider"
import { LinkExternalWallet } from "@/components/wallet/link-external-wallet"
import { WalletSwitcher } from "@/components/wallet/wallet-switcher"

export default function SettingsPage() {
  const { user } = useAuth()
  const { userProfile, updateProfile, loading } = useProfile()
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    username: userProfile?.username || "",
    bio: userProfile?.bio || "",
    email: userProfile?.email || "",
    showWalletAddress: userProfile?.showWalletAddress || false,
    showEmail: userProfile?.showEmail || false,
    isPublic: userProfile?.isPublic || true,
    socialLinks: {
      twitter: userProfile?.socialLinks?.twitter || "",
      discord: userProfile?.socialLinks?.discord || "",
      website: userProfile?.socialLinks?.website || "",
      instagram: userProfile?.socialLinks?.instagram || "",
      telegram: userProfile?.socialLinks?.telegram || "",
      github: userProfile?.socialLinks?.github || "",
    }
  })

  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSocialLinkChange = (platform: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [platform]: value
      }
    }))
  }

  const handleFileChange = (type: 'avatar' | 'cover', file: File | null) => {
    if (!file) return

    // Create preview
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
        socialLinks: formData.socialLinks,
        avatar: avatarPreview || userProfile.avatar,
        coverImage: coverPreview || userProfile.coverImage,
      }


      await updateProfile(updates)

      // Clear file states after successful save
      setAvatarFile(null)
      setCoverFile(null)
      setAvatarPreview(null)
      setCoverPreview(null)

      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (!user || !userProfile) {
    return (
      <div className="min-h-screen bg-background cyber-grid">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <p className="text-muted-foreground">Please sign in to access settings.</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background cyber-grid">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-bold">Profile Settings</h1>
            <p className="text-muted-foreground mt-2">
              Manage your profile information and privacy settings
            </p>
          </div>

          {/* Profile Images */}
          <Card className="border-border/50 bg-card/50 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5" />
                Profile Images
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Cover Image */}
              <div>
                <Label className="text-sm font-medium">Cover Image</Label>
                <div className="mt-2">
                  <div className="relative h-32 w-full rounded-lg border-2 border-dashed border-border bg-muted/50 flex items-center justify-center">
                    {(coverPreview || userProfile.coverImage) ? (
                      <img
                        src={coverPreview || userProfile.coverImage}
                        alt="Cover"
                        className="w-full h-full object-cover rounded-lg"
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
            </CardContent>
          </Card>

          {/* Basic Information */}
          <Card className="border-border/50 bg-card/50 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
            </CardContent>
          </Card>

          {/* Social Links */}
          <Card className="border-border/50 bg-card/50 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LinkIcon className="h-5 w-5" />
                Social Links
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Connect your social profiles so others can find you
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Twitter/X */}
                <div>
                  <Label htmlFor="twitter" className="flex items-center gap-2">
                    <Twitter className="h-4 w-4" />
                    Twitter / X
                  </Label>
                  <div className="flex items-center mt-1">
                    <span className="text-sm text-muted-foreground mr-2">@</span>
                    <Input
                      id="twitter"
                      value={formData.socialLinks.twitter}
                      onChange={(e) => handleSocialLinkChange("twitter", e.target.value)}
                      placeholder="username"
                      className="flex-1"
                    />
                  </div>
                </div>

                {/* Discord */}
                <div>
                  <Label htmlFor="discord" className="flex items-center gap-2">
                    <MessageCircle className="h-4 w-4" />
                    Discord
                  </Label>
                  <Input
                    id="discord"
                    value={formData.socialLinks.discord}
                    onChange={(e) => handleSocialLinkChange("discord", e.target.value)}
                    placeholder="username#1234"
                  />
                </div>

                {/* Website */}
                <div>
                  <Label htmlFor="website" className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    Website
                  </Label>
                  <Input
                    id="website"
                    value={formData.socialLinks.website}
                    onChange={(e) => handleSocialLinkChange("website", e.target.value)}
                    placeholder="https://yourwebsite.com"
                  />
                </div>

                {/* Instagram */}
                <div>
                  <Label htmlFor="instagram" className="flex items-center gap-2">
                    <Camera className="h-4 w-4" />
                    Instagram
                  </Label>
                  <div className="flex items-center mt-1">
                    <span className="text-sm text-muted-foreground mr-2">@</span>
                    <Input
                      id="instagram"
                      value={formData.socialLinks.instagram}
                      onChange={(e) => handleSocialLinkChange("instagram", e.target.value)}
                      placeholder="username"
                      className="flex-1"
                    />
                  </div>
                </div>

                {/* Telegram */}
                <div>
                  <Label htmlFor="telegram" className="flex items-center gap-2">
                    <MessageCircle className="h-4 w-4" />
                    Telegram
                  </Label>
                  <div className="flex items-center mt-1">
                    <span className="text-sm text-muted-foreground mr-2">@</span>
                    <Input
                      id="telegram"
                      value={formData.socialLinks.telegram}
                      onChange={(e) => handleSocialLinkChange("telegram", e.target.value)}
                      placeholder="username"
                      className="flex-1"
                    />
                  </div>
                </div>

                {/* GitHub */}
                <div>
                  <Label htmlFor="github" className="flex items-center gap-2">
                    <LinkIcon className="h-4 w-4" />
                    GitHub
                  </Label>
                  <Input
                    id="github"
                    value={formData.socialLinks.github}
                    onChange={(e) => handleSocialLinkChange("github", e.target.value)}
                    placeholder="username"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Privacy Settings */}
          <Card className="border-border/50 bg-card/50 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Privacy Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
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
            </CardContent>
          </Card>

          {/* Wallet Switcher */}
          <WalletSwitcher />

          {/* Link External Wallets */}
          <LinkExternalWallet />

          {/* Save Button */}
          <div className="flex justify-end">
            <Button
              onClick={handleSave}
              disabled={loading}
              className="bg-gradient-to-r from-primary to-secondary hover:from-primary/80 hover:to-secondary/80"
            >
              <Save className="mr-2 h-4 w-4" />
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
