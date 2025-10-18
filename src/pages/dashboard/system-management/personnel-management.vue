<script setup lang="ts">
import { ref, onMounted, watch, reactive } from 'vue'
import { Empty, message } from 'ant-design-vue'
import { ApartmentOutlined, SearchOutlined, InfoCircleOutlined } from '@ant-design/icons-vue'
import type { PersonnelModel, PersonnelQueryParams } from '@/api/system/personnel'
import { getPersonnelListApi, updatePersonnelStatusApi } from '@/api/system/personnel'
import { getAllOrganizationListApi, type RawOrganizationModel, type OrganizationModel } from '@/api/system/organization'

defineOptions({
  name: 'PersonnelManagement',
})

// 组织树相关
const treeData = ref<any[]>([])
const originalTreeData = ref<any[]>([])
const selectedOrg = ref<any>(null)
const expandedKeys = ref<(string | number)[]>([])
const selectedKeys = ref<(string | number)[]>([])
const searchKeyword = ref<string>('')
const treeLoading = ref<boolean>(false)

// 人员列表相关
const queryForm = reactive<PersonnelQueryParams>({
  userCode: '',
  userName: '',
  organization: '',
  organizationId: undefined,
  pageNum: 1,
  pageSize: 10,
})

const loading = ref(false)
const personnelList = ref<PersonnelModel[]>([])
const total = ref(0)

// 表格列定义
const columns = [
  {
    title: '用户编号',
    dataIndex: 'userCode',
    key: 'userCode',
    width: 160,
  },
  {
    title: '用户姓名',
    dataIndex: 'userName',
    key: 'userName',
    width: 140,
  },
  {
    title: '单位',
    dataIndex: 'organization',
    key: 'organization',
    ellipsis: true,
  },
  {
    title: '是否自然人',
    dataIndex: 'isNaturalPerson',
    key: 'isNaturalPerson',
    width: 140,
  },
  {
    title: '手机号',
    dataIndex: 'phone',
    key: 'phone',
    width: 180,
  },
  {
    title: '邮箱',
    dataIndex: 'email',
    key: 'email',
    width: 260,
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

// 递归获取所有节点的key
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
    
    const nameMatch = node.name?.toLowerCase().includes(keyword.toLowerCase())
    const codeMatch = node.code?.toLowerCase().includes(keyword.toLowerCase())
    
    if (node.children && node.children.length > 0) {
      const filteredChildren = filterTree(node.children, keyword)
      if (filteredChildren.length > 0) {
        nodeCopy.children = filteredChildren
        result.push(nodeCopy)
      } else if (nameMatch || codeMatch) {
        delete nodeCopy.children
        result.push(nodeCopy)
      }
    } else if (nameMatch || codeMatch) {
      result.push(nodeCopy)
    }
  })
  
  return result
}

// 获取匹配节点的所有父节点key
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
        keys.push(...currentPath)
        hasMatch = true
      }
    })
    
    return hasMatch
  }
  
  traverse(nodes)
  return [...new Set(keys)]
}

// 监听搜索关键词变化
watch(searchKeyword, (newKeyword) => {
  if (!newKeyword || newKeyword.trim() === '') {
    treeData.value = deepClone(originalTreeData.value)
    expandedKeys.value = getAllKeys(treeData.value)
  } else {
    const keyword = newKeyword.trim()
    treeData.value = filterTree(originalTreeData.value, keyword)
    expandedKeys.value = getMatchedKeys(originalTreeData.value, keyword)
  }
})

// 将原始 API 数据转换为组织模型
const convertRawToOrganization = (raw: RawOrganizationModel): OrganizationModel => {
  return {
    id: raw.orgID,
    name: raw.orgName,
    code: raw.orgCode,
    parentId: raw.parentOrgID || null,
    parentName: raw.parentOrgName,
    isActive: raw.status === 1,
    order: raw.sortID,
    isIndependentTraining: raw.isOrg === 1,
    isVirtual: raw.isVirOrg === 1,
  }
}

// 将扁平列表转换为树形结构
const buildTree = (list: OrganizationModel[]): OrganizationModel[] => {
  const map = new Map<string | number, OrganizationModel>()
  const roots: OrganizationModel[] = []
  
  // 先将所有节点放入 map
  list.forEach((item) => {
    map.set(item.id!, { ...item, children: [] })
  })
  
  // 构建树形结构
  list.forEach((item) => {
    const node = map.get(item.id!)
    if (!node) return
    
    if (item.parentId && map.has(item.parentId)) {
      // 有父节点，添加到父节点的 children 中
      const parent = map.get(item.parentId)
      if (parent) {
        if (!parent.children) {
          parent.children = []
        }
        parent.children.push(node)
      }
    } else {
      // 没有父节点或父节点不存在，作为根节点
      roots.push(node)
    }
  })
  
  return roots
}

