<script setup lang="ts">
import { ref } from 'vue';
import { Close, Send } from '@vicons/ionicons5';
import { NIcon, NButton, NInput, NScrollbar } from 'naive-ui';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

const isOpen = ref(false);
const messages = ref<Message[]>([
  {
    id: '1',
    text: 'Xin chào! Tôi có thể giúp gì cho bạn?',
    sender: 'bot',
    timestamp: new Date()
  }
]);
const inputMessage = ref('');

const toggleChat = () => {
  isOpen.value = !isOpen.value;
};

const sendMessage = async () => {
  if (!inputMessage.value.trim()) return;

  // Thêm tin nhắn của người dùng
  const userMessage: Message = {
    id: Date.now().toString(),
    text: inputMessage.value.trim(),
    sender: 'user',
    timestamp: new Date()
  };
  messages.value.push(userMessage);

  // Xóa input
  const messageText = inputMessage.value.trim();
  inputMessage.value = '';

  // Gọi API chat thực tế
  try {
    const response = await fetch('http://localhost:8000/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ message: messageText })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const replyText =
      data?.reply || data?.message || data?.content || 'Hệ thống đã nhận được câu hỏi của bạn.';

    const botMessage: Message = {
      id: (Date.now() + 1).toString(),
      text: replyText,
      sender: 'bot',
      timestamp: new Date()
    };
    messages.value.push(botMessage);
  } catch (error) {
    const botMessage: Message = {
      id: (Date.now() + 1).toString(),
      text: 'Xin lỗi, hiện không kết nối được tới máy chủ chat (http://localhost:8000). Vui lòng thử lại sau.',
      sender: 'bot',
      timestamp: new Date()
    };
    messages.value.push(botMessage);
  }
};

const handleKeyPress = (e: KeyboardEvent) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
};

