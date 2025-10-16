<script setup lang="ts">
import { MoreOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import type { FileTreeNode } from '../types'

interface Props {
  fileTreeData: FileTreeNode[]
  expandedKeys: string[]
}

interface Emits {
  (e: 'update:expandedKeys', value: string[]): void
  (e: 'select', selectedKeys: any[], info: any): void
  (e: 'menu-click', info: any, nodeData: any): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

const handleUpdateExpandedKeys = (keys: string[]) => {
  emit('update:expandedKeys', keys)
}

const handleSelect = (selectedKeys: any[], info: any) => {
  emit('select', selectedKeys, info)
}

const handleMenuClick = (info: any, nodeData: any) => {
  emit('menu-click', info, nodeData)
}
</script>

<template>
  <div class="file-tree-container">
    <div class="tree-header">
      <span class="tree-title">文件目录</span>
    </div>
    <div class="tree-content">
      <a-tree 
        :expanded-keys="expandedKeys" 
        @update:expanded-keys="handleUpdateExpandedKeys"
        :tree-data="fileTreeData" 
        :show-icon="false"
        :show-line="true" 
        @select="handleSelect"
      >
        <template #title="{ title, isLeaf, children, key }">
          <span class="tree-node-title-wrapper">
            <span class="tree-node-title">
              <span v-if="children !== undefined || isLeaf === false" class="folder-icon">📁</span>
              <span v-else class="file-icon">📄</span>
              {{ title }}
            </span>
            <a-dropdown :trigger="['click']" placement="bottomRight">
              <template #overlay>
                <a-menu @click="(info) => handleMenuClick(info, { key, title, isLeaf, children })">
                  <!-- 文件夹菜单 -->
                  <template v-if="children !== undefined || isLeaf === false">
                    <a-menu-item key="newFile">
                      <span>新建文件</span>
                    </a-menu-item>
                    <a-menu-item key="newFolder">
                      <span>新建文件夹</span>
                    </a-menu-item>
                    <a-menu-item key="upload">
                      <span>上传</span>
                    </a-menu-item>
                    <a-menu-divider />
                    <a-menu-item key="copyPath">
                      <span>复制路径</span>
                    </a-menu-item>
                    <a-menu-item key="delete" danger>
                      <span>删除</span>
                    </a-menu-item>
                  </template>
                  <!-- 文件菜单 -->
                  <template v-else>
                    <a-menu-item key="rename">
                      <span>重命名</span>
                    </a-menu-item>
                    <a-menu-item key="copyPath">
                      <span>复制路径</span>
                    </a-menu-item>
                    <a-menu-item key="delete" danger>
                      <span>删除</span>
                    </a-menu-item>
                  </template>
                </a-menu>
              </template>
              <span class="tree-node-more" @click.stop>
                <MoreOutlined />
              </span>
            </a-dropdown>
          </span>
        </template>
      </a-tree>
    </div>
  </div>
</template>

<style scoped lang="less">
.file-tree-container {
  flex: 1;
  min-height: 250px;
  max-height: 500px;
  margin: 0 12px 4px 12px;
  background: #fff;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  .tree-header {
    padding: 4px 16px;
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
        }

        .tree-node-more {
          display: none;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          border-radius: 2px;
          cursor: pointer;
          color: rgba(0, 0, 0, 0.45);
          transition: all 0.2s;
          flex-shrink: 0;
          margin-left: 8px;
          transform: rotate(90deg);
          color: #333;
          font-weight: bold;
          
          &:hover {
            background: rgba(0, 0, 0, 0.06);
            color: rgba(0, 0, 0, 1);
          }
        }

        &:hover {
          .tree-node-more {
            display: flex;
          }
        }
      }
    }
  }
}
</style>

