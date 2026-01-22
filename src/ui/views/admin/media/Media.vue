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
} from 'naive-ui';
import { Plus, Trash, Photo as ImageIcon } from '@vicons/tabler';
import MediaService from '@/core/services/api/media.service';
import type { Media } from '@/domain/models/media.model';
import { MediaType } from '@/domain/models/media.model';

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
  { label: 'Hình ảnh', value: MediaType.IMAGE },
  { label: 'Video', value: MediaType.VIDEO },
  { label: 'Tài liệu', value: MediaType.DOCUMENT },
  { label: 'Khác', value: MediaType.OTHER },
];

const getTypeTagType = (
  type: MediaType
): 'success' | 'info' | 'warning' | 'default' | 'error' | 'primary' => {
  const typeMap: Record<MediaType, 'success' | 'info' | 'warning' | 'default'> =
    {
      [MediaType.IMAGE]: 'success',
      [MediaType.VIDEO]: 'info',
      [MediaType.DOCUMENT]: 'warning',
      [MediaType.OTHER]: 'default',
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
          circle: true,
          type: 'error',
          quaternary: true,
        }, { icon: () => h(NIcon, null, { default: () => h(Trash) }) }),
        default: () => 'Bạn có chắc muốn xóa file này?',
      });
    },
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

// onFinish của NUpload nhận { file, event }
const handleUpload = (options: any) => {
  const fileInfo = options?.file;
  if (!fileInfo?.file) return;
  const file: File = fileInfo.file as File;
  MediaService.uploadImage(file, uploadFolder.value || undefined)
    .then(() => {
      message.success('Upload thành công');
      showUploadModal.value = false;
      uploadFolder.value = '';
      loadMedia();
    })
    .catch((error: any) => {
      message.error(error.response?.data?.message || 'Lỗi khi upload file');
    });
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

