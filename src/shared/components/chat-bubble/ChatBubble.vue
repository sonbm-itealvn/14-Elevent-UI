<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { Close, Send } from '@vicons/ionicons5';
import { Plus, MessageCircle } from '@vicons/tabler';
import { NIcon, NButton, NInput, NScrollbar, useMessage } from 'naive-ui';
import useAuthStore from '@/ui/stores/auth.store';
import ChatService, { type ChatSession } from '@/core/services/api/chat.service';

const message = useMessage();
const authStore = useAuthStore();

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  isTyping?: boolean;
}

const isOpen = ref(false);
const messages = ref<Message[]>([]);
const inputMessage = ref('');
const conversationId = ref<string | null>(null);
const sending = ref(false);
const loadingSessions = ref(false);
const loadingMessages = ref(false);
const sessions = ref<ChatSession[]>([]);
const selectedSession = ref<ChatSession | null>(null);
const isMobile = ref(false);

const isAuthenticated = computed(() => authStore.isAuthenticated);

const checkMobile = () => {
  isMobile.value = typeof window !== 'undefined' && window.innerWidth <= 768;
};

// Welcome message khi chưa có conversation
const welcomeMessage: Message = {
  id: 'welcome',
  text: 'Xin chào! Tôi có thể giúp gì cho bạn?',
  sender: 'bot',
  timestamp: new Date()
};

const toggleChat = () => {
  isOpen.value = !isOpen.value;
  if (isOpen.value && isAuthenticated.value) {
    loadSessions();
  }
};

const loadSessions = async () => {
  if (!isAuthenticated.value) return;
  
  try {
    loadingSessions.value = true;
    const data = await ChatService.getSessions();
    console.log('Loaded sessions from API:', data);
    // Sắp xếp sessions theo thời gian tạo mới nhất trước
    sessions.value = data.sort((a, b) => {
      // Xử lý format "2026-02-10 13:39:24"
      const dateA = new Date(a.createdAt.replace(' ', 'T')).getTime();
      const dateB = new Date(b.createdAt.replace(' ', 'T')).getTime();
      return dateB - dateA;
    });
    console.log('Sessions after sorting:', sessions.value);
    
    // Nếu có session được chọn, kiểm tra xem nó còn tồn tại không
    if (selectedSession.value) {
      const stillExists = sessions.value.find(s => s.id === selectedSession.value!.id);
      if (!stillExists) {
        // Session đã bị xóa, reset
        selectedSession.value = null;
        conversationId.value = null;
        messages.value = [welcomeMessage];
      } else {
        // Cập nhật selectedSession với data mới nhất
        selectedSession.value = stillExists;
      }
    } else if (data.length > 0) {
      // Chưa có session nào được chọn, tự động chọn session mới nhất
      selectSession(sessions.value[0]);
    } else {
      // Không có session nào, reset messages về welcome
      messages.value = [welcomeMessage];
      conversationId.value = null;
      selectedSession.value = null;
    }
  } catch (error: any) {
    message.error('Lỗi khi tải danh sách cuộc trò chuyện');
    console.error(error);
  } finally {
    loadingSessions.value = false;
  }
};

const selectSession = async (session: ChatSession) => {
  // Đánh dấu session được chọn
  selectedSession.value = session;
  conversationId.value = session.conversationId;
  
  try {
    loadingMessages.value = true;
    // Gọi API để lấy lịch sử chat của session này
    const chatMessages = await ChatService.getMessages(session.conversationId);
    
    // Convert API messages to component messages
    if (chatMessages && chatMessages.length > 0) {
      messages.value = chatMessages.map((msg, index) => {
        const senderNormalized = (msg.sender || '').toString().toUpperCase();
        const sender: 'user' | 'bot' =
          senderNormalized === 'USER' ? 'user' : 'bot';

        return {
          id: `msg-${session.conversationId}-${index}-${Date.now()}`,
          text: msg.content,
          sender,
          timestamp: new Date(msg.createdAt)
        };
      });
    } else {
      // Nếu không có messages, hiển thị welcome message
      messages.value = [welcomeMessage];
    }
    
    // Scroll to bottom sau khi load xong
    setTimeout(() => {
      const container = document.querySelector('.messages-container');
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    }, 200);
  } catch (error: any) {
    message.error('Lỗi khi tải lịch sử chat');
    console.error('Error loading messages:', error);
    // Nếu lỗi, vẫn hiển thị welcome message
    messages.value = [welcomeMessage];
  } finally {
    loadingMessages.value = false;
  }
};

const createNewConversation = () => {
  selectedSession.value = null;
  conversationId.value = null;
  messages.value = [welcomeMessage];
  // Clear input
  inputMessage.value = '';
};

