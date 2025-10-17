<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { Empty } from 'ant-design-vue'
import { ApartmentOutlined } from '@ant-design/icons-vue'

defineOptions({
  name: 'OrganizationManagement',
})

// 树形数据
const treeData = ref<any[]>([])
// 原始树形数据（用于搜索过滤）
const originalTreeData = ref<any[]>([])
// 选中的组织
const selectedOrg = ref<any>(null)
// 展开的节点
const expandedKeys = ref<(string | number)[]>([])
// 选中的节点
const selectedKeys = ref<(string | number)[]>([])
// 搜索关键词
const searchKeyword = ref<string>('')

// 递归获取所有节点的key（用于默认展开所有节点）
const getAllKeys = (data: any[]): (string | number)[] => {
  const keys: (string | number)[] = []
  const traverse = (nodes: any[]) => {
    nodes.forEach((node) => {
      if (node.id) {
        keys.push(node.id)
      }
      if (node.children && node.children.length > 0) {
        traverse(node.children)
      }
    })
  }
  traverse(data)
  return keys
}

// 深度克隆树形数据
const deepClone = (data: any[]): any[] => {
  return JSON.parse(JSON.stringify(data))
}

// 递归过滤树形数据
const filterTree = (nodes: any[], keyword: string): any[] => {
  if (!keyword) return deepClone(nodes)
  
  const result: any[] = []
  
  nodes.forEach((node) => {
    const nodeCopy = { ...node }
    
    // 检查当前节点是否匹配
    const nameMatch = node.name?.toLowerCase().includes(keyword.toLowerCase())
    const codeMatch = node.code?.toLowerCase().includes(keyword.toLowerCase())
    
    // 递归处理子节点
    if (node.children && node.children.length > 0) {
      const filteredChildren = filterTree(node.children, keyword)
      if (filteredChildren.length > 0) {
        nodeCopy.children = filteredChildren
        result.push(nodeCopy)
      } else if (nameMatch || codeMatch) {
        // 当前节点匹配但没有匹配的子节点
        delete nodeCopy.children
        result.push(nodeCopy)
      }
    } else if (nameMatch || codeMatch) {
      // 叶子节点匹配
      result.push(nodeCopy)
    }
  })
  
  return result
}

// 获取匹配节点的所有父节点key（用于展开）
const getMatchedKeys = (nodes: any[], keyword: string): (string | number)[] => {
  if (!keyword) return []
  
  const keys: (string | number)[] = []
  
  const traverse = (nodes: any[], parentKeys: (string | number)[] = []): boolean => {
    let hasMatch = false
    
    nodes.forEach((node) => {
      const nameMatch = node.name?.toLowerCase().includes(keyword.toLowerCase())
      const codeMatch = node.code?.toLowerCase().includes(keyword.toLowerCase())
      const currentPath = [...parentKeys, node.id]
      
      let childMatch = false
      if (node.children && node.children.length > 0) {
        childMatch = traverse(node.children, currentPath)
      }
      
      if (nameMatch || codeMatch || childMatch) {
        // 添加当前节点和所有父节点的key
        keys.push(...currentPath)
        hasMatch = true
      }
    })
    
    return hasMatch
  }
  
  traverse(nodes)
  return [...new Set(keys)] // 去重
}

// 监听搜索关键词变化
watch(searchKeyword, (newKeyword) => {
  if (!newKeyword || newKeyword.trim() === '') {
    // 如果搜索框为空，显示所有数据并展开所有节点
    treeData.value = deepClone(originalTreeData.value)
    expandedKeys.value = getAllKeys(treeData.value)
  } else {
    // 过滤树形数据
    const keyword = newKeyword.trim()
    treeData.value = filterTree(originalTreeData.value, keyword)
    // 自动展开匹配的节点
    expandedKeys.value = getMatchedKeys(originalTreeData.value, keyword)
  }
})

