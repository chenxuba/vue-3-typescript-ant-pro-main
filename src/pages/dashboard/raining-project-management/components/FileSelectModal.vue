<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { message } from 'ant-design-vue'
import { getGitFileListApi, type GitFileItem } from '@/api/common/file'
import type { FileTreeNode } from '../types'

interface Props {
  open: boolean
  title?: string
  gitUrl?: string
}

interface Emits {
  (e: 'update:open', value: boolean): void
  (e: 'confirm', files: SelectedFile[]): void
  (e: 'cancel'): void
}

interface SelectedFile {
  name: string
  path: string
}

const props = withDefaults(defineProps<Props>(), {
  title: '选择文件',
  gitUrl: ''
})

const emit = defineEmits<Emits>()

// 文件树数据
const fileTreeData = ref<FileTreeNode[]>([])
const loading = ref(false)

// 展开的节点
const expandedKeys = ref<(string | number)[]>([])

// 当前选中的文件
const selectedKeys = ref<(string | number)[]>([])

// 已加载的文件夹节点（避免重复加载）
const loadedFolderKeys = ref<Set<string>>(new Set())

// 当前选中的文件信息
const selectedFileInfo = computed(() => {
  if (!selectedKeys.value || selectedKeys.value.length === 0) return null
  
  const key = String(selectedKeys.value[0])
  const node = findNodeByKey(fileTreeData.value, key)
  
  return node ? {
    name: node.title,
    path: key
  } : null
})

// 监听模态框打开
watch(() => props.open, (isOpen) => {
  if (isOpen) {
    loadFileTree()
    selectedKeys.value = []
    expandedKeys.value = []
    loadedFolderKeys.value.clear()
  }
})

// 加载文件树
const loadFileTree = async () => {
  if (!props.gitUrl) {
    message.error('请先配置代码仓库地址')
    fileTreeData.value = []
    return
  }

  try {
    loading.value = true
    // 调用API获取根目录文件列表
    const fileList: GitFileItem[] = await getGitFileListApi(props.gitUrl, '')
    
    // 将API返回的数据格式转换为树节点格式
    fileTreeData.value = convertToTreeNodes(fileList, '')
    
    console.log('加载文件树成功:', fileTreeData.value)
  } catch (error: any) {
    console.error('加载文件列表失败:', error)
    message.error(error.message || '加载文件列表失败')
    fileTreeData.value = []
  } finally {
    loading.value = false
  }
}

// 将API返回的文件列表转换为树节点格式
const convertToTreeNodes = (fileList: GitFileItem[], parentPath: string): FileTreeNode[] => {
  return fileList.map(item => {
    const fullPath = item.fileUrl || (parentPath ? `${parentPath}/${item.fileName}` : `/${item.fileName}`)
    const isLeaf = item.fileType === 'file'
    
    return {
      title: item.fileName,
      key: fullPath,
      isLeaf,
      children: isLeaf ? undefined : [],
      selectable: isLeaf, // 只有文件可选择
    }
  })
}

