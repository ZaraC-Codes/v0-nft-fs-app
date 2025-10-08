// Quick test to verify GoldRush API is working
const GOLDRUSH_API_KEY = process.env.NEXT_PUBLIC_GOLDRUSH_API_KEY

async function testGoldRush() {
  console.log('Testing GoldRush API...')
  console.log('API Key configured:', !!GOLDRUSH_API_KEY)

  if (!GOLDRUSH_API_KEY) {
    console.error('❌ No GoldRush API key found in environment')
    return
  }

  const contractAddress = '0xb3443b6bd585ba4118cae2bedb61c7ec4a8281df' // Gs on Ape
  const chainName = 'apechain-mainnet'

  try {
    const response = await fetch(
      `https://api.covalenthq.com/v1/${chainName}/nft/${contractAddress}/metadata/`,
      {
        headers: {
          'Authorization': `Bearer ${GOLDRUSH_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    )

    console.log('Response status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ GoldRush API error:', errorText)
      return
    }

    const data = await response.json()
    console.log('✅ GoldRush API working!')
    console.log('Collection data:', JSON.stringify(data, null, 2))
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

testGoldRush()
