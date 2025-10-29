<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { ApartmentOutlined, SearchOutlined } from '@ant-design/icons-vue'
import { getAllOrganizationListApi, type RawOrganizationModel } from '@/api/system/organization'

defineOptions({
  name: 'OrganizationManagement',
})

// 树形数据 - 直接使用原始数据格式，添加key属性以满足ant-design-vue的要求
interface TreeNode extends RawOrganizationModel {
  key: number // key必须存在且为number类型
  children?: TreeNode[]
  isLeaf?: boolean
}

const treeData = ref<TreeNode[]>([])
// 选中的组织
const selectedOrg = ref<RawOrganizationModel | null>(null)
// 展开的节点
const expandedKeys = ref<(string | number)[]>([])
// 选中的节点
const selectedKeys = ref<(string | number)[]>([])
// 搜索关键词
const searchKeyword = ref<string>('')
// 是否正在搜索
const isSearching = ref<boolean>(false)
// 加载状态
const loading = ref<boolean>(false)
// 正在加载子节点的节点集合
const loadingNodeKeys = ref<Set<number>>(new Set())

// 递归统计节点数量
const countNodes = (nodes: TreeNode[]): number => {
  let count = 0
  const traverse = (items: TreeNode[]) => {
    items.forEach((node) => {
      count++
      if (node.children && node.children.length > 0) {
        traverse(node.children)
      }
    })
  }
  traverse(nodes)
  return count
}

