/**
 * Cross-Marketplace NFT Sale Tracking
 * Fetches sale history from ALL marketplaces by analyzing Transfer events + transaction values
 */

import { getRpcClient, eth_getTransactionByHash } from "thirdweb/rpc"
import { getContract, prepareEvent, getContractEvents, defineChain } from "thirdweb"
import { client } from "./thirdweb"

export interface SaleRecord {
  price: string // In APE
  priceWei: bigint
  marketplace: string
  from: string
  to: string
  timestamp: Date
  txHash: string
  blockNumber: number
}

/**
 * Detect which marketplace facilitated a sale
 * Based on contract address and transaction input data
 */
function detectMarketplace(toAddress: string, inputData: string): string {
  const to = toAddress.toLowerCase()

  // Known marketplace contract addresses
  const KNOWN_MARKETPLACES: Record<string, string> = {
    // FortunaSquare
    [process.env.NEXT_PUBLIC_FORTUNA_MARKETPLACE_ADDRESS?.toLowerCase() || ""]: "Fortuna Square",

    // OpenSea Seaport
    "0x00000000000000adc04c56bf30ac9d3c0aaf14dc": "OpenSea (Seaport)",
    "0x00000000006c3852cbef3e08e8df289169ede581": "OpenSea (Seaport 1.1)",

    // LooksRare
    "0x59728544b08ab483533076417fbbb2fd0b17ce3a": "LooksRare",

    // Blur
    "0x000000000000ad05ccc4f10045630fb830b95127": "Blur",

    // Magic Eden
    "0x3634e984ba0373cfa178986fd19f03ba4dd8e469": "Magic Eden",
  }

  if (KNOWN_MARKETPLACES[to]) {
    return KNOWN_MARKETPLACES[to]
  }

  // If not a known marketplace but has input data, likely a smart contract sale
  if (inputData && inputData.length > 10) {
    return "Unknown Marketplace"
  }

  // Direct wallet-to-wallet transfer with payment
  return "Direct Transfer"
}

/**
 * Get complete sale history for an NFT across ALL marketplaces
 * Analyzes Transfer events + transaction values to detect sales
 */
export async function getAllSaleHistory(
  contractAddress: string,
  tokenId: string,
  chainId: number
): Promise<SaleRecord[]> {
  try {
    const sales: SaleRecord[] = []
    const chain = defineChain(chainId)

    console.log(`🔍 [CrossMarketplace] Fetching sale history for NFT ${contractAddress}/${tokenId}...`)

    // 1. Get NFT contract
    const nftContract = getContract({
      client,
      chain,
      address: contractAddress,
    })

    // 2. Fetch Transfer events
    const transferEvent = prepareEvent({
      signature: "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)"
    })

    const transferEvents = await getContractEvents({
      contract: nftContract,
      events: [transferEvent],
    })

    console.log(`📊 [CrossMarketplace] Found ${transferEvents.length} total Transfer events`)

    // 3. Filter for this specific tokenId (exclude mints from 0x0)
    const relevantTransfers = transferEvents
      .filter(event =>
        event.args?.tokenId?.toString() === tokenId &&
        event.args?.from !== "0x0000000000000000000000000000000000000000"
      )
      .sort((a, b) => Number(b.blockNumber || 0) - Number(a.blockNumber || 0)) // Most recent first

    console.log(`🔍 [CrossMarketplace] Found ${relevantTransfers.length} transfers for this NFT (excluding mint)`)

    // 4. Get RPC client
    const rpcClient = getRpcClient({ client, chain })

    // 5. Analyze each transfer for sale indicators
    for (const transfer of relevantTransfers) {
      try {
        const tx = await eth_getTransactionByHash(rpcClient, {
          hash: transfer.transactionHash as `0x${string}`
        })

        // If transaction has value > 0, it's a sale (native token payment)
        if (tx.value && tx.value > 0n) {
          const marketplace = detectMarketplace(tx.to || "", tx.input || "")

          sales.push({
            price: (Number(tx.value) / 1e18).toFixed(4),
            priceWei: tx.value,
            marketplace,
            from: transfer.args.from,
            to: transfer.args.to,
            timestamp: new Date(Number(transfer.blockTimestamp || 0) * 1000),
            txHash: transfer.transactionHash,
            blockNumber: Number(transfer.blockNumber || 0),
          })

          console.log(`💰 [CrossMarketplace] Found sale: ${(Number(tx.value) / 1e18).toFixed(4)} APE via ${marketplace}`)
        }
      } catch (error) {
        console.warn(`⚠️ [CrossMarketplace] Could not fetch tx ${transfer.transactionHash}:`, error)
      }
    }

    console.log(`✅ [CrossMarketplace] Found ${sales.length} sales for NFT ${contractAddress}/${tokenId}`)
    return sales

  } catch (error) {
    console.error("❌ [CrossMarketplace] Error fetching sale history:", error)
    return []
  }
}

/**
 * Get the most recent sale price from any marketplace
 * This includes FortunaSquare, OpenSea, direct transfers, and all other platforms
 */
export async function getLastSalePriceCrossMarketplace(
  contractAddress: string,
  tokenId: string,
  chainId: number
): Promise<string | null> {
  const sales = await getAllSaleHistory(contractAddress, tokenId, chainId)

  if (sales.length === 0) {
    console.log(`📊 [CrossMarketplace] No sales found for NFT ${contractAddress}/${tokenId}`)
    return null
  }

  // Sales are already sorted by most recent first
  console.log(`✅ [CrossMarketplace] Last sale: ${sales[0].price} APE via ${sales[0].marketplace}`)
  return sales[0].price
}

/**
 * Format sale record for display
 */
export function formatSaleRecord(sale: SaleRecord): string {
  const date = sale.timestamp.toLocaleDateString()
  return `${sale.price} APE • ${sale.marketplace} • ${date}`
}
