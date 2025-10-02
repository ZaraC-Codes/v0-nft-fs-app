#!/bin/bash

# Calculate timestamps
CURRENT_TIMESTAMP=$(date +%s)
END_TIMESTAMP=$((CURRENT_TIMESTAMP + 2592000))  # 30 days

echo "Testing marketplace createListing..."
echo "Current timestamp: $CURRENT_TIMESTAMP"
echo "End timestamp: $END_TIMESTAMP"

# Try to create a listing via ThirdWeb API
curl -X POST "https://api.thirdweb.com/v1/contracts/write" \
  -H "Content-Type: application/json" \
  -H "x-secret-key: y9Y-BCEc2dmbGKd4e6F2Hc9Nlenv27sI5KhfhppQRaom5PPY4dWoh9g3EQbfL8QGjATaeUixs6pTNkhF3RHOKQ" \
  -d "{
    \"calls\": [{
      \"contractAddress\": \"0x33260E456B36F27DDdcB5F296F8E4F1f4C66Cbc9\",
      \"method\": \"function createListing((address assetContract, uint256 tokenId, uint256 quantity, address currency, uint256 pricePerToken, uint128 startTimestamp, uint128 endTimestamp, bool reserved) _params) returns (uint256 listingId)\",
      \"params\": [{
        \"assetContract\": \"0x18fad47bf1f2d17d489f46f49ad3caac592317b4\",
        \"tokenId\": \"0\",
        \"quantity\": \"1\",
        \"currency\": \"0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE\",
        \"pricePerToken\": \"1000000000000000000\",
        \"startTimestamp\": \"$CURRENT_TIMESTAMP\",
        \"endTimestamp\": \"$END_TIMESTAMP\",
        \"reserved\": false
      }]
    }],
    \"chainId\": 33111,
    \"from\": \"0x33946f623200f60e5954b78aaa9824ad29e5928c\"
  }"