// 初始化数据（加载顶级组织）
const initData = async () => {
  try {
    loading.value = true
    
    // 调用接口获取顶级组织列表 (parentOrgID = 0)
    const response = await getAllOrganizationListApi({
      limit: 10000,
      page: 1,
      startNum: 0,
      orderbyFiled: 'orgCode:asc',
      parentOrgID: 0, // 默认传0，查询顶级组织
    })
    
    if (response && response.data && response.data.list) {
      // 直接使用原始数据，不转换格式，添加key属性
      treeData.value = response.data.list.map(item => ({
        ...item,
        key: item.orgID, // 添加key属性
        children: [], // 初始化children为空数组
        isLeaf: false, // 假设都有子节点，点击时再加载
      }))
      
      // 默认选中第一个节点
      if (treeData.value.length > 0) {
        selectedKeys.value = [treeData.value[0].orgID]
        selectedOrg.value = treeData.value[0]
        
        // 自动展开第一级：为所有顶级组织加载子节点
        const expandKeys: number[] = []
        let totalChildren = 0
        
        for (const node of treeData.value) {
          const childCount = await loadChildrenData(node.orgID, true) // silent=true，不显示错误消息
          if (childCount > 0) {
            expandKeys.push(node.orgID)
            totalChildren += childCount
          }
        }
        
        // 设置展开的节点
        expandedKeys.value = expandKeys
        
        if (totalChildren > 0) {
          message.success(`成功加载 ${treeData.value.length} 个顶级组织和 ${totalChildren} 个子组织`)
        } else {
          message.success(`成功加载 ${treeData.value.length} 个顶级组织`)
        }
      } else {
        message.success(`成功加载 ${treeData.value.length} 个顶级组织`)
      }
    } else {
      message.warning('未获取到组织数据')
    }
  } catch (error) {
    console.error('获取组织列表失败:', error)
    message.error('获取组织列表失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

// 递归查找节点
const findNode = (nodes: TreeNode[], targetId: number): TreeNode | null => {
  for (const node of nodes) {
    if (node.orgID === targetId) {
      return node
    }
    if (node.children && node.children.length > 0) {
      const found = findNode(node.children, targetId)
      if (found) return found
    }
  }
  return null
}

// 动态加载子节点
const loadChildrenData = async (parentOrgID: number, silent = false) => {
  try {
    loadingNodeKeys.value.add(parentOrgID)
    
    const response = await getAllOrganizationListApi({
      limit: 10000,
      page: 1,
      startNum: 0,
      orderbyFiled: 'orgCode:asc',
      parentOrgID: parentOrgID, // 传递父级ID
    })
    
    if (response && response.data && response.data.list) {
      const children = response.data.list.map(item => ({
        ...item,
        key: item.orgID, // 添加key属性
        children: [],
        isLeaf: false,
      }))
      
      // 找到父节点并更新其子节点
      const parentNode = findNode(treeData.value, parentOrgID)
      if (parentNode) {
        parentNode.children = children
        // 如果没有子节点，标记为叶子节点
        if (children.length === 0) {
          parentNode.isLeaf = true
        }
      }
      
      // 触发树的更新
      treeData.value = [...treeData.value]
      
      return children.length
    }
    return 0
  } catch (error) {
    console.error('加载子节点失败:', error)
    if (!silent) {
      message.error('加载子节点失败')
    }
    return 0
  } finally {
    loadingNodeKeys.value.delete(parentOrgID)
  }
}

// 树节点展开事件
const onExpand = async (expandedKeysValue: (string | number)[], info: any) => {
  expandedKeys.value = expandedKeysValue
  
  // 如果是展开操作且该节点还没有加载过子节点
  if (info.expanded) {
    const node = info.node as TreeNode
    const nodeId = node.orgID
    
    // 如果子节点为空数组且不是叶子节点，则加载子节点
    if (node.children && node.children.length === 0 && !node.isLeaf) {
      const count = await loadChildrenData(nodeId)
      if (count > 0) {
        message.success(`加载了 ${count} 个子组织`)
      }
    }
  }
}

// 选择树节点
const onSelectTree = (keys: (string | number)[], info: any) => {
  if (keys.length > 0) {
    selectedKeys.value = keys
    selectedOrg.value = info.node as RawOrganizationModel
  }
}

// 搜索组织
const searchOrganization = async () => {
  const keyword = searchKeyword.value.trim()
  
  if (!keyword) {
    // 如果搜索关键词为空，恢复到初始状态
    clearSearch()
    return
  }
  
  try {
    isSearching.value = true
    loading.value = true
    
    // 调用接口，传递 orgName 参数进行搜索，不传 parentOrgID
    const response = await getAllOrganizationListApi({
      limit: 10000,
      page: 1,
      startNum: 0,
      orderbyFiled: 'orgCode:asc',
      orgName: keyword, // 传递搜索关键词
    })
    
    if (response && response.data && response.data.list) {
      // 搜索结果直接展示为扁平列表，不加载子节点
      treeData.value = response.data.list.map(item => ({
        ...item,
        key: item.orgID,
        children: [],
        isLeaf: true, // 搜索结果标记为叶子节点
      }))
      
      // 清空选中状态
      selectedKeys.value = []
      selectedOrg.value = null
      expandedKeys.value = []
      
      message.success(`找到 ${treeData.value.length} 个匹配的组织`)
    } else {
      treeData.value = []
      message.warning('未找到匹配的组织')
    }
  } catch (error) {
    console.error('搜索组织失败:', error)
    message.error('搜索失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

// 清空搜索，恢复到初始状态
const clearSearch = async () => {
  searchKeyword.value = ''
  isSearching.value = false
  selectedKeys.value = []
  selectedOrg.value = null
  expandedKeys.value = []
  await initData()
}

// 处理搜索框输入事件
const handleSearch = () => {
  if (searchKeyword.value.trim()) {
    searchOrganization()
  } else {
    clearSearch()
  }
}

// 处理搜索框清空事件
const handleClear = () => {
  clearSearch()
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
            :disabled="loading"
            @pressEnter="handleSearch"
            @clear="handleClear"
          >
            <template #prefix>
              <SearchOutlined />
            </template>
            <template #suffix>
              <a-button 
                type="primary" 
                size="small" 
                :loading="loading"
                @click="handleSearch"
              >
                搜索
              </a-button>
            </template>
          </a-input>
        </div>

        <div v-if="loading" class="loading-container">
          <a-spin size="large" tip="加载中..." />
        </div>

        <div v-else-if="treeData.length === 0" class="empty-search">
          <a-empty description="未找到匹配的组织" />
        </div>

        <div v-else class="tree-container">
          <a-tree
            v-model:expanded-keys="expandedKeys"
            v-model:selected-keys="selectedKeys"
            :tree-data="treeData"
            :field-names="{ title: 'orgName', key: 'orgID', children: 'children' }"
            show-line
            @expand="onExpand"
            @select="onSelectTree"
          >
            <template #title="{ orgName, orgID }">
              <a-tooltip :title="orgName" placement="topLeft">
                <div class="tree-node-title">
                  <span class="node-name">{{ orgName }}</span>
                  <a-spin v-if="loadingNodeKeys.has(orgID)" size="small" class="ml-2" />
                </div>
              </a-tooltip>
            </template>
          </a-tree>
        </div>

        <div class="panel-footer">
          <div class="stats-info">
            <div class="stat-item">
              <span class="stat-label">{{ isSearching ? '搜索结果' : '已加载' }}</span>
              <span class="stat-value">{{ countNodes(treeData) }}</span>
            </div>
          </div>
          <div v-if="isSearching" class="search-tip">
            <a-button type="link" size="small" @click="clearSearch">
              清空搜索，返回树形结构
            </a-button>
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
              {{ selectedOrg.orgName }}
            </a-descriptions-item>
            <a-descriptions-item label="单位编号">
              {{ selectedOrg.orgCode }}
            </a-descriptions-item>
            <a-descriptions-item label="组织ID">
              {{ selectedOrg.orgID }}
            </a-descriptions-item>
            <a-descriptions-item label="上级单位ID">
              {{ selectedOrg.parentOrgID || '-' }}
            </a-descriptions-item>
            <a-descriptions-item label="上级单位名称">
              {{ selectedOrg.parentOrgName || '-' }}
            </a-descriptions-item>
            <a-descriptions-item label="是否有效">
              {{ selectedOrg.status === 1 ? '是' : '否' }}
            </a-descriptions-item>
            <a-descriptions-item label="序号">
              {{ selectedOrg.sortID || '-' }}
            </a-descriptions-item>
            <a-descriptions-item label="组织层级">
              {{ selectedOrg.orglevel || '-' }}
            </a-descriptions-item>
            <a-descriptions-item label="是否独立组织培训机构">
              {{ selectedOrg.isOrg === 1 ? '是' : '否' }}
            </a-descriptions-item>
            <a-descriptions-item label="是否虚拟组织机构">
              {{ selectedOrg.isVirOrg === 1 ? '是' : '否' }}
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
    align-items: flex-start;
  }

  .left-panel {
    width: 320px;
    height: fit-content;
    max-height: calc(100vh - 40px);
    background: #fff;
    border-radius: 16px;
    padding: 0;
    display: flex;
    flex-direction: column;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
    overflow: hidden;
    position: sticky;
    top: 20px;

    .panel-header {
      padding: 24px 20px 16px;
      background: linear-gradient(135deg, rgba(64, 150, 255, 0.05) 0%, rgba(22, 119, 255, 0.05) 100%);
      border-bottom: 1px solid #f0f0f0;
      position: relative;
      z-index: 1;

      .header-title {
        display: flex;
        align-items: center;
        gap: 12px;
        color: rgba(0, 0, 0, 0.85);

        .title-icon {
          width: 40px;
          height: 40px;
          background: rgba(64, 150, 255, 0.1);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          color: #4096ff;
          box-shadow: 0 2px 8px rgba(64, 150, 255, 0.1);
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
      background: #fff;

      .modern-search {
        border-radius: 8px;
        border: 1px solid #d9d9d9;
        background: #fff;
        transition: all 0.3s ease;

        &:hover {
          border-color: #4096ff;
        }

        &:focus-within {
          border-color: #4096ff;
          box-shadow: 0 0 0 2px rgba(64, 150, 255, 0.1);
        }

        :deep(.ant-input) {
          background: transparent;
          border: none;
          font-size: 14px;
          padding: 4px 11px;

          &::placeholder {
            color: rgba(0, 0, 0, 0.45);
          }
        }

        :deep(.ant-input-prefix) {
          color: rgba(0, 0, 0, 0.45);
          font-size: 14px;
        }
      }
    }

    .loading-container {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 40px 20px;
      background: #fff;
      margin: 0 20px 16px;

      :deep(.ant-spin) {
        .ant-spin-text {
          color: rgba(0, 0, 0, 0.65);
          font-size: 14px;
          margin-top: 8px;
        }

        .ant-spin-dot {
          .ant-spin-dot-item {
            background-color: #4096ff;
          }
        }
      }
    }

    .empty-search {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 40px 20px;
      background: #fff;
      margin: 0 20px 16px;

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
      background: #fff;
      margin: 0 20px;

      .search-result-tip {
        display: flex;
        align-items: center;
        gap: 0px;
        padding: 8px 12px;
        margin-bottom: 12px;
        background: rgba(64, 150, 255, 0.05);
        border-radius: 8px;
        font-size: 13px;
        color: rgba(0, 0, 0, 0.65);
        animation: slideDown 0.3s ease;

        span {
          font-weight: 500;
        }

        .anticon {
          color: #4096ff;
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
        background: rgba(0, 0, 0, 0.15);
        border-radius: 3px;
        
        &:hover {
          background: rgba(0, 0, 0, 0.25);
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
              background: rgba(0, 0, 0, 0.04);
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
            background: #4096ff;
            border-radius: 2px;
            transition: height 0.3s ease;
          }

          &:hover {
            background: rgba(0, 0, 0, 0.04);

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
            background: rgba(64, 150, 255, 0.1);
            font-weight: 500;

            &::before {
              height: 30px;
            }

            .tree-node-title {
              .node-name {
                color: #4096ff;
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
          color: rgba(0, 0, 0, 0.45);
          transition: all 0.3s ease;
          margin-top: 7px;
          &:hover {
            color: #4096ff;
            background: rgba(64, 150, 255, 0.1);
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
      background: #fafafa;
      border-top: 1px solid #f0f0f0;
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
          background: #fff;
          border-radius: 8px;
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);

          .stat-label {
            font-size: 13px;
            color: rgba(0, 0, 0, 0.65);
            font-weight: 500;
          }

          .stat-value {
            font-size: 16px;
            color: #4096ff;
            font-weight: 700;
          }
        }
      }

      .search-tip {
        margin-top: 12px;
        text-align: center;

        :deep(.ant-btn-link) {
          color: #4096ff;
          font-size: 12px;
          padding: 0;
          height: auto;

          &:hover {
            color: #1677ff;
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
      padding: 14px 32px;
      background: linear-gradient(135deg, rgba(64, 150, 255, 0.05) 0%, rgba(22, 119, 255, 0.05) 100%);
      border-bottom: 1px solid #f0f0f0;
      position: relative;

      &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        width: 4px;
        background: #4096ff;
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
          background: #fafafa;
          font-weight: 500;
          color: rgba(0, 0, 0, 0.75);
        }

        .ant-descriptions-item-content {
          background-color: #fff;
          color: rgba(0, 0, 0, 0.85);
          font-weight: 400;
        }

        .ant-descriptions-row {
          border-bottom: 1px solid #f0f0f0;

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
