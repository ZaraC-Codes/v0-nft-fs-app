'use client'

import { useState } from 'react'
import { useActiveAccount } from 'thirdweb/react'
import { TransactionButton } from 'thirdweb/react'
import { prepareContractCall } from 'thirdweb'
import { getContract } from 'thirdweb'
import { client, apeChainCurtis } from '@/lib/thirdweb'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { Header } from '@/components/header'

export default function MintPage() {
  const account = useActiveAccount()
  const { toast } = useToast()
  const [erc721TokenId, setErc721TokenId] = useState('')
  const [erc1155TokenId, setErc1155TokenId] = useState('')
  const [erc1155Amount, setErc1155Amount] = useState('1')

  // ThirdWeb deployed NFT contracts on ApeChain Curtis
  const ERC721_CONTRACT = '0x85b5C89aB85bc318aAD14f4c5dea50C07ce93512'
  const ERC1155_CONTRACT = '0xd2dcb01A92897f66a46e2C46fEC6D2BE0Fd2Fa19'

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-gray-900">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Mint Test NFTs</h1>
            <p className="text-gray-400">Create test NFTs for marketplace testing</p>
          </div>

          {!account && (
            <Card className="glass-card border-purple-500/20">
              <CardContent className="pt-6">
                <p className="text-center text-gray-400">
                  Please connect your wallet to mint NFTs
                </p>
              </CardContent>
            </Card>
          )}

          {account && (
            <div className="grid md:grid-cols-2 gap-6">
              {/* ERC721 Minting */}
              <Card className="glass-card border-purple-500/20">
                <CardHeader>
                  <CardTitle className="text-white">Mint ERC721 NFT</CardTitle>
                  <CardDescription>Single edition NFT</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">Token ID</label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={erc721TokenId}
                      onChange={(e) => setErc721TokenId(e.target.value)}
                      className="bg-gray-800/50 border-gray-700"
                    />
                  </div>

                  <TransactionButton
                      transaction={() => {
                        const contract = getContract({
                          client,
                          chain: apeChainCurtis,
                          address: ERC721_CONTRACT,
                        })

                        // ThirdWeb's TokenERC721 uses mintTo(address, string uri)
                        return prepareContractCall({
                          contract,
                          method: 'function mintTo(address to, string uri) returns (uint256)',
                          params: [account.address, `ipfs://test-${Date.now()}`],
                        })
                      }}
                      onTransactionConfirmed={() => {
                        toast({
                          title: 'Minted!',
                          description: `Successfully minted ERC721 NFT!`,
                        })
                      }}
                      onError={(error) => {
                        toast({
                          title: 'Mint Failed',
                          description: error.message,
                          variant: 'destructive',
                        })
                      }}
                      className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                    >
                      Mint ERC721
                    </TransactionButton>

                  <p className="text-xs text-gray-500 text-center">
                    Single-edition NFT (quantity: 1)
                  </p>
                </CardContent>
              </Card>

              {/* ERC1155 Minting */}
              <Card className="glass-card border-blue-500/20">
                <CardHeader>
                  <CardTitle className="text-white">Mint ERC1155 NFT</CardTitle>
                  <CardDescription>Multi-edition NFT</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">Token ID</label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={erc1155TokenId}
                      onChange={(e) => setErc1155TokenId(e.target.value)}
                      className="bg-gray-800/50 border-gray-700"
                    />
                  </div>

                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">Amount</label>
                    <Input
                      type="number"
                      placeholder="1"
                      value={erc1155Amount}
                      onChange={(e) => setErc1155Amount(e.target.value)}
                      className="bg-gray-800/50 border-gray-700"
                    />
                  </div>

                  <TransactionButton
                      transaction={() => {
                        const contract = getContract({
                          client,
                          chain: apeChainCurtis,
                          address: ERC1155_CONTRACT,
                        })

                        // ThirdWeb's TokenERC1155 uses mintTo(address, uint256 tokenId, string uri, uint256 amount)
                        return prepareContractCall({
                          contract,
                          method: 'function mintTo(address to, uint256 tokenId, string uri, uint256 amount) returns (uint256)',
                          params: [account.address, BigInt(erc1155TokenId || '0'), `ipfs://test-1155-${Date.now()}`, BigInt(erc1155Amount || '1')],
                        })
                      }}
                      onTransactionConfirmed={() => {
                        toast({
                          title: 'Minted!',
                          description: `Successfully minted ${erc1155Amount}x ERC1155 token #${erc1155TokenId}`,
                        })
                        setErc1155TokenId('')
                        setErc1155Amount('1')
                      }}
                      onError={(error) => {
                        toast({
                          title: 'Mint Failed',
                          description: error.message,
                          variant: 'destructive',
                        })
                      }}
                      className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
                    >
                      Mint ERC1155
                    </TransactionButton>

                  <p className="text-xs text-gray-500 text-center">
                    Multi-edition NFT (quantity: customizable)
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          <Card className="glass-card border-yellow-500/20">
            <CardHeader>
              <CardTitle className="text-white">Setup Instructions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-gray-400">
              <div>
                <h4 className="text-white font-semibold mb-2">1. Deploy Test Contracts</h4>
                <p>You need to deploy simple ERC721 and ERC1155 contracts. Use ThirdWeb's deploy command:</p>
                <code className="block bg-gray-800 p-2 rounded mt-2 text-xs">
                  npx thirdweb deploy
                </code>
              </div>

              <div>
                <h4 className="text-white font-semibold mb-2">2. Update Contract Addresses</h4>
                <p>After deployment, update the contract addresses in <code>app/mint/page.tsx</code></p>
              </div>

              <div>
                <h4 className="text-white font-semibold mb-2">3. Mint NFTs</h4>
                <p>Use this page to mint test NFTs that you can list on the marketplace</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
