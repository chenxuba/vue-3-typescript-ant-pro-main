<script setup lang="ts">
import { ref, watch } from 'vue'
import type { FormInstance, Rule } from 'ant-design-vue/es/form'
import type { NewFolderForm } from '../types'

interface Props {
  open: boolean
  parentPath: string
}

interface Emits {
  (e: 'update:open', value: boolean): void
  (e: 'confirm', formData: NewFolderForm): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const formRef = ref<FormInstance>()
const formData = ref<NewFolderForm>({
  folderName: '',
  commitMessage: '',
})

const formRules: Record<string, Rule[]> = {
  folderName: [
    { required: true, message: '请输入文件夹名称', trigger: 'blur' },
  ],
  commitMessage: [
    { required: true, message: '请输入提交信息', trigger: 'blur' },
  ],
}

const handleCancel = () => {
  emit('update:open', false)
  formRef.value?.resetFields()
}

const handleConfirm = async () => {
  try {
    await formRef.value?.validate()
    emit('confirm', { ...formData.value })
    formRef.value?.resetFields()
  } catch (error) {
    console.error('表单验证失败：', error)
  }
}

// 监听弹窗打开，重置表单
watch(() => props.open, (newValue) => {
  if (newValue) {
    formData.value = {
      folderName: '',
      commitMessage: '',
    }
    formRef.value?.clearValidate()
  }
})
</script>

<template>
  <a-modal 
    :open="open" 
    title="新建文件夹" 
    :footer="null" 
    width="600px" 
    centered
    @update:open="$emit('update:open', $event)"
  >
    <a-form ref="formRef" :model="formData" :rules="formRules" layout="vertical">
      <a-form-item label="文件夹名称：" name="folderName" required>
        <a-input v-model:value="formData.folderName" placeholder="请输入文件夹名称">
          <template #addonBefore>
            <div class="min-w-100px max-w-150px">{{ parentPath }}</div>
          </template>
        </a-input>
      </a-form-item>

      <a-form-item label="提交信息：" name="commitMessage" required>
        <a-input 
          v-model:value="formData.commitMessage" 
          placeholder="请输入本次提交的主要信息，合理的描信息有利于代历史记录的查理"
        />
      </a-form-item>
    </a-form>

    <div class="modal-footer">
      <a-button @click="handleCancel">取消</a-button>
      <a-button type="primary" @click="handleConfirm">确定</a-button>
    </div>
  </a-modal>
</template>

<style scoped lang="less">
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}
</style>

