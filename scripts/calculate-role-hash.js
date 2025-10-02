const { keccak256, toUtf8Bytes } = require('ethers');

// Calculate LISTER_ROLE hash
const LISTER_ROLE = keccak256(toUtf8Bytes("LISTER_ROLE"));
console.log("LISTER_ROLE hash:", LISTER_ROLE);

// Calculate ASSET_ROLE hash
const ASSET_ROLE = keccak256(toUtf8Bytes("ASSET_ROLE"));
console.log("ASSET_ROLE hash:", ASSET_ROLE);

// Calculate DEFAULT_ADMIN_ROLE (this is always 0x00...00)
console.log("DEFAULT_ADMIN_ROLE:", "0x0000000000000000000000000000000000000000000000000000000000000000");
