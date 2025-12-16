<template>
  <div class="chat-wrapper">
    <div class="chat-header">Tell Me!</div>

    <div class="chat-body">
      <div
        v-for="(msg, index) in messages"
        :key="index"
        :class="['message', msg.sender === myId ? 'me' : 'other']"
      >
        {{ msg.text }}
      </div>
    </div>

    <div class="chat-input">
      <input
        v-model="message"
        placeholder="Type a message"
        @keyup.enter="sendMessage"
      />
      <button @click="sendMessage">➤</button>
    </div>
  </div>
</template>

<script>
import { io } from "socket.io-client"

export default {
  data() {
    return {
      socket: null,
      myId: null,
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
      this.$nextTick(() => {
        const body = document.querySelector(".chat-body")
        body.scrollTop = body.scrollHeight
      })
    })
  },
  methods: {
    sendMessage() {
      if (!this.message.trim()) return
      this.socket.emit("chat", this.message)
      this.message = ""
    }
  }
}
</script>

<style scoped>
.chat-wrapper {
  width: 360px;
  height: 520px;
  margin: 40px auto;
  display: flex;
  flex-direction: column;
  background: #e5ddd5;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
  overflow: hidden;
}

.chat-header {
  background: #075e54;
  color: white;
  padding: 14px;
  text-align: center;
  font-weight: bold;
}

.chat-body {
  flex: 1;
  padding: 10px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}
.message {
  max-width: 70%;
  padding: 8px 12px;
  margin-bottom: 8px;
  border-radius: 10px;
  font-size: 14px;
  color: #111;
  word-wrap: break-word;
}

.me {
  align-self: flex-end;
  background: #dcf8c6;
  color: #111; 
}

.other {
  align-self: flex-start;
  background: #ffffff;
  color: #111; 
}

.chat-input {
  display: flex;
  padding: 10px;
  background: #f0f0f0;
}

.chat-input input {
  flex: 1;
  padding: 10px;
  border-radius: 20px;
  border: none;
  outline: none;
}

.chat-input button {
  margin-left: 8px;
  background: #075e54;
  color: white;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  cursor: pointer;
}
</style>
