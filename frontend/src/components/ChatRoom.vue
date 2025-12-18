<template>
  <div class="chat-wrapper">
    <div v-if="!username" class="username-overlay">
      <div class="username-box">
        <div class="icon-circle">💬</div>
        <h2>Join MyChat</h2>
        <p>Enter a nickname to start chatting</p>
        <input
          v-model="tempName"
          placeholder="Nickname..."
          @keyup.enter="joinChat"
        />
        <button @click="joinChat" :disabled="!tempName.trim()">Join Now</button>
      </div>
    </div>

    <div v-else class="chat-container">
      <div class="chat-header">
        <div class="header-info">
          <span class="status-dot" :class="{ 'online': isConnected }"></span>
          <div>
            <div class="title">Global Chat Room</div>
            <div class="subtitle">{{ isConnected ? 'Online' : 'Connecting...' }}</div>
          </div>
        </div>
      </div>

      <div class="chat-body" ref="chatBody">
        <div
          v-for="(msg, index) in messages"
          :key="index"
          :class="msg.type === 'system' ? 'system-row' : ['message-row', msg.sender === myId ? 'me' : 'other']"
        >
          <div v-if="msg.type !== 'system'" class="bubble">
            <span v-if="msg.sender !== myId" class="sender-name">{{ msg.username }}</span>
            <p class="text">{{ msg.text }}</p>
            <span class="timestamp">{{ msg.time }}</span>
          </div>
          <div v-else class="system-inner">{{ msg.text }}</div>
        </div>
      </div>

      <div class="chat-input-area">
        <input
          v-model="message"
          placeholder="Type a message..."
          @keyup.enter="sendMessage"
          ref="messageInput"
        />
        <button @click="sendMessage" :disabled="!message.trim() || !isConnected">
          <svg viewBox="0 0 24 24" width="24" height="24">
            <path fill="currentColor" d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { io } from "socket.io-client"

export default {
  name: "ChatRoom",
  data() {
    return {
      socket: null,
      myId: null,
      username: "",
      tempName: "",
      message: "",
      messages: [],
      isConnected: false
    }
  },
  mounted() {
    // Fixed URL ending in 'cyx1' and forced websocket transport
    this.socket = io("https://mychat-cyx1.onrender.com", {
      transports: ["websocket"]
    })

    this.socket.on("connect", () => {
      this.isConnected = true;
      this.myId = this.socket.id;
    })

    this.socket.on("disconnect", () => {
      this.isConnected = false;
    })

    this.socket.on("chat", (msg) => {
      const now = new Date();
      msg.time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      this.messages.push(msg);
      this.scrollToBottom();
    })

    this.socket.on("system", (msg) => {
      this.messages.push({ ...msg, type: "system" });
      this.scrollToBottom();
    })
  },
  methods: {
    joinChat() {
      if (!this.tempName.trim()) return;
      this.username = this.tempName;
      this.socket.emit("join", this.username);
      this.$nextTick(() => {
        if (this.$refs.messageInput) this.$refs.messageInput.focus();
      })
    },
    sendMessage() {
      if (!this.message.trim()) return;
      this.socket.emit("chat", this.message);
      this.message = "";
    },
    scrollToBottom() {
      this.$nextTick(() => {
        const el = this.$refs.chatBody;
        if (el) el.scrollTop = el.scrollHeight;
      })
    }
  }
}
</script>

<style scoped>
.chat-wrapper {
  height: 100vh;
  background: #e5ddd5;
  display: flex;
  justify-content: center;
  align-items: center;
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
}

/* Login Overlay */
.username-overlay {
  background: white;
  padding: 40px;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  text-align: center;
  width: 320px;
}
.icon-circle { font-size: 50px; margin-bottom: 10px; }
.username-box input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  margin: 15px 0;
  outline: none;
}
.username-box button {
  width: 100%;
  padding: 12px;
  background: #075e54;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
}

/* Chat Container */
.chat-container {
  width: 400px;
  height: 90vh;
  background: #fff;
  display: flex;
  flex-direction: column;
  box-shadow: 0 5px 20px rgba(0,0,0,0.1);
  border-radius: 10px;
  overflow: hidden;
}

.chat-header { background: #075e54; color: white; padding: 15px; }
.header-info { display: flex; align-items: center; gap: 10px; }
.status-dot { width: 10px; height: 10px; background: #999; border-radius: 50%; }
.status-dot.online { background: #2ecc71; }
.title { font-weight: bold; }
.subtitle { font-size: 11px; opacity: 0.8; }

/* Message Area */
.chat-body { flex: 1; padding: 15px; overflow-y: auto; background-color: #e5ddd5; }
.message-row { display: flex; margin-bottom: 10px; width: 100%; }
.message-row.me { justify-content: flex-end; }
.message-row.other { justify-content: flex-start; }

.bubble {
  padding: 8px 12px;
  max-width: 75%;
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.1);
  color: #111; /* Visible dark text */
}
.me .bubble { background: #dcf8c6; border-top-right-radius: 0; }
.other .bubble { background: #fff; border-top-left-radius: 0; }

.sender-name { font-size: 11px; font-weight: bold; color: #128c7e; display: block; }
.text { margin: 3px 0; font-size: 14px; color: #111; }
.timestamp { font-size: 10px; color: #888; text-align: right; display: block; }

.system-row { text-align: center; margin: 15px 0; width: 100%; }
.system-inner { background: rgba(255,255,255,0.7); padding: 3px 12px; border-radius: 12px; font-size: 12px; color: #555; }

/* Input Area */
.chat-input-area { display: flex; padding: 10px; background: #f0f0f0; gap: 10px; align-items: center; }
.chat-input-area input { flex: 1; padding: 10px 15px; border-radius: 25px; border: none; outline: none; }
.chat-input-area button { background: #075e54; color: white; border: none; width: 40px; height: 40px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; }
</style>