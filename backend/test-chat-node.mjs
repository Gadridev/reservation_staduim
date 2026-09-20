// test-chat-node.mjs
import { io } from "socket.io-client";

const PLAYER_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2YTZkMjA2ODVmMzhmZWE3YjdiMzY3NjEiLCJpYXQiOjE3ODc5MTkxNTksImV4cCI6MTc4ODUyMzk1OX0._8Irc_nC6DBWzcVlx2s2qX_YcdBZ6CdviUKFyp0vw14";
const OWNER_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2YTY3YmJlMmI2MTcxY2FmM2M3YzNkOTUiLCJpYXQiOjE3ODc5MTkzMjMsImV4cCI6MTc4ODUyNDEyM30.4A6JHArtnW8ugFfBLnxjf4zt8CMCC-wg40P3-8eSIbg";
const CONVERSATION_ID = "6a917c2d3b81b93b7b1a16e1";

function createClient(name, token) {
  const socket = io("http://localhost:5000", {
    auth: { token },
    transports: ["websocket"],
  });

  socket.on("connect", () => console.log(`[${name}] ✅ connected`));
  socket.on("connect_error", (err) => console.log(`[${name}] ❌ connect_error:`, err.message));
  socket.on("joined_conversation", (d) => console.log(`[${name}] ✅ joined`, d));
  socket.on("new_message", (m) => console.log(`[${name}] 💬 new_message:`, m));
  socket.on("socket_error", (e) => console.log(`[${name}] ⚠️ socket_error:`, e));

  return socket;
}

const player = createClient("PLAYER", PLAYER_TOKEN);
const owner = createClient("OWNER", OWNER_TOKEN);

setTimeout(() => {
  player.emit("join_conversation", { conversationId: CONVERSATION_ID });
  owner.emit("join_conversation", { conversationId: CONVERSATION_ID });
}, 1000);

setTimeout(() => {
  player.emit("send_message", { conversationId: CONVERSATION_ID, content: "Hello from player!" });
}, 2000);

setTimeout(() => {
  owner.emit("send_message", { conversationId: CONVERSATION_ID, content: "Hi, yes it's available!" });
}, 3000);

setTimeout(() => process.exit(0), 5000);