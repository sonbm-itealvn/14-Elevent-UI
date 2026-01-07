<script setup lang="ts">
import { ref } from 'vue';
import { NInput, NButton, NTag, useMessage, NIcon } from 'naive-ui';
import { X, Ticket } from '@vicons/tabler';
import CartService from '@/core/services/api/cart.service';

const props = defineProps<{
  cartToken?: string;
  appliedVoucherCode?: string;
  onVoucherApplied?: () => void;
  onVoucherRemoved?: () => void;
}>();

const emit = defineEmits<{
  voucherApplied: [];
  voucherRemoved: [];
}>();

const message = useMessage();
const voucherCode = ref('');
const loading = ref(false);
const appliedCode = ref(props.appliedVoucherCode || '');

const handleApplyVoucher = async () => {
  if (!voucherCode.value.trim()) {
    message.warning('Vui lòng nhập mã voucher');
    return;
  }

  try {
    loading.value = true;
    await CartService.applyVoucher(voucherCode.value.trim().toUpperCase(), props.cartToken);
    appliedCode.value = voucherCode.value.trim().toUpperCase();
    voucherCode.value = '';
    message.success('Áp dụng voucher thành công');
    emit('voucherApplied');
    props.onVoucherApplied?.();
  } catch (error: any) {
    message.error(
      error.response?.data?.message || 'Không thể áp dụng voucher. Vui lòng kiểm tra lại mã voucher.'
    );
  } finally {
    loading.value = false;
  }
};

const handleRemoveVoucher = async () => {
  try {
    loading.value = true;
    await CartService.removeVoucher(props.cartToken);
    appliedCode.value = '';
    message.success('Đã xóa voucher');
    emit('voucherRemoved');
    props.onVoucherRemoved?.();
  } catch (error: any) {
    message.error(error.response?.data?.message || 'Không thể xóa voucher');
  } finally {
    loading.value = false;
  }
};

// Watch for prop changes
import { watch } from 'vue';
watch(
  () => props.appliedVoucherCode,
  (newValue) => {
    appliedCode.value = newValue || '';
  }
);
</script>

<template>
  <div class="voucher-input-container">
    <div v-if="!appliedCode" class="flex gap-2">
      <NInput
        v-model:value="voucherCode"
        placeholder="Nhập mã voucher"
        :disabled="loading"
        class="flex-1"
        @keyup.enter="handleApplyVoucher"
      >
        <template #prefix>
          <NIcon><Ticket /></NIcon>
        </template>
      </NInput>
      <NButton
        type="primary"
        :loading="loading"
        :disabled="!voucherCode.trim()"
        @click="handleApplyVoucher"
      >
        Áp dụng
      </NButton>
    </div>
    <div v-else class="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
      <NTag type="success" size="large" class="font-mono font-semibold">
        {{ appliedCode }}
      </NTag>
      <span class="flex-1 text-sm text-green-700 dark:text-green-300">
        Voucher đã được áp dụng
      </span>
      <NButton
        size="small"
        type="error"
        :loading="loading"
        @click="handleRemoveVoucher"
      >
        <template #icon>
          <NIcon><X /></NIcon>
        </template>
        Xóa
      </NButton>
    </div>
  </div>
</template>

<style scoped>
.voucher-input-container {
  width: 100%;
}
</style>

