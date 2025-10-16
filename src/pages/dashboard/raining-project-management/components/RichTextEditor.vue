<script setup lang="ts">
import { shallowRef, onBeforeUnmount } from 'vue'
// @ts-ignore
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'
import type { IEditorConfig, IToolbarConfig } from '@wangeditor/editor'
import '@wangeditor/editor/dist/css/style.css'

interface Props {
  modelValue: string
  placeholder?: string
}

interface Emits {
  (e: 'update:modelValue', value: string): void
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '请输入内容'
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
  MENU_CONF: {},
}

const handleCreated = (editor: any) => {
  editorRef.value = editor
}

const handleChange = (editor: any) => {
  emit('update:modelValue', editor.getHtml())
}

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
    height: 300px !important;
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