// 处理树节点展开
const handleTreeExpand = async (expandedKeysValue: (string | number)[], info: any) => {
  expandedKeys.value = expandedKeysValue || []
  
  const { expanded, node } = info
  
  // 如果是展开且该节点是文件夹且未加载过
  if (expanded && node && !node.isLeaf) {
    const nodeKey = String(node.key)
    const nodePath = nodeKey.replace(/^\//, '') // 移除开头的 /
    
    // 检查是否已加载
    if (loadedFolderKeys.value.has(nodeKey)) {
      return
    }
    
    try {
      console.log('加载文件夹：', nodePath, '节点key:', nodeKey)
      
      const loadingMsg = message.loading(`正在加载 ${node.title}...`, 0)
      
      // 调用API获取子文件列表
      const fileList = await getGitFileListApi(props.gitUrl, nodePath)
      
      // 加载子文件到树中
      loadChildrenData(nodeKey, fileList)
      
      // 标记该文件夹已加载
      loadedFolderKeys.value.add(nodeKey)
      
      loadingMsg()
      console.log('文件夹加载成功：', nodePath, fileList)
    } catch (error: any) {
      message.error(error.message || '加载文件夹失败')
      console.error('加载文件夹失败：', error)
    }
  }
}

// 加载子文件数据
const loadChildrenData = (parentKey: string, fileList: GitFileItem[]) => {
  if (!fileList || !Array.isArray(fileList)) return
  
  const parentNode = findNodeByKey(fileTreeData.value, parentKey)
  if (parentNode) {
    // 转换为树节点
    const childNodes = convertToTreeNodes(fileList, parentKey)
    parentNode.children = childNodes
  }
}

// 根据key查找节点
const findNodeByKey = (nodes: FileTreeNode[], key: string): FileTreeNode | null => {
  if (!nodes || !Array.isArray(nodes) || nodes.length === 0) return null
  
  for (const node of nodes) {
    if (String(node.key) === key) {
      return node
    }
    if (node.children && Array.isArray(node.children)) {
      const found = findNodeByKey(node.children, key)
      if (found) return found
    }
  }
  return null
}

// 处理树节点选择
const handleTreeSelect = (selectedKeysValue: (string | number)[], info: any) => {
  const { node } = info
  
  // 只能选择文件，不能选择文件夹
  if (node && node.isLeaf) {
    selectedKeys.value = selectedKeysValue || []
  }
}

// 确认选择
const handleConfirm = () => {
  // 从树中获取选中的文件
  if (!selectedFileInfo.value) {
    message.warning('请选择一个文件')
    return
  }
  
  const selectedFiles: SelectedFile[] = [selectedFileInfo.value]
  
  emit('confirm', selectedFiles)
  emit('update:open', false)
}

// 取消
const handleCancel = () => {
  emit('cancel')
  emit('update:open', false)
}
</script>

<template>
  <a-modal 
    :open="open" 
    :title="title" 
    width="800px" 
    centered
    @update:open="$emit('update:open', $event)"
  >
    <template #footer>
      <div class="modal-footer">
        <a-button @click="handleCancel">取消</a-button>
        <a-button type="primary" @click="handleConfirm">确定</a-button>
      </div>
    </template>

    <div class="file-select-modal-content">
      <div class="tabs">
        <div class="tab active">代码仓库</div>
        <div class="tab">私密代码仓库</div>
      </div>

      <a-spin :spinning="loading">
        <div class="file-tree-container">
          <div class="tree-header">
            <span class="tree-title">文件路径</span>
          </div>
          <div class="tree-content">
            <!-- 空状态 -->
            <a-empty 
              v-if="!fileTreeData || fileTreeData.length === 0"
              description="暂无文件"
              class="empty-tree"
            >
              <template #image>
                <div class="empty-icon">📂</div>
              </template>
            </a-empty>
            
            <!-- 文件树 -->
            <a-tree 
              v-else
              v-model:expanded-keys="expandedKeys"
              v-model:selected-keys="selectedKeys"
              :tree-data="fileTreeData" 
              :show-icon="false"
              :show-line="true" 
              @select="handleTreeSelect"
              @expand="handleTreeExpand"
            >
              <template #title="{ title, isLeaf, children }">
                <span class="tree-node-title-wrapper">
                  <span class="tree-node-title">
                    <span v-if="children !== undefined || isLeaf === false" class="folder-icon">📁</span>
                    <span v-else class="file-icon">📄</span>
                    <span class="tree-node-text" :title="title">{{ title }}</span>
                  </span>
                </span>
              </template>
            </a-tree>
          </div>
        </div>
      </a-spin>

      <div class="selected-section">
        <div class="section-title">已选中的文件:</div>
        
        <div class="selected-list">
          <a-tag 
            v-if="selectedFileInfo" 
            closable
            @close="() => selectedKeys = []"
            class="file-tag"
          >
            {{ selectedFileInfo.name }}
          </a-tag>
          <div v-if="!selectedFileInfo" class="empty-selected">
            未选择文件
          </div>
        </div>
      </div>
    </div>
  </a-modal>
</template>

<style scoped lang="less">
.file-select-modal-content {
  .tabs {
    display: flex;
    gap: 24px;
    margin-bottom: 20px;
    border-bottom: 2px solid #e8e8e8;

    .tab {
      padding: 8px 16px;
      cursor: pointer;
      font-size: 14px;
      color: rgba(0, 0, 0, 0.65);
      position: relative;
      transition: all 0.3s;

      &:hover {
        color: #1890ff;
      }

      &.active {
        color: #1890ff;
        font-weight: 500;

        &::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          right: 0;
          height: 2px;
          background: #1890ff;
        }
      }
    }
  }

  .file-tree-container {
    min-height: 300px;
    max-height: 400px;
    margin-bottom: 20px;
    background: #fff;
    border: 1px solid #e8e8e8;
    border-radius: 4px;
    display: flex;
    flex-direction: column;
    overflow: hidden;

    .tree-header {
      padding: 8px 16px;
      background: #fafafa;
      border-bottom: 1px solid #e8e8e8;

      .tree-title {
        font-size: 14px;
        font-weight: 500;
        color: rgba(0, 0, 0, 0.85);
      }
    }

    .tree-content {
      flex: 1;
      padding: 12px;
      overflow-y: auto;

      .empty-tree {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 200px;
        
        .empty-icon {
          font-size: 64px;
          margin-bottom: 16px;
          opacity: 0.3;
        }

        :deep(.ant-empty-description) {
          color: rgba(0, 0, 0, 0.45);
          font-size: 14px;
        }
      }

      :deep(.ant-tree) {
        background: transparent;
        font-size: 14px;

        .ant-tree-treenode {
          padding: 2px 0;
          width: 100%;

          &:hover {
            background: #f5f5f5;
          }
        }

        .ant-tree-node-content-wrapper {
          width: 100% !important;
          flex: 1 !important;
          
          &:hover {
            background: transparent;
          }

          &.ant-tree-node-selected {
            background: #e6f7ff !important;
          }
        }

        .ant-tree-title {
          width: 100%;
        }

        .tree-node-title-wrapper {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          min-width: 0;
          padding-right: 4px;

          .tree-node-title {
            display: flex;
            align-items: center;
            gap: 6px;
            flex: 1;
            min-width: 0;
            overflow: hidden;

            .folder-icon,
            .file-icon {
              font-size: 14px;
              flex-shrink: 0;
            }

            .tree-node-text {
              flex: 1;
              min-width: 0;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
            }
          }
        }
      }
    }
  }

  .selected-section {
    .section-title {
      font-size: 14px;
      color: rgba(0, 0, 0, 0.85);
      margin-bottom: 12px;
      font-weight: 500;
    }

    .selected-list {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      min-height: 40px;
      padding: 12px;
      background: #fafafa;
      border-radius: 4px;
      border: 1px solid #e8e8e8;

      .file-tag {
        margin: 0;
      }

      .empty-selected {
        width: 100%;
        text-align: center;
        color: rgba(0, 0, 0, 0.45);
        font-size: 14px;
      }
    }
  }
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>

