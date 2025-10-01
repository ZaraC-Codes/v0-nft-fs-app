import { NextRequest, NextResponse } from 'next/server'

const THIRDWEB_CLIENT_ID = process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID || '67ac338a3f1dda0f31634dcb98e3ef8c'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const address = searchParams.get('address')
  const chainId = searchParams.get('chainId')

  if (!address) {
    return NextResponse.json({ error: 'Wallet address is required' }, { status: 400 })
  }

  if (!chainId) {
    return NextResponse.json({ error: 'Chain ID is required' }, { status: 400 })
  }

  try {
    console.log(`Fetching NFTs for address ${address} on chain ${chainId}`)

    // Call ThirdWeb API to get wallet NFTs
    const thirdwebUrl = `https://api.thirdweb.com/v1/wallets/${address}/nfts?chainId=${chainId}`

    const response = await fetch(thirdwebUrl, {
      headers: {
        'x-client-id': THIRDWEB_CLIENT_ID,
      },
    })

    if (!response.ok) {
      throw new Error(`ThirdWeb API error: ${response.statusText}`)
    }

    const data = await response.json()
    console.log('ThirdWeb API response:', JSON.stringify(data, null, 2))

    // Handle different response structures
    let nftData = []
    if (Array.isArray(data)) {
      nftData = data
    } else if (data.result?.nfts && Array.isArray(data.result.nfts)) {
      nftData = data.result.nfts
    } else if (data.result && Array.isArray(data.result)) {
      nftData = data.result
    } else if (data.data && Array.isArray(data.data)) {
      nftData = data.data
    } else {
      console.error('Unexpected response format:', data)
      return NextResponse.json({ nfts: [], error: 'Unexpected API response format' })
    }

    // Map the response to our format
    const nfts = nftData.map((nft: any) => ({
      contractAddress: nft.contractAddress || nft.contract_address || nft.token_address,
      tokenId: nft.tokenId || nft.token_id,
      name: nft.metadata?.name || nft.name || `Token #${nft.tokenId || nft.token_id}`,
      image: nft.metadata?.image || nft.image_url || nft.image || nft.metadata?.animation_url,
      collectionName: nft.contract?.name || nft.collection?.name || 'Unknown Collection',
      chainId: nft.chain_id || nft.chainId || parseInt(chainId),
      metadata: nft.metadata,
    }))

    return NextResponse.json({ nfts })
  } catch (error) {
    console.error('Error fetching wallet NFTs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch NFTs', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}