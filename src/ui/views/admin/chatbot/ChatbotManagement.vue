<script setup lang="ts">
import { ref, onMounted, h } from 'vue';
import {
  NDataTable,
  NButton,
  useMessage,
  NIcon,
  NCard,
  NModal,
} from 'naive-ui';
import { Refresh, Database, FileText } from '@vicons/tabler';
import ChatbotService, {
  type ChatUser,
  type ChatUserSession,
  type ChatSessionMessage,
} from '@/core/services/api/chatbot.service';

const message = useMessage();

const loading = ref(false);
const users = ref<ChatUser[]>([]);
const tablePagination = ref({ pageSize: 10 });

const updatingProducts = ref(false);
const updatingDocuments = ref(false);

// Modal sessions theo user
const showSessionsModal = ref(false);
const loadingSessions = ref(false);
const selectedUser = ref<ChatUser | null>(null);
const userSessions = ref<ChatUserSession[]>([]);

// Modal chi tiết messages theo session
const showMessagesModal = ref(false);
const loadingMessages = ref(false);
const selectedSession = ref<ChatUserSession | null>(null);
const sessionMessages = ref<ChatSessionMessage[]>([]);

const userColumns = [
  {
    title: 'ID',
    key: 'id',
    width: 80,
  },
  {
    title: 'Người dùng',
    key: 'fullName',
    width: 260,
    render: (row: ChatUser) => {
      const avatar = (row as any).avatar;
      const name = row.fullName || '-';
      const email = row.email || '-';
      return h(
        'div',
        { class: 'flex items-center gap-3' },
        [
          avatar
            ? h('img', {
                src: avatar,
                alt: name,
                class: 'w-8 h-8 rounded-full object-cover border border-gray-200',
              })
            : h(
                'div',
                {
                  class:
                    'w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-semibold text-gray-500',
                },
                name.charAt(0).toUpperCase()
              ),
          h('div', { class: 'flex flex-col' }, [
            h('span', { class: 'font-medium text-gray-900 text-sm' }, name),
            h('span', { class: 'text-xs text-gray-500' }, email),
          ]),
        ]
      );
    },
  },
  {
    title: 'Email người dùng',
    key: 'email',
    width: 220,
    render: (row: ChatUser) => row.email || '-',
  },
  {
    title: 'Số cuộc trò chuyện',
    key: 'sessionCount',
    width: 160,
    render: (row: ChatUser) =>
      row.sessionCount !== undefined ? row.sessionCount : '-',
  },
  {
    title: 'Thời gian gần nhất',
    key: 'lastChatTime',
    width: 200,
    render: (row: ChatUser) => {
      const value = row.lastChatTime || (row as any).lastChatTime;
      if (!value) return '-';
      const date = new Date(
        value.toString().includes('T') ? value : value.toString().replace(' ', 'T')
      );
      return date.toLocaleString('vi-VN');
    },
  },
];

const sessionColumns = [
  {
    title: 'ID',
    key: 'id',
    width: 80,
  },
  {
    title: 'Conversation ID',
    key: 'conversationId',
    width: 260,
  },
  {
    title: 'Tiêu đề',
    key: 'title',
    width: 260,
    render: (row: ChatUserSession) => row.title || 'Không có tiêu đề',
  },
  {
    title: 'Thời gian tạo',
    key: 'createdAt',
    width: 200,
    render: (row: ChatUserSession) => {
      const value = row.createdAt;
      const date = new Date(
        value.toString().includes('T') ? value : value.toString().replace(' ', 'T')
      );
      return date.toLocaleString('vi-VN');
    },
  },
];

// Click cả dòng để mở chi tiết (thay vì nút riêng lẻ)
const userRowProps = (row: ChatUser) => ({
  style: 'cursor: pointer;',
  onClick: () => handleViewSessions(row),
});

const sessionRowProps = (row: ChatUserSession) => ({
  style: 'cursor: pointer;',
  onClick: () => handleViewMessages(row),
});

const loadUsers = async () => {
  try {
    loading.value = true;
    const data = await ChatbotService.getChatUsers();
    users.value = data;
  } catch (error: any) {
    message.error(
      error.response?.data?.message ||
        'Lỗi khi tải danh sách người dùng có lịch sử chat'
    );
  } finally {
    loading.value = false;
  }
};

const handleUpdateProducts = async () => {
  try {
    updatingProducts.value = true;
    await ChatbotService.updateProductData();
    message.success('Cập nhật dữ liệu sản phẩm thành công');
  } catch (error: any) {
    message.error(
      error.response?.data?.message ||
        'Lỗi khi cập nhật dữ liệu sản phẩm'
    );
  } finally {
    updatingProducts.value = false;
  }
};

const handleUpdateDocuments = async () => {
  try {
    updatingDocuments.value = true;
    await ChatbotService.updateSystemDocuments();
    message.success('Cập nhật tài liệu hệ thống thành công');
  } catch (error: any) {
    message.error(
      error.response?.data?.message ||
        'Lỗi khi cập nhật tài liệu hệ thống'
    );
  } finally {
    updatingDocuments.value = false;
  }
};

const handleRefresh = () => {
  loadUsers();
};

const handleViewSessions = async (user: ChatUser) => {
  selectedUser.value = user;
  showSessionsModal.value = true;
  loadingSessions.value = true;
  try {
    const data = await ChatbotService.getUserSessions(user.id);
    userSessions.value = data;
  } catch (error: any) {
    message.error(
      error.response?.data?.message ||
        'Lỗi khi tải danh sách session của người dùng'
    );
  } finally {
    loadingSessions.value = false;
  }
};

