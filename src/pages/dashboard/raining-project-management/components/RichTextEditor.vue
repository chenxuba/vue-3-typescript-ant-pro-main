<script setup lang="ts">
import { shallowRef, onBeforeUnmount, watch, ref } from 'vue'
import { message } from 'ant-design-vue'
// @ts-ignore
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'
import type { IEditorConfig, IToolbarConfig } from '@wangeditor/editor'
import '@wangeditor/editor/dist/css/style.css'
import { uploadFileApi } from '@/api/common/file'
import { aiEmbellishApi } from '@/api/project'

interface Props {
  modelValue: string
  placeholder?: string
  height?: number
  showAiEmbellish?: boolean
}

interface Emits {
  (e: 'update:modelValue', value: string): void
  (e: 'change', value: string): void
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '请输入内容',
  height: 300,
  showAiEmbellish: true
})
const emit = defineEmits<Emits>()

// AI润色相关
const aiEmbellishLoading = ref(false)

const editorRef = shallowRef()

const toolbarConfig: Partial<IToolbarConfig> = {
  toolbarKeys: [
    'bold',
    'italic',
    'underline',
    'through',
    '|',
    'bulletedList',
    'numberedList',
    '|',
    'justifyLeft',
    'justifyCenter',
    'justifyRight',
    '|',
    'insertLink',
    'insertImage',
    '|',
    'undo',
    'redo',
  ],
}

const editorConfig: Partial<IEditorConfig> = {
  placeholder: props.placeholder,
  autoFocus: false,
  MENU_CONF: {
    // 配置上传图片
    uploadImage: {
      // 自定义上传
      async customUpload(file: File, insertFn: any) {
        try {
          // 调用上传接口
          const url = await uploadFileApi(file)
          // 插入图片到编辑器
          insertFn(url, file.name, url)
          message.success('图片上传成功')
        } catch (error) {
          console.error('图片上传失败:', error)
          message.error('图片上传失败')
        }
      },
      // 最大文件大小 10M
      maxFileSize: 10 * 1024 * 1024,
      // 最多上传 5 张图片
      maxNumberOfFiles: 5,
      // 选择文件时的类型限制
      allowedFileTypes: ['image/*'],
    },
  },
}

const handleCreated = (editor: any) => {
  editorRef.value = editor
  // 如果有初始值，设置到编辑器中
  if (props.modelValue) {
    editor.setHtml(props.modelValue)
  }
}

const handleChange = (editor: any) => {
  const html = editor.getHtml()
  emit('update:modelValue', html)
  emit('change', html)
}

// 监听 modelValue 变化，同步到编辑器
watch(() => props.modelValue, (newValue) => {
  const editor = editorRef.value
  if (editor == null) return
  
  // 只有当编辑器内容与新值不同时才更新，避免循环更新
  if (editor.getHtml() !== newValue) {
    editor.setHtml(newValue || '')
  }
})

onBeforeUnmount(() => {
  const editor = editorRef.value
  if (editor == null) return
  editor.destroy()
})

// AI润色处理函数
const handleAIEmbellish = async () => {
  // 检查是否有内容
  if (!props.modelValue || props.modelValue.trim() === '' || props.modelValue === '<p><br></p>') {
    message.warning('请先输入内容')
    return
  }

  try {
    aiEmbellishLoading.value = true
    // 调用AI润色接口
    const embellishedContent = await aiEmbellishApi(props.modelValue)
    
    // 更新内容
    emit('update:modelValue', embellishedContent)
    emit('change', embellishedContent)
    
    // 同步到编辑器
    const editor = editorRef.value
    if (editor != null) {
      editor.setHtml(embellishedContent)
    }
    
    message.success('AI润色成功')
  } catch (error) {
    console.error('AI润色失败:', error)
    message.error('AI润色失败，请稍后重试')
  } finally {
    aiEmbellishLoading.value = false
  }
}
</script>

<template>
  <div class="editor-wrapper">
    <div v-if="showAiEmbellish" class="ai-embellish-bar">
      <a-button 
        type="primary" 
        :loading="aiEmbellishLoading"
        @click="handleAIEmbellish"
        size="small"
      >
        AI润色
      </a-button>
    </div>
    <div class="editor-container">
      <Toolbar :editor="editorRef" :defaultConfig="toolbarConfig" :mode="'default'" class="editor-toolbar" />
      <Editor 
        :modelValue="modelValue" 
        :defaultConfig="editorConfig" 
        :mode="'default'" 
        class="editor-content"
        :style="{ height: `${height}px` }"
        @onCreated="handleCreated" 
        @onChange="handleChange" 
      />
    </div>
  </div>
</template>

<style scoped lang="less">
.editor-wrapper {
  width: 100%;
}

.ai-embellish-bar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 8px;
}

.editor-container {
  border: 1px solid #d9d9d9;
  border-radius: 2px;
  transition: all 0.3s;
  width: 100%;
  max-width: 100%;
  overflow: hidden;

  &:hover {
    border-color: #40a9ff;
  }

  &:focus-within {
    border-color: #1890ff;
    box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.1);
  }

  .editor-toolbar {
    border-bottom: 1px solid #e8e8e8;
    background: #fafafa;
    width: 100%;
    max-width: 100%;
    overflow: hidden;
  }

  .editor-content {
    overflow-y: auto;
    overflow-x: hidden;
    background: #fff;
    width: 100%;
    max-width: 100%;

    :deep(.w-e-text-container) {
      background: #fff;
      overflow-x: hidden !important;
      width: 100%;
      max-width: 100%;
    }

    :deep(.w-e-text-placeholder) {
      color: #bfbfbf;
    }

    :deep(.w-e-text-container [data-slate-editor]) {
      overflow-wrap: break-word !important;
      word-wrap: break-word !important;
      word-break: break-word !important;
      white-space: pre-wrap !important;
      width: 100%;
      max-width: 100%;
      overflow-x: hidden !important;
    }

    :deep(.w-e-text-container p) {
      overflow-wrap: break-word !important;
      word-wrap: break-word !important;
      word-break: break-word !important;
      white-space: pre-wrap !important;
      max-width: 100%;
    }

    :deep(.w-e-text-container div) {
      overflow-wrap: break-word !important;
      word-wrap: break-word !important;
      word-break: break-word !important;
      max-width: 100%;
    }

    :deep(.w-e-scroll) {
      overflow-x: hidden !important;
      width: 100%;
      max-width: 100%;
    }

    :deep(.w-e-text-container pre),
    :deep(.w-e-text-container code) {
      max-width: 100% !important;
      white-space: pre-wrap !important;
      word-wrap: break-word !important;
      word-break: break-word !important;
      overflow-wrap: break-word !important;
      overflow-x: auto !important;
    }

    :deep(.w-e-text-container span),
    :deep(.w-e-text-container strong),
    :deep(.w-e-text-container em) {
      overflow-wrap: break-word !important;
      word-wrap: break-word !important;
      word-break: break-word !important;
    }
  }
}
</style>

