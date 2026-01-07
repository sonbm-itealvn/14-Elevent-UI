<script setup lang="ts">
import { ref, onMounted, h } from 'vue';
import { 
  NDataTable, 
  NButton, 
  NModal, 
  NUpload,
  NImage,
  NPopconfirm,
  useMessage,
  NIcon,
  NTag,
  NInput,
  NSelect,
  NGrid,
  NGridItem,
  NCard
} from 'naive-ui';
import { Plus, Trash, Photo as ImageIcon } from '@vicons/tabler';
import MediaService from '@/core/services/api/media.service';
import type { Media, MediaType } from '@/domain/models/media.model';

const message = useMessage();

const loading = ref(false);
const mediaList = ref<Media[]>([]);
const pagination = ref({
  page: 1,
  pageSize: 20,
  total: 0,
  showSizePicker: true,
  pageSizes: [20, 50, 100],
});

const showUploadModal = ref(false);
const uploadFolder = ref('');

const typeOptions = [
  { label: 'Tất cả', value: '' },
  { label: 'Hình ảnh', value: 'IMAGE' },
  { label: 'Video', value: 'VIDEO' },
  { label: 'Tài liệu', value: 'DOCUMENT' },
  { label: 'Khác', value: 'OTHER' },
];

const getTypeTagType = (type: string) => {
  const typeMap: Record<string, string> = {
    IMAGE: 'success',
    VIDEO: 'info',
    DOCUMENT: 'warning',
    OTHER: 'default',
  };
  return typeMap[type] || 'default';
};

const formatFileSize = (bytes?: number) => {
  if (!bytes) return '-';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
};

const columns = [
  {
    title: 'ID',
    key: 'id',
    width: 80,
  },
  {
    title: 'Hình ảnh',
    key: 'url',
    width: 150,
    render: (row: Media) => {
      if (row.type === 'IMAGE') {
        return h(NImage, {
          src: row.url,
          width: 100,
          height: 100,
          objectFit: 'cover',
          previewDisabled: false,
        });
      }
      return h(NIcon, { size: 40 }, { default: () => h(ImageIcon) });
    },
  },
  {
    title: 'Tên',
    key: 'name',
    width: 200,
  },
  {
    title: 'Loại',
    key: 'type',
    width: 120,
    render: (row: Media) => {
      return h(NTag, { type: getTypeTagType(row.type) }, { default: () => typeOptions.find(o => o.value === row.type)?.label || row.type });
    },
  },
  {
    title: 'Kích thước',
    key: 'size',
    width: 120,
    render: (row: Media) => formatFileSize(row.size),
  },
  {
    title: 'Thư mục',
    key: 'folder',
    width: 150,
    render: (row: Media) => row.folder || '-',
  },
  {
    title: 'Kích thước (px)',
    key: 'dimensions',
    width: 150,
    render: (row: Media) => row.width && row.height ? `${row.width}x${row.height}` : '-',
  },
  {
    title: 'Ngày tạo',
    key: 'createdAt',
    width: 180,
    render: (row: Media) => row.createdAt ? new Date(row.createdAt).toLocaleString('vi-VN') : '-',
  },
  {
    title: 'Thao tác',
    key: 'actions',
    width: 120,
    render: (row: Media) => {
      return h(NPopconfirm, {
        onPositiveClick: () => handleDelete(row.id),
      }, {
        trigger: () => h(NButton, {
          size: 'small',
          type: 'error',
        }, { default: () => 'Xóa', icon: () => h(NIcon, null, { default: () => h(Trash) }) }),
        default: () => 'Bạn có chắc muốn xóa file này?',
      });
    },
  },
];

// Mock data for UI preview
const mockMedia: Media[] = [
  {
    id: 1,
    name: 'product-image-1.jpg',
    url: 'https://via.placeholder.com/300x300',
    type: 'IMAGE',
    size: 102400,
    mimeType: 'image/jpeg',
    folder: 'products',
    width: 1920,
    height: 1080,
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    name: 'banner-home.jpg',
    url: 'https://via.placeholder.com/800x400',
    type: 'IMAGE',
    size: 204800,
    mimeType: 'image/jpeg',
    folder: 'banners',
    width: 1920,
    height: 1080,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 3,
    name: 'video-intro.mp4',
    url: 'https://via.placeholder.com/300x300',
    type: 'VIDEO',
    size: 5242880,
    mimeType: 'video/mp4',
    folder: 'videos',
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
];

const loadMedia = async () => {
  try {
    loading.value = true;
    
    // Real API call
    const response = await MediaService.getMedia({
      page: pagination.value.page - 1,
      size: pagination.value.pageSize,
    });
    mediaList.value = response.content;
    pagination.value.total = response.totalElements;
    loading.value = false;
  } catch (error: any) {
    message.error(error.response?.data?.message || 'Lỗi khi tải danh sách media');
    loading.value = false;
  }
};

const handleUpload = async (fileList: any[]) => {
  try {
    for (const file of fileList) {
      await MediaService.uploadImage(file.file, uploadFolder.value || undefined);
    }
    message.success('Upload thành công');
    showUploadModal.value = false;
    uploadFolder.value = '';
    await loadMedia();
  } catch (error: any) {
    message.error(error.response?.data?.message || 'Lỗi khi upload file');
  }
};

const handleDelete = async (mediaId: number) => {
  try {
    // Real API call
    await MediaService.deleteMedia(mediaId);
    message.success('Xóa file thành công');
    await loadMedia();
  } catch (error: any) {
    message.error(error.response?.data?.message || 'Lỗi khi xóa file');
  }
};

onMounted(() => {
  loadMedia();
});
</script>

<template>
  <div>
    <div class="flex justify-between items-center mb-4">
      <h1 class="text-2xl font-bold">Quản lý Media</h1>
      <NButton type="primary" @click="showUploadModal = true">
        <template #icon>
          <NIcon><Plus /></NIcon>
        </template>
        Upload Media
      </NButton>
    </div>

    <NDataTable
      :columns="columns"
      :data="mediaList"
      :loading="loading"
      :pagination="pagination"
      @update:page="(page) => { pagination.page = page; loadMedia(); }"
      @update:page-size="(size) => { pagination.pageSize = size; pagination.page = 1; loadMedia(); }"
      striped
      bordered
    />

    <NModal v-model:show="showUploadModal" title="Upload Media" preset="dialog" style="width: 500px">
      <div class="mb-4">
        <NInput v-model:value="uploadFolder" placeholder="Thư mục (tùy chọn)" />
      </div>
      <NUpload
        multiple
        :max="10"
        :on-finish="handleUpload"
        accept="image/*,video/*"
        directory-dnd
      >
        <NButton>Chọn file hoặc kéo thả</NButton>
      </NUpload>
      <template #action>
        <NButton @click="showUploadModal = false">Đóng</NButton>
      </template>
    </NModal>
  </div>
</template>

<style scoped>
</style>

