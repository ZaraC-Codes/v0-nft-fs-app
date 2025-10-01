"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
// import { Switch } from "@/components/ui/switch" // Temporarily disabled
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import { Camera, Save, User, Shield, Eye } from "lucide-react"
import { useProfile } from "@/components/profile/profile-provider"
import { useAuth } from "@/components/auth/auth-provider"

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
  })

  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [coverFile, setCoverFile] = useState<File | null>(null)

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleFileChange = (type: 'avatar' | 'cover', file: File | null) => {
    if (type === 'avatar') {
      setAvatarFile(file)
    } else {
      setCoverFile(file)
    }
  }

  const handleSave = async () => {
    if (!userProfile) return

    try {
      // In a real app, you'd upload the files first and get URLs
      const updates: any = {
        username: formData.username,
        bio: formData.bio,
        email: formData.email,
        showWalletAddress: formData.showWalletAddress,
        showEmail: formData.showEmail,
        isPublic: formData.isPublic,
      }

      // Mock file upload - in reality you'd upload to cloud storage
      if (avatarFile) {
        updates.avatar = URL.createObjectURL(avatarFile)
      }
      if (coverFile) {
        updates.coverImage = URL.createObjectURL(coverFile)
      }

      await updateProfile(updates)

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
                    {(coverFile || userProfile.coverImage) ? (
                      <img
                        src={coverFile ? URL.createObjectURL(coverFile) : userProfile.coverImage}
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
                        src={avatarFile ? URL.createObjectURL(avatarFile) : userProfile.avatar}
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