const sendMessage = async () => {
  if (!inputMessage.value.trim() || sending.value) return;

  sending.value = true;
  const isNewConversation = !conversationId.value;

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

  // Thêm typing indicator
  const typingMessageId = `typing-${Date.now()}`;
  const typingMessage: Message = {
    id: typingMessageId,
    text: '',
    sender: 'bot',
    timestamp: new Date(),
    isTyping: true
  };
  messages.value.push(typingMessage);

  // Scroll to bottom
  setTimeout(() => {
    const container = document.querySelector('.messages-container');
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, 100);

  // Gọi API chat
  try {
    const result = await ChatService.sendMessage(messageText, conversationId.value || undefined);
    
    // Lưu conversationId từ response
    // Chỉ nhận conversationId mới khi đây là cuộc trò chuyện mới (nhấn \"Cuộc trò chuyện mới\" hoặc lần chat đầu)
    if (isNewConversation && result.conversationId) {
      const newConversationId = result.conversationId;
      conversationId.value = newConversationId;
      
      // Nếu đã đăng nhập và chưa có session được chọn, reload sessions để tìm session mới
      if (isAuthenticated.value) {
        // Reload danh sách sessions để cập nhật session mới tạo
        await loadSessions();
        // Tự động chọn session vừa tạo
        const newSession = sessions.value.find(s => s.conversationId === newConversationId);
        if (newSession) {
          selectedSession.value = newSession;
        }
      }
    }

    const replyText = result.reply || 'Hệ thống đã nhận được câu hỏi của bạn.';

    // Thay thế typing indicator bằng response thật
    const typingIndex = messages.value.findIndex(m => m.id === typingMessageId);
    if (typingIndex !== -1) {
      messages.value[typingIndex] = {
        id: (Date.now() + 1).toString(),
        text: replyText,
        sender: 'bot',
        timestamp: new Date()
      };
    }
    
    // Scroll to bottom after response
    setTimeout(() => {
      const container = document.querySelector('.messages-container');
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    }, 100);
  } catch (error: any) {
    // Thay thế typing indicator bằng message lỗi
    const typingIndex = messages.value.findIndex(m => m.id === typingMessageId);
    if (typingIndex !== -1) {
      messages.value[typingIndex] = {
        id: (Date.now() + 1).toString(),
        text: error.message || 'Xin lỗi, hiện không kết nối được tới máy chủ chat. Vui lòng thử lại sau.',
        sender: 'bot',
        timestamp: new Date()
      };
    }
  } finally {
    sending.value = false;
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

const formatDate = (dateString: string) => {
  try {
    // Xử lý format "2026-02-10 13:39:24" hoặc ISO format
    const date = new Date(dateString.replace(' ', 'T'));
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Reset time để so sánh chỉ ngày
    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const yesterdayOnly = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());
    
    if (dateOnly.getTime() === todayOnly.getTime()) {
      // Hiển thị giờ nếu là hôm nay
      return new Intl.DateTimeFormat('vi-VN', {
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } else if (dateOnly.getTime() === yesterdayOnly.getTime()) {
      return 'Hôm qua';
    } else {
      return new Intl.DateTimeFormat('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }).format(date);
    }
  } catch (error) {
    return dateString;
  }
};

// Watch authentication status
watch(isAuthenticated, (newVal) => {
  if (newVal && isOpen.value) {
    loadSessions();
  } else if (!newVal) {
    // Reset khi logout
    sessions.value = [];
    selectedSession.value = null;
    conversationId.value = null;
    messages.value = [welcomeMessage];
  }
});

// Initialize messages + mobile check
onMounted(() => {
  if (!isAuthenticated.value) {
    messages.value = [welcomeMessage];
  }
  checkMobile();
  window.addEventListener('resize', checkMobile);
});

onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('resize', checkMobile);
  }
});
</script>

<template>
  <div class="chat-bubble-container">
    <!-- Chat Window -->
    <Transition name="chat-window">
      <div v-if="isOpen" class="chat-window" :class="{ 'with-sidebar': isAuthenticated && !isMobile }">
        <!-- Sidebar: chỉ hiện trên desktop (ẩn trên mobile để giao diện gọn) -->
        <div v-if="isAuthenticated && !isMobile" class="chat-sidebar">
          <div class="sidebar-header">
            <h4 class="sidebar-title">Cuộc trò chuyện</h4>
            <NButton
              quaternary
              circle
              size="small"
              @click="createNewConversation"
              class="new-chat-button"
              title="Cuộc trò chuyện mới"
            >
              <template #icon>
                <NIcon><Plus /></NIcon>
              </template>
            </NButton>
          </div>
          
          <NScrollbar style="height: calc(100% - 60px);">
            <div class="sessions-list">
              <div
                v-for="session in sessions"
                :key="session.id"
                :class="['session-item', { active: selectedSession && selectedSession.id === session.id }]"
                @click="selectSession(session)"
              >
                <div class="session-icon">
                  <NIcon><MessageCircle /></NIcon>
                </div>
                <div class="session-info">
                  <div class="session-title">{{ session.title || 'Cuộc trò chuyện mới' }}</div>
                  <div class="session-date">{{ formatDate(session.createdAt) }}</div>
                </div>
              </div>
              
              <div v-if="loadingSessions" class="loading-sessions">
                Đang tải...
              </div>
              
              <div v-if="!loadingSessions && sessions.length === 0" class="empty-sessions">
                <p>Chưa có cuộc trò chuyện nào</p>
                <NButton size="small" @click="createNewConversation">
                  Bắt đầu cuộc trò chuyện mới
                </NButton>
              </div>
            </div>
          </NScrollbar>
        </div>

        <!-- Main Chat Area -->
        <div class="chat-main">
          <!-- Header -->
          <div class="chat-header">
            <div class="chat-header-inner">
              <div class="chat-avatar">
                <img
                  src="/14elevent.jpg"
                  alt="14Elevent"
                  class="w-full h-full object-contain rounded-full"
                />
              </div>
              <div class="chat-header-text">
                <h3 class="chat-title">14Elevent</h3>
                <p class="chat-subtitle">Chúng tôi sẵn sàng trợ giúp. Hỏi chúng tôi bất cứ điều gì.</p>
              </div>
            </div>
            <div class="chat-header-actions">
              <!-- Trên mobile khi đã đăng nhập: nút tạo cuộc trò chuyện mới -->
              <NButton
                v-if="isAuthenticated && isMobile"
                quaternary
                circle
                size="small"
                @click="createNewConversation"
                class="header-action-btn"
                title="Cuộc trò chuyện mới"
              >
                <template #icon>
                  <NIcon><Plus /></NIcon>
                </template>
              </NButton>
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
          </div>

          <!-- Messages -->
          <div class="chat-messages">
            <NScrollbar class="chat-messages-scroll">
              <div class="messages-container">
                <div v-if="loadingMessages" class="loading-messages">
                  Đang tải tin nhắn...
                </div>
                <div
                  v-for="message in messages"
                  :key="message.id"
                  :class="['message', 'message-' + message.sender]"
                >
                  <div class="message-content">
                    <div v-if="message.isTyping" class="typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                    <template v-else>
                      <p class="message-text">{{ message.text }}</p>
                      <span class="message-time">{{ formatTime(message.timestamp) }}</span>
                    </template>
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
              :disabled="!inputMessage.trim() || sending"
              :loading="sending"
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
      </div>
    </Transition>

    <!-- Floating Button -->
    <Transition name="bubble-button">
      <div
        v-if="!isOpen"
        class="chat-button"
        @click="toggleChat"
      >
        <div class="chat-button-content">
          <div class="chat-button-icon">
            <NIcon>
              <MessageCircle />
            </NIcon>
          </div>
          <div class="chat-button-text-group">
            <span class="chat-button-title">Chat hỗ trợ</span>
            <span class="chat-button-subtitle">Hỏi 14Elevent</span>
          </div>
        </div>
        <span v-if="messages.length > 1" class="notification-badge">{{ messages.length - 1 }}</span>
      </div>
    </Transition>
  </div>
</template>

<style>
.chat-bubble-container {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 1000;
}

/* Floating Button */
.chat-button {
  min-width: 64px;
  height: 56px;
  border-radius: 999px;
  background: radial-gradient(circle at 0 0, #ff4b6b, #b3000f 60%, #4b0008 100%);
  border: 3px solid #b3000f;
  box-shadow: 0 4px 20px rgba(179, 0, 15, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: visible;
  animation: chat-bounce 2.6s ease-in-out infinite;
  animation-delay: 1s;
}

.chat-button-content {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 4px 14px 4px 10px;
  color: #fff;
}

.chat-button-icon {
  width: 32px;
  height: 32px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
}

.chat-button-icon :deep(svg) {
  width: 20px;
  height: 20px;
}

.chat-button-text-group {
  display: flex;
  flex-direction: column;
  line-height: 1.1;
}

.chat-button-title {
  font-size: 13px;
  font-weight: 600;
}

.chat-button-subtitle {
  font-size: 11px;
  opacity: 0.9;
}

.chat-button:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 25px rgba(179, 0, 15, 0.6);
  border-color: #ff0000;
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
  min-width: 0;
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: row;
  overflow: hidden;
}

.chat-window.with-sidebar {
  width: 700px;
}

.chat-sidebar {
  width: 280px;
  min-width: 0;
  flex-shrink: 0;
  border-right: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  background: #f8f9fa;
  overflow: hidden;
}

.sidebar-header {
  padding: 16px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
}

.sidebar-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  color: #333;
}

.new-chat-button {
  color: #b3000f;
}

.sessions-list {
  padding: 8px;
}

.session-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s;
  margin-bottom: 4px;
}

.session-item:hover {
  background: #e9ecef;
}

.session-item.active {
  background: #000000;
  color: white;
}

.session-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(179, 0, 15, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.session-item.active .session-icon {
  background: rgba(255, 255, 255, 0.2);
}

.session-info {
  flex: 1;
  min-width: 0;
}

.session-title {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.session-date {
  font-size: 12px;
  opacity: 0.7;
}

.loading-sessions,
.empty-sessions {
  padding: 20px;
  text-align: center;
  color: #666;
  font-size: 14px;
}

.empty-sessions p {
  margin-bottom: 12px;
}

.chat-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.chat-header {
  background: #1a1a1a;
  border-bottom: 2px solid rgba(179, 0, 15, 0.5);
  color: white;
  padding: 14px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
}

.chat-header-inner {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
  flex: 1;
}

.chat-header-text {
  min-width: 0;
}

.chat-header-actions {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

.header-action-btn {
  color: rgba(255, 255, 255, 0.9);
}

.chat-avatar {
  width: 36px;
  height: 36px;
  flex-shrink: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border: 1px solid rgba(179, 0, 15, 0.6);
}

.chat-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  color: white;
  line-height: 1.2;
}

.chat-subtitle {
  font-size: 11px;
  margin: 2px 0 0 0;
  color: rgba(255, 255, 255, 0.85);
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 200px;
}

.close-button {
  color: white;
}

.chat-messages {
  flex: 1;
  min-height: 0;
  padding: 16px;
  background: #f5f5f5;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.chat-messages-scroll {
  flex: 1;
  min-height: 0;
}

.chat-messages-scroll :deep(.n-scrollbar-container) {
  max-height: 100%;
}

.messages-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.loading-messages {
  text-align: center;
  padding: 20px;
  color: #666;
  font-size: 14px;
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
  white-space: pre-line;
}

.message-time {
  font-size: 11px;
  opacity: 0.7;
  margin-top: 4px;
  display: block;
}

/* Typing Indicator */
.typing-indicator {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 0;
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #666;
  display: inline-block;
  animation: typing-bounce 1.4s infinite ease-in-out;
}

.typing-indicator span:nth-child(1) {
  animation-delay: -0.32s;
}

.typing-indicator span:nth-child(2) {
  animation-delay: -0.16s;
}

.typing-indicator span:nth-child(3) {
  animation-delay: 0;
}

@keyframes typing-bounce {
  0%, 80%, 100% {
    transform: scale(0.8);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
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
  background: #b3000f !important;
  border-color: #b3000f !important;
  color: white !important;
}

.send-button:hover:not(:disabled) {
  background: #dc2626 !important;
  border-color: #dc2626 !important;
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

@keyframes chat-bounce {
  0%, 60%, 100% {
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

/* Responsive - mobile: chỉ khung chat, gọn gàng */
@media (max-width: 768px) {
  .chat-window {
    width: min(400px, calc(100vw - 32px));
    height: min(72vh, 580px);
    max-height: 580px;
    border-radius: 14px;
  }

  .chat-window.with-sidebar {
    width: min(400px, calc(100vw - 32px));
  }

  .chat-header {
    padding: 10px 12px;
  }

  .chat-subtitle {
    white-space: normal;
    max-width: 180px;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
  }

  .chat-messages :deep(.n-scrollbar-container) {
    max-height: 100%;
  }
}

@media (max-width: 480px) {
  .chat-button {
    min-width: 52px;
    height: 52px;
    padding: 0;
  }

  .chat-button-content {
    padding: 0;
  }

  .chat-button-text-group {
    display: none;
  }

  .chat-button-icon {
    width: 40px;
    height: 40px;
  }

  .chat-window {
    width: min(360px, calc(100vw - 24px));
    height: min(68vh, 520px);
    max-height: 520px;
  }

  .chat-window.with-sidebar {
    width: min(360px, calc(100vw - 24px));
  }

  .chat-subtitle {
    max-width: 140px;
  }

  .chat-bubble-container {
    bottom: 16px;
    right: 16px;
  }
}
</style>
