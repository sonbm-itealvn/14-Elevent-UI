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
    title: 'Tiêu đề',
    key: 'title',
    minWidth: 180,
    ellipsis: { tooltip: true },
    render: (row: ChatUserSession) => row.title || 'Không có tiêu đề',
  },
  {
    title: 'Thời gian tạo',
    key: 'createdAt',
    width: 180,
    render: (row: ChatUserSession) => formatSessionDate(row.createdAt),
  },
];

function formatSessionDate(value: string) {
  const date = new Date(
    value.toString().includes('T') ? value : value.toString().replace(' ', 'T')
  );
  return date.toLocaleString('vi-VN');
}

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

const formatLastChatTime = (row: ChatUser) => {
  const value = row.lastChatTime || (row as any).lastChatTime;
  if (!value) return '-';
  const date = new Date(
    value.toString().includes('T') ? value : value.toString().replace(' ', 'T')
  );
  return date.toLocaleString('vi-VN');
};

onMounted(() => {
  loadUsers();
});
</script>

<template>
  <div class="p-3 sm:p-0 min-w-0">
    <div class="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center mb-4">
      <h1 class="text-xl sm:text-2xl font-bold">Quản lý Chatbot</h1>
      <div class="grid grid-cols-1 sm:flex sm:flex-row gap-2 w-full sm:w-auto">
        <NButton
          type="primary"
          :loading="updatingProducts"
          class="w-full sm:w-auto"
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
          class="w-full sm:w-auto"
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
    <NCard class="mb-4 min-w-0 overflow-hidden">
      <div class="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center mb-3">
        <h2 class="text-base sm:text-lg font-semibold">Người dùng có lịch sử chat</h2>
        <NButton size="small" tertiary class="self-start sm:self-center" @click="handleRefresh">
          <template #icon>
            <NIcon><Refresh /></NIcon>
          </template>
          Tải lại
        </NButton>
      </div>
      <p class="text-sm text-gray-500 mb-3">
        Danh sách người dùng đã từng trò chuyện với chatbot. Nhấn "Xem sessions" để xem các cuộc trò chuyện (session) của từng người dùng.
      </p>

      <!-- Bảng: desktop -->
      <div class="hidden md:block overflow-x-auto min-w-0">
        <NDataTable
          :columns="userColumns"
          :data="users"
          :loading="loading"
          :pagination="tablePagination"
          :row-props="userRowProps"
          striped
          bordered
        />
      </div>

      <!-- Mobile: danh sách thẻ -->
      <div class="block md:hidden space-y-3">
        <div v-if="loading" class="text-center py-8 text-gray-500">Đang tải...</div>
        <template v-else>
          <p v-if="users.length === 0" class="text-center text-gray-500 py-8">Chưa có người dùng nào có lịch sử chat.</p>
          <template v-else>
            <div
              v-for="user in users"
              :key="user.id"
              class="chat-user-card rounded-lg border p-4 shadow-sm bg-white active:opacity-90"
              role="button"
              tabindex="0"
              @click="handleViewSessions(user)"
              @keydown.enter="handleViewSessions(user)"
            >
            <div class="flex items-center gap-3 mb-2">
              <img
                v-if="(user as any).avatar"
                :src="(user as any).avatar"
                :alt="user.fullName || ''"
                class="w-10 h-10 rounded-full object-cover border border-gray-200 flex-shrink-0"
              />
              <div
                v-else
                class="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-sm font-semibold text-gray-500 flex-shrink-0"
              >
                {{ (user.fullName || user.email || '?').charAt(0).toUpperCase() }}
              </div>
              <div class="min-w-0 flex-1">
                <div class="font-medium text-gray-900 truncate">{{ user.fullName || '-' }}</div>
                <div class="text-xs text-gray-500 truncate">{{ user.email || '-' }}</div>
              </div>
            </div>
            <div class="text-sm text-gray-600 space-y-0.5 mb-3">
              <div>Số cuộc trò chuyện: {{ user.sessionCount !== undefined ? user.sessionCount : '-' }}</div>
              <div>Gần nhất: {{ formatLastChatTime(user) }}</div>
            </div>
            <NButton size="small" type="primary" block @click.stop="handleViewSessions(user)">
              Xem sessions
            </NButton>
            </div>
          </template>
        </template>
      </div>
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
      class="chatbot-modal-sessions"
    >
      <div class="min-w-0">
        <p class="text-sm text-gray-500 mb-3">
          Danh sách các session chat của người dùng.
        </p>
        <!-- Desktop: bảng -->
        <div class="hidden md:block overflow-x-auto">
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
        <!-- Mobile: danh sách thẻ -->
        <div class="block md:hidden space-y-2">
          <div v-if="loadingSessions" class="text-center py-6 text-gray-500">Đang tải...</div>
          <template v-else>
            <p v-if="userSessions.length === 0" class="text-center text-gray-500 py-6">Chưa có session nào.</p>
            <template v-else>
              <div
                v-for="session in userSessions"
                :key="session.id"
                class="session-card rounded-lg border p-3 shadow-sm bg-white active:opacity-90"
                role="button"
                tabindex="0"
                @click="handleViewMessages(session)"
                @keydown.enter="handleViewMessages(session)"
              >
                <div class="font-medium text-gray-900 line-clamp-2 break-words">
                  {{ session.title || 'Không có tiêu đề' }}
                </div>
                <div class="text-xs text-gray-500 mt-1">
                  {{ formatSessionDate(session.createdAt) }}
                </div>
              </div>
            </template>
          </template>
        </div>
      </div>
    </NModal>

    <!-- Modal lịch sử tin nhắn của một session -->
    <NModal
      v-model:show="showMessagesModal"
      preset="dialog"
      :title="
        selectedSession
          ? `Lịch sử chat - ${selectedSession.title || 'Session'}`
          : 'Lịch sử chat của session'
      "
      class="chatbot-modal-messages"
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
.chatbot-modal-sessions :deep(.n-dialog) {
  width: 100%;
  max-width: 800px;
  margin: 12px;
}
.chatbot-modal-messages :deep(.n-dialog) {
  width: 100%;
  max-width: 900px;
  margin: 12px;
}
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
  max-width: 90%;
}
@media (min-width: 640px) {
  .session-message {
    max-width: 80%;
  }
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


