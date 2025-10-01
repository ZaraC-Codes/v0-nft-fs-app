# Quick Start: Deploy Rental Contracts

## Prerequisites

- Private key added to `.env.local` (already done ✅)
- Testnet funds in your wallet

## Deploy Rental Contracts

```bash
# Deploy to ApeChain Curtis
npx hardhat run scripts/deploy-rentals.ts --network apechain_curtis

# OR deploy to Sepolia
npx hardhat run scripts/deploy-rentals.ts --network sepolia
```

## Update Frontend

After deployment, copy the addresses and update `lib/rental.ts`:

```typescript
export const RENTAL_CONTRACT_ADDRESSES = {
  [apeChainCurtis.id]: {
    rentalWrapper: "PASTE_YOUR_RENTAL_WRAPPER_ADDRESS",
    rentalManager: "PASTE_YOUR_RENTAL_MANAGER_ADDRESS",
    erc6551Registry: "0x000000006551c19487814612e58FE06813775758",
    accountImplementation: "0xaaf75c1727304f0990487517b5eb1c961b7dfade",
  },
};
```

## Test It!

1. Restart dev server: `pnpm run dev`
2. Go to your profile at http://localhost:3000
3. Click "Wrap for Rental"
4. Select an NFT, set rental terms, and wrap it
5. The wrapper NFT appears in your portfolio
6. Others can now rent it!

---

## How Rental System Works

### For NFT Owners:

#### 1. Wrap NFT for Rental
- **What happens**: Your NFT is transferred to a Token Bound Account (TBA)
- **What you get**: An ERC4907 wrapper NFT in your wallet
- **NFT location**: Securely stored in the wrapper's TBA
- **You still own**: The wrapper NFT (and therefore the original NFT)

#### 2. Set Rental Terms
- **Price per Day**: How much to charge daily (in APE)
- **Min Duration**: Minimum rental period (1-365 days)
- **Max Duration**: Maximum rental period (1-365 days)
- **Example**: 0.1 APE/day, min 3 days, max 30 days

#### 3. Earn from Rentals
- **You receive**: Rental payment directly (minus 2.5% platform fee)
- **Payment timing**: Upfront when someone rents
- **Rental count**: Track total rentals and earnings

#### 4. After Rental
- **Re-rent**: Keep wrapper and list again (no extra gas)
- **Unwrap**: Retrieve original NFT, burn wrapper NFT

### For Renters:

#### 1. Find Rental
- Browse available rental listings
- See price, duration limits, and terms
- Check NFT metadata (mirrors original)

#### 2. Rent NFT
- Choose rental duration (within owner's limits)
- Pay total cost = (price × days) + 2.5% platform fee
- Get temporary `userOf()` rights via ERC4907

#### 3. During Rental
- **You have**: Temporary usage rights for the duration
- **You can**: Use NFT in apps that check ERC4907 `userOf()`
- **You cannot**: Sell, transfer, or keep after expiration
- **Automatic expiry**: Rights removed after rental period

#### 4. After Expiration
- Your `userOf()` rights automatically expire
- No action needed from you
- Owner can re-rent or unwrap

---

## Technical Details

### ERC4907 + ERC6551 Architecture

```
Original NFT (any ERC721)
    ↓ transferred to
Token Bound Account (TBA)
    ↑ owned by
Wrapper NFT (ERC4907 + ERC721)
    ├─ ownerOf() → Owner (permanent)
    └─ userOf() → Renter (temporary)
```

### Key Features

✅ **Works with ANY NFT** - Not just ERC4907 tokens
✅ **Secure Storage** - Original NFT in TBA
✅ **Standard Compliant** - Real ERC4907 wrapper
✅ **Owner Protection** - Cannot lose NFT
✅ **Renter Protection** - Cannot be evicted early
✅ **Automatic Expiry** - No manual intervention needed

### Smart Contracts

**RentalWrapper.sol (ERC721 + ERC4907)**
- Mints wrapper NFTs
- Implements ERC4907 user rights
- Prevents transfer while rented
- Stores rental terms

**RentalManager.sol**
- Wraps NFTs (creates TBA, transfers original)
- Handles rentals (payments, setUser)
- Unwraps NFTs (returns original, burns wrapper)
- 2.5% platform fee

**IERC4907.sol**
- Standard ERC4907 interface
- `setUser(tokenId, user, expires)`
- `userOf(tokenId)` returns current renter
- `userExpires(tokenId)` returns expiry timestamp

---

## Platform Support

### Where Rentals Work:

✅ **Your Platform** - Full support
✅ **Apps checking ERC4907** - Growing adoption
✅ **Wallets** - Wrapper displays like normal NFT
⚠️  **Other Platforms** - Limited (most check `ownerOf()` only)

### For Maximum Utility:

1. Build integrations checking `userOf()`
2. Partner with platforms supporting ERC4907
3. Educate renters on where they can use rentals
4. Focus on use cases where rental makes sense:
   - Gaming NFTs (skins, weapons, characters)
   - Metaverse land/assets
   - Event tickets
   - Access passes

---

## Troubleshooting

**"Only rental manager can mint"**
→ Make sure contracts are properly linked after deployment

**"Cannot unwrap while rented"**
→ Wait for rental period to expire first

**"Invalid duration"**
→ Duration must be between minDays and maxDays

**"Insufficient payment"**
→ Make sure to pay: (pricePerDay × days) + 2.5% fee

**"Contract not approved"**
→ Approve the RentalManager contract for your NFT first

---

## Example User Flow

### Owner Flow:
```
1. Own CryptoPunk #1234
2. Click "Wrap for Rental"
3. Set: 0.5 APE/day, 1-30 days
4. Approve & Wrap
5. Get Wrapper NFT #1
6. Someone rents for 7 days
7. Receive: 3.4125 APE (3.5 APE - 2.5% fee)
8. After 7 days: Can re-rent or unwrap
```

### Renter Flow:
```
1. Browse rentals
2. Find Wrapper NFT #1 (contains CryptoPunk #1234)
3. Rent for 7 days
4. Pay: 3.5875 APE total
5. Get userOf() rights for 7 days
6. Use in games/apps checking ERC4907
7. After 7 days: Rights automatically expire
```

---

## Future Enhancements

### Phase 2:
- Rental marketplace page
- Search/filter rentals
- Rental history tracking
- Reputation system

### Phase 3:
- Delegate.cash integration (broader platform support)
- Rental extensions
- Rental bundles (rent multiple NFTs together)
- Dynamic pricing (peak/off-peak)

### Phase 4:
- Rental auctions
- Revenue sharing for collections
- Cross-chain rentals
- Rental insurance

---

For complete technical documentation, see: `contracts/RentalWrapper.sol` and `contracts/RentalManager.sol`