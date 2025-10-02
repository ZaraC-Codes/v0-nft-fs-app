import { createThirdwebClient, getContract, readContract } from "thirdweb";
import { defineChain } from "thirdweb/chains";

const client = createThirdwebClient({
  secretKey: process.env.THIRDWEB_SECRET_KEY!,
});

const apeChainCurtis = defineChain(33111);

const marketplace = getContract({
  client,
  chain: apeChainCurtis,
  address: "0x33260E456B36F27DDdcB5F296F8E4F1f4C66Cbc9",
});

const LISTER_ROLE = "0xf94103142c1baabe9ac2b5d1487bf783de9e69cfeea9a72f5c9c94afd7877b8c";
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
const YOUR_WALLET = "0x33946f623200f60e5954b78aaa9824ad29e5928c";

async function checkRoles() {
  console.log("Checking LISTER_ROLE on marketplace contract...\n");

  // Check if LISTER_ROLE is open to everyone
  const isOpen = await readContract({
    contract: marketplace,
    method: "function hasRole(bytes32 role, address account) view returns (bool)",
    params: [LISTER_ROLE, ZERO_ADDRESS],
  });

  console.log("1. Is LISTER_ROLE open to everyone (granted to address(0))?");
  console.log("   Result:", isOpen);
  console.log("");

  // Check if your wallet has LISTER_ROLE
  const yourRole = await readContract({
    contract: marketplace,
    method: "function hasRole(bytes32 role, address account) view returns (bool)",
    params: [LISTER_ROLE, YOUR_WALLET],
  });

  console.log("2. Does your wallet have LISTER_ROLE?");
  console.log("   Wallet:", YOUR_WALLET);
  console.log("   Result:", yourRole);
  console.log("");

  // Conclusion
  if (isOpen || yourRole) {
    console.log("✅ You have permission to create listings!");
  } else {
    console.log("❌ YOU DON'T HAVE PERMISSION TO CREATE LISTINGS!");
    console.log("");
    console.log("This is why you're getting the 'not owner or approved tokens' error.");
    console.log("The marketplace contract has role-based access control enabled.");
    console.log("");
    console.log("To fix this, you need to grant yourself the LISTER_ROLE:");
    console.log("1. Go to the marketplace contract in ThirdWeb dashboard");
    console.log("2. Find the 'grantRole' function");
    console.log("3. Call it with:");
    console.log("   - role:", LISTER_ROLE);
    console.log("   - account:", YOUR_WALLET);
  }
}

checkRoles().catch(console.error);
