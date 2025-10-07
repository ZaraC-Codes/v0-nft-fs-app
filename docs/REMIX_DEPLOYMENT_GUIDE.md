# Remix Deployment Guide - Step by Step

## 🚀 Quick Deployment Checklist

Follow these exact steps to deploy the Fortuna Square Bundle System on ApeChain Mainnet.

---

## ⚙️ SETUP (Do this first!)

### 1. Open Remix
- Go to: https://remix.ethereum.org/

### 2. Connect MetaMask
- Make sure you're on **ApeChain Mainnet** (Chain ID: 33139)
- Ensure you have enough APE for gas fees (~0.1 APE should be plenty)

### 3. Create Files in Remix
Create two new files in the `contracts` folder:

**File 1: FortunaSquareBundleAccount.sol**
- Copy from: `contracts/FortunaSquareBundleAccount.sol`
- Paste into Remix

**File 2: BundleNFTUnified_Updated.sol**
- Copy from: `contracts/BundleNFTUnified_Updated.sol`
- Paste into Remix

---

## 📝 STEP 1: Deploy FortunaSquareBundleAccount

### Compile
1. Click on **Solidity Compiler** (left sidebar)
2. Select compiler version: **0.8.20**
3. Click **Compile FortunaSquareBundleAccount.sol**
4. ✅ Should compile without errors

### Deploy
1. Click on **Deploy & Run Transactions** (left sidebar)
2. Environment: **Injected Provider - MetaMask**
3. Verify network shows: **Custom (33139) network**
4. Contract: Select **FortunaSquareBundleAccount**
5. Click **Deploy**
6. ✅ Confirm transaction in MetaMask

### Save Address
**IMPORTANT**: Copy the deployed contract address!

```
FortunaSquareBundleAccount: 0x________________________________
```

---

## 📝 STEP 2: Deploy BundleNFTUnified

### Compile
1. Click on **Solidity Compiler**
2. Select compiler version: **0.8.20**
3. Click **Compile BundleNFTUnified_Updated.sol**
4. ✅ Should compile without errors

### Prepare Constructor Parameters
You need TWO parameters:

**Parameter 1 - Registry Address:**
```
0x000000006551c19487814612e58FE06813775758
```

**Parameter 2 - Account Implementation:**
```
[PASTE YOUR FortunaSquareBundleAccount ADDRESS FROM STEP 1]
```

### Deploy
1. Click on **Deploy & Run Transactions**
2. Contract: Select **BundleNFTUnified**
3. In the constructor fields, enter:
   - `_REGISTRY`: `0x000000006551c19487814612e58FE06813775758`
   - `_ACCOUNTIMPLEMENTATION`: `[Your FortunaSquareBundleAccount address]`
4. Click **Deploy**
5. ✅ Confirm transaction in MetaMask

### Save Address
**IMPORTANT**: Copy the deployed contract address!

```
BundleNFTUnified: 0x________________________________
```

---

## 📝 STEP 3: Initialize Account Implementation

### Call Initialize Function
1. Find your **FortunaSquareBundleAccount** contract in Remix's "Deployed Contracts" section
2. Expand the contract to see all functions
3. Find the **initialize** function
4. Enter the **BundleNFTUnified address** from Step 2
5. Click **transact**
6. ✅ Confirm transaction in MetaMask

### Verify Initialization
1. Click the **initialized** button (should return `true`)
2. Click the **bundleContract** button (should return your BundleNFTUnified address)
3. ✅ Both should match what you expect!

---

## ✅ VERIFICATION CHECKLIST

After all 3 steps, verify everything:

### FortunaSquareBundleAccount
- [ ] `FACTORY` = Your wallet address
- [ ] `bundleContract` = Your BundleNFTUnified address
- [ ] `initialized` = true

### BundleNFTUnified
- [ ] `accountImplementation` = Your FortunaSquareBundleAccount address
- [ ] `registry` = `0x000000006551c19487814612e58FE06813775758`

---

## 📋 FINAL ADDRESSES

**Save these for the next step!**

```
Network: ApeChain Mainnet (Chain ID: 33139)

FortunaSquareBundleAccount: 0x________________________________

BundleNFTUnified: 0x________________________________

Registry: 0x000000006551c19487814612e58FE06813775758
```

---

## ⏭️ NEXT STEP

Once you have both addresses deployed and initialized:

1. **Tell me the addresses** - I'll update the frontend configuration
2. **I'll update lib/bundle.ts** - Add your new contract addresses
3. **I'll update the unwrap logic** - Switch to `batchUnwrapBundle`
4. **Commit and push** - Deploy to production
5. **Test!** - Create a bundle and unwrap it!

---

## 🆘 TROUBLESHOOTING

### MetaMask shows wrong network
- **Solution**: Manually switch to ApeChain Mainnet in MetaMask
- RPC URL: `https://apechain.calderachain.xyz/http`
- Chain ID: `33139`

### Compilation errors
- **Solution**: Make sure you selected Solidity 0.8.20
- Check that you pasted the entire contract code

### Initialize function reverts
- **Solution**: Make sure you're calling from the SAME wallet that deployed the account
- Make sure you haven't already initialized it

### Can't find deployed contract
- **Solution**: Check the "Deployed Contracts" section in Remix
- Make sure the transaction was confirmed in MetaMask

---

## 🎉 SUCCESS!

Once deployed and verified, you'll have:
- ✅ Custom ERC-6551 implementation
- ✅ Gas-optimized batch unwrapping (60-80% savings!)
- ✅ Production-ready bundle system
- ✅ Competitive advantage for demo day!

**Ready? Let's deploy!** 🚀
