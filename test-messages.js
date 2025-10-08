const { getContract, readContract } = require("thirdweb");
const { createThirdwebClient, defineChain } = require("thirdweb");

const client = createThirdwebClient({
  clientId: "67ac338a3f1dda0f31634dcb98e3ef8c",
});

const apeChain = defineChain(33139);
const CHAT_RELAY_ADDRESS = "0xC75255aB6eeBb6995718eBa64De276d5B110fb7f";
const groupId = BigInt("1404715513623252054");

async function testMessages() {
  console.log("Testing GroupChatRelay contract messages...");
  console.log("Contract:", CHAT_RELAY_ADDRESS);
  console.log("GroupId:", groupId.toString());
  console.log("");

  try {
    const contract = getContract({
      client,
      chain: apeChain,
      address: CHAT_RELAY_ADDRESS,
    });

    const messages = await readContract({
      contract,
      method: {
        type: "function",
        name: "getGroupMessages",
        inputs: [{ name: "groupId", type: "uint256", internalType: "uint256" }],
        outputs: [{
          name: "",
          type: "tuple[]",
          internalType: "struct GroupChatRelay.Message[]",
          components: [
            { name: "id", type: "uint256", internalType: "uint256" },
            { name: "groupId", type: "uint256", internalType: "uint256" },
            { name: "sender", type: "address", internalType: "address" },
            { name: "content", type: "string", internalType: "string" },
            { name: "timestamp", type: "uint256", internalType: "uint256" },
            { name: "messageType", type: "uint8", internalType: "enum GroupChatRelay.MessageType" },
            { name: "isBot", type: "bool", internalType: "bool" }
          ]
        }],
        stateMutability: "view"
      },
      params: [groupId],
    });

    console.log("✅ Messages fetched successfully!");
    console.log("Total messages:", messages.length);
    console.log("");
    
    messages.forEach((msg, i) => {
      console.log(`Message ${i + 1}:`);
      console.log("  ID:", msg.id.toString());
      console.log("  Sender:", msg.sender);
      console.log("  Content:", msg.content);
      console.log("  Timestamp:", new Date(Number(msg.timestamp) * 1000).toISOString());
      console.log("  Type:", msg.messageType);
      console.log("  IsBot:", msg.isBot);
      console.log("");
    });
  } catch (error) {
    console.error("❌ Error:", error.message);
    if (error.message.includes("execution reverted")) {
      console.log("⚠️ This likely means there are no messages for this group yet.");
    }
  }
}

testMessages();
