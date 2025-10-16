<script setup lang="ts">
import { ExclamationCircleOutlined } from '@ant-design/icons-vue'

interface Props {
  open: boolean
}

interface Emits {
  (e: 'update:open', value: boolean): void
  (e: 'confirm'): void
  (e: 'cancel'): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

const handleConfirm = () => {
  emit('confirm')
}

const handleCancel = () => {
  emit('cancel')
}
</script>

<template>
  <a-modal 
    :open="open" 
    title="开启版本库" 
    :footer="null" 
    width="480px" 
    centered
    @update:open="$emit('update:open', $event)"
  >
    <div class="repository-modal-content">
      <div class="modal-icon">
        <ExclamationCircleOutlined style="color: #faad14; font-size: 24px;" />
      </div>
      <div class="modal-text">
        新建实践题关卡时，需要使用代码仓库；如果只有选择关卡，则不需要代码仓库。代码仓库启用后，将无法关闭。
      </div>
    </div>
    <div class="modal-footer">
      <a-button @click="handleCancel">不开启</a-button>
      <a-button type="primary" @click="handleConfirm">开启</a-button>
    </div>
  </a-modal>
</template>

<style scoped lang="less">
.repository-modal-content {
  display: flex;
  gap: 16px;
  padding: 16px 0;

  .modal-icon {
    flex-shrink: 0;
  }

  .modal-text {
    flex: 1;
    font-size: 14px;
    line-height: 1.6;
    color: rgba(0, 0, 0, 0.85);
  }
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}
</style>

