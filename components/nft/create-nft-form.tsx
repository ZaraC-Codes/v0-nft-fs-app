"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { X, Plus, Zap, ImageIcon } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Attribute {
  trait_type: string
  value: string
}

export function CreateNFTForm() {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    collection: "",
    royalties: "5",
    blockchain: "ethereum",
  })
  const [attributes, setAttributes] = useState<Attribute[]>([])
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setImageFile(null)
    setImagePreview(null)
  }

  const addAttribute = () => {
    setAttributes([...attributes, { trait_type: "", value: "" }])
  }

  const updateAttribute = (index: number, field: keyof Attribute, value: string) => {
    const updated = attributes.map((attr, i) => (i === index ? { ...attr, [field]: value } : attr))
    setAttributes(updated)
  }

  const removeAttribute = (index: number) => {
    setAttributes(attributes.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!imageFile) {
      toast({
        title: "Image required",
        description: "Please upload an image for your NFT",
        variant: "destructive",
      })
      return
    }

    if (!formData.name || !formData.description) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    // Simulate NFT creation
    setTimeout(() => {
      setIsLoading(false)
      toast({
        title: "NFT created successfully!",
        description: `${formData.name} has been minted and added to your collection`,
      })

      // Reset form
      setFormData({
        name: "",
        description: "",
        collection: "",
        royalties: "5",
        blockchain: "ethereum",
      })
      setAttributes([])
      setImageFile(null)
      setImagePreview(null)
    }, 3000)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Image Upload */}
      <div className="space-y-2">
        <Label>Image, Video, Audio, or 3D Model *</Label>
        {imagePreview ? (
          <div className="relative">
            <img
              src={imagePreview || "/placeholder.svg"}
              alt="NFT Preview"
              className="w-full h-64 object-cover rounded-lg border border-border/50"
            />
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white"
              onClick={removeImage}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="border-2 border-dashed border-border/50 rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
            <input
              type="file"
              accept="image/*,video/*,audio/*,.glb,.gltf"
              onChange={handleImageUpload}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <ImageIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-2">Drag and drop or click to upload</p>
              <p className="text-sm text-muted-foreground">
                JPG, PNG, GIF, SVG, MP4, WEBM, MP3, WAV, OGG, GLB, GLTF. Max 100mb.
              </p>
            </label>
          </div>
        )}
      </div>

      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name *</Label>
          <Input
            id="name"
            placeholder="Enter NFT name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="bg-card/50 border-border/50 focus:border-accent/50 focus:ring-accent/20"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="collection">Collection</Label>
          <Select
            value={formData.collection}
            onValueChange={(value) => setFormData({ ...formData, collection: value })}
          >
            <SelectTrigger className="bg-card/50 border-border/50 focus:border-accent/50">
              <SelectValue placeholder="Select collection" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cyber-samurai">Cyber Samurai Elite</SelectItem>
              <SelectItem value="digital-dreams">Digital Dreamscape</SelectItem>
              <SelectItem value="neon-warriors">Neon Warriors</SelectItem>
              <SelectItem value="create-new">+ Create New Collection</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Describe your NFT..."
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="bg-card/50 border-border/50 focus:border-accent/50 focus:ring-accent/20 min-h-[100px]"
          required
        />
      </div>

      {/* Attributes */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Attributes</Label>
          <Button type="button" variant="outline" size="sm" onClick={addAttribute}>
            <Plus className="mr-2 h-4 w-4" />
            Add Attribute
          </Button>
        </div>

        {attributes.length > 0 && (
          <div className="space-y-3">
            {attributes.map((attr, index) => (
              <Card key={index} className="bg-card/30 border-border/50 p-4">
                <div className="flex items-center space-x-3">
                  <Input
                    placeholder="Trait type (e.g., Background)"
                    value={attr.trait_type}
                    onChange={(e) => updateAttribute(index, "trait_type", e.target.value)}
                    className="bg-card/50 border-border/50"
                  />
                  <Input
                    placeholder="Value (e.g., Neon City)"
                    value={attr.value}
                    onChange={(e) => updateAttribute(index, "value", e.target.value)}
                    className="bg-card/50 border-border/50"
                  />
                  <Button type="button" size="icon" variant="ghost" onClick={() => removeAttribute(index)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="royalties">Royalties (%)</Label>
          <Input
            id="royalties"
            type="number"
            min="0"
            max="10"
            step="0.1"
            value={formData.royalties}
            onChange={(e) => setFormData({ ...formData, royalties: e.target.value })}
            className="bg-card/50 border-border/50 focus:border-accent/50 focus:ring-accent/20"
          />
          <p className="text-xs text-muted-foreground">
            Suggested: 5-10%. You'll receive this percentage on secondary sales.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="blockchain">Blockchain</Label>
          <Select
            value={formData.blockchain}
            onValueChange={(value) => setFormData({ ...formData, blockchain: value })}
          >
            <SelectTrigger className="bg-card/50 border-border/50 focus:border-accent/50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ethereum">Ethereum</SelectItem>
              <SelectItem value="polygon">Polygon</SelectItem>
              <SelectItem value="solana">Solana</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary */}
      <Card className="bg-card/30 border-border/50 p-4">
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Minting fee</span>
            <span className="font-semibold">0.001 ETH</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Service fee</span>
            <span className="font-semibold">Free</span>
          </div>
          <Separator />
          <div className="flex justify-between">
            <span className="font-semibold">Total cost</span>
            <span className="font-bold text-accent">0.001 ETH</span>
          </div>
        </div>
      </Card>

      {/* Submit */}
      <Button
        type="submit"
        disabled={isLoading}
        className="w-full bg-gradient-to-r from-accent to-secondary hover:from-accent/80 hover:to-secondary/80 neon-glow"
      >
        {isLoading ? (
          "Creating NFT..."
        ) : (
          <>
            <Zap className="mr-2 h-4 w-4" />
            Create NFT
          </>
        )}
      </Button>
    </form>
  )
}
