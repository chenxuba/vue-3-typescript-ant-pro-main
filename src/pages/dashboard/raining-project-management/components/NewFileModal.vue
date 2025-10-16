<script setup lang="ts">
import { ref, watch } from 'vue'
import type { FormInstance, Rule } from 'ant-design-vue/es/form'
import { useCodeEditor } from '../composables/useCodeEditor'
import type { NewFileForm } from '../types'

interface Props {
  open: boolean
  parentPath: string
}

interface Emits {
  (e: 'update:open', value: boolean): void
  (e: 'confirm', formData: NewFileForm): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const formRef = ref<FormInstance>()
const formData = ref<NewFileForm>({
  fileName: '',
  commitMessage: '',
  fileContent: '',
})

const formRules: Record<string, Rule[]> = {
  fileName: [
    { required: true, message: '请输入文件名称', trigger: 'blur' },
  ],
  commitMessage: [
    { required: true, message: '请输入提交信息', trigger: 'blur' },
  ],
  fileContent: [
    { required: true, message: '请输入文件内容', trigger: 'blur' },
  ],
}

const { codeLineNumbers, updateLineNumbers, syncScroll, handleKeydown } = useCodeEditor()

// 监听内容变化更新行号
watch(() => formData.value.fileContent, (newValue) => {
  updateLineNumbers(newValue)
})

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

const handleKeydownWrapper = (e: KeyboardEvent) => {
  handleKeydown(e, formData.value.fileContent, (value) => {
    formData.value.fileContent = value
  })
}

// 监听弹窗打开，重置表单
watch(() => props.open, (newValue) => {
  if (newValue) {
    formData.value = {
      fileName: '',
      commitMessage: '',
      fileContent: '',
    }
    codeLineNumbers.value = [1]
    formRef.value?.clearValidate()
  }
})
</script>

<template>
  <a-modal 
    :open="open" 
    title="新建文件" 
    :footer="null" 
    width="880px" 
    centered
    @update:open="$emit('update:open', $event)"
  >
    <a-form ref="formRef" :model="formData" :rules="formRules" layout="vertical">
      <a-form-item label="文件名称或文件路径：" name="fileName" required>
        <a-input v-model:value="formData.fileName" placeholder="请输入文件名称">
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

      <a-form-item label="文件内容：" name="fileContent" required>
        <div class="code-editor-wrapper">
          <div class="code-editor-line-numbers">
            <div 
              v-for="line in codeLineNumbers" 
              :key="line" 
              class="line-number"
            >
              {{ line }}
            </div>
          </div>
          <textarea 
            v-model="formData.fileContent"
            class="code-editor-textarea"
            placeholder="请输入文件内容"
            @scroll="syncScroll"
            @keydown="handleKeydownWrapper"
            spellcheck="false"
          />
        </div>
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

/* 代码编辑器样式 */
.code-editor-wrapper {
  position: relative;
  display: flex;
  height: 400px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  background: #fff;
  overflow: hidden;
  transition: all 0.3s;

  &:hover {
    border-color: #40a9ff;
  }

  &:focus-within {
    border-color: #1890ff;
    box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.1);
  }

  .code-editor-line-numbers {
    flex-shrink: 0;
    width: 48px;
    height: 100%;
    background: #f6f8fa;
    border-right: 1px solid #e1e4e8;
    overflow-y: hidden;
    overflow-x: hidden;
    user-select: none;
    padding: 12px 0;
    text-align: right;

    .line-number {
      height: 21px;
      line-height: 21px;
      padding-right: 10px;
      font-family: 'Monaco', 'Menlo', 'Consolas', 'Courier New', monospace;
      font-size: 12px;
      color: #6e7781;
    }
  }

  .code-editor-textarea {
    flex: 1;
    height: 100%;
    border: none;
    outline: none;
    resize: none;
    padding: 12px;
    font-family: 'Monaco', 'Menlo', 'Consolas', 'Courier New', monospace;
    font-size: 13px;
    line-height: 21px;
    color: #24292e;
    background: #fff;
    overflow-y: auto;
    overflow-x: auto;
    tab-size: 2;

    &::placeholder {
      color: #bfbfbf;
    }

    &::-webkit-scrollbar {
      width: 10px;
      height: 10px;
    }

    &::-webkit-scrollbar-track {
      background: #f1f1f1;
    }

    &::-webkit-scrollbar-thumb {
      background: #c1c1c1;
      border-radius: 5px;

      &:hover {
        background: #a8a8a8;
      }
    }
  }
}
</style>

