<script setup lang="ts">
import { ref, onMounted, h } from 'vue';
import {
  NDataTable,
  NButton,
  NInput,
  NTag,
  useMessage,
  NIcon,
  NCard,
  NModal,
} from 'naive-ui';
import { Refresh, Database, FileText, Eye } from '@vicons/tabler';
import ChatbotService, { type ChatHistory } from '@/core/services/api/chatbot.service';

const message = useMessage();

const loading = ref(false);
const chatHistory = ref<ChatHistory[]>([]);
const pagination = ref({
  page: 1,
  pageSize: 10,
  total: 0,
  showSizePicker: true,
  pageSizes: [10, 20, 50, 100],
});

const filters = ref({
  conversationId: '',
  userEmail: '',
});

const showDetailModal = ref(false);
const selectedChat = ref<ChatHistory | null>(null);
const updatingProducts = ref(false);
const updatingDocuments = ref(false);

const columns = [
  {
    title: 'ID',
    key: 'id',
    width: 100,
  },
  {
    title: 'Conversation ID',
    key: 'conversationId',
    width: 200,
    render: (row: ChatHistory) => {
      return h('div', { class: 'font-mono text-xs' }, row.conversationId);
    },
  },
  {
    title: 'Email người dùng',
    key: 'userEmail',
    width: 200,
    render: (row: ChatHistory) => row.userEmail || '-',
  },
  {
    title: 'Tin nhắn',
    key: 'message',
    width: 250,
    ellipsis: {
      tooltip: true,
    },
  },
  {
    title: 'Phản hồi',
    key: 'reply',
    width: 300,
    ellipsis: {
      tooltip: true,
    },
  },
  {
    title: 'Agent',
    key: 'agent',
    width: 150,
    render: (row: ChatHistory) => {
      if (!row.agent) return '-';
      return h(NTag, { type: 'info', size: 'small' }, { default: () => row.agent });
    },
  },
  {
    title: 'Thời gian',
    key: 'createdAt',
    width: 180,
    render: (row: ChatHistory) => {
      return new Date(row.createdAt).toLocaleString('vi-VN');
    },
  },
  {
    title: 'Thao tác',
    key: 'actions',
    width: 100,
    render: (row: ChatHistory) => {
      return h(
        NButton,
        {
          size: 'small',
          circle: true,
          tertiary: true,
          quaternary: true,
          onClick: () => handleViewDetail(row),
        },
        {
          icon: () => h(NIcon, null, { default: () => h(Eye) }),
        }
      );
    },
  },
];

const loadChatHistory = async () => {
  try {
    loading.value = true;
    const params: any = {
      page: pagination.value.page - 1,
      size: pagination.value.pageSize,
    };

    if (filters.value.conversationId) {
      params.conversationId = filters.value.conversationId;
    }
    if (filters.value.userEmail) {
      params.userEmail = filters.value.userEmail;
    }

    const response = await ChatbotService.getChatHistory(params);
    chatHistory.value = response.content;
    pagination.value.total = response.totalElements;
    loading.value = false;
  } catch (error: any) {
    message.error(
      error.response?.data?.message || 'Lỗi khi tải lịch sử chat'
    );
    loading.value = false;
  }
};

const handleViewDetail = (chat: ChatHistory) => {
  selectedChat.value = chat;
  showDetailModal.value = true;
};

const handleUpdateProducts = async () => {
  try {
    updatingProducts.value = true;
    await ChatbotService.updateProductData();
    message.success('Cập nhật dữ liệu sản phẩm thành công');
  } catch (error: any) {
    message.error(
      error.response?.data?.message || 'Lỗi khi cập nhật dữ liệu sản phẩm'
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
      error.response?.data?.message || 'Lỗi khi cập nhật tài liệu hệ thống'
    );
  } finally {
    updatingDocuments.value = false;
  }
};

const handleFilter = () => {
  pagination.value.page = 1;
  loadChatHistory();
};

const handleResetFilter = () => {
  filters.value = {
    conversationId: '',
    userEmail: '',
  };
  pagination.value.page = 1;
  loadChatHistory();
};

onMounted(() => {
  loadChatHistory();
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

    <!-- Filters -->
    <NCard class="mb-4">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <NInput
          v-model:value="filters.conversationId"
          placeholder="Tìm kiếm Conversation ID"
          clearable
          @keyup.enter="handleFilter"
        />
        <NInput
          v-model:value="filters.userEmail"
          placeholder="Tìm kiếm email người dùng"
          clearable
          @keyup.enter="handleFilter"
        />
        <div class="flex gap-2">
          <NButton type="primary" @click="handleFilter">
            <template #icon>
              <NIcon><Refresh /></NIcon>
            </template>
            Lọc
          </NButton>
          <NButton @click="handleResetFilter">Đặt lại</NButton>
        </div>
      </div>
    </NCard>

    <!-- Chat History Table -->
    <NDataTable
      :columns="columns"
      :data="chatHistory"
      :loading="loading"
      :pagination="pagination"
      @update:page="(page) => { pagination.page = page; loadChatHistory(); }"
      @update:page-size="(size) => { pagination.pageSize = size; pagination.page = 1; loadChatHistory(); }"
      striped
      bordered
    />

    <!-- Detail Modal -->
    <NModal
      v-model:show="showDetailModal"
      title="Chi tiết cuộc trò chuyện"
      preset="dialog"
      style="width: 800px"
    >
      <div v-if="selectedChat" class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <strong>Conversation ID:</strong>
            <div class="font-mono text-xs mt-1">{{ selectedChat.conversationId }}</div>
          </div>
          <div>
            <strong>Email người dùng:</strong>
            <div class="mt-1">{{ selectedChat.userEmail || '-' }}</div>
          </div>
          <div>
            <strong>Agent:</strong>
            <div class="mt-1">
              <NTag v-if="selectedChat.agent" type="info" size="small">
                {{ selectedChat.agent }}
              </NTag>
              <span v-else>-</span>
            </div>
          </div>
          <div>
            <strong>Thời gian:</strong>
            <div class="mt-1">{{ new Date(selectedChat.createdAt).toLocaleString('vi-VN') }}</div>
          </div>
        </div>

        <div class="border-t pt-4">
          <strong>Tin nhắn người dùng:</strong>
          <div class="mt-2 p-3 bg-gray-50 rounded border">
            <p class="whitespace-pre-line">{{ selectedChat.message }}</p>
          </div>
        </div>

        <div class="border-t pt-4">
          <strong>Phản hồi từ bot:</strong>
          <div class="mt-2 p-3 bg-blue-50 rounded border">
            <p class="whitespace-pre-line">{{ selectedChat.reply }}</p>
          </div>
        </div>
      </div>
      <template #action>
        <NButton @click="showDetailModal = false">Đóng</NButton>
      </template>
    </NModal>
  </div>
</template>

<style scoped>
</style>

