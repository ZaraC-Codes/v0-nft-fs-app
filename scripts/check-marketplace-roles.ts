import { createThirdwebClient, getContract, readContract } from "thirdweb";
import { apeChainCurtis } from "../lib/thirdweb";
import { keccak256, toHex } from "thirdweb/utils";

const client = createThirdwebClient({
  clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID!,
});

const marketplaceAddress = "0x33260E456B36F27DDdcB5F296F8E4F1f4C66Cbc9";
const yourWallet = "0x33946f623200f60e5954b78aaa9824ad29e5928c";

async function checkRoles() {
  const marketplace = getContract({
    client,
    chain: apeChainCurtis,
    address: marketplaceAddress,
  });

  // Calculate role hashes
  const LISTER_ROLE = keccak256(toHex("LISTER_ROLE"));
  const ASSET_ROLE = keccak256(toHex("ASSET_ROLE"));
  const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

  console.log("Checking marketplace roles...");
  console.log("Marketplace:", marketplaceAddress);
  console.log("Your wallet:", yourWallet);
  console.log("");

  try {
    // Check if LISTER_ROLE is open (granted to address(0))
    const listerRoleOpen = await readContract({
      contract: marketplace,
      method: "function hasRole(bytes32 role, address account) view returns (bool)",
      params: [LISTER_ROLE, ZERO_ADDRESS],
    });

    console.log("LISTER_ROLE granted to address(0):", listerRoleOpen);

    // Check if your wallet has LISTER_ROLE
    const yourListerRole = await readContract({
      contract: marketplace,
      method: "function hasRole(bytes32 role, address account) view returns (bool)",
      params: [LISTER_ROLE, yourWallet],
    });

    console.log("Your wallet has LISTER_ROLE:", yourListerRole);
    console.log("");

    // Check if ASSET_ROLE is open
    const assetRoleOpen = await readContract({
      contract: marketplace,
      method: "function hasRole(bytes32 role, address account) view returns (bool)",
      params: [ASSET_ROLE, ZERO_ADDRESS],
    });

    console.log("ASSET_ROLE granted to address(0):", assetRoleOpen);

    // Check if your NFT contract has ASSET_ROLE
    const nftContract = "0x85b5c89ab85bc318aad14f4c5dea50c07ce93512";
    const nftAssetRole = await readContract({
      contract: marketplace,
      method: "function hasRole(bytes32 role, address account) view returns (bool)",
      params: [ASSET_ROLE, nftContract],
    });

    console.log("NFT contract has ASSET_ROLE:", nftAssetRole);
    console.log("");

    if (!listerRoleOpen && !yourListerRole) {
      console.log("❌ PROBLEM: You don't have LISTER_ROLE and it's not open!");
      console.log("   You need to be granted LISTER_ROLE by the marketplace admin.");
    }

    if (!assetRoleOpen && !nftAssetRole) {
      console.log("❌ PROBLEM: NFT contract doesn't have ASSET_ROLE and it's not open!");
      console.log("   The NFT contract needs to be granted ASSET_ROLE by the marketplace admin.");
    }

    if ((listerRoleOpen || yourListerRole) && (assetRoleOpen || nftAssetRole)) {
      console.log("✅ You have all required roles to list NFTs!");
    }
  } catch (error) {
    console.error("Error checking roles:", error);
  }
}

checkRoles();