// 初始化数据（模拟数据）
const initData = () => {
  const mockData = [
    {
      id: '1',
      name: '计算机网络信息中心',
      code: '241711',
      parentId: null,
      parentName: '中国科学院',
      isActive: true,
      order: 0,
      isIndependentTraining: true,
      isVirtual: false,
      children: [
        {
          id: '1-1',
          name: '大数据技术与应用发展部',
          code: '241711001',
          parentId: '1',
          parentName: '计算机网络信息中心',
          isActive: true,
          order: 1,
          isIndependentTraining: false,
          isVirtual: false,
          children: [
            {
              id: '1-1-1',
              name: '党群办公室',
              code: '241711001001',
              parentId: '1-1',
              parentName: '大数据技术与应用发展部',
              isActive: true,
              order: 1,
              isIndependentTraining: false,
              isVirtual: false,
            },
          ],
        },
        {
          id: '1-2',
          name: '高性能计算技术与应用发展部',
          code: '241711002',
          parentId: '1',
          parentName: '计算机网络信息中心',
          isActive: true,
          order: 2,
          isIndependentTraining: false,
          isVirtual: false,
        },
        {
          id: '1-3',
          name: '管理信息化技术与应用发展部',
          code: '241711003',
          parentId: '1',
          parentName: '计算机网络信息中心',
          isActive: true,
          order: 3,
          isIndependentTraining: false,
          isVirtual: false,
          children: [
            {
              id: '1-3-1',
              name: '广州中心',
              code: '241711003001',
              parentId: '1-3',
              parentName: '管理信息化技术与应用发展部',
              isActive: true,
              order: 1,
              isIndependentTraining: false,
              isVirtual: false,
            },
            {
              id: '1-3-2',
              name: '基地办公室',
              code: '241711003002',
              parentId: '1-3',
              parentName: '管理信息化技术与应用发展部',
              isActive: true,
              order: 2,
              isIndependentTraining: false,
              isVirtual: false,
            },
          ],
        },
      ],
    },
  ]
  
  // 保存原始数据
  originalTreeData.value = deepClone(mockData)
  treeData.value = deepClone(mockData)
  
  // 默认展开所有节点
  expandedKeys.value = getAllKeys(treeData.value)
  // 默认选中第一个节点
  if (treeData.value.length > 0) {
    selectedKeys.value = [treeData.value[0].id!]
    selectedOrg.value = treeData.value[0]
  }
}

// 选择树节点
const onSelectTree = (keys: (string | number)[], info: any) => {
  if (keys.length > 0) {
    selectedKeys.value = keys
    selectedOrg.value = info.node
  }
}

onMounted(() => {
  initData()
})
</script>

