<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { message } from 'ant-design-vue'
import { ApartmentOutlined, SearchOutlined } from '@ant-design/icons-vue'
import type { AllUserModel, AllUsersQueryParams } from '@/api/system/personnel'
import { getAllUsersApi } from '@/api/system/personnel'
import { getAllOrganizationListApi } from '@/api/system/organization'

defineOptions({
  name: 'PersonnelManagement',
})

// 组织树相关
const treeData = ref<any[]>([])
const selectedOrg = ref<any>(null)
const expandedKeys = ref<(string | number)[]>([])
const selectedKeys = ref<(string | number)[]>([])
const treeLoading = ref<boolean>(false)
const loadedKeys = ref<Set<string | number>>(new Set()) // 记录已加载子节点的节点
// 搜索相关
const searchKeyword = ref<string>('')
const isSearching = ref<boolean>(false)
const loadingNodeKeys = ref<Set<number>>(new Set())

// 全量用户列表查询参数
const queryForm = reactive({
  userID: '',
  operatorName: '',
  orgName: '',
  page: 1,
  pageSize: 10,
  orderbyFiled: 'createTime:desc',
})

const loading = ref(false)
const usersList = ref<AllUserModel[]>([])
const total = ref(0)

// 表格列定义
const columns = [
  {
    title: '用户编号',
    dataIndex: 'operatorID',
    key: 'operatorID',
    width: 160,
  },
  {
    title: '用户昵称',
    dataIndex: 'operatorName',
    key: 'operatorName',
    width: 140,
  },
  {
    title: '单位',
    dataIndex: 'orgName',
    key: 'orgName',
    width: 200,
    ellipsis: true,
  },
  {
    title: '是否管理人',
    dataIndex: 'isAdmin',
    key: 'isAdmin',
    width: 120,
  },
  {
    title: '手机号',
    dataIndex: 'mobileNO',
    key: 'mobileNO',
    width: 140,
  },
  {
    title: '邮箱',
    dataIndex: 'oEmail',
    key: 'oEmail',
    width: 200,
    ellipsis: true,
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    width: 100,
  },
  {
    title: '操作',
    key: 'action',
    width: 150,
    fixed: 'right' as const,
  },
]

