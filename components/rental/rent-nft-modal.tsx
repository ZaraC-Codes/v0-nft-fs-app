"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { BaseModal, BaseModalError } from "@/components/shared/BaseModal"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TransactionButton } from "thirdweb/react"
import { useActiveAccount } from "thirdweb/react"
import { client } from "@/lib/thirdweb"
import { prepareRentNFT, calculateRentalCost, getWrapperInfo, WrapperInfo } from "@/lib/rental"
import { Calendar, DollarSign, Clock, Zap, Package } from "lucide-react"
import Image from "next/image"
import { fromWei } from "thirdweb"

interface RentNFTModalProps {
  isOpen: boolean
  onClose: () => void
  wrapperId: string
  wrapperNFT: {
    name: string
    image?: string
    contractAddress: string
    chainId: number
  }
}

export function RentNFTModal({ isOpen, onClose, wrapperId, wrapperNFT }: RentNFTModalProps) {
  const account = useActiveAccount()

  const [duration, setDuration] = useState("7")
  const [wrapperInfo, setWrapperInfo] = useState<WrapperInfo | null>(null)
  const [costs, setCosts] = useState<{
    rentalCost: bigint
    platformFee: bigint
    totalCost: bigint
  } | null>(null)
  const [loading, setLoading] = useState(true)

  const chain = { id: wrapperNFT.chainId, name: "ApeChain Curtis" } as any

  // Load wrapper info
  useEffect(() => {
    if (isOpen) {
      loadWrapperInfo()
    }
  }, [isOpen, wrapperId])

  // Calculate costs when duration changes
  useEffect(() => {
    if (wrapperInfo && duration) {
      calculateCosts()
    }
  }, [duration, wrapperInfo])

  const loadWrapperInfo = async () => {
    try {
      setLoading(true)
      const info = await getWrapperInfo(client, chain, wrapperId)
      setWrapperInfo(info)
    } catch (error) {
      console.error("Error loading wrapper info:", error)
    } finally {
      setLoading(false)
    }
  }

  const calculateCosts = async () => {
    try {
      const durationNum = parseInt(duration)
      if (isNaN(durationNum) || durationNum < 1) return

      const result = await calculateRentalCost(client, chain, wrapperId, durationNum)
      setCosts(result)
    } catch (error) {
      console.error("Error calculating costs:", error)
    }
  }

  const handleRent = () => {
    if (!duration || !costs || !wrapperInfo) {
      alert("Please enter a valid duration")
      return false
    }

    const durationNum = parseInt(duration)

    if (durationNum < wrapperInfo.minDays || durationNum > wrapperInfo.maxDays) {
      alert(`Duration must be between ${wrapperInfo.minDays} and ${wrapperInfo.maxDays} days`)
      return false
    }

    return true
  }

  if (loading) {
    return (
      <BaseModal isOpen={isOpen} onClose={onClose} title="Loading..." size="lg">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
        </div>
      </BaseModal>
    )
  }

  if (!wrapperInfo) {
    return (
      <BaseModalError
        isOpen={isOpen}
        onClose={onClose}
        title="Error Loading Rental"
        description="Failed to load rental information. Please try again."
      />
    )
  }

  const pricePerDayAPE = fromWei(wrapperInfo.pricePerDay, 18)

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <span className="bg-gradient-to-r from-green-400 to-blue-600 bg-clip-text text-transparent">
          Rent NFT
        </span>
      }
      description="Rent this NFT and get temporary usage rights. The owner retains ownership."
      size="lg"
      scrollable={true}
      titleIcon={<Calendar className="h-6 w-6 text-green-400" />}
      footer={
        <div className="flex gap-3 w-full">
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1 border-gray-700 text-gray-300 hover:bg-gray-800"
          >
            Cancel
          </Button>

          {costs && (
            <TransactionButton
              transaction={() => {
                if (!handleRent()) {
                  throw new Error("Invalid rental duration")
                }

                return prepareRentNFT(client, chain, {
                  wrapperId,
                  durationInDays: parseInt(duration),
                  totalCost: costs.totalCost,
                })
              }}
              onTransactionConfirmed={() => {
                onClose()
                alert(`NFT rented successfully for ${duration} days!`)
              }}
              onError={(error) => {
                console.error("Error renting NFT:", error)
                alert("Failed to rent NFT. Please try again.")
              }}
              className="flex-1 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 neon-glow"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Rent for {duration} days
            </TransactionButton>
          )}
        </div>
      }
    >
      <div>
        {/* NFT Preview */}
        <Card className="p-4 bg-gray-800/50 border-gray-700">
          <div className="flex gap-4">
            <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
              {wrapperNFT.image ? (
                <Image
                  src={wrapperNFT.image}
                  alt={wrapperNFT.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
                  <Package className="h-8 w-8 text-gray-600" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-white">{wrapperNFT.name}</h3>
              <p className="text-sm text-gray-400">Wrapper ID #{wrapperId}</p>
              <div className="flex gap-2 mt-2">
                <Badge variant="outline" className="text-xs border-green-500/50 text-green-400">
                  Available
                </Badge>
                <Badge variant="outline" className="text-xs border-blue-500/50 text-blue-400">
                  ERC4907
                </Badge>
              </div>
            </div>
          </div>
        </Card>

        {/* Rental Terms */}
        <Card className="p-4 bg-gray-800/30 border-gray-700">
          <h4 className="font-semibold text-white mb-3">Rental Terms</h4>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-gray-500">Price per Day</p>
              <p className="text-sm font-semibold text-white">{pricePerDayAPE} APE</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Min Duration</p>
              <p className="text-sm font-semibold text-white">{wrapperInfo.minDays} days</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Max Duration</p>
              <p className="text-sm font-semibold text-white">{wrapperInfo.maxDays} days</p>
            </div>
          </div>
        </Card>

        {/* Duration Selection */}
        <div>
          <Label htmlFor="duration" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Rental Duration (days)
          </Label>
          <Input
            id="duration"
            type="number"
            min={wrapperInfo.minDays}
            max={wrapperInfo.maxDays}
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="bg-gray-800 border-gray-700 text-white mt-2"
          />
          <p className="text-xs text-gray-500 mt-1">
            Choose between {wrapperInfo.minDays} and {wrapperInfo.maxDays} days
          </p>
        </div>

        {/* Cost Breakdown */}
        {costs && (
          <Card className="p-4 bg-gradient-to-br from-green-500/10 to-blue-500/10 border-green-500/30">
            <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Cost Breakdown
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Rental Cost ({duration} days)</span>
                <span className="text-white font-semibold">
                  {fromWei(costs.rentalCost, 18)} APE
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Platform Fee (2.5%)</span>
                <span className="text-white">
                  {fromWei(costs.platformFee, 18)} APE
                </span>
              </div>
              <div className="border-t border-gray-700 pt-2 flex justify-between">
                <span className="text-white font-semibold">Total</span>
                <span className="text-green-400 font-bold text-lg">
                  {fromWei(costs.totalCost, 18)} APE
                </span>
              </div>
            </div>
          </Card>
        )}

        {/* Info Box */}
        <Card className="p-4 bg-blue-500/10 border-blue-500/30">
          <div className="flex gap-3">
            <Zap className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-200">
              <p className="font-semibold mb-1">What you get:</p>
              <ul className="space-y-1 text-xs">
                <li>• Temporary usage rights for {duration} days</li>
                <li>• Access to NFT utilities on supported platforms</li>
                <li>• Automatic expiration after rental period</li>
                <li>• You cannot sell or transfer the rented NFT</li>
                <li>• Owner retains full ownership rights</li>
              </ul>
            </div>
          </div>
        </Card>

      </div>
    </BaseModal>
  )
}