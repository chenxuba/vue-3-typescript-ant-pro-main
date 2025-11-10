<script setup lang="ts">
import type { SelectedFile } from '../types'

interface Props {
  selectedFile: SelectedFile | null
  highlightedCode: string
  dynamicFileContents?: Record<string, string>
}

const props = defineProps<Props>()

// 下载文件
const handleDownload = () => {
  const file = props.selectedFile
  if (!file) return
  
  // 如果有 fileUrl，从服务器下载
  if (file.fileUrl) {
    // 拼接完整的文件URL
    const fullUrl = `${window.location.origin}${file.fileUrl}`
    
    // 创建一个隐藏的a标签来触发下载
    const link = document.createElement('a')
    link.href = fullUrl
    link.download = file.title // 使用文件名作为下载名称
    link.target = '_blank'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    console.log('下载文件:', fullUrl)
  } 
  // 如果没有 fileUrl 但有文件内容，下载本地内容
  else if (file.content || (props.dynamicFileContents && props.dynamicFileContents[file.key])) {
    const content = file.content || (props.dynamicFileContents?.[file.key] || '')
    
    // 创建 Blob 对象
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    
    // 创建下载链接
    const link = document.createElement('a')
    link.href = url
    link.download = file.title
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    // 释放 URL 对象
    URL.revokeObjectURL(url)
    
    console.log('下载本地文件:', file.title)
  }
}

// 判断是否可以下载
const canDownload = () => {
  const file = props.selectedFile
  if (!file) return false
  
  // 有 fileUrl 或者有文件内容都可以下载
  return !!(file.fileUrl || file.content || (props.dynamicFileContents && props.dynamicFileContents[file.key]))
}
</script>

<template>
  <div class="file-preview-area">
    <div v-if="selectedFile" class="file-preview">
      <div class="file-header">
        <span class="file-icon">📄</span>
        <span class="file-name">{{ selectedFile.title }}</span>
      </div>
      <div class="file-content">
        <div class="download-container">
          <a-button 
            type="primary" 
            size="large"
            :disabled="!canDownload()"
            @click="handleDownload"
          >
            点击下载
          </a-button>
        </div>
      </div>
    </div>
    <div v-else class="empty-preview">
      在左侧代码仓库区域点击目录打开文件
    </div>
  </div>
</template>

<style scoped lang="less">
.file-preview-area {
  flex: 1;
  background: #fff;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  .file-preview {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;

    .file-header {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 16px;
      background: #fafafa;
      border-bottom: 1px solid #e8e8e8;

      .file-icon {
        font-size: 16px;
      }

      .file-name {
        font-size: 14px;
        font-weight: 500;
        color: rgba(0, 0, 0, 0.85);
      }
    }

    .file-content {
      flex: 1;
      overflow: auto;
      padding: 16px;
      background: #f6f8fa;
      display: flex;
      align-items: center;
      justify-content: center;

      .download-container {
        display: flex;
        align-items: center;
        justify-content: center;
      }

      pre {
        margin: 0;
        padding: 16px;
        background: #fff;
        border-radius: 6px;
        border: 1px solid #e1e4e8;

        code.hljs {
          display: block;
          overflow-x: auto;
          padding: 0;
          background: transparent;
          font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
          font-size: 13px;
          line-height: 1.6;
          color: #24292e;
          white-space: pre;
          word-wrap: normal;
        }
      }
    }
  }

  .empty-preview {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    color: rgba(0, 0, 0, 0.45);
    font-size: 14px;
  }
}
</style>