<template>
  <div class="organization-management">
    <!-- <div class="breadcrumb">
      系统管理 / 组织机构管理
    </div> -->

    <div class="content-wrapper">
      <!-- 左侧树形结构 -->
      <div class="left-panel">
        <div class="panel-header">
          <div class="header-title">
            <div class="title-icon">
              <ApartmentOutlined />
            </div>
            <span class="title-text">
              组织架构
            </span>
          </div>
        </div>

        <div class="search-box">
          <a-input 
            v-model:value="searchKeyword"
            placeholder="搜索组织名称..." 
            allow-clear
            class="modern-search"
          >
            <template #prefix>
              <SearchOutlined />
            </template>
          </a-input>
        </div>

        <div v-if="searchKeyword && treeData.length === 0" class="empty-search">
          <a-empty 
            description="未找到匹配的组织"
            :image="Empty.PRESENTED_IMAGE_SIMPLE"
          />
        </div>

        <div v-else class="tree-container">
          <div v-if="searchKeyword" class="search-result-tip">
            <InfoCircleOutlined />
            <span>搜索到 {{ getAllKeys(treeData).length }} 个匹配结果</span>
          </div>
          
          <a-tree
            v-model:expanded-keys="expandedKeys"
            v-model:selected-keys="selectedKeys"
            :tree-data="treeData"
            :field-names="{ title: 'name', key: 'id', children: 'children' }"
            show-line
            @select="onSelectTree"
          >
            <template #title="{ name }">
              <a-tooltip :title="name" placement="topLeft">
                <div class="tree-node-title">
                  <span class="node-name">{{ name }}</span>
                </div>
              </a-tooltip>
            </template>
          </a-tree>
        </div>

        <div class="panel-footer">
          <div class="stats-info">
            <div class="stat-item">
              <span class="stat-label">总数</span>
              <span class="stat-value">{{ getAllKeys(treeData).length }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧详情展示 -->
      <div class="right-panel">
        <div class="detail-header">
          <h3>基本信息</h3>
        </div>

        <div v-if="selectedOrg" class="detail-content">
          <a-descriptions bordered :column="1">
            <a-descriptions-item label="单位名称">
              {{ selectedOrg.name }}
            </a-descriptions-item>
            <a-descriptions-item label="单位编号">
              {{ selectedOrg.code }}
            </a-descriptions-item>
            <a-descriptions-item label="上级单位名称">
              {{ selectedOrg.parentName || '-' }}
            </a-descriptions-item>
            <a-descriptions-item label="是否有效">
              {{ selectedOrg.isActive ? '是' : '否' }}
            </a-descriptions-item>
            <a-descriptions-item label="序号">
              {{ selectedOrg.order }}
            </a-descriptions-item>
            <a-descriptions-item label="是否独立组织培训机构">
              {{ selectedOrg.isIndependentTraining ? '是' : '否' }}
            </a-descriptions-item>
            <a-descriptions-item label="是否虚拟组织机构">
              {{ selectedOrg.isVirtual ? '是' : '否' }}
            </a-descriptions-item>
          </a-descriptions>
        </div>
        <div v-else class="empty-content">
          <a-empty description="请在左侧选择组织" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
.organization-management {
  background: linear-gradient(135deg, #f5f7fa 0%, #f0f2f5 100%);
  // min-height: 100vh;
  // padding: 24px;

  .breadcrumb {
    margin-bottom: 16px;
    font-size: 14px;
    color: rgba(0, 0, 0, 0.45);
    padding: 12px 20px;
    background: rgba(255, 255, 255, 0.6);
    backdrop-filter: blur(10px);
    border-radius: 12px;
    display: inline-block;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  }

  .content-wrapper {
    display: flex;
    gap: 20px;
    min-height: calc(100vh - 180px);
  }

  .left-panel {
    width: 320px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 16px;
    padding: 0;
    display: flex;
    flex-direction: column;
    box-shadow: 0 10px 30px rgba(102, 126, 234, 0.2);
    overflow: hidden;
    position: relative;

    // 添加装饰性背景
    &::before {
      content: '';
      position: absolute;
      top: -50%;
      right: -50%;
      width: 200px;
      height: 200px;
      background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
      border-radius: 50%;
    }

    .panel-header {
      padding: 24px 20px 16px;
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      border-bottom: 1px solid rgba(255, 255, 255, 0.15);
      position: relative;
      z-index: 1;

      .header-title {
        display: flex;
        align-items: center;
        gap: 12px;
        color: #fff;

        .title-icon {
          width: 40px;
          height: 40px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          backdrop-filter: blur(10px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .title-text {
          font-size: 18px;
          font-weight: 600;
          letter-spacing: 0.5px;
          display: flex;
          align-items: center;
          gap: 8px;

          .title-prefix-icon {
            font-size: 18px;
            animation: iconPulse 2s ease-in-out infinite;
          }
        }

        @keyframes iconPulse {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.8;
          }
        }
      }
    }

    .search-box {
      padding: 16px 20px;
      position: relative;
      z-index: 1;

      .modern-search {
        border-radius: 12px;
        border: none;
        background: rgba(255, 255, 255, 0.95);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        transition: all 0.3s ease;

        &:hover {
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
          transform: translateY(-1px);
        }

        &:focus-within {
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.3);
        }

        :deep(.ant-input) {
          background: transparent;
          border: none;
          font-size: 14px;
          padding: 10px 12px;

          &::placeholder {
            color: rgba(0, 0, 0, 0.4);
          }
        }

        :deep(.ant-input-prefix) {
          color: rgba(102, 126, 234, 0.6);
          font-size: 16px;
        }
      }
    }

    .empty-search {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 40px 20px;
      background: rgba(255, 255, 255, 0.95);
      margin: 0 12px 16px;
      border-radius: 12px;
      position: relative;
      z-index: 1;

      :deep(.ant-empty) {
        .ant-empty-image {
          opacity: 0.6;
        }

        .ant-empty-description {
          color: rgba(0, 0, 0, 0.45);
          font-size: 14px;
        }
      }
    }

    .tree-container {
      flex: 1;
      overflow: auto;
      padding: 8px 16px 16px;
      background: rgba(255, 255, 255, 0.95);
      margin: 0 12px;
      border-radius: 12px;
      position: relative;
      z-index: 1;
      box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.04);

      .search-result-tip {
        display: flex;
        align-items: center;
        gap: 0px;
        padding: 8px 12px;
        margin-bottom: 12px;
        background: linear-gradient(90deg, rgba(102, 126, 234, 0.08) 0%, rgba(118, 75, 162, 0.08) 100%);
        border-radius: 8px;
        font-size: 13px;
        color: rgba(0, 0, 0, 0.65);
        animation: slideDown 0.3s ease;

        span {
          font-weight: 500;
        }

        .anticon {
          color: #667eea;
          font-size: 14px;
        }
      }

      @keyframes slideDown {
        from {
          opacity: 0;
          transform: translateY(-10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      // 自定义滚动条
      &::-webkit-scrollbar {
        width: 6px;
      }

      &::-webkit-scrollbar-track {
        background: rgba(0, 0, 0, 0.02);
        border-radius: 3px;
      }

      &::-webkit-scrollbar-thumb {
        background: rgba(102, 126, 234, 0.3);
        border-radius: 3px;
        
        &:hover {
          background: rgba(102, 126, 234, 0.5);
        }
      }

      :deep(.ant-tree) {
        background: transparent;
        color: rgba(0, 0, 0, 0.85);

        .ant-tree-treenode {
          padding: 4px 0;
          transition: all 0.3s ease;

          &:hover {
            .ant-tree-node-content-wrapper {
              background: linear-gradient(90deg, rgba(102, 126, 234, 0.08) 0%, rgba(118, 75, 162, 0.08) 100%);
            }
          }
        }

        .ant-tree-list-holder-inner {
          .ant-tree-treenode {
            width: 100%;

            .ant-tree-treenode-switcher-open,
            .ant-tree-treenode-switcher-close {
              width: 100%;
            }
          }
        }

        .ant-tree-node-content-wrapper {
          border-radius: 8px;
          padding: 8px 12px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          align-items: center;
          min-height: 40px;
          position: relative;
          flex: 1;
          overflow: hidden;

          &::before {
            content: '';
            position: absolute;
            left: 0;
            top: 50%;
            transform: translateY(-50%);
            width: 3px;
            height: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 2px;
            transition: height 0.3s ease;
          }

          &:hover {
            background: linear-gradient(90deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
            transform: translateX(4px);
            box-shadow: 0 2px 8px rgba(102, 126, 234, 0.15);

            &::before {
              height: 24px;
            }
          }

          .ant-tree-title {
            flex: 1;
            overflow: hidden;
            min-width: 0;
          }
        }

        .ant-tree-title {
          flex: 1;
          overflow: hidden;
          min-width: 0;
        }

        .ant-tree-node-selected {
          .ant-tree-node-content-wrapper {
            background: linear-gradient(90deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%);
            box-shadow: 0 3px 12px rgba(102, 126, 234, 0.2);
            transform: translateX(6px);
            font-weight: 500;

            &::before {
              height: 30px;
            }

            .tree-node-title {
              .node-name {
                color: #667eea;
                font-weight: 600;
              }
            }
          }
        }

        .ant-tree-switcher {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          color: rgba(102, 126, 234, 0.7);
          transition: all 0.3s ease;
          margin-top: 7px;
          &:hover {
            color: #667eea;
            background: rgba(102, 126, 234, 0.1);
            border-radius: 4px;
          }

          .ant-tree-switcher-icon {
            font-size: 12px;
          }
        }

        .ant-tree-iconEle {
          display: none;
        }
      }

      .tree-node-title {
        display: flex;
        align-items: center;
        gap: 8px;
        width: 100%;
        overflow: hidden;
        min-width: 0; // 确保flex子元素可以缩小

        .node-name {
          font-size: 14px;
          color: rgba(0, 0, 0, 0.85);
          transition: all 0.3s ease;
          line-height: 1.5;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          flex: 1;
          min-width: 0; // 确保flex子元素可以缩小
          display: block;
        }
      }
    }

    .panel-footer {
      padding: 16px 20px 20px;
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      border-top: 1px solid rgba(255, 255, 255, 0.15);
      position: relative;
      z-index: 1;

      .stats-info {
        display: flex;
        justify-content: center;
        gap: 16px;

        .stat-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 10px;
          backdrop-filter: blur(10px);

          .stat-label {
            font-size: 13px;
            color: rgba(255, 255, 255, 0.9);
            font-weight: 500;
          }

          .stat-value {
            font-size: 16px;
            color: #fff;
            font-weight: 700;
          }
        }
      }
    }
  }

  .right-panel {
    flex: 1;
    background: #fff;
    border-radius: 16px;
    padding: 0;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
    overflow: hidden;

    .detail-header {
      padding: 28px 32px;
      background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
      border-bottom: 1px solid rgba(102, 126, 234, 0.1);
      position: relative;

      &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        width: 4px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      }

      h3 {
        margin: 0;
        font-size: 20px;
        font-weight: 600;
        color: rgba(0, 0, 0, 0.85);
        display: flex;
        align-items: center;
        gap: 10px;

        &::before {
          content: '📋';
          font-size: 22px;
        }
      }
    }

    .detail-content {
      padding: 32px;

      :deep(.ant-descriptions) {
        .ant-descriptions-item-label {
          width: 200px;
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
          font-weight: 500;
          color: rgba(0, 0, 0, 0.75);
        }

        .ant-descriptions-item-content {
          background-color: #fff;
          color: rgba(0, 0, 0, 0.85);
          font-weight: 400;
        }

        .ant-descriptions-row {
          border-bottom: 1px solid rgba(102, 126, 234, 0.08);

          &:last-child {
            border-bottom: none;
          }
        }
      }
    }

    .empty-content {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 500px;
      padding: 32px;
    }
  }
}
</style>