const formatTime = (date: Date) => {
  return new Intl.DateTimeFormat('vi-VN', {
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};
</script>

<template>
  <div class="chat-bubble-container">
    <!-- Chat Window -->
    <Transition name="chat-window">
      <div v-if="isOpen" class="chat-window">
        <!-- Header -->
        <div class="chat-header">
          <div class="flex items-center gap-3">
            <div class="chat-avatar">
              <img
                src="/14elevent.jpg"
                alt="14Elevent"
                class="w-full h-full object-contain rounded-full"
              />
            </div>
            <div>
              <h3 class="chat-title">14Elevent</h3>
              <p class="chat-subtitle">Chúng tôi sẵn sàng trợ giúp. Vui lòng hỏi chúng tôi bất cứ điều gì hoặc chia sẻ phản hồi của bạn</p>
            </div>
          </div>
          <NButton
            quaternary
            circle
            size="small"
            @click="toggleChat"
            class="close-button"
          >
            <template #icon>
              <NIcon>
                <Close />
              </NIcon>
            </template>
          </NButton>
        </div>

        <!-- Messages -->
        <div class="chat-messages">
          <NScrollbar style="max-height: 400px;">
            <div class="messages-container">
              <div
                v-for="message in messages"
                :key="message.id"
                :class="['message', `message-${message.sender}`]"
              >
                <div class="message-content">
                  <p class="message-text">{{ message.text }}</p>
                  <span class="message-time">{{ formatTime(message.timestamp) }}</span>
                </div>
              </div>
            </div>
          </NScrollbar>
        </div>

        <!-- Input Area -->
        <div class="chat-input-area">
          <NInput
            v-model:value="inputMessage"
            type="textarea"
            placeholder="Nhập tin nhắn của bạn..."
            :autosize="{ minRows: 1, maxRows: 4 }"
            @keydown="handleKeyPress"
            class="chat-input"
          />
          <NButton
            type="primary"
            circle
            :disabled="!inputMessage.trim()"
            @click="sendMessage"
            class="send-button"
          >
            <template #icon>
              <NIcon>
                <Send />
              </NIcon>
            </template>
          </NButton>
        </div>
      </div>
    </Transition>

    <!-- Floating Button -->
    <Transition name="bubble-button">
      <div
        v-if="!isOpen"
        class="chat-button"
        @click="toggleChat"
      >
        <img
          src="/14elevent.jpg"
          alt="Chat"
          class="chat-button-logo"
        />
        <span v-if="messages.length > 1" class="notification-badge">{{ messages.length - 1 }}</span>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.chat-bubble-container {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 1000;
}

/* Floating Button */
.chat-button {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: #000000;
  border: 3px solid #b3000f;
  box-shadow: 0 4px 20px rgba(179, 0, 15, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  /* Cho badge thông báo hiển thị trọn vẹn, hình tròn logo vẫn bo góc nhờ border-radius của img */
  overflow: visible;
  /* Hiệu ứng rung nhẹ thu hút người dùng */
  animation: chat-bounce 2.6s ease-in-out infinite;
  animation-delay: 1s;
}

.chat-button:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 25px rgba(179, 0, 15, 0.6);
  border-color: #ff0000;
  /* Dừng rung khi người dùng đang tương tác */
  animation-play-state: paused;
}

.chat-button-logo {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.notification-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  background: #b3000f;
  color: white;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
  border: 2px solid #000000;
}

/* Chat Window */
.chat-window {
  width: 380px;
  height: 600px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.chat-header {
  background: #000000;
  border-bottom: 3px solid #b3000f;
  color: white;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chat-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border: 2px solid #b3000f;
}

.chat-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  color: white;
}

.chat-subtitle {
  font-size: 12px;
  margin: 4px 0 0 0;
  color: rgba(255, 255, 255, 0.9);
}

.close-button {
  color: white;
}

.chat-messages {
  flex: 1;
  padding: 16px;
  background: #f8f9fa;
  overflow-y: auto;
}

.messages-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.message {
  display: flex;
  max-width: 80%;
  animation: messageSlide 0.3s ease;
}

@keyframes messageSlide {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.message-user {
  align-self: flex-end;
}

.message-bot {
  align-self: flex-start;
}

.message-content {
  padding: 12px 16px;
  border-radius: 18px;
  position: relative;
}

.message-user .message-content {
  background: #000000;
  color: white;
  border: 1px solid #b3000f;
  border-bottom-right-radius: 4px;
}

.message-bot .message-content {
  background: white;
  color: #333;
  border-bottom-left-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.message-text {
  margin: 0;
  font-size: 14px;
  line-height: 1.5;
  word-wrap: break-word;
  /* Giữ xuống dòng từ trường reply (kí tự \n, \n\n) để khách đọc dễ hơn */
  white-space: pre-line;
}

.message-time {
  font-size: 11px;
  opacity: 0.7;
  margin-top: 4px;
  display: block;
}

.chat-input-area {
  padding: 16px;
  background: white;
  border-top: 1px solid #e5e7eb;
  display: flex;
  gap: 8px;
  align-items: flex-end;
}

.chat-input {
  flex: 1;
}

.send-button {
  flex-shrink: 0;
  background: #000000;
  border: 2px solid #b3000f;
  color: white;
}

.send-button:hover {
  background: #b3000f;
  border-color: #ff0000;
}

.send-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Transitions */
.chat-window-enter-active,
.chat-window-leave-active {
  transition: all 0.3s ease;
}

.chat-window-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.9);
}

.chat-window-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.9);
}

.bubble-button-enter-active,
.bubble-button-leave-active {
  transition: all 0.3s ease;
}

.bubble-button-enter-from {
  opacity: 0;
  transform: scale(0);
}

.bubble-button-leave-to {
  opacity: 0;
  transform: scale(0);
}

/* Hiệu ứng rung/bounce cho nút chat */
@keyframes chat-bounce {
  0%,
  60%,
  100% {
    transform: translate3d(0, 0, 0);
  }
  65% {
    transform: translate3d(0, -3px, 0) scale(1.03);
  }
  72% {
    transform: translate3d(0, 2px, 0) scale(0.98);
  }
  80% {
    transform: translate3d(0, -1px, 0) scale(1.02);
  }
  90% {
    transform: translate3d(0, 0, 0) scale(1);
  }
}

/* Responsive */
@media (max-width: 480px) {
  .chat-window {
    width: calc(100vw - 48px);
    height: calc(100vh - 100px);
    max-height: 600px;
  }

  .chat-bubble-container {
    bottom: 16px;
    right: 16px;
  }
}
</style>