// 初始化组织树数据（调用真实接口）
const initTreeData = async () => {
  try {
    treeLoading.value = true
    
    // 调用真实接口获取组织列表
    const response = await getAllOrganizationListApi({
      limit: 10000, // 获取所有数据
      page: 1,
      startNum: 0,
      orderbyFiled: 'orgCode:asc',
    })
    
    if (response && response.data && response.data.list) {
      // 转换数据格式
      const organizations = response.data.list.map(convertRawToOrganization)
      
      // 构建树形结构
      const treeStructure = buildTree(organizations)
      
      // 保存原始数据
      originalTreeData.value = deepClone(treeStructure)
      treeData.value = deepClone(treeStructure)
      
      // 默认展开所有节点
      expandedKeys.value = getAllKeys(treeData.value)
      
      // 默认选中第一个节点
      if (treeData.value.length > 0) {
        selectedKeys.value = [treeData.value[0].id!]
        selectedOrg.value = treeData.value[0]
        queryForm.organizationId = treeData.value[0].id
      }
      
      message.success(`成功加载 ${organizations.length} 个组织`)
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

// 选择树节点
const onSelectTree = (keys: (string | number)[], info: any) => {
  if (keys.length > 0) {
    selectedKeys.value = keys
    selectedOrg.value = info.node
    queryForm.organizationId = info.node.id
    // 自动查询该组织下的人员
    handleQuery()
  }
}

// 获取人员列表
const fetchPersonnelList = async () => {
  loading.value = true
  try {
    const result = await getPersonnelListApi(queryForm)
    if (result.data) {
      personnelList.value = result.data.list
      total.value = result.data.total
    }
  } catch (error) {
    message.error('获取人员列表失败')
  } finally {
    loading.value = false
  }
}

// 查询
const handleQuery = () => {
  queryForm.pageNum = 1
  fetchPersonnelList()
}

// 重置
const handleReset = () => {
  queryForm.userCode = ''
  queryForm.userName = ''
  queryForm.organization = ''
  queryForm.pageNum = 1
  queryForm.pageSize = 10
  fetchPersonnelList()
}

// 切换状态
const handleToggleStatus = async (record: any) => {
  try {
    const newStatus = !record.status
    await updatePersonnelStatusApi(record.id, newStatus)
    record.status = newStatus
    message.success(record.status ? '启用成功' : '禁用成功')
  } catch (error) {
    message.error('操作失败')
  }
}

// 分页变化
const handleTableChange = (pagination: any) => {
  queryForm.pageNum = pagination.current
  queryForm.pageSize = pagination.pageSize
  fetchPersonnelList()
}

onMounted(() => {
  initTreeData()
  fetchPersonnelList()
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
          >
            <template #prefix>
              <SearchOutlined />
            </template>
          </a-input>
        </div>

        <div v-if="treeLoading" class="loading-container">
          <a-spin size="large" tip="加载中..." />
        </div>

        <div v-else-if="searchKeyword && treeData.length === 0" class="empty-search">
          <a-empty 
            description="未找到匹配的组织"
            :image="Empty.PRESENTED_IMAGE_SIMPLE"
          />
        </div>

        <div v-else class="tree-container">
          <div v-if="searchKeyword" class="search-result-tip">
            <InfoCircleOutlined />
            <span class="ml-6px">搜索到 {{ getAllKeys(treeData).length }} 个匹配结果</span>
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

      <!-- 右侧人员列表 -->
      <div class="right-panel">
        <div class="query-header">
          <h3>筛选查询</h3>
        </div>

        <div class="query-form">
          <a-form layout="inline">
            <a-form-item label="用户编号">
              <a-input 
                v-model:value="queryForm.userCode" 
                placeholder="请输入" 
                allow-clear
                style="width: 180px"
              />
            </a-form-item>
            <a-form-item label="姓名">
              <a-input 
                v-model:value="queryForm.userName" 
                placeholder="请输入" 
                allow-clear
                style="width: 180px"
              />
            </a-form-item>
            <a-form-item label="单位">
              <a-input 
                v-model:value="queryForm.organization" 
                placeholder="请输入" 
                allow-clear
                style="width: 200px"
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
            :data-source="personnelList"
            :loading="loading"
            :pagination="{
              current: queryForm.pageNum,
              pageSize: queryForm.pageSize,
              total: total,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total) => `共 ${total} 条`,
            }"
            :scroll="{ x: 1400 }"
            row-key="id"
            @change="handleTableChange"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'userName'">
                <a class="user-link">{{ record.userName }}</a>
              </template>
              <template v-else-if="column.key === 'isNaturalPerson'">
                <span>{{ record.isNaturalPerson ? '否' : '是' }}</span>
              </template>
              <template v-else-if="column.key === 'phone'">
                <span>{{ record.phone || '-' }}</span>
              </template>
              <template v-else-if="column.key === 'status'">
                <a-tag :color="record.status ? 'green' : 'red'">
                  {{ record.status ? '启用' : '禁用' }}
                </a-tag>
              </template>
              <template v-else-if="column.key === 'action'">
                <a-space>
                  <a-button 
                    type="link" 
                    size="small"
                    @click="handleToggleStatus(record)"
                  >
                    {{ record.status ? '禁用' : '启用' }}
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
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 16px;
    padding: 0;
    display: flex;
    flex-direction: column;
    box-shadow: 0 10px 30px rgba(102, 126, 234, 0.2);
    overflow: hidden;
    position: sticky;
    top: 20px;

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

    .loading-container {
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

      :deep(.ant-spin) {
        .ant-spin-text {
          color: rgba(0, 0, 0, 0.65);
          font-size: 14px;
          margin-top: 8px;
        }

        .ant-spin-dot {
          .ant-spin-dot-item {
            background-color: #667eea;
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

        .stat-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 10px;

          .stat-label {
            font-size: 13px;
            color: rgba(255, 255, 255, 0.9);
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
      background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
      border-bottom: 1px solid rgba(102, 126, 234, 0.1);

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
      background: linear-gradient(135deg, rgba(102, 126, 234, 0.03) 0%, rgba(118, 75, 162, 0.03) 100%);
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
          color: #667eea;
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
        color: #667eea;
        cursor: pointer;

        &:hover {
          text-decoration: underline;
        }
      }
    }
  }
}
</style>
