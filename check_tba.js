const { createThirdwebClient } = require("thirdweb");
const { getContract } = require("thirdweb");
const { readContract } = require("thirdweb");
const { apeChainCurtis } = require("thirdweb/chains");

async function checkTBA() {
  const client = createThirdwebClient({
    clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID,
  });

  const tbaAddress = "0x41C8f39463A868d3A88af00cd0fe7102F30E44eC"; // Curtis implementation
  
  console.log("Checking TBA implementation at:", tbaAddress);
  console.log("\nFetching bytecode...");
  
  // Check if it has bytecode
  const response = await fetch(`https://curtis.explorer.caldera.xyz/api?module=contract&action=getabi&address=${tbaAddress}`);
  const data = await response.json();
  
  console.log("API response:", JSON.stringify(data, null, 2));
}

checkTBA().catch(console.error);
