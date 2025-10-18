<script setup lang="ts">
import { shallowRef, onBeforeUnmount, watch } from 'vue'
// @ts-ignore
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'
import type { IEditorConfig, IToolbarConfig } from '@wangeditor/editor'
import '@wangeditor/editor/dist/css/style.css'

interface Props {
  modelValue: string
  placeholder?: string
  height?: number
}

interface Emits {
  (e: 'update:modelValue', value: string): void
  (e: 'change', value: string): void
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '请输入内容',
  height: 300
})
const emit = defineEmits<Emits>()

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
  MENU_CONF: {},
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
</script>

<template>
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
</template>

<style scoped lang="less">
.editor-container {
  border: 1px solid #d9d9d9;
  border-radius: 2px;
  transition: all 0.3s;

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
  }

  .editor-content {
    overflow-y: auto;
    background: #fff;

    :deep(.w-e-text-container) {
      background: #fff;
    }

    :deep(.w-e-text-placeholder) {
      color: #bfbfbf;
    }
  }
}
</style>

