<template>
  <div class="chat-wrapper">
    <!-- Username Screen -->
    <div v-if="!username" class="username-box">
      <h2>Join Chat</h2>
      <input
        v-model="tempName"
        placeholder="Enter your name"
        @keyup.enter="joinChat"
      />
      <button @click="joinChat">Join</button>
    </div>

    <!-- Chat Screen -->
    <div v-else class="chat-container">
      <div class="chat-header">
        💬 Chat Room
      </div>

      <div class="chat-body">
        <div
          v-for="(msg, index) in messages"
          :key="index"
          :class="msg.type === 'system'
            ? 'system'
            : ['message', msg.sender === myId ? 'me' : 'other']"
        >
          <span v-if="msg.username" class="username">
            {{ msg.username }}:
          </span>
          {{ msg.text || msg.message }}
        </div>
      </div>

      <div class="chat-input">
        <input
          v-model="message"
          placeholder="Type a message"
          @keyup.enter="sendMessage"
        />
        <button @click="sendMessage">Send</button>
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
      messages: []
    }
  },
  mounted() {
    this.socket = io("http://localhost:3000")

    this.socket.on("connect", () => {
      this.myId = this.socket.id
    })

    this.socket.on("chat", (msg) => {
      this.messages.push(msg)
      this.scrollToBottom()
    })

    this.socket.on("system", (msg) => {
      this.messages.push({
        ...msg,
        type: "system"
      })
      this.scrollToBottom()
    })
  },
  methods: {
    joinChat() {
      if (!this.tempName.trim()) return
      this.username = this.tempName
      this.socket.emit("join", this.username)
    },
    sendMessage() {
      if (!this.message.trim()) return
      this.socket.emit("chat", this.message)
      this.message = ""
    },
    scrollToBottom() {
      this.$nextTick(() => {
        const body = document.querySelector(".chat-body")
        if (body) body.scrollTop = body.scrollHeight
      })
    }
  }
}
</script>

<style scoped>
.chat-wrapper {
  height: 100vh;
  background: #ece5dd;
  display: flex;
  justify-content: center;
  align-items: center;
  font-family: Arial, sans-serif;
  color: #111;
}

/* Username screen */
.username-box {
  background: white;
  padding: 40px;
  border-radius: 12px;
  text-align: center;
  width: 300px;
}

.username-box input {
  width: 100%;
  padding: 10px;
  margin-top: 15px;
  border-radius: 6px;
  border: 1px solid #ccc;
}

.username-box button {
  margin-top: 15px;
  padding: 10px 20px;
  background: #075e54;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

/* Chat container */
.chat-container {
  width: 380px;
  height: 600px;
  background: #fff;
  display: flex;
  flex-direction: column;
  border-radius: 12px;
  overflow: hidden;
}

/* Header */
.chat-header {
  background: #075e54;
  color: white;
  padding: 15px;
  text-align: center;
  font-weight: bold;
}

/* Messages */
.chat-body {
  flex: 1;
  padding: 10px;
  overflow-y: auto;
  background: #e5ddd5;
}

/* Message bubbles */
.message {
  padding: 8px 12px;
  margin: 6px 0;
  max-width: 75%;
  border-radius: 10px;
  font-size: 14px;
  word-wrap: break-word;
  color: #111;  
}

.me {
  background: #dcf8c6;
  margin-left: auto;
  text-align: right;
}

.other {
  background: #fff;
  margin-right: auto;
}

/* System messages */
.system {
  text-align: center;
  font-size: 12px;
  color: #333;
  margin: 10px 0;
}


/* Username label */
.username {
  font-weight: bold;
  margin-right: 4px;
}

/* Input area */
.chat-input {
  display: flex;
  padding: 10px;
  background: #f0f0f0;
}

.chat-input input {
  flex: 1;
  padding: 10px;
  border-radius: 20px;
  border: 1px solid #ccc;
  outline: none;
}

.chat-input button {
  margin-left: 10px;
  padding: 10px 16px;
  background: #075e54;
  color: white;
  border: none;
  border-radius: 20px;
  cursor: pointer;
}
</style>