const handleViewMessages = async (session: ChatUserSession) => {
  selectedSession.value = session;
  showMessagesModal.value = true;
  loadingMessages.value = true;
  try {
    const data = await ChatbotService.getSessionMessages(
      session.conversationId
    );
    sessionMessages.value = data;
  } catch (error: any) {
    message.error(
      error.response?.data?.message ||
        'Lỗi khi tải lịch sử chat của session'
    );
  } finally {
    loadingMessages.value = false;
  }
};

onMounted(() => {
  loadUsers();
});
</script>

<template>
  <div>
    <div class="flex justify-between items-center mb-4">
      <h1 class="text-2xl font-bold">Quản lý Chatbot</h1>
      <div class="flex gap-2">
        <NButton
          type="primary"
          :loading="updatingProducts"
          @click="handleUpdateProducts"
        >
          <template #icon>
            <NIcon><Database /></NIcon>
          </template>
          Cập nhật dữ liệu sản phẩm
        </NButton>
        <NButton
          type="info"
          :loading="updatingDocuments"
          @click="handleUpdateDocuments"
        >
          <template #icon>
            <NIcon><FileText /></NIcon>
          </template>
          Cập nhật tài liệu hệ thống
        </NButton>
      </div>
    </div>

    <!-- Danh sách người dùng có lịch sử chat -->
    <NCard class="mb-4">
      <div class="flex justify-between items-center mb-3">
        <h2 class="text-lg font-semibold">Người dùng có lịch sử chat</h2>
        <NButton size="small" tertiary @click="handleRefresh">
          <template #icon>
            <NIcon><Refresh /></NIcon>
          </template>
          Tải lại
        </NButton>
      </div>
      <p class="text-sm text-gray-500 mb-3">
        Danh sách người dùng đã từng trò chuyện với chatbot. Nhấn
        \"Xem sessions\" để xem các cuộc trò chuyện (session) của từng người dùng.
      </p>

      <NDataTable
        :columns="userColumns"
        :data="users"
        :loading="loading"
        :pagination="tablePagination"
        :row-props="userRowProps"
        striped
        bordered
      />
    </NCard>

    <!-- Modal danh sách sessions theo user -->
    <NModal
      v-model:show="showSessionsModal"
      preset="dialog"
      :title="
        selectedUser
          ? `Sessions của ${selectedUser.fullName || selectedUser.email}`
          : 'Sessions của người dùng'
      "
      style="width: 800px"
    >
      <div>
        <p class="text-sm text-gray-500 mb-3">
          Danh sách các session chat của người dùng.
        </p>
        <NDataTable
          :columns="sessionColumns"
          :data="userSessions"
          :loading="loadingSessions"
          :pagination="false"
          :row-props="sessionRowProps"
          striped
          bordered
        />
      </div>
    </NModal>

    <!-- Modal lịch sử tin nhắn của một session -->
    <NModal
      v-model:show="showMessagesModal"
      preset="dialog"
      :title="
        selectedSession
          ? `Lịch sử chat - ${selectedSession.title || selectedSession.conversationId}`
          : 'Lịch sử chat của session'
      "
      style="width: 900px"
    >
      <div>
        <p class="text-sm text-gray-500 mb-3">
          Chi tiết tin nhắn trong session. Sender = USER là khách hàng, BOT là chatbot.
        </p>
        <div class="session-chat-wrapper">
          <div v-if="loadingMessages" class="session-chat-loading">
            Đang tải lịch sử chat...
          </div>
          <div v-else class="session-chat-container">
            <div
              v-for="(msg, index) in sessionMessages"
              :key="index"
              :class="[
                'session-message',
                msg.sender?.toString().toUpperCase() === 'USER'
                  ? 'session-message-user'
                  : 'session-message-bot'
              ]"
            >
              <div class="session-message-content">
                <p class="session-message-text">{{ msg.content }}</p>
                <span class="session-message-meta">
                  <span class="session-message-sender">
                    {{ msg.sender?.toString().toUpperCase() === 'USER' ? 'USER' : 'BOT' }}
                  </span>
                  <span class="session-message-time">
                    {{
                      new Date(
                        msg.createdAt.toString().includes('T')
                          ? msg.createdAt
                          : msg.createdAt.toString().replace(' ', 'T')
                      ).toLocaleString('vi-VN')
                    }}
                  </span>
                </span>
              </div>
            </div>
            <div v-if="sessionMessages.length === 0" class="session-chat-empty">
              Chưa có tin nhắn nào trong session này.
            </div>
          </div>
        </div>
      </div>
    </NModal>
  </div>
</template>

<style scoped>
.session-chat-wrapper {
  max-height: 520px;
  overflow: hidden;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  background: #f9fafb;
}

.session-chat-container {
  max-height: 520px;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.session-chat-loading,
.session-chat-empty {
  padding: 24px;
  text-align: center;
  font-size: 14px;
  color: #6b7280;
}

.session-message {
  display: flex;
  max-width: 80%;
}

.session-message-user {
  align-self: flex-end;
  justify-content: flex-end;
}

.session-message-bot {
  align-self: flex-start;
  justify-content: flex-start;
}

.session-message-content {
  padding: 10px 14px;
  border-radius: 16px;
  position: relative;
  background: #ffffff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}

.session-message-user .session-message-content {
  background: #111827;
  color: #f9fafb;
  border-bottom-right-radius: 4px;
}

.session-message-bot .session-message-content {
  background: #ffffff;
  color: #111827;
  border-bottom-left-radius: 4px;
}

.session-message-text {
  margin: 0;
  white-space: pre-line;
  font-size: 14px;
  line-height: 1.5;
}

.session-message-meta {
  display: flex;
  gap: 6px;
  margin-top: 6px;
  font-size: 11px;
  opacity: 0.8;
}

.session-message-sender {
  text-transform: uppercase;
  font-weight: 600;
}

.session-message-time {
  color: #6b7280;
}
</style>