// 递归统计节点数量
const countNodes = (nodes: any[]): number => {
  let count = 0
  const traverse = (items: any[]) => {
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

// 递归查找节点
const findNode = (nodes: any[], targetId: number): any | null => {
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

// 加载组织数据
const loadOrganizations = async (parentOrgID: number = 0): Promise<any[]> => {
  const response = await getAllOrganizationListApi({
    limit: 10000,
    page: 1,
    startNum: 0,
    orderbyFiled: 'orgCode:asc',
    parentOrgID,
  })
  
  if (response && response.data && response.data.list) {
    // 直接使用原始数据，添加必要的属性
    return response.data.list.map(org => ({
      ...org,
      key: org.orgID,
      title: org.orgName,
      children: [], // 添加空的children数组
      isLeaf: false, // 假设所有节点都可能有子节点
    }))
  }
  
  return []
}

// 初始化组织树数据（加载顶级组织并自动展开第一级）
const initTreeData = async () => {
  try {
    treeLoading.value = true
    
    // 加载 parentOrgID = 0 的顶级组织
    const topLevelOrgs = await loadOrganizations(0)
    
    treeData.value = topLevelOrgs
    
    if (topLevelOrgs.length > 0) {
      // 自动展开第一级：为所有顶级组织加载子节点
      const expandKeys: number[] = []
      let totalChildren = 0
      
      for (const org of topLevelOrgs) {
        const children = await loadOrganizations(org.orgID)
        
        if (children.length > 0) {
          // 更新树数据
          const updateOrgChildren = (nodes: any[]): any[] => {
            return nodes.map(node => {
              if (node.orgID === org.orgID) {
                loadedKeys.value.add(org.orgID)
                expandKeys.push(org.orgID)
                totalChildren += children.length
                return {
                  ...node,
                  children: children,
                  isLeaf: false,
                }
              }
              return node
            })
          }
          
          treeData.value = updateOrgChildren(treeData.value)
        }
      }
      
      // 设置展开的节点
      expandedKeys.value = expandKeys
      
      if (totalChildren > 0) {
        message.success(`成功加载 ${topLevelOrgs.length} 个顶级组织和 ${totalChildren} 个子组织`)
      } else {
        message.success(`成功加载 ${topLevelOrgs.length} 个顶级组织`)
      }
    } else {
      message.warning('未获取到组织数据')
    }
  } catch (error) {
    console.error('获取组织列表失败:', error)
    message.error('获取组织列表失败，请稍后重试')
  } finally {
    treeLoading.value = false
  }
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
      parentOrgID: parentOrgID,
    })
    
    if (response && response.data && response.data.list) {
      const children = response.data.list.map(item => ({
        ...item,
        key: item.orgID,
        title: item.orgName,
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
        // 标记为已加载
        loadedKeys.value.add(parentOrgID)
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
    const node = info.node.dataRef
    const nodeId = node.orgID
    
    // 如果子节点为空数组且不是叶子节点，则加载子节点
    if (node.children && node.children.length === 0 && !node.isLeaf && !loadedKeys.value.has(nodeId)) {
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
    selectedOrg.value = info.node.dataRef
    queryForm.orgName = info.node.dataRef.orgName || ''
    // 自动查询该组织下的人员
    handleQuery()
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
    treeLoading.value = true
    
    // 调用接口，传递 orgName 参数进行搜索，不传 parentOrgID
    const response = await getAllOrganizationListApi({
      limit: 10000,
      page: 1,
      startNum: 0,
      orderbyFiled: 'orgCode:asc',
      orgName: keyword,
    })
    
    if (response && response.data && response.data.list) {
      // 搜索结果直接展示为扁平列表，不加载子节点
      treeData.value = response.data.list.map(item => ({
        ...item,
        key: item.orgID,
        title: item.orgName,
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
    treeLoading.value = false
  }
}

// 清空搜索，恢复到初始状态
const clearSearch = async () => {
  searchKeyword.value = ''
  isSearching.value = false
  selectedKeys.value = []
  selectedOrg.value = null
  expandedKeys.value = []
  loadedKeys.value.clear()
  await initTreeData()
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

// 获取全量用户列表
const fetchList = async () => {
  loading.value = true
  try {
    const params: AllUsersQueryParams = {
      limit: queryForm.pageSize,
      page: queryForm.page,
      startNum: (queryForm.page - 1) * queryForm.pageSize,
      orderbyFiled: queryForm.orderbyFiled,
    }
    
    // 添加搜索条件（只传递有值的字段）
    if (queryForm.orgName) {
      params.orgName = queryForm.orgName
    }
    if (queryForm.operatorName) {
      params.operatorName = queryForm.operatorName
    }
    if (queryForm.userID) {
      params.operatorID = Number(queryForm.userID)
    }
    
    const result = await getAllUsersApi(params)
    console.log(result);
    
    if (result.result === 1 && result.data) {
      usersList.value = result.data.list
      total.value = result.data.total
      message.success(`成功加载 ${result.data.list.length} 条用户数据`)
    } else {
      message.error(result.msg || '获取用户列表失败')
    }
  } catch (error) {
    console.error('获取全量用户列表失败:', error)
    message.error('获取用户列表失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

// 查询
const handleQuery = () => {
  queryForm.page = 1
  fetchList()
}

// 重置
const handleReset = () => {
  queryForm.userID = ''
  queryForm.operatorName = ''
  queryForm.orgName = ''
  queryForm.page = 1
  queryForm.pageSize = 10
  fetchList()
}

// 切换状态
const handleToggleStatus = async (record: any) => {
  try {
    // 状态处理 (1为正常，0为禁用)
    const newStatus = record.status === 1 ? 0 : 1
    // TODO: 调用状态更新接口
    // await updateUserStatusApi(record.operatorID, newStatus)
    record.status = newStatus
    message.success(newStatus === 1 ? '启用成功' : '禁用成功')
  } catch (error) {
    message.error('操作失败')
  }
}

// 分页变化
const handleTableChange = (pagination: any) => {
  queryForm.page = pagination.current
  queryForm.pageSize = pagination.pageSize
  fetchList()
}

onMounted(() => {
  initTreeData()
  fetchList()
})
</script>

<template>
  <div class="personnel-management">
    <div class="content-wrapper">
      <!-- 左侧组织树 -->
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
            :disabled="treeLoading"
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
                :loading="treeLoading"
                @click="handleSearch"
              >
                搜索
              </a-button>
            </template>
          </a-input>
        </div>

        <div v-if="treeLoading" class="loading-container">
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

      <!-- 右侧人员列表 -->
      <div class="right-panel">
        <div class="query-header">
          <h3>筛选查询</h3>
        </div>

        <div class="query-form">
          <a-form layout="inline">
            <a-form-item label="用户ID">
              <a-input 
                v-model:value="queryForm.userID" 
                placeholder="请输入" 
                allow-clear
                style="width: 180px"
                @pressEnter="handleQuery"
              />
            </a-form-item>
            <a-form-item label="姓名">
              <a-input 
                v-model:value="queryForm.operatorName" 
                placeholder="请输入" 
                allow-clear
                style="width: 180px"
                @pressEnter="handleQuery"
              />
            </a-form-item>
            <a-form-item label="组织名称">
              <a-input 
                v-model:value="queryForm.orgName" 
                placeholder="请输入" 
                allow-clear
                style="width: 200px"
                @pressEnter="handleQuery"
              />
            </a-form-item>
            <a-form-item>
              <a-space>
                <a-button type="primary" @click="handleQuery">
                  查询
                </a-button>
                <a-button @click="handleReset">
                  重置
                </a-button>
              </a-space>
            </a-form-item>
          </a-form>
        </div>

        <div class="table-header">
          <div class="table-info">
            <span class="info-label">数据列表</span>
            <span class="info-divider">数据共</span>
            <span class="info-value">{{ total }}</span>
            <span class="info-unit">条</span>
          </div>
        </div>

        <div class="table-container">
          <a-table
            :columns="columns"
            :data-source="usersList"
            :loading="loading"
            :pagination="{
              current: queryForm.page,
              pageSize: queryForm.pageSize,
              total: total,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total) => `共 ${total} 条`,
            }"
            :scroll="{ x: 1400 }"
            row-key="operatorID"
            @change="handleTableChange"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'operatorName'">
                <a class="user-link">{{ record.operatorName }}</a>
              </template>
              <template v-else-if="column.key === 'isAdmin'">
                <span>-</span>
              </template>
              <template v-else-if="column.key === 'mobileNO'">
                <span>{{ record.mobileNO || '-' }}</span>
              </template>
              <template v-else-if="column.key === 'oEmail'">
                <span>{{ record.oEmail || '-' }}</span>
              </template>
              <template v-else-if="column.key === 'status'">
                <a-tag :color="record.status === 1 ? 'green' : 'red'">
                  {{ record.status === 1 ? '启用' : '禁用' }}
                </a-tag>
              </template>
              <template v-else-if="column.key === 'action'">
                <a-space>
                  <a-button 
                    type="link" 
                    size="small"
                    @click="handleToggleStatus(record)"
                  >
                    {{ record.status === 1 ? '禁用' : '启用' }}
                  </a-button>
                </a-space>
              </template>
            </template>
          </a-table>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
.personnel-management {
  background: linear-gradient(135deg, #f5f7fa 0%, #f0f2f5 100%);
  // min-height: calc(100vh - 120px);

  .content-wrapper {
    display: flex;
    gap: 20px;
    min-height: calc(100vh - 180px);
    align-items: flex-start;
  }

  // 左侧组织树样式（复用组织架构页面）
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

  // 右侧人员列表样式
  .right-panel {
    flex: 1;
    background: #fff;
    border-radius: 16px;
    padding: 0;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
    overflow: hidden;
    display: flex;
    flex-direction: column;

    .query-header {
      padding: 24px 24px 16px;
      background: linear-gradient(135deg, rgba(64, 150, 255, 0.05) 0%, rgba(22, 119, 255, 0.05) 100%);
      border-bottom: 1px solid #f0f0f0;

      h3 {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
        color: rgba(0, 0, 0, 0.85);
      }
    }

    .query-form {
      padding: 20px 24px;
      background: #fff;
      border-bottom: 1px solid #f0f0f0;

      :deep(.ant-form-inline) {
        .ant-form-item {
          margin-bottom: 16px;
        }

        .ant-form-item-label {
          > label {
            color: rgba(0, 0, 0, 0.85);
            font-weight: 500;
          }
        }
      }
    }

    .table-header {
      padding: 16px 24px;
      background: #fafafa;
      border-bottom: 1px solid #f0f0f0;

      .table-info {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 14px;

        .info-label {
          color: rgba(0, 0, 0, 0.85);
          font-weight: 500;
        }

        .info-divider {
          color: rgba(0, 0, 0, 0.45);
        }

        .info-value {
          color: #4096ff;
          font-weight: 600;
          font-size: 18px;
        }

        .info-unit {
          color: rgba(0, 0, 0, 0.45);
        }
      }
    }

    .table-container {
      flex: 1;
      padding: 24px;
      overflow: auto;

      .user-link {
        color: #4096ff;
        cursor: pointer;

        &:hover {
          text-decoration: underline;
        }
      }
    }
  }
}
</style>
